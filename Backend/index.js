import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";
const app = express();
const port = 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

let groups = [];

io.on('connection', (socket) => {
    console.log(`a user connected with id: ${socket.id}`);

    socket.on('private-message', ({ message, recipient }) => {
        console.log(`Private message from client {${socket.id}} to ${recipient}: ${message}`);
        socket.to(recipient).emit('receive-message', { message, sender: socket.id, type: 'private' });
    });

    socket.on('create-group', ({ group }) => {
        console.log(`Group created: ${group}`);
        groups.push(group);
    });

    socket.on('join-group', ({ group }) => {
        if (groups.includes(group)) {
            console.log(`User {${socket.id}} joined group ${group}`);
            socket.join(group);
        } else {
            console.log(`Group ${group} does not exist`);
        }
    });

    socket.on('group-message', ({ message, group }) => {
        if (groups.includes(group)) {
            console.log(`Group message from client {${socket.id}} to ${group}: ${message}`);
            socket.to(group).emit('receive-message', { message, sender: socket.id, type: 'group' });
        } else {
            console.log(`Group ${group} does not exist`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected with id: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});