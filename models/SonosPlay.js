/*
 *  SonosPlay.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-03
 */

var iotdb = require("iotdb");
var _ = iotdb._;

exports.binding = {
    bridge: require('../SonosBridge').Bridge,
    model: require('./SonosPlay.json'),
};
