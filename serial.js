//Serial communication
var SerialPort = require("serialport");
var serialPortController= new SerialPort("/dev/ttyACM0", {baudRate: 115200});
const EventEmitter = require('events');
// internal function

var serialResponse = new EventEmitter();
const Helper=require('./helper');

var accumulator = '';
var lock = false;

serialPortController.on('data', function (data) {
  accumulator += data;
  var lastCharacters = data.slice(-4).toString();
  if (lastCharacters === 'ok\r\n' || lastCharacters === '>\r\n\n') {
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

const waitResponse = async function(){
  const response = new Promise(resolve => serialResponse.once('data', resolve));
  return Promise.race([response, Helper.timeout(5000)]);
}

exports.serialPortController = serialPortController;
const write = async function(data){
  serialPortController.write(data);
};
const writeWaitResponse = async function(data){
  console.log('write data', data)
  write(data);
  response = await waitResponse();
  console.log('response', response);
  return response;
}
const upload = async function(filename, content){
    
};
exports.upload=upload;
exports.locked=lock;
exports.writeWaitResponse=writeWaitResponse;
