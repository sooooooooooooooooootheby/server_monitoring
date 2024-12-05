import { Server } from "socket.io";
import { getInformation } from "./monitoring.js";

const port = 4568;
const time = 300000;

const io = new Server(port, {
    cors: {
        origin: "*",
    },
    path: "/server_monitoring/",
});

io.on("connection", (socket) => {
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
