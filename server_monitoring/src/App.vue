<template>
    <div class="main" v-if="server_list.length > 0">
        <ul class="list">
            <li class="item" v-for="(item, index) in server_list" :key="index" @click="select_server(index)">
                <mdui-button :variant="server_variant[index]" :loading="server_loading[index]">{{ item.name }}</mdui-button>
            </li>
        </ul>
        <div class="panel">
            <servers :pm2="pm2" :server="server" />
        </div>
    </div>
    <div class="tips" v-else>
        <mdui-chip>还没有服务器捏</mdui-chip>
    </div>
    <div class="tool">
        <mdui-fab size="small" :icon="theme_mode" @click="cutTheme"></mdui-fab>
    </div>
</template>

<script setup>
import { ref } from "vue";
import servers from "@/components/server.vue";
import { io } from "socket.io-client";
import { setTheme } from "mdui/functions/setTheme.js";
import { getTheme } from "mdui/functions/getTheme.js";
import 'mdui/components/chip.js';
import 'mdui/components/fab.js';
import 'mdui/components/button.js';

const server_list = ref([
    {
        name: "huawei cloud",
        url: "https://api.sooooooooooooooooootheby.top",
        path: "/server_monitoring/",
    },
]);

let pm2 = ref(null);
let server = ref(null);
let socket = null;

const server_loading = ref(server_list.value.map(() => false));
const server_variant = ref(server_list.value.map(() => "outlined"));

const select_server = (id) => {
    pm2.value = null;
    server.value = null;

    server_loading.value = server_loading.value.map((_, index) => index === id);
    server_variant.value = server_variant.value.map((_, index) => (index === id ? "filled" : "outlined"));

    if (socket) {
        socket.disconnect();
    }

    socket = io(server_list.value[id].url, {
        path: server_list.value[id].path ? server_list.value[id].path : "",
    });

    socket.on("server-status", (data) => {
        pm2.value = data.pm2Info;
        server.value = data.serverInfo;

        server_loading.value[id] = false;
    });
};

if (server_list.value.length > 0) {
    select_server(0);
}

let theme_mode = ref("light_mode");
const cutTheme = () => {
    getTheme() == "dark" ? setTheme("light") : setTheme("dark");
    theme_mode.value == "dark_mode" ? (theme_mode.value = "light_mode") : (theme_mode.value = "dark_mode");
};
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .panel {
        width: 80vw;
        margin-top: 12px;
    }
    .list {
        width: 80vw;
        display: flex;

        .item {
            list-style: none;
            margin-right: 12px;
        }
    }
}
.tool {
    position: fixed;
    top: 12px;
    right: 12px;
    display: flex;
}

@media screen and (max-width: 950px) {
    .main {
        width: calc(100vw - 40px);
        margin-top: 108px;
        padding: 20px;

        .panel {
            width: 100%;
            margin-top: 12px;
        }
        .list {
            width: 100%;
        }
    }
}
</style>
