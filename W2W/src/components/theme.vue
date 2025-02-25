<template>
    <div class="theme">
        <p class="title">Theme</p>
        <select class="select select-bordered w-full max-w-xs focus:outline-none" @change="cutTheme($event)">
            <option v-for="(item, index) in themes" :key="index" :value="item" :selected="item === selectTheme">
                {{ item }}
            </option>
        </select>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const themes = ref([
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
]);
const selectTheme = ref("");

const cutTheme = (event) => {
    const selectedTheme = event.target.value;
    localStorage.setItem("theme", selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
};

onMounted(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
        selectTheme.value = theme;
    }
});
</script>

<style lang="scss" scoped>
.theme {
    margin-top: 12px;

    .title {
        margin-left: 4px;
    }
}
</style>
