const io = require("socket.io")(process.env.PORT || 8900, {
	cors: {
		origin: "https://friendlink-app.netlify.app",
		method: ["GET", "POST"],
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (Id) => {
	// console.log('inside getUser', Id);
	return users.find((user) => user.userId === Id);
};

io.on("connection", (socket) => {
	console.log("A user connected to the socket server.");

	socket.on("addUser", (userId) => {
		// console.log('userId in addUser socket', userId, socket.id);
		addUser(userId, socket.id);
		io.emit("getUsers", users);
	});

	//send and get message
	socket.on("sendMessage", ({ senderId, receiverId, message }) => {
		const user = getUser(receiverId);
		console.log("user before socketId", user);
		io.to(user?.socketId).emit("getMessage", {
			senderId,
			message,
		});
	});

	//on disconnection
	socket.on("disconnect", () => {
		console.log("a user disconnected!");
		removeUser(socket.id);
		io.emit("getUsers", users);
	});
});
