<script setup lang="ts">
import type { LayoutItem, DashboardView } from '~/composables/useDashboardLayout';

const props = defineProps<{
    isOpen: boolean;
    layout: LayoutItem[];
    views: Record<string, DashboardView>;
    currentViewId: string;
    refreshInterval: number;
}>();

const emit = defineEmits([
    'close',
    'toggleVisibility',
    'setCols',
    'reorder',
    'saveView',
    'loadView',
    'deleteView',
    'setRefreshInterval',
    'export',
    'import',
]);

const activeTab = ref<'cards' | 'views' | 'settings'>('cards');
const newViewName = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            emit('import', content);
        };
        reader.readAsText(file);
    }
}

function handleSaveView() {
    if (newViewName.value.trim()) {
        emit('saveView', newViewName.value.trim());
        newViewName.value = '';
    }
}

// Simple move up/down for reordering
function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < props.layout.length) {
        const newLayout = [...props.layout];
        const item = newLayout.splice(index, 1)[0];
        newLayout.splice(newIndex, 0, item!);
        emit('reorder', newLayout);
    }
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity"
    >
        <div
            class="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300"
        >
            <!-- Header -->
            <div class="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Dashboard Layout</h2>
                    <p class="text-zinc-500 text-sm mt-1">Customize your experience and saved views</p>
                </div>
                <button @click="emit('close')" class="btn btn-ghost p-2">
                    <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex px-8 border-b border-zinc-800 gap-8">
                <button
                    v-for="tab in ['cards', 'views', 'settings'] as const"
                    :key="tab"
                    @click="activeTab = tab"
                    :class="[
                        'py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 px-1',
                        activeTab === tab
                            ? 'border-white text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300',
                    ]"
                >
                    {{ tab }}
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <!-- Cards Tab -->
                <div v-if="activeTab === 'cards'" class="space-y-4">
                    <div
                        v-for="(item, index) in layout"
                        :key="item.id"
                        class="group flex items-center gap-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                        <!-- Drag/Move Handles -->
                        <div class="flex flex-col gap-1">
                            <button
                                @click="moveItem(index, 'up')"
                                :disabled="index === 0"
                                class="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20"
                            >
                                <iconify-icon icon="mdi:chevron-up"></iconify-icon>
                            </button>
                            <button
                                @click="moveItem(index, 'down')"
                                :disabled="index === layout.length - 1"
                                class="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20"
                            >
                                <iconify-icon icon="mdi:chevron-down"></iconify-icon>
                            </button>
                        </div>

                        <!-- Visibility -->
                        <button
                            @click="emit('toggleVisibility', item.id)"
                            class="btn btn-outline p-2.5"
                            :class="{ 'text-white border-zinc-500': item.visible }"
                        >
                            <iconify-icon
                                :icon="item.visible ? 'mdi:eye' : 'mdi:eye-off'"
                                class="text-lg"
                            ></iconify-icon>
                        </button>

                        <!-- Title -->
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-zinc-100 truncate">{{ item.title }}</div>
                            <div class="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                                ID: {{ item.id }}
                            </div>
                        </div>

                        <!-- Width Selector -->
                        <div class="flex items-center gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-800">
                            <button
                                v-for="w in 4"
                                :key="w"
                                @click="emit('setCols', item.id, w)"
                                :class="[
                                    'px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all',
                                    item.cols === w ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400',
                                ]"
                            >
                                {{ w }}/4
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Views Tab -->
                <div v-if="activeTab === 'views'" class="space-y-8">
                    <!-- Save Current -->
                    <div class="space-y-4">
                        <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            Save Current View
                        </label>
                        <div class="flex gap-2">
                            <input
                                v-model="newViewName"
                                type="text"
                                placeholder="View name (e.g. CEO Overview)"
                                class="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                                @keyup.enter="handleSaveView"
                            />
                            <button @click="handleSaveView" class="btn btn-white px-6">Save</button>
                        </div>
                    </div>

                    <!-- Saved List -->
                    <div class="space-y-4">
                        <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Views</label>
                        <div
                            v-if="Object.keys(views).length === 0"
                            class="text-center py-12 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800"
                        >
                            <iconify-icon
                                icon="mdi:view-dashboard-outline"
                                class="text-4xl text-zinc-800 mb-2"
                            ></iconify-icon>
                            <p class="text-zinc-600 text-sm">No saved views yet</p>
                        </div>
                        <div v-else class="grid grid-cols-1 gap-3">
                            <div
                                v-for="view in views"
                                :key="view.id"
                                class="flex items-center justify-between p-3 rounded-lg border transition-all"
                                :class="
                                    currentViewId === view.id
                                        ? 'bg-zinc-900 border-zinc-500'
                                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                                "
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-2 h-2 rounded-full"
                                        :class="
                                            currentViewId === view.id
                                                ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                                : 'bg-zinc-700'
                                        "
                                    ></div>
                                    <span
                                        class="font-bold text-sm"
                                        :class="currentViewId === view.id ? 'text-blue-400' : 'text-zinc-300'"
                                    >
                                        {{ view.name }}
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <button @click="emit('loadView', view.id)" class="btn btn-black btn-sm">
                                        Load
                                    </button>
                                    <button
                                        @click="emit('deleteView', view.id)"
                                        class="p-2 rounded-lg text-zinc-600 hover:text-red-500 transition-all"
                                    >
                                        <iconify-icon icon="mdi:delete-outline"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settings Tab -->
                <div v-if="activeTab === 'settings'" class="space-y-12">
                    <!-- Refresh Interval -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Auto Refresh
                            </label>
                            <span class="text-blue-500 font-mono text-sm font-bold">{{ refreshInterval / 1000 }}s</span>
                        </div>
                        <input
                            type="range"
                            min="5000"
                            max="300000"
                            step="5000"
                            :value="refreshInterval"
                            @input="(e) => emit('setRefreshInterval', parseInt((e.target as HTMLInputElement).value))"
                            class="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div class="flex justify-between text-[10px] text-zinc-600 font-bold">
                            <span>5s</span>
                            <span>5min</span>
                        </div>
                    </div>

                    <!-- Data Management -->
                    <div class="space-y-4 pt-8 border-t border-zinc-800">
                        <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            Backup & Portability
                        </label>
                        <div class="grid grid-cols-2 gap-4">
                            <button
                                @click="emit('export')"
                                class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all"
                            >
                                <iconify-icon icon="mdi:download" class="text-xl text-zinc-500"></iconify-icon>
                                <div class="text-left">
                                    <div class="text-sm font-bold text-zinc-200">Export Config</div>
                                    <div class="text-[10px] text-zinc-500">Save to JSON file</div>
                                </div>
                            </button>
                            <button
                                @click="fileInput?.click()"
                                class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all"
                            >
                                <iconify-icon icon="mdi:upload" class="text-xl text-zinc-500"></iconify-icon>
                                <div class="text-left">
                                    <div class="text-sm font-bold text-zinc-200">Import Config</div>
                                    <div class="text-[10px] text-zinc-500">Load from JSON file</div>
                                </div>
                            </button>
                            <input
                                ref="fileInput"
                                type="file"
                                accept=".json"
                                class="hidden"
                                @change="handleFileUpload"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-8 bg-zinc-900/40 border-t border-zinc-800 flex justify-between items-center">
                <div class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    v2.0 • Local Persistence Enabled
                </div>
                <button @click="emit('close')" class="btn btn-white px-8">Done</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
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
