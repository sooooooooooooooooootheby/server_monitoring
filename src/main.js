const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const pm2 = require("pm2");
const si = require("systeminformation");

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

const port = 4567;
const timeout = 300000;

const sendInfo = async () => {
    try {
        // 创建对象分别存储服务器信息和pm2信息
        const serverInfo = {
            os: null,
            cpu: null,
            memory: null,
            disk: null,
        };
        const pm2Info = [];

        // 获取各项系统信息
        serverInfo.os = await si.osInfo(); // 操作系统信息
        serverInfo.time = await si.time(); // 系统运行时间
        // 获取CPU负载情况
        const cpuLoad = await si.currentLoad(); // CPU 负载
        serverInfo.cpu = cpuLoad.currentLoad.toFixed(2); // CPU 当前负载
        // 获取内存使用情况
        const memory = await si.mem(); // 内存使用情况
        serverInfo.memory = ((memory.used / memory.total) * 100).toFixed(2); // 已用内存
        // 获取磁盘使用情况
        const disks = await si.fsSize(); // 磁盘使用情况
        serverInfo.disk = disks.map((disk) => ({
            fs: disk.fs, // 磁盘分区
            used: (disk.used / 1024 / 1024 / 1024).toFixed(2), // 已使用空间，单位GB
            percentage: ((disk.used / disk.size) * 100).toFixed(2), // 计算已使用空间的百分比
        }));

        // 获取 PM2 的进程信息
        pm2.list((err, list) => {
            if (err) {
                console.error("PM2 error:", err);
                return;
            }

            // 收集 PM2 进程信息
            pm2Info.push(
                ...list.map((app) => ({
                    name: app.name, // 应用名称
                    pid: app.pid, // 进程 ID
                    status: app.pm2_env.status, // 状态（如 online、stopped）
                    cpu: app.monit.cpu, // CPU 占用
                    memory: app.monit.memory, // 内存占用
                    uptime: app.pm2_env.pm_uptime, // 启动时间
                }))
            );

            // 打包数据
            const packagedInfo = {
                serverInfo, // 服务器信息
                pm2Info, // PM2 信息
            };

            // 向所有客户端发送打包后的信息
            io.emit("server-status", packagedInfo);
        });
    } catch (err) {
        console.log("Error fetching server info:", err);
    }
};

io.on("connection", (socket) => {
    sendInfo();
});

setInterval(async () => {
    sendInfo();
}, timeout);

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
