import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173" }
});

const users = new Map(); // socket.id -> username

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ username }) => {
        users.set(socket.id, username);
        socket.broadcast.emit("chat", {
            username: "System",
            text: `${username} joined the chat.`,
            timestamp: new Date().toISOString()
        });
    });

    socket.on("chat", ({ username, text }) => {
        const message = {
            username,
            text,
            timestamp: new Date().toISOString()
        };
        io.emit("chat", message);
    });

    socket.on("disconnect", () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        if (username) {
            io.emit("chat", {
                username: "System",
                text: `${username} left the chat.`,
                timestamp: new Date().toISOString()
            });
        }
    });
});

server.listen(4000, () => {
    console.log("Server running at http://localhost:4000");
});
