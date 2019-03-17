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
  if (data.indexOf('\n\n') !== -1) {
    console.log('accumulator', accumulator);
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
exports.write=function(data){
  lock=true;
  serialPortController.write(data);
};
exports.locked=lock;