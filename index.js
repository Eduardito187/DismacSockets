const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

console.log(new Date());
process.env.TZ = "America/La_Paz";
console.log(new Date());

var ProcessExecute = [];

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.route('/NewProcess')
  .get((req, res) => {
    res.json(
      {
        "status": false
      }
    );
  })
  .post((req, res) => {
    validateParams(req.body);
    res.json(
      {
        "status": true
      }
    );
  })
  .put((req, res) => {
    res.json(
      {
        "status": false
      }
    );
  });

function validateParams(params) {
  if (params.ID != null && params.Ejecucion != null && params.Duracion != null && params.FechaEjecucion != null && params.FechaDuracion != null) {
    runProcess(params);
    ProcessExecute.push(params);
  }
}

function runProcess(params) {
  
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('filter_sale_date', (data) => {
    console.log(data);
    io.to(socket.id).emit('request_sale', true);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});