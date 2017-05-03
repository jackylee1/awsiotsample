const awsIot = require('aws-iot-device-sdk');
const certSource = "cert/";
/*const deviceOpts = {
	keyPath: certSource + 'cabinetIoT.private.key',
	certPath: certSource + 'cabinetIoT.cert.pem',
	caPath: certSource + 'root-CA.crt',
	clientId: 'cabinetIoT',
	region: 'us-east-1'
};*/
const deviceOpts = {
	keyPath: certSource + '3358fb1222-private.pem.key',
	certPath: certSource + '3358fb1222-certificate.pem.crt',
	caPath: certSource + '3358fb1222-CA.crt',
	clientId: 'cabinetIoT-app',
	region: 'us-east-1'
};
const shadows = awsIot.thingShadow(deviceOpts);
const operationTimeout = 10000;

var stack = [];
var currentTimeout = null;
var shadowObj = null;

const thingName = "cabinetIoT";
const endpoint = "a26ho2ufth6bld.iot.us-east-1.amazonaws.com";
const url = "https://" + endpoint + "/things/" + thingName + "/shadow";

const express = require("express");
const http = require("http");
const app = express();
const hostname = '127.0.0.1';
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');

/*const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});*/

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));

// view engine setup
app.set('views', path.join(__dirname, 'views')); // here the .ejs files is in views folders
app.set('view engine', 'ejs'); //tell the template engine

app.post("/update", function(request, response){
	console.log("post update");
	console.log(request.body);
	genericOperation('update', deviceState(request.body));
	response.statusCode = 200;
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify({ result: 1 }));
});

app.post("/get", function(request, response){
	console.log("get");
	var c = shadows['get'](thingName);
	console.log('c ', c);
	setTimeout(function(){		
		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		response.end(JSON.stringify(shadowObj));
	}, 1500);
});

app.post("/status", function(request, response){
	console.log("post status");
	console.log(request.body);
	genericOperation('update', deviceState(request.body));
});

app.listen(port, hostname, () => {
	console.log("Server running at http://"+ hostname + ":"+ port + "/");
	console.log('url' , url);
	shadows.on('connect', function(){
		console.log("device connected via shadow");
		shadows.register('cabinetIoT');
		shadows['get'](thingName);
		console.log("listening for shadow...");
	});
});

function deviceState(value){
	return {
		state: {
			'desired': {'pin':  [value.pin, value.status]}
		}
	};
} 

function genericOperation(operation, state) {
	var clientToken = shadows[operation](thingName, state);
	console.log('token', clientToken);
	if (clientToken === null) {
         //
         // The thing shadow operation can't be performed because another one
         // is pending; if no other operation is pending, reschedule it after an 
         // interval which is greater than the thing shadow operation timeout.
         //
         if (currentTimeout !== null) {
         	console.log('operation in progress, scheduling retry...');
         	currentTimeout = setTimeout(
         		function() {
         			genericOperation(operation, state);
         		},
         		operationTimeout * 2);
         }
     } else {
         //
         // Save the client token so that we know when the operation completes.
         //
         stack.push(clientToken);
     }
 }

 /* serves main page */
 app.get("/", function(request, response) {
 	homepage(response);
 });

 function homepage(response){
 	response.sendFile(path.join(__dirname + '/index.html'));
 }

 shadows.on('error', function(error) {
 	console.log('error', error);
 });

 shadows.on('message', function(topic, payload) {
 	console.log('message', topic, payload.toString());
 });

 shadows.on('status', function(thingName, stat, clientToken, stateObject) {
	//handleStatus(thingName, stat, clientToken, stateObject);
	console.log("status ", thingName + ", "  + stat + " , " + clientToken + " , " + JSON.stringify(stateObject));
	console.log("stateObject ", JSON.stringify(stateObject));
	shadowObj = stateObject;
});

 shadows.on('delta', function(thingName, stateObject) {
	//handleDelta(thingName, stateObject);
	console.log("delta ", thingName + " , " + stateObject);	
});

 shadows.on('timeout', function(thingName, clientToken) {
	//handleTimeout(thingName, clientToken);
	console.log("timeout ", thingName + " , " + clientToken);
});