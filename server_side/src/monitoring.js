import pm2 from "pm2";
import si from "systeminformation";
import { logger } from "./function.js";
import { io } from "./main.js";
import fs from "fs/promises";

const getLog = async (path) => {
    try {
        const data = await fs.readFile(path, "utf8");
        return data;
    } catch (err) {
        console.error("Error reading log file:", err);
        return null; // 或者返回一个错误信息
    }
};

export const getInformation = async () => {
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
        serverInfo.cpu = cpuLoad;
        // 获取内存使用情况
        const memory = await si.mem(); // 内存使用情况
        serverInfo.memory = memory;
        // 获取磁盘使用情况
        const disks = await si.fsSize(); // 磁盘使用情况
        serverInfo.disk = disks;

        // 获取 PM2 的进程信息
        // pm2.list( async (err, list) => {
        //     if (err) {
        //         logger.error("PM2 error:", err);
        //         return;
        //     }

		//     const outLogs = await getLog(app.pm2_env.pm_out_log_path);
        //     const errorLogs = await getLog(app.pm2_env.pm_err_log_path);

        //     // 收集 PM2 进程信息
        //     pm2Info.push(
        //         ...list.map((app) => ({
        //             name: app.name, // 应用名称
        //             pid: app.pid, // 进程 ID
        //             id: app.pm_id, // PM2 进程 ID
        //             status: app.pm2_env.status, // 状态（如 online、stopped）
        //             cpu: app.monit.cpu, // CPU 占用
        //             memory: app.monit.memory, // 内存占用
        //             uptime: app.pm2_env.pm_uptime, // 启动时间
        //             restart: app.pm2_env.restart_time, // 重启次数
        //             out_logs: outLogs, // 输出日志
        //             error_logs: errorLogs // 错误日志
        //         }))
        //     );

        //     // console.log(pm2Info);

        //     // 打包数据
        //     const packagedInfo = {
        //         serverInfo, // 服务器信息
        //         pm2Info, // PM2 信息
        //     };

        //     // 向所有客户端发送打包后的信息
        //     io.emit("server-status", packagedInfo);
        // });

        pm2.list(async (err, list) => {
            if (err) {
                logger.error("PM2 error:", err);
                return;
            }

            // 遍历每个PM2进程并获取日志
            const pm2Apps = await Promise.all(list.map(async (app) => {
                // 读取当前应用的日志文件
                const [outLogs, errorLogs] = await Promise.all([
                    getLog(app.pm2_env?.pm_out_log_path),
                    getLog(app.pm2_env?.pm_err_log_path)
                ]);

                return {
                    name: app.name,
                    pid: app.pid,
                    id: app.pm_id,
                    status: app.pm2_env?.status,
                    cpu: app.monit?.cpu || 0,
                    memory: app.monit?.memory || 0,
                    uptime: app.pm2_env?.pm_uptime,
                    restart: app.pm2_env?.restart_time || 0,
                    out_logs: outLogs,
                    error_logs: errorLogs
                };
            }));

            pm2Info.push(...pm2Apps);

            const packagedInfo = {
                serverInfo,
                pm2Info
            };

            io.emit("server-status", packagedInfo);
        });
    } catch (error) {
        logger.error(error);
    }
};
