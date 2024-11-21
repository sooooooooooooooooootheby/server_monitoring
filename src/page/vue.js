import { createApp } from "https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.esm-browser.js";

const app = createApp({
    data() {
        return {
            isLoad: false,
            color: 0,
            server: {
                os: {},
                cpu: 0,
                memory: 0,
                disk: [],
                time: {},
            },
            pm2: [],
        };
    },
    methods: {
        handleSystemTime(time) {
            const days = Math.floor(time / (3600 * 24)); // 计算天数
            const hours = Math.floor((time % (3600 * 24)) / 3600); // 计算剩余小时
            const minutes = Math.floor((time % 3600) / 60); // 计算剩余分钟
            const seconds = Math.floor(time % 60); // 计算剩余秒数

            return `系统已运行: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        },
        updateColor() {
            const themeColor = `oklch(0.8 .1 ${this.color})`;
            document.documentElement.style.setProperty("--theme-color", themeColor);
            localStorage.setItem("theme-color", this.color);
        },
    },
    mounted() {
        const localColor = localStorage.getItem("theme-color");
        if (localColor) {
            this.color = localColor;
            this.updateColor();
        }
        // const socket = io("https://api.sooooooooooooooooootheby.top"); // 连接到服务器
        const socket = io("127.0.0.1:3000"); // 连接到服务器

        // 监听服务器推送的状态更新
        socket.on("server-status", (data) => {
            this.server = data.serverInfo;
            this.pm2 = data.pm2Info;
            if (!this.isLoad) {
                this.isLoad = true;
            }
        });
    },
});
app.mount("#app");
