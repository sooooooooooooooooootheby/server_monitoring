<template>
    <div>
        <div class="panel">
            <div class="button">
                <Icon class="icon" icon="ri:settings-3-fill" @click="isMenu = !isMenu" />
            </div>
            <div class="content shadow" v-if="isMenu">
                <label class="label cursor-pointer">
                    <span class="label-text">show cpu cores</span>
                    <input type="checkbox" checked="checked" class="checkbox" v-model="isCore" />
                </label>
                <label class="label cursor-pointer">
                    <span class="label-text">show disk</span>
                    <input type="checkbox" checked="checked" class="checkbox" v-model="isDisk" />
                </label>
                <theme />
            </div>
        </div>
        <div class="main" v-if="server">
            <div class="info">
                <img src="/logo.png" alt="logo" />
                <div class="text">
                    <p class="title">{{ server.serverInfo.os.hostname }}</p>
                </div>
            </div>
            <div class="row row1">
                <div class="card card1">
                    <div class="stats shadow">
                        <div class="stat">
                            <div class="stat-title">{{ server.serverInfo.os.platform }}</div>
                            <div class="stat-value">
                                <Icon :icon="icon[server.serverInfo.os.logofile]" />
                            </div>
                            <div class="stat-desc">{{ server.serverInfo.os.distro }}</div>
                        </div>
                    </div>
                </div>
                <div class="card card2">
                    <div class="stats shadow">
                        <div class="stat">
                            <div class="stat-title">Uptime</div>
                            <div class="stat-value">
                                <p>{{ handleSystemTime(server.serverInfo.time.uptime) }}</p>
                            </div>
                            <div class="stat-desc">
                                {{ server.serverInfo.time.timezoneName }} / {{ handleTime(server.serverInfo.time.current) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row2">
                <div class="card card1">
                    <div class="stats shadow">
                        <div class="stat">
                            <div class="stat-figure">
                                <Icon class="icon" icon="ri:cpu-fill" />
                            </div>
                            <div class="stat-title">CPU</div>
                            <div class="stat-value">{{ server.serverInfo.cpu.currentLoad.toFixed() }}%</div>
                            <div class="stat-desc">
                                user: {{ server.serverInfo.cpu.currentLoadUser.toFixed() }}% / system:
                                {{ server.serverInfo.cpu.currentLoadSystem.toFixed() }}%
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card card2">
                    <div class="stats shadow">
                        <div class="stat">
                            <div class="stat-figure">
                                <Icon class="icon" icon="ri:ram-2-fill" />
                            </div>
                            <div class="stat-title">Memory</div>
                            <div class="stat-value">
                                {{ ((server.serverInfo.memory.used / server.serverInfo.memory.total) * 100).toFixed() }}%
                            </div>
                            <div class="stat-desc">
                                {{ (server.serverInfo.memory.used / (1024 * 1024 * 1024)).toFixed(1) }} /
                                {{ (server.serverInfo.memory.total / (1024 * 1024 * 1024)).toFixed(1) }}GB
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card" v-if="isCore">
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">CPU cores</div>
                        <ul class="core">
                            <li class="item" v-for="(item, index) in server.serverInfo.cpu.cpus" :key="index">
                                <p>core {{ ++index }}</p>
                                <span>{{ item.load.toFixed() }}%</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="card" v-if="isDisk">
                <div class="stats stats-vertical shadow">
                    <div class="stat">
                        <div class="stat-title">Disk</div>
                        <div class="stat" v-for="(item, index) in server.serverInfo.disk" :key="index">
                            <div class="stat-title">{{ item.fs }} / {{ item.type }}</div>
                            <div class="data">
                                <progress class="progress" :value="item.use" max="100"></progress>
                            </div>
                            <div class="stat-desc">
                                {{ (item.used / (1024 * 1024 * 1024)).toFixed() }} /
                                {{ (item.size / (1024 * 1024 * 1024)).toFixed() }} GB ( {{ item.use }}% )
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card pm2">
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">Service</div>
                        <div class="stat" v-for="item in server.pm2Info" :key="item.id">
                            <div class="stat-title">
                                <div class="status" :class="{ green: item.status === 'online' }"></div>
                                <span style="font-weight: bold">{{ item.name }}</span>
                            </div>
                            <div class="data">
                                <span class="name">cpu</span>
                                <progress class="progress" :value="item.cpu" max="100"></progress>
                            </div>
                            <div class="data">
                                <span class="name">memory</span>
                                <progress
                                    class="progress"
                                    :value="(item.memory / (1024 * 1024 * 1024)).toFixed(2)"
                                    max="100"
                                ></progress>
                            </div>
                            <data class="stat-value">
                                <days :log="[item.error_logs, item.out_logs]" />
                            </data>
                            <div class="stat-desc">
                                <span>pm id: {{ item.id }} / pid: {{ item.pid }} / restart: {{ item.restart }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ul class="card logs">
                <!-- <li v-for="(item, index) in handleLogs(server.pm2Info.error_logs)" :key="index">{{ item }}</li> -->
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { io } from "socket.io-client";
import axios from "axios";
import { Icon } from "@iconify/vue";
import theme from "./components/theme.vue";
import days from "./components/days.vue";

const server = ref(null);
const icon = ref({});
const isMenu = ref(false);
const isCore = ref(true);
const isDisk = ref(true);
const logs = ref([]);

const socket = io("https://api.s22y.moe", {
    path: "/server_monitoring/",
});

socket.on("server-status", (data) => {
    server.value = data;
});
// 时间戳转换
const handleTime = (time) => {
    const date = new Date(time);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要+1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const handleSystemTime = (time) => {
    const days = Math.floor(time / (3600 * 24)); // 计算天数
    const hours = Math.floor((time % (3600 * 24)) / 3600); // 计算剩余小时
    const minutes = Math.floor((time % 3600) / 60); // 计算剩余分钟
    const seconds = Math.floor(time % 60); // 计算剩余秒数

    return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

// 获取图标
const getIcon = async () => {
    try {
        const results = await axios.get("/icon.json");
        icon.value = results.data;
    } catch (error) {
        console.log(error);
    }
};

watch([isCore, isDisk], (newVal, oldVal) => {
    localStorage.setItem("isCore", newVal[0]);
    localStorage.setItem("isDisk", newVal[1]);
});

onMounted(() => {
    getIcon();

    isCore.value = localStorage.getItem("isCore") === "true";
    isDisk.value = localStorage.getItem("isDisk") === "true";

    const theme = localStorage.getItem("theme");
    if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
    }
});
</script>

<style lang="scss" scoped>
.panel {
    position: fixed;
    top: 12px;
    left: 18px;
    z-index: 99;

    .button {
        display: flex;
        align-items: center;

        .icon {
            font-size: 1.6rem;
            cursor: pointer;
        }
        .swap {
            margin-left: 12px;

            svg {
                scale: 0.7;
            }
        }
    }
    .content {
        width: 300px;
        padding: 12px;
        border-radius: 12px;
        position: relative;
        top: 12px;
        backdrop-filter: blur(20px);
    }
}

.main {
    width: 800px;
    margin: 128px 0;
    display: flex;
    flex-direction: column;

    .info {
        margin-bottom: 24px;
        display: flex;

        img {
            width: 125px;
            height: 125px;
            border-radius: 999px;
            flex-shrink: 0;
        }
        .text {
            margin-left: 24px;

            .title {
                font-size: 42px;
                font-weight: bold;
            }
        }
    }
    .row {
        display: flex;

        .card {
            min-height: 140px;
        }
    }
    .card {
        margin: 8px;

        .stats {
            min-height: 140px;
        }
    }
    .row1 {
        .card {
            width: 40%;
        }
        .card2 {
            width: 60%;
        }
    }
    .row2 {
        .card1 {
            width: 70%;
        }
        .card2 {
            width: 30%;
        }
    }
}

.stats {
    .stat {
        .stat-title {
            display: flex;
            align-items: center;
        }
        .stat-value {
            margin: 12px 0;
        }
        .stat-figure {
            .icon {
                font-size: 2.4rem;
            }
        }
    }
}

.core {
    display: flex;
    flex-wrap: wrap;

    .item {
        margin: 8px;
        padding: 12px;
        padding-right: 32px;

        p {
            width: 64px;
            opacity: 0.8;
        }
        span {
            font-size: 1.2rem;
            font-weight: bold;
        }
    }
}

.pm2 {
    .status {
        width: 12px;
        height: 12px;
        margin-right: 4px;
        background-color: #ff5861;
        border-radius: 12px;
    }
    .green {
        background-color: #aee1dd;
    }
    .data {
        display: flex;
        align-items: center;
    }
    .name {
        width: 80px;
        margin-right: 12px;
    }
}
</style>
