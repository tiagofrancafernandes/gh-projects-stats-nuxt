<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean;
    availableLabels: string[];
    availableStatuses: string[];
    currentFilters: {
        labels: string[];
        states: string[];
        status: string[];
    };
    layout: { id: string; title: string; visible: boolean }[];
}>();

const emit = defineEmits(['close', 'apply', 'clear', 'toggleVisibility', 'resetLayout']);

const localFilters = ref({ ...props.currentFilters });

watch(
    () => props.currentFilters,
    (newVal) => {
        localFilters.value = JSON.parse(JSON.stringify(newVal));
    },
    { deep: true }
);

function toggleLabel(label: string) {
    const index = localFilters.value.labels.indexOf(label);
    if (index > -1) {
        localFilters.value.labels.splice(index, 1);
    } else {
        localFilters.value.labels.push(label);
    }
}

function apply() {
    emit('apply', { ...localFilters.value });
    emit('close');
}

function clear() {
    localFilters.value = {
        labels: [],
        states: [],
        status: [],
    };
    emit('clear');
    emit('close');
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
        <div
            class="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        >
            <!-- Header -->
            <div class="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h2 class="text-xl font-semibold text-zinc-100">Filters</h2>
                <button @click="emit('close')" class="btn btn-ghost p-1.5">
                    <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                <!-- States -->
                <div class="space-y-3">
                    <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">State</label>
                    <div class="flex gap-2">
                        <button
                            v-for="state in ['OPEN', 'CLOSED']"
                            :key="state"
                            @click="localFilters.states = localFilters.states.includes(state) ? [] : [state]"
                            class="btn flex-1"
                            :class="localFilters.states.includes(state) ? 'btn-white' : 'btn-outline'"
                        >
                            {{ state }}
                        </button>
                    </div>
                </div>

                <!-- Status -->
                <div class="space-y-3">
                    <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="status in availableStatuses"
                            :key="status"
                            @click="localFilters.status = localFilters.status.includes(status) ? [] : [status]"
                            class="btn btn-sm"
                            :class="localFilters.status.includes(status) ? 'btn-white' : 'btn-outline'"
                        >
                            {{ status }}
                        </button>
                    </div>
                </div>

                <!-- Labels -->
                <div class="space-y-3">
                    <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Labels</label>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="label in availableLabels"
                            :key="label"
                            @click="toggleLabel(label)"
                            class="btn btn-sm"
                            :class="localFilters.labels.includes(label) ? 'btn-white' : 'btn-outline'"
                        >
                            {{ label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex gap-3">
                <button @click="clear" class="flex-1 btn btn-ghost">Clear All</button>
                <button @click="apply" class="flex-[2] btn btn-white">Apply Filters</button>
            </div>
        </div>
    </div>
</template>
