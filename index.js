const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.route('/NewProcess')
  .get((req, res) => {
    console.log("get", req.body);
    res.json(
      {
        "status": true
      }
    );
  })
  .post((req, res) => {
    console.log("post", req.body);
    res.json(
      {
        "status": true
      }
    );
  })
  .put((req, res) => {
    console.log("put", req.body);
    res.json(
      {
        "status": true
      }
    );
  });

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