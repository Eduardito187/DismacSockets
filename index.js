const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');
const https = require('https');

var SOCKET = null;
var SESSION_TOKEN = [];

const KEY_API = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const URL_HOSTING = "https://dismacapi.grazcompany.com/";
const EXTEND_API = "api/";

const {listTimeZones, findTimeZone, getZonedTime, getUnixTime} = require('timezone-support');

var ProcessExecute = [];

var ProcessSuccess = [];
var ProcessRevert = [];

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.route('/NewProcess')
  .get((req, res) => {
    res.json({"status": false});
  })
  .post((req, res) => {
    validateParams(req.body);
    res.json({"status": true});
  })
  .put((req, res) => {
    res.json({"status": false});
  });

app.route('/UpdateAccountPartner')
  .get((req, res) => {
    res.json({"status": false});
  })
  .post((req, res) => {
    if (SOCKET != null){
      SOCKET.emit('UPDATE_'+req.body.id_partner+'_PARTNER', true);
    }
    res.json({"status": true});
  })
  .put((req, res) => {
    res.json({"status": false});
  });

app.route('/CloseAccount')
  .get((req, res) => {
    res.json({"status": false});
  })
  .post((req, res) => {
    if (SOCKET != null){
      SOCKET.emit('CLOSE_'+req.body.id_account+'_ACCOUNT', true);
      SESSION_TOKEN.push(req.body);
      console.log(SESSION_TOKEN);
    }
    res.json({"status": true});
  })
  .put((req, res) => {
    res.json({"status": false});
  });

app.route('/DisableAccount')
  .get((req, res) => {
    res.json({"status": false});
  })
  .post((req, res) => {
    if (SOCKET != null){
      SOCKET.emit('DISABLE_'+req.body.id_account+'_ACCOUNT', true);
    }
    res.json({"status": true});
  })
  .put((req, res) => {
    res.json({"status": false});
  });

function getCurrentDate() {
  return convertTimeArray(getZonedTime(new Date(), findTimeZone('America/La_Paz')));
}

function getDate(date) {
  return convertTimeArray(getZonedTime(new Date(date), findTimeZone('America/La_Paz')));
}

function convertTimeArray(array) {
  return array.year+"-"+array.month+"-"+array.day+" "+array.hours+":"+array.minutes+":"+array.seconds;
}

function validateParams(params) {
  if (params.ID != null && params.Ejecucion != null && params.Duracion != null && params.FechaEjecucion != null && params.FechaDuracion != null) {
    runProcess(params);
    ProcessExecute.push(params);
  }
}

function runProcess(params) {
  let CurrentDate = new Date(getCurrentDate());
  let Now = new Date(getDate(params.Status == 1 ? params.FechaEjecucion : params.FechaDuracion));
  let Result = Now - CurrentDate;
  let count = (Result > 0) ? Result : 1;
  if (params.Status == 1) {
    addProcessRun(params);
  } else if (params.Status == 2) {
    addProcessRevert(params);
  }
  executeProcess(params, count);
}

function addProcessRun(params) {
  ProcessSuccess.push(params);
}

function addProcessRevert(params) {
  ProcessRevert.push(params);
}

function URL_API(Controller) {
  return URL_HOSTING+EXTEND_API+Controller;
}

function GET_HEADER_TOKEN(token) {
  return {
    "headers": {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "text/json"
    }
  };
}

function executeProcess(params, time) {
  setTimeout(() => {
    axios.post(URL_API("process"),{"id":params.ID},GET_HEADER_TOKEN(KEY_API)).then(res => {
    }).catch(err => {});
  }, time);
}


function getAllProcessPending() {
  axios.get(URL_API("process"),GET_HEADER_TOKEN(KEY_API)).then(res => {
    ProcessExecute = res.data.response;
    runAllProcessOn();
  }).catch(err => {});
}

function runAllProcessOn() {
  ProcessExecute.forEach(p => {
    runProcess(p);
  });
}

getAllProcessPending();

io.on('connection', (socket) => {
  SOCKET = socket;
  socket.on('filter_sale_date', (data) => {
    io.to(socket.id).emit('request_sale', true);
  });
  socket.on('reload_profile', (data) => {
    console.log(data);
    io.to(socket.id).emit('reload_profile', true);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});