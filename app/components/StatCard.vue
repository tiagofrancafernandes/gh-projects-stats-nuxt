<script setup lang="ts">
const props = defineProps<{
    title: string;
    value: string | number;
    icon?: string;
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
                <span class="text-zinc-500 text-xs font-bold uppercase tracking-widest">{{ title }}</span>
                <div class="flex items-center gap-1">
                    <button
                        @click.stop="isEditing = true"
                        data-tooltip="Configure"
                        class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm px-2"
                    >
                        <iconify-icon icon="mdi:cog" class="text-base text-zinc-500"></iconify-icon>
                    </button>
                    <button
                        @click.stop="$emit('expand')"
                        :data-tooltip="isExpanded ? 'Minimize' : 'Expand'"
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
                    v-else
                    class="font-bold text-zinc-100 tracking-tighter"
                    :class="isExpanded ? 'text-8xl' : 'text-3xl'"
                >
                    {{ value }}
                </div>
            </div>

            <div v-if="!loading" class="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                <span class="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">LIVE</span>
                <span>Last updated just now</span>
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

            <div class="space-y-4 flex-1">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Title</label>
                    <input
                        v-model="editTitle"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all"
                        placeholder="e.g., Total Items"
                    />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Data Path (stats.*)
                    </label>
                    <input
                        v-model="editPath"
                        type="text"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                        placeholder="e.g., total"
                    />
                    <p class="text-[9px] text-zinc-600 font-medium italic">
                        Example: total, open, closed, weeklyVelocity
                    </p>
                </div>
            </div>

            <div class="flex gap-2 pt-4 border-t border-zinc-800">
                <button @click="save" class="flex-1 btn btn-white btn-sm py-2">Save Changes</button>
                <button @click="cancel" class="flex-1 btn btn-ghost btn-sm py-2 border border-zinc-800">Cancel</button>
            </div>
        </div>
    </div>
</template>
