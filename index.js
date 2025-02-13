const express = require("express");
const http = require("http");

const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app);

const io = new Server(server);

app.set('view engine', 'ejs')
app.set('trust proxy', 1);

io.on("connection", (socket) => {
    console.log(`${socket.id} has connected`);

    socket.on("create room", (name) => {
        socket.join(name);
        socket.currentRoom = name;

        io.to(name).emit("room created", name);
    });
});

app.get("/", (req, res) => {
    res.render("index.ejs");
})

const port = 3000;

server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});