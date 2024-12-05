<template>
    <div class="info">
        <mdui-card variant="outlined" class="server" style="margin-right: 12px">
            <div v-if="props.server">
                <p class="hostname">
                    <Icon class="icon" :icon="`fa6-brands:${server.os.platform.toLowerCase()}`" />{{ props.server.os.hostname }}
                </p>
                <p class="os">{{ server.os.distro }}</p>
                <p class="time">{{ handleSystemTime(props.server.time.uptime) }}</p>
                <div class="performance">
                    <div class="cpu">
                        <span>CPU 已使用 {{ props.server.cpu }} %</span>
                        <mdui-linear-progress
                            :id="server.cpu"
                            :value="parseFloat(props.server.cpu.replace('%', ''))"
                            max="100"
                        ></mdui-linear-progress>
                    </div>
                    <div class="memory">
                        <span>内存 已使用 {{ props.server.memory }} %</span>
                        <mdui-linear-progress
                            :id="server.memory"
                            :value="parseFloat(props.server.memory.replace('%', ''))"
                            max="100"
                        ></mdui-linear-progress>
                    </div>
                    <ul class="disk">
                        <li v-for="item in props.server.disk" :key="item.fs">
                            <span>{{ item.fs }} {{ parseInt(item.used) }} GB 已用, 共 {{ parseInt(item.size) }} GB</span>
                            <mdui-linear-progress
                                :id="item.fs"
                                max="100"
                                :value="parseFloat(item.percentage.replace('%', ''))"
                            ></mdui-linear-progress>
                        </li>
                    </ul>
                </div>
            </div>
            <mdui-circular-progress v-else></mdui-circular-progress>
        </mdui-card>
        <mdui-card variant="outlined" class="pm2">
            <div v-if="props.pm2">
                <div class="item" v-for="item in props.pm2" :key="item.pid">
                    <div class="title">
                        <div :class="{ spot: true, online: item.status === 'online' }">{{ item.pid }}</div>
                        {{ item.name }}
                    </div>
                    <div class="cpu">
                        <span>CPU 已使用 {{ item.cpu }} %</span>
                        <mdui-linear-progress :id="item.cpu" max="100" :value="item.cpu"></mdui-linear-progress>
                    </div>
                    <div class="memory">
                        <span>内存 已使用 {{ (item.memory / (1024 * 1024 * 1024)).toFixed(2) }} GB</span>
                        <mdui-linear-progress
                            :id="item.memory"
                            max="2"
                            :value="(item.memory / (1024 * 1024 * 1024)).toFixed(2)"
                        ></mdui-linear-progress>
                    </div>
                </div>
            </div>
            <mdui-circular-progress v-else></mdui-circular-progress>
        </mdui-card>
    </div>
</template>

<script setup>
import 'mdui/components/card.js';
import 'mdui/components/circular-progress.js';
import 'mdui/components/linear-progress.js';

import { Icon } from "@iconify/vue";
const props = defineProps(["pm2", "server"]);

const handleSystemTime = (time) => {
    const days = Math.floor(time / (3600 * 24)); // 计算天数
    const hours = Math.floor((time % (3600 * 24)) / 3600); // 计算剩余小时
    const minutes = Math.floor((time % 3600) / 60); // 计算剩余分钟
    const seconds = Math.floor(time % 60); // 计算剩余秒数

    return `系统已运行: ${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};
</script>

<style lang="scss" scoped>
.info {
    display: flex;

    mdui-card {
        min-height: 500px;
    }
    .server {
        width: 30%;

        .hostname {
            font-size: 2rem;
            font-weight: bold;
            display: flex;
            align-items: center;

            .icon {
                margin-right: 6px;
            }
        }
        .time {
            margin-bottom: 12px;
        }
        .performance {
            div {
                display: flex;
                flex-direction: column;
            }
            .disk {
                margin-top: 12px;

                li {
                    list-style: none;
                }
            }
        }
    }
    .pm2 {
        width: 70%;
        overflow-x: hidden;
        overflow-y: scroll;

        .item {
            margin-bottom: 12px;
            padding: 10px;
            border-radius: 10px;
            transition: 0.2s;

            .title {
                display: flex;
                align-items: center;
                font-size: 1.1rem;

                .spot {
                    min-width: 16px;
                    height: 16px;
                    margin-right: 6px;
                    padding: 0 6px;
                    background-color: #fcb3b7;
                    border-radius: 999px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 0.6rem;
                    color: #000000;
                }
                .online {
                    background-color: #aee1dd;
                }
            }
            .cpu,
            .memory {
                display: flex;
                flex-direction: column;
            }
        }
        .item:hover {
            background-color: rgba($color: var(--mdui-color-primary-light), $alpha: 0.3);
        }
    }
    .pm2::-webkit-scrollbar {
        width: 0px;
    }
}
@media screen and (max-width: 950px) {
    .info {
        flex-direction: column;

        mdui-card {
            min-height: 200px;
        }
        .server,
        .pm2 {
            width: 100%;
            height: auto;
            margin-top: 12px;
        }
    }
}
</style>
