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
    .io("volume", iotdb.integer.percent.volume)
    .io("mute", iotdb.boolean.mute)
    .io("mode",
        iotdb
        .make_string(":media.mode")
        .enumeration(_.ld.expand([
            "iot-purpose:media.mode.play",
            "iot-purpose:media.mode.pause",
            "iot-purpose:media.mode.stop",
        ]))
    )
    .o("next", iotdb.make_null("media.next"))
    .o("previous", iotdb.make_null("medi.previous"))
    .make();

exports.binding = {
    bridge: require('../SonosBridge').Bridge,
    model: exports.Model,
};
