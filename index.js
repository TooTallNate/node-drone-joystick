
/**
 * Module dependencies.
 */

var SDL = require('sdl');
var arDrone = require('ar-drone');
var config = require('./config/ps3.json');

var client  = arDrone.createClient({ ip: process.argv[2] || '192.168.1.1' });

SDL.init(SDL.INIT.VIDEO | SDL.INIT.JOYSTICK);
process.on('exit', function () { SDL.quit(); });

var screen = SDL.setVideoMode(320, 200, 0, 0);
console.log(screen);

var joys = [];
for (var i = 0, l = SDL.numJoysticks(); i < l; i++) {
  joys[i] = SDL.joystickOpen(i);
  console.log('joystick ' + i + ': ' + SDL.joystickName( i ));
}
console.log(joys);

// range of the "axis" events (+/-)
var range = Math.pow(2, 16) / 2;

SDL.events.on('event', function (event) {
  var data;
  var func;
  switch (event.type) {
    case 'JOYAXISMOTION':
      event.float = event.value / range;
      data = config.axis[event.axis];
      if (!data) return;
      console.log(event, data);
      func = data[event.float > 0 ? 1 : 0];
      client[func](Math.abs(event.float));
      break;
    case 'JOYBUTTONDOWN':
      data = config.buttons[event.button];
      if (!data) return;
      func = data[0];
      console.log(event, data);
      client[func]();
      break;
    case 'JOYBUTTONUP':
      // don't need to do anything...
      break;
  }
});
SDL.events.on('QUIT', function () { process.exit(0); }); // Window close
SDL.events.on('KEYDOWN', function (evt) {
  if (evt.sym === 99 && evt.mod === 64) process.exit(0); // Control+C
  if (evt.sym === 27 && evt.mod === 0) process.exit(0);  // ESC
});
