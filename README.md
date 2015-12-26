# homestar-sonos
IOTDB / HomeStar Controller for Sonos

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

See <a href="samples/">the samples</a> for details how to add to your project.

# Important Bug List

* This has never been tested: I don't own a Sonos
* We don't know the Sonos UUID. We have to get them
  to figure that out in the sonos library

# Quick Start

Set the channel to 3

	$ npm install -g homestar ## with 'sudo' if error
	$ homestar setup
	$ homestar install homestar-sonos
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("SonosPlay")
	>>> things.set(":volume", 20)
	>>> things.set(":mute", true)
	>>> things.set(":media.mode", ":media.mode.play")

# LGSmartTV

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
