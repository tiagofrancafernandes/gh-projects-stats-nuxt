<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
    currentViewId: string;
    views: Record<string, any>;
}>();

const emit = defineEmits(['select', 'create', 'clone', 'delete']);

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);
const search = ref('');

onClickOutside(container, () => (isOpen.value = false));

const currentView = computed(() => props.views[props.currentViewId] || { name: 'Default View' });

const filteredViews = computed(() => {
    const list = Object.values(props.views);
    if (!search.value) return list;
    return list.filter((v) => v.name.toLowerCase().includes(search.value.toLowerCase()));
});

function selectView(id: string) {
    emit('select', id);
    isOpen.value = false;
    search.value = '';
}

function handleCreate() {
    emit('create');
    isOpen.value = false;
}
</script>

<template>
    <div ref="container" class="relative">
        <button
            @click="isOpen = !isOpen"
            class="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full hover:border-zinc-700 transition-all group"
        >
            <iconify-icon icon="mdi:view-dashboard-outline" class="text-blue-500"></iconify-icon>
            <span class="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                {{ currentView.name }}
            </span>
            <iconify-icon
                icon="mdi:chevron-down"
                class="text-zinc-500 transition-transform duration-300"
                :class="{ 'rotate-180': isOpen }"
            ></iconify-icon>
        </button>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
        >
            <div
                v-if="isOpen"
                class="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-[60] overflow-hidden"
            >
                <div class="p-3 border-b border-zinc-800 space-y-3">
                    <div class="relative">
                        <iconify-icon
                            icon="mdi:magnify"
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                        ></iconify-icon>
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search views..."
                            class="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        />
                    </div>
                    <button
                        @click="handleCreate"
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-xs font-bold text-blue-400 transition-all group/new"
                    >
                        <iconify-icon
                            icon="mdi:plus"
                            class="text-base group-hover/new:rotate-90 transition-transform"
                        ></iconify-icon>
                        Create New View
                    </button>
                </div>

                <div class="max-h-72 overflow-y-auto p-1 custom-scrollbar">
                    <div v-if="filteredViews.length === 0" class="p-8 text-center">
                        <iconify-icon icon="mdi:folder-open-outline" class="text-3xl text-zinc-800 mb-2"></iconify-icon>
                        <p class="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">No views found</p>
                    </div>
                    <div
                        v-for="view in filteredViews"
                        :key="view.id"
                        class="group/item flex items-center justify-between p-1"
                    >
                        <button
                            @click="selectView(view.id)"
                            class="flex-1 text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                            :class="
                                currentViewId === view.id
                                    ? 'bg-zinc-800 text-zinc-100'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                            "
                        >
                            <div class="flex items-center gap-2">
                                <iconify-icon
                                    :icon="currentViewId === view.id ? 'mdi:check-circle' : 'mdi:circle-outline'"
                                    :class="currentViewId === view.id ? 'text-blue-500' : 'text-zinc-800'"
                                    class="text-sm"
                                ></iconify-icon>
                                {{ view.name }}
                            </div>
                        </button>
                        <div
                            class="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 pr-1 transition-opacity"
                        >
                            <button
                                @click.stop="$emit('clone', view.id)"
                                v-tippy="'Duplicate'"
                                class="p-2 rounded-md hover:bg-white/10 text-zinc-500 hover:text-blue-400 transition-all"
                            >
                                <iconify-icon icon="mdi:content-copy" class="text-base"></iconify-icon>
                            </button>
                            <button
                                @click.stop="$emit('delete', view.id)"
                                v-tippy="'Delete'"
                                class="p-2 rounded-md hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-all"
                            >
                                <iconify-icon icon="mdi:trash-can-outline" class="text-base"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3f3f46;
}
</style>
