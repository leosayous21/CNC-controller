//Serial communication
var SerialPort = require("serialport");
var serialPortController= new SerialPort("/dev/cu.usbmodem141101", {baudRate: 115200});
// internal function

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
