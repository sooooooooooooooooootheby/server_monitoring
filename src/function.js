import winston from "winston";

export const logger = winston.createLogger({
	level: "error",
	// 定义输出格式
	format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.json()),
	// 定义日志输出位置
	transports: [new winston.transports.File({ filename: "log/error.log" })],
});