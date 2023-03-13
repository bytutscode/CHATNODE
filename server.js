const express = require('express');
const path = require('path');
const http = require('http')
const socketIO = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(process.env.PORT); 

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection',(socket)=>{
    console.log('conexão estabelecida');

    socket.on('join-request',(userName)=>{
        socket.userName = userName;
        connectedUsers.push(userName);
        console.log(connectedUsers);

        socket.emit('user-ok',connectedUsers);

        socket.broadcast.emit('updated-list',{
            joined: socket.userName,
            list: connectedUsers
        });
    });

    socket.on('new-mensage',(msg)=>{
        let obj = {mensage:msg,userName:socket.userName};
        socket.emit('show-mensage',obj)
        socket.broadcast.emit('show-mensage',obj);
    })

    socket.on('disconnect',()=>{
        connectedUsers = connectedUsers.filter(u => u != socket.userName);
        socket.broadcast.emit('updated-list',{left:socket.userName,list:connectedUsers});
    })
})


