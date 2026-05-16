<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
    value: number;
    max: number;
    title: string;
    loading?: boolean;
    isExpanded?: boolean;
    path?: string;
    subLabel?: string;
    customFn?: string;
}>();

const emit = defineEmits(['expand', 'update']);

const isEditing = ref(false);
const editTitle = ref(props.title);
const editPath = ref(props.path || '');
const editSubLabel = ref(props.subLabel || '');
const editCustomFn = ref(props.customFn || '');
const useLogic = ref(!!props.customFn);

function save() {
    emit('update', {
        title: editTitle.value,
        path: useLogic.value ? undefined : editPath.value,
        subLabel: editSubLabel.value,
        customFn: useLogic.value ? editCustomFn.value : undefined,
    });
    isEditing.value = false;
}

const cancel = () => {
    editTitle.value = props.title;
    editPath.value = props.path || '';
    editSubLabel.value = props.subLabel || '';
    editCustomFn.value = props.customFn || '';
    useLogic.value = !!props.customFn;
    isEditing.value = false;
};

const displayValue = computed(() => {
    const val = Number(props.value);
    return isNaN(val) ? 0 : val;
});

const chartData = computed(() => ({
    labels: ['Velocity', 'Remaining'],
    datasets: [
        {
            data: [props.value, Math.max(0, props.max - props.value)],
            backgroundColor: [
                '#3b82f6', // Primary color
                '#18181b', // Background color for the gauge track
            ],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            borderRadius: 5,
            cutout: '85%',
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
    },
    animation: {
        duration: 2000,
        easing: 'easeOutQuart' as const,
    },
}));
</script>

<template>
    <div
        class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 h-full flex flex-col group relative overflow-hidden"
    >
        <!-- Decoration -->
        <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div
                class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500"
            ></div>
        </div>

        <div v-if="!isEditing" class="flex flex-col h-full w-full relative z-10">
            <div class="flex items-center justify-between mb-2">
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

            <div class="flex-1 relative flex flex-col items-center justify-center pt-8">
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
                </div>

                <div class="relative w-full h-full max-h-[160px]">
                    <Doughnut v-if="!loading" :data="chartData" :options="chartOptions" />

                    <!-- Center Text -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center mt-8">
                        <span class="font-bold text-zinc-100 tracking-tighter text-4xl">
                            {{ displayValue }}
                        </span>
                        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                            {{ subLabel || 'Items / Week' }}
                        </span>
                    </div>
                </div>

                <!-- Gauge Labels -->
                <div class="w-full flex justify-between px-8 -mt-2">
                    <span class="text-[10px] font-bold text-zinc-600">0</span>
                    <span class="text-[10px] font-bold text-zinc-600">{{ max }}</span>
                </div>
            </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="flex flex-col h-full w-full relative z-10 gap-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
                <span class="text-zinc-100 text-xs font-bold uppercase tracking-widest">Configure Gauge</span>
                <button @click="cancel" class="btn btn-ghost btn-sm px-2">
                    <iconify-icon icon="mdi:close" class="text-base"></iconify-icon>
                </button>
            </div>

            <div class="space-y-4 flex-1">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Title</label>
                    <input
                        id="gauge-title"
                        name="gauge-title"
                        v-model="editTitle"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all"
                    />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Sub-label / Units
                    </label>
                    <input
                        id="gauge-sublabel"
                        name="gauge-sublabel"
                        v-model="editSubLabel"
                        type="text"
                        placeholder="e.g. Items / Week"
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
                            id="gauge-path"
                            name="gauge-path"
                            v-model="editPath"
                            type="text"
                            placeholder="e.g. total, weeklyVelocity"
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
                                placeholder="return stats.total / 2;"
                                rows="5"
                                class="w-full bg-transparent px-3 py-2 text-xs text-blue-400 focus:outline-none font-mono resize-none"
                            ></textarea>
                            <div class="px-3 py-1 bg-zinc-900/50 border-t border-zinc-800">
                                <span class="text-[9px] font-mono text-zinc-500">}</span>
                            </div>
                        </div>
                        <p class="text-[9px] text-zinc-600 leading-tight">
                            Access data via
                            <code class="text-zinc-400">stats</code>
                            object or
                            <code class="text-zinc-400">cards</code>
                            array. Must return a number.
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
