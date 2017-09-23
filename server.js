const http = require("http");
const path = require("path");

const moniker = require("moniker");

const express = require("express");
const app = express();

const server = http.Server(app)

const io = require("socket.io")(server);

const port = process.env.PORT || 1337;

var motd = "Hax inboud in: "
var wen = new Date();
wen.setDate(wen.getDate() + 20);

app.use("/", express.static(path.join(__dirname, "public")))

io.on("connect", function(socket) {
	socket.username = moniker.choose();

	socket.emit("motd", {motd: motd});
	socket.emit("date", {date: wen.toString()});

	addTime(Math.round(1 + Math.random() * 4));
	io.emit("chat", {
		name: "server",
		message: socket.username + " has added some delay by joining"
	});

	socket.on("chat", function(data) {
		var chunks = data.message.split("-");
		switch (chunks[0]) {
			case ":~setmotd":
				motd = chunks[1];
				io.emit("motd", {motd: motd});
				break;
			
			case ":~disaster":
				addTime(parseInt(chunks[1]));
				io.emit("chat", {
					name: "server",
					message: chunks[2]
				});
				break;

			default:
				socket.emit("chat", {
					name: socket.username,
					message: data.message
				});
				break;
		}
	});
});

function addTime(minutes) {
	wen.setMinutes(wen.getMinutes() + minutes);
	io.emit("date", {date: wen.toString()});
}

server.listen(port, function() {
	console.log("Server is running b0ss.", port);
});

