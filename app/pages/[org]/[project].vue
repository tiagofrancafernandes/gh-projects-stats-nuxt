<script setup lang="ts">
const { org: owner, project: projectNum } = useRoute().params;
const projectNumber = ref(parseInt(projectNum as string));
const ownerRef = ref(owner as string);

const { cards, stats, pendingCards, pendingStats, filters, refresh, setFilters, resetFilters } = useGithub(
    ownerRef,
    projectNumber
);

const {
    layout,
    views,
    currentViewId,
    refreshInterval,
    toggleVisibility,
    setCols,
    updateItem,
    saveView,
    loadView,
    deleteView,
    cloneView,
    addItem,
    removeItem,
    exportConfig,
    importConfig,
} = useDashboardLayout();

const { results: customResults, runAll: runCustomLogic } = useCustomLogic();

function resolveValue(item: any) {
    if (item.customFn && customResults.value[item.id] !== undefined) {
        return customResults.value[item.id];
    }
    return resolvePath(stats.value, item.path) ?? 0;
}

function resolvePath(obj: any, path: string | undefined) {
    if (!path || !obj) return null;
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
}

// Execute custom logic when data or layout changes
watch(
    [layout, stats, cards],
    () => {
        runCustomLogic(layout.value, stats.value, cards.value || []);
    },
    { deep: true, immediate: true }
);

const isFiltersOpen = ref(false);
const isLayoutOpen = ref(false);
const focusMode = ref(false);
const itemSearch = ref('');

// Dynamic auto refresh
let refreshTimer: any = null;
function clearRefreshTimer() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

function startRefreshTimer() {
    clearRefreshTimer();
    refreshTimer = setInterval(() => {
        if (!pendingCards.value && !pendingStats.value) {
            refresh();
        }
    }, refreshInterval.value);
}

onMounted(() => {
    startRefreshTimer();
    const route = useRoute();
    if (route.query.view === 'tv') focusMode.value = true;
});

onUnmounted(() => {
    clearRefreshTimer();
});

watch(refreshInterval, () => {
    startRefreshTimer();
});

watch(currentViewId, () => {
    // Re-sync timer when switching views as interval might change
    startRefreshTimer();
});

watch(focusMode, (val) => {
    const route = useRoute();
    const query = { ...route.query };
    if (val) query.view = 'tv';
    else delete query.view;
    useRouter().push({ query });
});

watch(refreshInterval, () => {
    startRefreshTimer();
});

onUnmounted(() => {
    if (refreshTimer) clearInterval(refreshTimer);
});

const filteredCards = computed(() => {
    if (!cards.value) return [];
    const s = itemSearch.value.toLowerCase();
    return cards.value.filter((card) => card.title.toLowerCase().includes(s));
});

function toggleExpand(id: string) {
    const currentlyExpanded = layout.value.find((i: any) => (i as any).isExpanded);
    if (currentlyExpanded && currentlyExpanded.id !== id) {
        (currentlyExpanded as any).isExpanded = false;
    }

    const item = layout.value.find((i) => i.id === id);
    if (item) {
        (item as any).isExpanded = !(item as any).isExpanded;
    }
}

const colSpanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-3',
    4: 'col-span-1 md:col-span-4',
};

import draggable from 'vuedraggable';

const isSaveViewOpen = ref(false);
const isSaveViewMinimized = ref(false);

function handleDragEnd() {
    if (!isSaveViewMinimized.value) {
        isSaveViewOpen.value = true;
    }
}

function handleSaveView(name: string) {
    saveView(name);
    isSaveViewOpen.value = false;
    isSaveViewMinimized.value = false;
}

function minimizeSaveView() {
    isSaveViewOpen.value = false;
    isSaveViewMinimized.value = true;
}

function closeSaveView() {
    isSaveViewOpen.value = false;
    isSaveViewMinimized.value = false;
}

const currentViewName = computed(() => {
    return views.value[currentViewId.value]?.name || 'Default View';
});
</script>

<template>
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-blue-500/30">
        <!-- Top Navigation -->
        <nav
            v-show="!focusMode"
            class="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/50 px-8 py-4 animate-in slide-in-from-top duration-500"
        >
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex items-center gap-8">
                    <NuxtLink to="/" class="flex items-center gap-3 group">
                        <div
                            class="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center group-hover:border-zinc-700 transition-all"
                        >
                            <iconify-icon
                                icon="mdi:github"
                                class="text-xl text-zinc-400 group-hover:text-zinc-100"
                            ></iconify-icon>
                        </div>
                        <div class="text-left">
                            <div class="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                {{ ownerRef }}
                            </div>
                            <div class="text-sm font-semibold text-zinc-100">
                                <span class="text-zinc-500 mr-1">(#{{ projectNumber }})</span>
                                {{ stats?.projectTitle || 'Loading...' }}
                            </div>
                        </div>
                    </NuxtLink>

                    <div class="h-8 w-px bg-zinc-800 hidden md:block"></div>

                    <div
                        class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full"
                    >
                        <iconify-icon icon="mdi:view-dashboard-outline" class="text-blue-500"></iconify-icon>
                        <span class="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                            {{ currentViewName }}
                        </span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button @click="refresh" v-tippy="'Refresh'" class="btn btn-ghost">
                        <iconify-icon
                            icon="mdi:refresh"
                            :class="{ 'animate-spin': pendingCards || pendingStats }"
                            class="text-lg"
                        ></iconify-icon>
                    </button>

                    <div class="h-4 w-px bg-zinc-800 mx-1"></div>

                    <button @click="focusMode = true" v-tippy="'TV Mode'" class="btn btn-ghost">
                        <!-- <iconify-icon icon="mdi:monitor-dashboard" class="text-lg"></iconify-icon> -->
                        <iconify-icon icon="tdesign:tv" class="text-lg"></iconify-icon>
                    </button>

                    <button @click="isLayoutOpen = true" v-tippy="'Customize Layout'" class="btn btn-ghost">
                        <iconify-icon icon="mdi:view-dashboard-edit" class="text-lg"></iconify-icon>
                    </button>

                    <button @click="isFiltersOpen = true" v-tippy="'Filters'" class="btn btn-white btn-sm">
                        <iconify-icon icon="mdi:filter-variant" class="text-base"></iconify-icon>
                        <span class="text-xs">Filters</span>
                    </button>
                </div>
            </div>
        </nav>

        <!-- Focus Mode Close Button (Top Center Hover Zone) -->
        <div
            v-if="focusMode"
            class="fixed top-0 left-0 right-0 h-24 z-[100] group flex justify-center items-start pt-4 pointer-events-none"
        >
            <button
                @click="focusMode = false"
                v-tippy="'Exit TV Mode'"
                class="pointer-events-auto btn btn-black px-6 shadow-2xl opacity-0 group-hover:opacity-100 translate-y-[-20px] group-hover:translate-y-0"
            >
                <iconify-icon icon="mdi:close" class="text-lg"></iconify-icon>
                <span class="text-[10px] font-semibold uppercase tracking-wider">Exit TV Mode</span>
            </button>
        </div>

        <!-- Main Dashboard Content -->
        <main class="mx-auto transition-all duration-700 ease-in-out" :class="[
            focusMode 
                ? 'pt-12 pb-12 px-12 max-w-[95vw] lg:max-w-[1800px] 2xl:max-w-[2400px]' 
                : 'pt-28 pb-20 px-8 max-w-7xl'
        ]">
            <!-- Layout Grid -->
            <draggable
                v-model="layout"
                item-key="id"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 transition-all duration-500"
                :class="focusMode ? 'gap-10' : 'gap-6'"
                handle=".drag-handle"
                @end="handleDragEnd"
            >
                <template #item="{ element: item }">
                    <div
                        v-if="item.visible"
                        :class="[
                            colSpanClasses[item.cols || 1],
                            (item as any).isExpanded ? 'fixed inset-4 z-50 overflow-auto bg-[#050505] p-8' : 'relative group',
                        ]"
                    >
                        <StatCard
                            v-if="item.type === 'stat'"
                            :title="item.title"
                            :path="item.path"
                            :value="resolveValue(item)"
                            :loading="pendingStats"
                            :is-expanded="(item as any).isExpanded"
                            :show-value="item.showValue"
                            :show-label="item.showLabel"
                            :format="item.format"
                            :precision="item.precision"
                            :sub-label="item.subLabel"
                            :custom-fn="item.customFn"
                            @expand="toggleExpand(item.id)"
                            @update="updateItem(item.id, $event)"
                        />

                        <GaugeChart
                            v-else-if="item.type === 'gauge'"
                            :title="item.title"
                            :path="item.path"
                            :value="resolveValue(item)"
                            :max="50"
                            :loading="pendingStats"
                            :is-expanded="(item as any).isExpanded"
                            :sub-label="item.subLabel"
                            :custom-fn="item.customFn"
                            @expand="toggleExpand(item.id)"
                            @update="updateItem(item.id, $event)"
                        />

                        <GroupCard
                            v-else-if="item.type === 'group'"
                            :id="item.id"
                            :title="item.title"
                            :children="item.children || []"
                            :stats="stats"
                            :custom-results="customResults"
                            :loading="pendingStats"
                            :is-expanded="(item as any).isExpanded"
                            @expand="toggleExpand(item.id)"
                            @update="updateItem(item.id, $event)"
                            @update-child="updateItem"
                        />

                        <LineChart
                            v-else-if="item.type === 'chart'"
                            :title="item.title"
                            :path="item.path"
                            :data="item.customFn ? (customResults[item.id] || []) : (resolvePath(stats, item.path) ?? [])"
                            :loading="pendingStats"
                            :is-expanded="(item as any).isExpanded"
                            @expand="toggleExpand(item.id)"
                            @update="updateItem(item.id, $event)"
                        />

                        <PieChart
                            v-else-if="item.type === 'pie'"
                            :title="item.title"
                            :path="item.path"
                            :data="item.customFn ? (customResults[item.id] || {}) : (resolvePath(stats, item.path) ?? {})"
                            :loading="pendingStats"
                            :is-expanded="(item as any).isExpanded"
                            @expand="toggleExpand(item.id)"
                            @update="updateItem(item.id, $event)"
                        />

                        <div
                            v-else-if="item.type === 'list'"
                            class="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl flex flex-col h-full group relative"
                        >
                            <!-- List content -->
                            <div
                                class="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div class="flex items-center gap-4">
                                    <div
                                        class="drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 -ml-2 rounded-lg hover:bg-white/10 z-20 backdrop-blur-sm border border-transparent hover:border-white/20"
                                    >
                                        <iconify-icon icon="mdi:drag-variant" class="text-zinc-500 text-lg"></iconify-icon>
                                    </div>
                                    <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-widest">
                                        Recent Activity
                                    </h3>
                                    <span
                                        class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold"
                                    >
                                        {{ filteredCards.length }} Items
                                    </span>
                                </div>
                                <div class="relative max-w-xs w-full">
                                    <iconify-icon
                                        icon="mdi:magnify"
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                    ></iconify-icon>
                                    <input
                                        v-model="itemSearch"
                                        type="text"
                                        placeholder="Filter by title..."
                                        class="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
                                    />
                                </div>
                            </div>

                            <!-- Table container -->
                            <div class="overflow-x-auto flex-1">
                                <table class="w-full text-left">
                                    <thead
                                        class="bg-zinc-900/30 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider"
                                    >
                                        <tr>
                                            <th class="px-6 py-3">Content</th>
                                            <th class="px-6 py-3">Labels</th>
                                            <th class="px-6 py-3">Status</th>
                                            <th class="px-6 py-3">State</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-zinc-800/30">
                                        <tr
                                            v-for="card in filteredCards"
                                            :key="card.id"
                                            class="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group/row"
                                        >
                                            <td class="px-6 py-5">
                                                <div class="flex items-center gap-4">
                                                    <div
                                                        class="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 group-hover/row:border-blue-500/50 transition-all"
                                                    >
                                                        <iconify-icon
                                                            :icon="
                                                                card.type === 'pr'
                                                                    ? 'mdi:git-pull-request'
                                                                    : 'mdi:alert-circle-outline'
                                                            "
                                                            :class="
                                                                card.state === 'OPEN'
                                                                    ? 'text-green-500'
                                                                    : 'text-purple-500'
                                                            "
                                                        ></iconify-icon>
                                                    </div>
                                                    <a
                                                        :href="`https://github.com/${ownerRef}/${projectNumber}/issues/${card.id}`"
                                                        target="_blank"
                                                        class="text-sm font-medium text-zinc-300 hover:text-white transition-colors line-clamp-1"
                                                    >
                                                        {{ card.title }}
                                                    </a>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5">
                                                <div class="flex flex-wrap gap-1.5">
                                                    <span
                                                        v-for="label in card.labels"
                                                        :key="label"
                                                        class="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 text-[10px] font-bold"
                                                    >
                                                        {{ label }}
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5">
                                                <span
                                                    class="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700/50"
                                                >
                                                    {{ card.status }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-5">
                                                <div class="flex items-center gap-2">
                                                    <div
                                                        class="w-1.5 h-1.5 rounded-full"
                                                        :class="
                                                            card.state === 'OPEN' ? 'bg-green-500' : 'bg-purple-500'
                                                        "
                                                    ></div>
                                                    <span class="text-[10px] font-bold text-zinc-500 uppercase">
                                                        {{ card.state }}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Drag Handle -->
                        <div
                            v-if="item.type !== 'list'"
                            class="drag-handle absolute top-4 left-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg hover:bg-white/10 z-20 backdrop-blur-sm border border-transparent hover:border-white/20"
                        >
                            <iconify-icon icon="mdi:drag-variant" class="text-zinc-500 text-lg"></iconify-icon>
                        </div>
                    </div>
                </template>
            </draggable>

        </main>

        <!-- Modals -->
        <FiltersModal
            :is-open="isFiltersOpen"
            :available-labels="stats?.availableLabels || []"
            :available-statuses="stats?.availableStatuses || []"
            :current-filters="filters"
            :layout="layout"
            @close="isFiltersOpen = false"
            @apply="setFilters"
            @clear="resetFilters"
        />

        <LayoutManager
            :is-open="isLayoutOpen"
            :layout="layout"
            :views="views"
            :current-view-id="currentViewId"
            :refresh-interval="refreshInterval"
            @close="isLayoutOpen = false"
            @toggle-visibility="toggleVisibility"
            @set-cols="setCols"
            @reorder="layout = $event"
            @save-view="saveView"
            @load-view="loadView"
            @delete-view="deleteView"
            @clone-view="cloneView"
            @add-item="addItem"
            @remove-item="removeItem"
            @set-refresh-interval="refreshInterval = $event"
            @export="exportConfig"
            @import="importConfig"
        />

        <SaveViewModal
            :is-open="isSaveViewOpen"
            :current-view-id="currentViewId"
            :view-name="views[currentViewId]?.name"
            @close="closeSaveView"
            @save="handleSaveView"
            @minimize="minimizeSaveView"
        />

        <!-- Minimized Save FAB -->
        <div
            v-if="isSaveViewMinimized && !focusMode"
            class="fixed bottom-8 right-8 z-[90] animate-in slide-in-from-bottom-8 fade-in duration-300"
        >
            <button
                @click="isSaveViewOpen = true"
                class="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white pl-4 pr-6 py-3 rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95"
            >
                <div class="relative">
                    <iconify-icon icon="mdi:content-save-edit" class="text-xl"></iconify-icon>
                    <span class="absolute -top-1 -right-1 flex h-2 w-2">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"
                        ></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-100"></span>
                    </span>
                </div>
                <div class="flex flex-col items-start leading-none">
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Unsaved Changes</span>
                    <span class="text-xs font-bold">{{ currentViewId === 'default' ? 'Save New View' : 'Update ' + currentViewName }}</span>
                </div>
            </button>
        </div>

        <!-- Layout Settings Toggle -->
        <button
            v-if="!focusMode"
            @click="isLayoutOpen = true"
            v-tippy="'Customize Layout'"
            class="fixed bottom-8 left-8 btn btn-black p-3 shadow-2xl"
        >
            <iconify-icon icon="mdi:view-dashboard-edit" class="text-xl"></iconify-icon>
        </button>
    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

body {
    font-family: 'Inter', sans-serif;
    background-color: #050505;
}

.dashboard-grid {
    background-image: radial-gradient(circle at 1px 1px, #ffffff05 1px, transparent 0);
    background-size: 40px 40px;
}

.line-clamp-1 {
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    box-orient: vertical;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #18181b;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #27272a;
}
</style>
