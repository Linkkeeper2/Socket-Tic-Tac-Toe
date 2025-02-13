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

        this.turn = 1;
        this.winner = null;
    }

    click(row, col, socket) {
        if (this.turn === 1 && this.player1 === socket) {
            if (!this.board[row][col]) {
                this.board[row][col] = "O";
                this.turn = 2;
                io.to(socket.currentRoom).emit("update board", this.board);
            }
        }

        else if (this.turn === 2 && this.player2 === socket) {
            if (!this.board[row][col]) {
                this.board[row][col] = "X";
                this.turn = 1;
                io.to(socket.currentRoom).emit("update board", this.board);
            }
        }
    }

    checkWin() {
        let rowWin = this.checkRows();


    }

    checkRows() {
        for (let r = 0; r < this.board.length; r++) {
            let row = this.board[r];

            if (row[0] === row[1] && row[1] === row[2]) {
                if (row[0] === "O")
                    this.winner = 1;

                else
                    this.winner = 2;

                return true;
            }
        }

        return false;
    }

    checkCols() {
        
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

    socket.on("click cell", (row, col) => {
        let game = Game.findGame(socket.currentRoom);

        if (game)
            game.click(row, col, socket);
    });
});

app.get("/", (req, res) => {
    res.render("index.ejs");
})

const port = 3000;

server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});