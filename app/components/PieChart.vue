<script setup lang="ts">
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
    data: Record<string, number>;
    title: string;
    loading?: boolean;
    isExpanded?: boolean;
    showHandle?: boolean;
    path?: string;
}>();

const emit = defineEmits(['expand', 'update']);

const isEditing = ref(false);
const editTitle = ref(props.title);
const editPath = ref(props.path || '');

function save() {
    emit('update', { title: editTitle.value, path: editPath.value });
    isEditing.value = false;
}

function cancel() {
    editTitle.value = props.title;
    editPath.value = props.path || '';
    isEditing.value = false;
}

const chartData = computed(() => ({
    labels: props.data ? Object.keys(props.data) : [],
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
            data: props.data ? Object.values(props.data) : [],
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

            <div class="flex-1 relative" :class="isExpanded ? 'min-h-[500px]' : 'min-h-[250px]'">
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <Pie v-else :data="chartData" :options="chartOptions" />
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
                        v-model="editTitle"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all"
                    />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data Path</label>
                    <input
                        v-model="editPath"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                    />
                </div>
            </div>

            <div class="flex gap-2 pt-4 border-t border-zinc-800">
                <button @click="save" class="flex-1 btn btn-white btn-sm py-2">Save</button>
                <button @click="cancel" class="flex-1 btn btn-ghost btn-sm py-2">Cancel</button>
            </div>
        </div>
    </div>
</template>
