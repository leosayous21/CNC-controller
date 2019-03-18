//Serial communication
var SerialPort = require("serialport");
var serialPortController= new SerialPort("/dev/cu.usbmodem146101", {baudRate: 115200});
const EventEmitter = require('events');
// internal function

var serialResponse = new EventEmitter();
const helper=require('./helper');

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
const write = async function(data, retry=3){
  if(retry<=0) return false;
  if(lock) {
    console.log('locked - previous not finished');
    await helper.delay(100);
    return write(data, retry-1);
  }
  lock=true;
  serialPortController.write(data);
  return true
};
exports.write=write;
exports.locked=lock;
setInterval(() => serialPortController.write('\n'), 2000); // in case of hard block