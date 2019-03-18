//Serial communication
var SerialPort = require("serialport");
var serialPortController= new SerialPort("/dev/cu.usbmodem146101", {baudRate: 115200});
const EventEmitter = require('events');
// internal function

var serialResponse = new EventEmitter();

var accumulator = '';
var lock = false;

serialPortController.on('data', function (data) {
  accumulator += data;
  var lastCharacters = data.slice(-4).toString();
  if (lastCharacters === 'ok\r\n' || lastCharacters === '>\r\n\n') {
    console.log('data', accumulator);
    serialResponse.emit('data', accumulator);
    accumulator='';
    lock=false;
  }
});

serialPortController.open(function (error) {
  console.log('serialPortController opened');
  if (error) {
    console.log("Unable to open optimate controller", error);
  }
});

serialPortController.on('close', function(error){
	console.log("Optimate controller has been closed ! "+error);
});

serialPortController.on('error', function(error){
	console.log("Optimate controller has encounter an error ! "+error);
});

exports.serialPortController = serialPortController;
exports.serialResponse = serialResponse;
const write = function(data){
  if(lock) {
    console.log('locked - previous not finished');
    setTimeout(() => write(data), 100);
    return;
  }
  lock=true;
  serialPortController.write(data);
};
exports.write=write;
exports.locked=lock;
setInterval(() => serialPortController.write('\n'), 2000); // in case of hard block