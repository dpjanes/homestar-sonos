/*
 *  SonosBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-03
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var sonos = require('sonos');

var logger = bunyan.createLogger({
    name: 'homestar-sonos',
    module: 'SonosBridge',
});

var mode_play = _.ld.expand("iot-attribute:media.mode.play");
var mode_pause = _.ld.expand("iot-attribute:media.mode.pause");
var mode_stop = _.ld.expand("iot-attribute:media.mode.stop");

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var SonosBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/SonosBridge/initd"), {
            poll: 30
        }
    );
    self.native = native;

    if (self.native) {
        self.native.uuid = "00000000-0000-0000-0000-000000000000";
        self.queue = _.queue("SonosBridge");
        self.stated = {};
    }
};

SonosBridge.prototype = new iotdb.Bridge();

SonosBridge.prototype.name = function () {
    return "SonosBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.discover = function () {
    var self = this;

    logger.info({
        method: "discover"
    }, "called");

    sonos.search(function (native) {
        self.discovered(new SonosBridge(self.initd, native));
    });
};

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._setup_polling();
    self.pull();
};

SonosBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

SonosBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.push = function (pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "push",
        pushd: pushd,
    }, "push");

    if (pushd.mute !== undefined) {
        self._push_mute(pushd.mute);
    }

    if (pushd.volume !== undefined) {
        self._push_volume(pushd.volume);
    }

    if (pushd.next) {
        self._push_next();
    }

    if (pushd.previous) {
        self._push_previous();
    }

    if (pushd.mode === mode_play) {
        self._push_mode_play();
    } else if (pushd.mode === mode_pause) {
        self._push_mode_pause();
    } else if (pushd.mode === mode_stop) {
        self._push_mode_stop();
    }
};

SonosBridge.prototype._push_volume = function (volume) {
    var self = this;

    self.queue.add({
        id: "_push_volume",
        run: function (queue, qitem) {
            self.native.setVolume(volume, function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_volume/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        volume: volume,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._push_mute = function (mute) {
    var self = this;

    self.queue.add({
        id: "_push_mute",
        run: function (queue, qitem) {
            self.native.setMuted(mute, function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_mute/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        mute: mute,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._push_mode_play = function () {
    var self = this;

    self.queue.add({
        id: "_push_mode",
        run: function (queue, qitem) {
            self.native.play(function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_mode_play/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        mode: mode_play,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._push_mode_pause = function () {
    var self = this;

    self.queue.add({
        id: "_push_mode",
        run: function (queue, qitem) {
            self.native.pause(function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_mode_pause/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        mode: mode_pause,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._push_mode_stop = function () {
    var self = this;

    self.queue.add({
        id: "_push_mode",
        run: function (queue, qitem) {
            self.native.stop(function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_mode_stop/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        mode: mode_stop,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._push_next = function () {
    var self = this;

    self.queue.add({
        id: "push-next",
        run: function (queue, qitem) {
            self.native.next(function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_next/callback",
                        error: error,
                    }, "Sonos error");
                }
            });
        }
    });
};

SonosBridge.prototype._push_previous = function () {
    var self = this;

    self.queue.add({
        id: "push-previous",
        run: function (queue, qitem) {
            self.native.previous(function (error, data) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_push_previous/callback",
                        error: error,
                    }, "Sonos error");
                }
            });
        }
    });
};

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    self._pull_volume();
    self._pull_mute();
    self._pull_state();
};

SonosBridge.prototype._pull_volume = function () {
    var self = this;

    self.queue.add({
        id: "_pull_volume",
        run: function (queue, qitem) {
            self.native.getVolume(function (error, volume) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_pull_volume/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        volume: volume,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._pull_mute = function () {
    var self = this;

    self.queue.add({
        id: "_pull_mute",
        run: function (queue, qitem) {
            self.native.getMuted(function (error, mute) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_pull_mute/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    self.pulled({
                        mute: mute,
                    });
                }
            });
        }
    });
};

SonosBridge.prototype._pull_state = function () {
    var self = this;

    self.queue.add({
        id: "_pull_state",
        run: function (queue, qitem) {
            self.native.getCurrentState(function (error, state) {
                self.queue.finished(qitem);

                if (error) {
                    logger.error({
                        method: "_pull_state/callback",
                        error: error,
                    }, "Sonos error");
                } else {
                    logger.debug({
                        method: "_pull_state/callback",
                        error: error,
                        state: state,
                    }, "XXX - have the state but don't know what to do with it just yet");
                }
            });
        }
    });
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("Sonos", self.native.uuid),
        "schema:name": self.native.name || "Sonos",
        "schema:manufacturer": "http://www.sonos.com/",
    };
};

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#XXX} for documentation.
 */
SonosBridge.prototype.configure = function (app) {};

/*
 *  API
 */
exports.Bridge = SonosBridge;
