<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean;
    currentViewId: string;
    viewName?: string;
}>();

const emit = defineEmits(['close', 'save']);

const name = ref(props.viewName || '');

watch(() => props.viewName, (newVal) => {
    name.value = newVal || '';
});

function handleSave() {
    if (!name.value) return;
    emit('save', name.value);
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
    >
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div class="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <h2 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <iconify-icon icon="mdi:content-save-outline" class="text-blue-500"></iconify-icon>
                    {{ currentViewId === 'default' ? 'Save New View' : 'Update Current View' }}
                </h2>
                <button @click="$emit('close')" class="btn btn-ghost btn-sm px-2">
                    <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                </button>
            </div>

            <div class="p-6 space-y-6">
                <div v-if="currentViewId === 'default'" class="space-y-2">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">View Name</label>
                    <input
                        v-model="name"
                        type="text"
                        placeholder="e.g., Development Dashboard, PM View..."
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner placeholder:text-zinc-700"
                        autofocus
                    />
                </div>
                <div v-else class="py-4 text-center">
                    <p class="text-zinc-400 text-sm">
                        You've modified the <span class="text-blue-400 font-bold">"{{ viewName }}"</span> layout.
                        Would you like to save these changes?
                    </p>
                </div>

                <div class="flex gap-3 pt-2">
                    <button
                        @click="handleSave"
                        class="flex-1 btn btn-white py-3 font-bold shadow-lg shadow-blue-500/10"
                        :disabled="currentViewId === 'default' && !name"
                    >
                        {{ currentViewId === 'default' ? 'Save View' : 'Update Layout' }}
                    </button>
                    <button
                        @click="$emit('close')"
                        class="flex-1 btn btn-ghost py-3 font-bold border border-zinc-800"
                    >
                        Discard Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
