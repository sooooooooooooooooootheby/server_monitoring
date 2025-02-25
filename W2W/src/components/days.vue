<template>
    <div class="days">
        <div class="day" v-for="(item, index) in day" :key="index">
            <div class="tooltip" :data-tip="`${item.date} ${item.status}`">
                <div class="black card btn" :class="{ error: item.status === 'error' }"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps(["log"]);
const day = ref([]);
const title = ref("");
const log = ref([]);

onMounted(() => {
    // 生成最近30天的日期数组
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // 从29天前开始
    day.value = Array.from({ length: 30 }, () => {
        const dateStr = startDate.toISOString().split("T")[0];
        startDate.setDate(startDate.getDate() + 1); // 每次递增日期
        return { date: dateStr, status: "" };
    });

    // 提取日志中的日期并使用Set优化查找性能
    let array = props.log[0].split("\n");
    const logDates = new Set(array.map((item) => item.split("T")[0]));

    day.value.forEach((dayObj) => {
        if (logDates.has(dayObj.date)) {
            dayObj.status = "error";
        }
    });
});
</script>

<style lang="scss" scoped>
.days {
    padding: 0 13px;
    display: flex;
    justify-content: space-between;

    .day {
        .black {
            width: 15px;
            height: 60px;
            padding: 0;
            background-color: #aee1dd;
            transition: 0.2s;
        }
        .error {
            background-color: #ff5861;
            cursor: pointer;
        }
        .black:hover {
            scale: 1.1;
        }
    }
}
</style>
