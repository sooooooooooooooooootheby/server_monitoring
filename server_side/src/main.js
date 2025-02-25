import { Server } from "socket.io";
import { getInformation } from "./monitoring.js";
const port = 4568;
const time = 1000000;
const maxConnections = 5;

const io = new Server(port, {
    cors: {
        origin: "*",
    },
    path: "/server_monitoring/",
});

let connectionCount = 0;

io.on("connection", (socket) => {
    if (connectionCount >= maxConnections) {
        socket.disconnect(true);
        console.log("Connection refused: maximum number of connections reached.");
        return;
    }

    connectionCount++;
    console.log(`Client connected. Current connections: ${connectionCount}`);

    socket.on("disconnect", () => {
        connectionCount--;
        console.log(`Client disconnected. Current connections: ${connectionCount}`);
    });

    getInformation();
    start();
});

const start = () => {
    setInterval(() => {
        getInformation();
    }, time);
};

console.clear();
console.log(`server running at http://localhost:${port}`);
console.log(`test: "curl 'http://localhost:${port}/socket.io/?EIO=4&transport=polling' -v"`);

export { io };
