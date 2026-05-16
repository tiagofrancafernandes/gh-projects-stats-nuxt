<script setup lang="ts">
const props = defineProps<{
    title: string;
    value: string | number;
    icon?: string;
    loading?: boolean;
    isExpanded?: boolean;
    showHandle?: boolean;
    path?: string;
    showValue?: boolean;
    showLabel?: boolean;
    format?: 'fixed' | 'percent';
    precision?: number;
    subLabel?: string;
    customFn?: string;
}>();

const emit = defineEmits(['expand', 'update']);

const isEditing = ref(false);
const editTitle = ref(props.title);
const editPath = ref(props.path || '');
const editShowValue = ref(props.showValue !== false);
const editShowLabel = ref(props.showLabel !== false);
const editFormat = ref(props.format || 'fixed');
const editPrecision = ref(props.precision ?? 0);
const editSubLabel = ref(props.subLabel || '');
const editCustomFn = ref(props.customFn || '');
const useLogic = ref(!!props.customFn);

const formattedValue = computed(() => {
    let val = Number(props.value);
    if (isNaN(val)) val = 0;

    if (editFormat.value === 'percent') {
        return val.toFixed(editPrecision.value) + '%';
    }
    return val.toFixed(editPrecision.value);
});

function save() {
    emit('update', {
        title: editTitle.value,
        path: useLogic.value ? undefined : editPath.value,
        showValue: editShowValue.value,
        showLabel: editShowLabel.value,
        format: editFormat.value,
        precision: editPrecision.value,
        subLabel: editSubLabel.value,
        customFn: useLogic.value ? editCustomFn.value : undefined,
    });
    isEditing.value = false;
}

function cancel() {
    editTitle.value = props.title;
    editPath.value = props.path || '';
    editShowValue.value = props.showValue !== false;
    editShowLabel.value = props.showLabel !== false;
    editFormat.value = props.format || 'fixed';
    editPrecision.value = props.precision ?? 0;
    editSubLabel.value = props.subLabel || '';
    editCustomFn.value = props.customFn || '';
    useLogic.value = !!props.customFn;
    isEditing.value = false;
}
</script>

<template>
    <div
        class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group relative h-full flex flex-col"
        :class="{ 'justify-center items-center': isExpanded && !isEditing }"
    >
        <!-- Decoration Container -->
        <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div
                class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500"
            ></div>
        </div>

        <div v-if="!isEditing" class="flex flex-col h-full w-full relative z-10">
            <div class="flex items-center justify-between mb-4">
                <span v-if="showLabel !== false" class="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    {{ title }}
                </span>
                <span v-else></span>
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

            <div class="flex-1 flex flex-col justify-center">
                <div v-if="loading" class="h-10 w-32 bg-zinc-800/50 animate-pulse rounded-lg"></div>
                <div
                    v-else-if="showValue !== false"
                    class="font-bold text-zinc-100 tracking-tighter"
                    :class="isExpanded ? 'text-8xl' : 'text-3xl'"
                >
                    {{ formattedValue }}
                </div>
            </div>

            <div v-if="!loading" class="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                <span v-if="!subLabel" class="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">LIVE</span>
                <span>{{ subLabel || 'Last updated just now' }}</span>
            </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="flex flex-col h-full w-full relative z-10 gap-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
                <span class="text-zinc-100 text-xs font-bold uppercase tracking-widest">Configure Card</span>
                <button @click="cancel" class="btn btn-ghost btn-sm px-2">
                    <iconify-icon icon="mdi:close" class="text-base"></iconify-icon>
                </button>
            </div>

            <div class="space-y-4 flex-1 overflow-y-auto pr-2">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Title</label>
                    <input
                        id="card-title"
                        name="card-title"
                        v-model="editTitle"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            v-model="editShowValue"
                            id="showValue"
                            name="showValue"
                            class="rounded border-zinc-800 bg-zinc-950 text-blue-500"
                        />
                        <label for="showValue" class="text-[10px] font-bold text-zinc-500 uppercase">Show Value</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            v-model="editShowLabel"
                            id="showLabel"
                            name="showLabel"
                            class="rounded border-zinc-800 bg-zinc-950 text-blue-500"
                        />
                        <label for="showLabel" class="text-[10px] font-bold text-zinc-500 uppercase">Show Label</label>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Format</label>
                        <select
                            id="card-format"
                            name="card-format"
                            v-model="editFormat"
                            class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                        >
                            <option value="fixed">Fixed</option>
                            <option value="percent">Percentage</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precision</label>
                        <input
                            id="card-precision"
                            name="card-precision"
                            type="number"
                            v-model.number="editPrecision"
                            min="0"
                            max="5"
                            class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                        />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sub-label / Units</label>
                    <input
                        id="card-sublabel"
                        name="card-sublabel"
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
                            <span class="text-[9px] font-bold text-zinc-600 uppercase">{{ useLogic ? 'Logic Enabled' : 'Use Path' }}</span>
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
                            id="card-path"
                            name="card-path"
                            v-model="editPath"
                            type="text"
                            placeholder="e.g. total, weeklyVelocity"
                            class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                        />
                    </div>
                    <div v-else class="space-y-2">
                        <div class="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-blue-500/50 transition-all">
                            <div class="px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
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
                            Access data via <code class="text-zinc-400">stats</code> object or <code class="text-zinc-400">cards</code> array. Must return a number.
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex gap-2 pt-4 border-t border-zinc-800 mt-auto">
                <button @click="save" class="flex-1 btn btn-white btn-sm py-2">Save</button>
                <button @click="cancel" class="flex-1 btn btn-ghost btn-sm py-2 border border-zinc-800">Cancel</button>
            </div>
        </div>
    </div>
</template>
