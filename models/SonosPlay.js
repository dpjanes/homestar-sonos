/*
 *  SonosPlay.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-03
 */

var iotdb = require("iotdb");
var _ = iotdb._;

exports.Model = iotdb.make_model('SonosPlay')
    .name("Sonos Play")
    .io("on", iotdb.boolean.on)
    .io("volume", iotdb.number.unit.volume)
    .io("media-mode",
        iotdb
            .make_string(":media-mode")
            .enumeration(_.ld.expand([
                "iot-attribute:mode-mode.play",
                "iot-attribute:mode-mode.pause",
                "iot-attribute:mode-mode.stop",
            ]))
    )
    .o("next", iotdb.make_null("media-mode.next"))
    .o("previous", iotdb.make_null("media-mode.previous"))
    .make();

exports.binding = {
    bridge: require('../SonosBridge').Bridge,
    model: exports.Model,
};
