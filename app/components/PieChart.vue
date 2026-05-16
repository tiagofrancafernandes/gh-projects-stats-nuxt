<script setup lang="ts">
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
    data: Record<string, number>;
    title: string;
    loading?: boolean;
    isExpanded?: boolean;
}>();

defineEmits(['expand']);

const chartData = computed(() => ({
    labels: Object.keys(props.data),
    datasets: [
        {
            backgroundColor: [
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#f97316',
                '#eab308',
                '#22c55e',
                '#06b6d4',
                '#6366f1',
                '#a855f7',
                '#f43f5e',
            ],
            data: Object.values(props.data),
            borderWidth: 0,
            hoverOffset: 15,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: props.isExpanded ? 'right' : ('bottom' as const),
            labels: {
                color: '#71717a',
                usePointStyle: true,
                padding: props.isExpanded ? 30 : 20,
                font: {
                    size: props.isExpanded ? 14 : 11,
                    weight: 'bold' as const,
                },
            },
        },
        tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#fafafa',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            displayColors: false,
        },
    },
}));
</script>

<template>
    <div
        class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 h-full flex flex-col group relative overflow-hidden"
    >
        <div class="flex items-center justify-between mb-8 relative z-10">
            <h3 class="text-zinc-500 font-bold text-xs uppercase tracking-widest">{{ title }}</h3>
            <button
                @click.stop="$emit('expand')"
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all"
            >
                <iconify-icon
                    :icon="isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                    class="text-lg"
                ></iconify-icon>
            </button>
        </div>

        <div class="flex-1 relative" :class="isExpanded ? 'min-h-[500px]' : 'min-h-[250px]'">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                <div class="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <Pie v-else :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
