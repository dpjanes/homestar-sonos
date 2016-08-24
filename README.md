# homestar-sonos
[IOTDB](https://github.com/dpjanes/node-iotdb) Bridge for Sonos

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

See <a href="samples/">the samples</a> for details how to add to your project.

* This has never been tested: I don't own a Sonos
* We don't know the Sonos UUID. We have to get them
  to figure that out in the sonos library

* [Read about Bridges](https://github.com/dpjanes/node-iotdb/blob/master/docs/bridges.md)

# Installation

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

Then:

    $ npm install homestar-sonos

# Use

Set the channel to 3

	const iotdb = require('iotdb')
    iotdb.use("homestar-sonos")

	const things = iotdb.connect("SonosPlay")
	things.set(":volume", 20)
	things.set(":mute", true)
	things.set(":media.mode", ":media.mode.play")

# Models
## SonosPlay

* <code>volume</code>: integer from 0 to 100 (<code>iot-attribute:volume</code>)
* <code>mute</code>: true or false (<code>iot-attribute:mute</code>)
* <code>media.mode</code>: string, see below (<code>iot-attribute:media.mode.\*</code>)
* <code>next</code>: a work in progress
* <code>previous</code>: a work in progress

### Modes

Supported Media Modes (so far)

* media.mode.play
* media.mode.pause
* media.mode.stop
