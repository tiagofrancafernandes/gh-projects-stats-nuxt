<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler);

const props = defineProps<{
    data: { date: string; closed: number }[];
    title: string;
    loading?: boolean;
    isExpanded?: boolean;
    showHandle?: boolean;
}>();

defineEmits(['expand']);

const chartData = computed(() => ({
    labels: props.data.map((d) => d.date),
    datasets: [
        {
            label: 'Closed Items',
            data: props.data.map((d) => d.closed),
            borderColor: '#3b82f6',
            backgroundColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: props.isExpanded ? 6 : 4,
            pointHoverRadius: props.isExpanded ? 8 : 6,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#09090b',
            pointBorderWidth: 2,
            borderWidth: 3,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#fafafa',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                color: '#52525b',
                font: { size: props.isExpanded ? 12 : 10, weight: 'bold' },
            },
        },
        y: {
            grid: { color: '#18181b' },
            ticks: {
                color: '#52525b',
                font: { size: props.isExpanded ? 12 : 10 },
                stepSize: 1,
            },
            beginAtZero: true,
        },
    },
}));
</script>

<template>
    <div
        class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 h-full flex flex-col group relative"
    >
        <div class="flex items-center justify-between mb-8 relative z-10">
            <h3 class="text-zinc-500 font-bold text-xs uppercase tracking-widest">{{ title }}</h3>
            <button
                @click.stop="$emit('expand')"
                :data-tooltip="isExpanded ? 'Minimize' : 'Expand'"
                class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm"
            >
                <iconify-icon
                    :icon="isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                    class="text-base"
                ></iconify-icon>
            </button>
        </div>

        <div class="flex-1 relative" :class="isExpanded ? 'min-h-[500px]' : 'min-h-[300px]'">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                <div class="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <Line v-else :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
