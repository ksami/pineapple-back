const express = require("express");
const sio = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;
const SITE_INDEX = path.join(__dirname, "public", "index.html");

// Express server
const server = express()
    .use((req, res) => res.sendFile(SITE_INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

// Socket.io server
const io = sio(server);
io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => console.log(`${socket.id} disconnected`));
});

// Broadcast time every second
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);