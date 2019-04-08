//Serial communication
var SerialPort = require("serialport");
var Queue = require("promise-queue");
var serialQueue = new Queue(1, 1);
var serialPortController= new SerialPort("/dev/ttyACM0", {baudRate: 115200});
const EventEmitter = require('events');
// internal function

var serialResponse = new EventEmitter();
const Helper=require('./helper');

var accumulator = '';
var lock = false;

serialPortController.on('data', function (data) {
  console.log('on data', data.toString());
  accumulator += data;
  var lastCharacters = data.slice(-4).toString();
  if (lastCharacters === 'ok\r\n' || lastCharacters === '>\r\n\n' || lastCharacters === 'sh\r\n') {
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
  return Promise.race([response, Helper.timeout(2000)]);
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
const handleQueue = async function(res, callback) {
  return serialQueue.add(callback)
    .then(data => res.send(data))
    .catch(err => res.status(500).send(`Error: ${err}`));
}
const upload = async function(res, filename, content){
  await handleQueue(res, async function () {
    await writeWaitResponse(`upload /sd/${filename}`+'\n')
    console.log('ok upload start command');
    write(content)
    console.log('ok write content command');
    write(String.fromCharCode(26))
    console.log('ok ctrl+Z')
  })
};

const handleCommand = async function (res, data) {
  await handleQueue(res, () => writeWaitResponse(data))
};
exports.upload=upload;
exports.locked=lock;
exports.writeWaitResponse=writeWaitResponse;
exports.handleCommand = handleCommand;
