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
    data: any[];
    title: string;
    loading?: boolean;
    isExpanded?: boolean;
    showHandle?: boolean;
    path?: string;
    customFn?: string;
}>();

const emit = defineEmits(['expand', 'update']);

const isEditing = ref(false);
const editTitle = ref(props.title);
const editPath = ref(props.path || '');
const editCustomFn = ref(props.customFn || '');
const useLogic = ref(!!props.customFn);

function save() {
    emit('update', {
        title: editTitle.value,
        path: useLogic.value ? undefined : editPath.value,
        customFn: useLogic.value ? editCustomFn.value : undefined,
    });
    isEditing.value = false;
}

function cancel() {
    editTitle.value = props.title;
    editPath.value = props.path || '';
    editCustomFn.value = props.customFn || '';
    useLogic.value = !!props.customFn;
    isEditing.value = false;
}

const chartData = computed(() => {
    let labels: string[] = [];
    let values: number[] = [];

    if (Array.isArray(props.data)) {
        labels = props.data.map((i: any) => i.date || i.label || 'Unknown');
        values = props.data.map(
            (i: any) => (typeof i === 'object' ? (i.closed !== undefined ? i.closed : i.value) : i) || 0
        );
    }

    return {
        labels,
        datasets: [
            {
                label: 'Items',
                data: values,
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
    };
});

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
        <div v-if="!isEditing" class="flex flex-col h-full w-full">
            <div class="flex items-center justify-between mb-8 relative z-10">
                <h3 class="text-zinc-500 font-bold text-xs uppercase tracking-widest">{{ title }}</h3>
                <div class="flex items-center gap-1">
                    <button
                        @click.stop="isEditing = true"
                        v-tippy="'Configure'"
                        class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm px-2"
                    >
                        <iconify-icon icon="mdi:cog" class="text-base text-zinc-500"></iconify-icon>
                    </button>
                    <button
                        @click.stop="$emit('expand')"
                        v-tippy="isExpanded ? 'Minimize' : 'Expand'"
                        class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm px-2"
                    >
                        <iconify-icon
                            :icon="isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                            class="text-base text-zinc-500"
                        ></iconify-icon>
                    </button>
                </div>
            </div>

            <div class="flex-1 relative" :class="isExpanded ? 'min-h-[500px]' : 'min-h-[300px]'">
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <Line v-else :data="chartData" :options="chartOptions" />
            </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="flex flex-col h-full w-full relative z-10 gap-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
                <span class="text-zinc-100 text-xs font-bold uppercase tracking-widest">Configure Chart</span>
                <button @click="cancel" class="btn btn-ghost btn-sm px-2">
                    <iconify-icon icon="mdi:close" class="text-base"></iconify-icon>
                </button>
            </div>

            <div class="space-y-4 flex-1">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Title</label>
                    <input
                        id="line-title"
                        name="line-title"
                        v-model="editTitle"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all"
                    />
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {{ useLogic ? 'Custom Logic (Async JS)' : 'Data Path' }}
                        </label>
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] font-bold text-zinc-600 uppercase">
                                {{ useLogic ? 'Logic Enabled' : 'Use Path' }}
                            </span>
                            <button
                                @click="useLogic = !useLogic"
                                class="w-8 h-4 rounded-full relative transition-colors duration-300 border border-zinc-700"
                                :class="useLogic ? 'bg-blue-600' : 'bg-zinc-800'"
                            >
                                <div
                                    class="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300"
                                    :class="useLogic ? 'left-4.5' : 'left-0.5'"
                                ></div>
                            </button>
                        </div>
                    </div>

                    <div v-if="!useLogic">
                        <input
                            id="line-path"
                            name="line-path"
                            v-model="editPath"
                            type="text"
                            placeholder="e.g. weeklyVelocity"
                            class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                        />
                    </div>
                    <div v-else class="space-y-2">
                        <div
                            class="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-blue-500/50 transition-all"
                        >
                            <div
                                class="px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between"
                            >
                                <span class="text-[9px] font-mono text-zinc-500">async (stats, cards) => {</span>
                                <iconify-icon icon="mdi:javascript" class="text-zinc-600"></iconify-icon>
                            </div>
                            <textarea
                                v-model="editCustomFn"
                                placeholder="return [{ date: 'Mon', closed: 10 }, ...]"
                                rows="5"
                                class="w-full bg-transparent px-3 py-2 text-xs text-blue-400 focus:outline-none font-mono resize-none"
                            ></textarea>
                            <div class="px-3 py-1 bg-zinc-900/50 border-t border-zinc-800">
                                <span class="text-[9px] font-mono text-zinc-500">}</span>
                            </div>
                        </div>
                        <p class="text-[9px] text-zinc-600 leading-tight">
                            Must return an array
                            <code class="text-zinc-400">[{date, closed}]</code>
                            or
                            <code class="text-zinc-400">[{label, value}]</code>
                            .
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex gap-2 pt-4 border-t border-zinc-800">
                <button @click="save" class="flex-1 btn btn-white btn-sm py-2">Save</button>
                <button @click="cancel" class="flex-1 btn btn-ghost btn-sm py-2">Cancel</button>
            </div>
        </div>
    </div>
</template>
