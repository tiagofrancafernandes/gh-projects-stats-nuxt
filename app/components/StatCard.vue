<script setup lang="ts">
defineProps<{
    title: string;
    value: string | number;
    icon?: string;
    loading?: boolean;
    isExpanded?: boolean;
    showHandle?: boolean;
}>();

defineEmits(['expand']);
</script>

<template>
    <div
        class="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group relative"
        :class="{ 'h-full flex flex-col justify-center items-center': isExpanded }"
    >
        <!-- Decoration Container -->
        <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div
                class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500"
            ></div>
            <div
                class="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/5 blur-[80px] rounded-full group-hover:bg-purple-500/10 transition-all duration-500"
            ></div>
        </div>

        <div class="flex items-center justify-between mb-4 w-full relative z-10">
            <span class="text-zinc-500 text-xs font-bold uppercase tracking-widest">{{ title }}</span>
            <div class="flex items-center gap-2">
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
                <div v-if="icon" class="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <iconify-icon :icon="icon" class="text-xl"></iconify-icon>
                </div>
            </div>
        </div>

        <div v-if="loading" class="h-10 w-32 bg-zinc-800/50 animate-pulse rounded-lg"></div>
        <div
            v-else
            class="font-bold text-zinc-100 tracking-tighter relative z-10"
            :class="isExpanded ? 'text-8xl' : 'text-3xl'"
        >
            {{ value }}
        </div>

        <div v-if="!loading" class="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-500 relative z-10">
            <span class="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">LIVE</span>
            <span>Last updated just now</span>
        </div>
    </div>
</template>
