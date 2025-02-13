const express = require("express");
const http = require("http");

const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app);

const io = new Server(server);

app.set('view engine', 'ejs')
app.set('trust proxy', 1);

class Game {
    constructor(room) {
        this.player1 = null;
        this.player2 = null;
        this.room = room;

        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
    }

    static findGame(roomName) {
        return games.find(game => game.room === roomName);
    }
}

var games = [];

io.on("connection", (socket) => {
    console.log(`${socket.id} has connected`);

    socket.on("create room", (name) => {
        let game = Game.findGame(name);

        if (game) {
            socket.emit("room exists", name);
        }

        else {
            socket.join(name);
            socket.currentRoom = name;

            games.push(new Game(name));

            game = Game.findGame(name);

            game.player1 = socket;

            io.to(name).emit("room created", name);
        }
    });

    socket.on("join room", (name) => {
        let game = Game.findGame(name);
        
        if (game) {
            if (!game.player2) {
                socket.join(name);
                socket.currentRoom = name;

                game.player2 = socket;

                io.to(name).emit("user joined", name);
            }
            
            else {
                socket.emit("room full", name)
            }
        }

        else {
           socket.emit("no room", name);
        }
    });
});

app.get("/", (req, res) => {
    res.render("index.ejs");
})

const port = 3000;

server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});