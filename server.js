const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;
const SITE_INDEX = path.join(__dirname, "dist", "index.html");
const SITE_JS = path.join(__dirname, "dist", "index.js");

// Express server
const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}\n\n${req.body}`);
    next();
});
app.get("/", (req, res) => {
    res.sendFile(SITE_INDEX);
}).get("/index.js", (req, res) => {
    res.sendFile(SITE_JS);
});

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));


// Socket.io server
const io = socketIO(server);
io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => console.log(`${socket.id} disconnected`));

    // Log and send to everyone else
    socket.on("music", (data) => {
        console.log(`${socket.id} sends ${JSON.stringify(data)}`);
        socket.broadcast.emit("music", data);
    });
});


// Broadcast time every second
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);