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
    saveView,
    loadView,
    deleteView,
    exportConfig,
    importConfig,
} = useDashboardLayout();

const isFiltersOpen = ref(false);
const isLayoutOpen = ref(false);
const focusMode = ref(false);
const itemSearch = ref('');

// Dynamic auto refresh
let refreshTimer: any = null;
function startRefreshTimer() {
    if (refreshTimer) clearInterval(refreshTimer);
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

function handleReorder(newLayout: any[]) {
    layout.value = newLayout;
}
</script>

<template>
    <div class="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-blue-500/30">
        <!-- Navigation -->
        <nav
            v-if="!focusMode"
            class="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4"
        >
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex items-center gap-8">
                    <NuxtLink to="/" class="flex items-center gap-3 group">
                        <div
                            class="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center group-hover:border-zinc-700 transition-all"
                        >
                            <iconify-icon
                                icon="mdi:github"
                                class="text-xl text-zinc-400 group-hover:text-zinc-100"
                            ></iconify-icon>
                        </div>
                        <div class="text-left">
                            <div class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {{ ownerRef }}
                            </div>
                            <div class="text-sm font-bold text-zinc-100">
                                <span class="text-zinc-500 mr-1">(#{{ projectNumber }})</span>
                                {{ stats?.projectTitle || 'Loading...' }}
                            </div>
                        </div>
                    </NuxtLink>
                </div>

                <div class="flex items-center gap-4">
                    <button
                        @click="refresh"
                        data-tooltip="Refresh"
                        class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                    >
                        <iconify-icon
                            icon="mdi:refresh"
                            :class="{ 'animate-spin': pendingCards || pendingStats }"
                            class="text-xl"
                        ></iconify-icon>
                    </button>

                    <div class="h-6 w-px bg-zinc-800 mx-2"></div>

                    <button
                        @click="focusMode = true"
                        data-tooltip="TV Mode"
                        class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                    >
                        <iconify-icon icon="mdi:monitor-dashboard" class="text-xl"></iconify-icon>
                    </button>

                    <button
                        @click="isLayoutOpen = true"
                        data-tooltip="Customize Layout"
                        class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                    >
                        <iconify-icon icon="mdi:view-dashboard-edit" class="text-xl"></iconify-icon>
                    </button>

                    <button
                        @click="isFiltersOpen = true"
                        data-tooltip="Filters"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-[0_10px_20px_-10px_rgba(59,130,246,0.3)]"
                    >
                        <iconify-icon icon="mdi:filter-variant" class="text-lg"></iconify-icon>
                        Filters
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
                data-tooltip="Exit TV Mode"
                class="pointer-events-auto p-3 px-6 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-[-20px] group-hover:translate-y-0 shadow-2xl flex items-center gap-2"
            >
                <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                <span class="text-xs font-bold uppercase tracking-widest">Exit TV Mode</span>
            </button>
        </div>

        <main class="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <!-- Layout Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <template v-for="item in layout" :key="item.id">
                    <div
                        v-if="item.visible"
                        :class="[
                            colSpanClasses[item.cols || 1],
                            (item as any).isExpanded ? 'fixed inset-4 z-50 overflow-auto bg-[#050505] p-8' : 'relative',
                        ]"
                    >
                        <template v-if="item.id === 'total'">
                            <StatCard
                                title="Total Items"
                                :value="stats?.total || 0"
                                :loading="pendingStats"
                                color="blue"
                                :is-expanded="(item as any).isExpanded"
                                @expand="toggleExpand('total')"
                            />
                        </template>
                        <template v-else-if="item.id === 'open'">
                            <StatCard
                                title="Open Items"
                                :value="stats?.open || 0"
                                :loading="pendingStats"
                                color="green"
                                :is-expanded="(item as any).isExpanded"
                                @expand="toggleExpand('open')"
                            />
                        </template>
                        <template v-else-if="item.id === 'closed'">
                            <StatCard
                                title="Closed Items"
                                :value="stats?.closed || 0"
                                :loading="pendingStats"
                                color="purple"
                                :is-expanded="(item as any).isExpanded"
                                @expand="toggleExpand('closed')"
                            />
                        </template>
                        <template v-else-if="item.id === 'merged'">
                            <StatCard
                                title="Merged PRs"
                                :value="stats?.merged || 0"
                                :loading="pendingStats"
                                color="pink"
                                :is-expanded="(item as any).isExpanded"
                                @expand="toggleExpand('merged')"
                            />
                        </template>
                        <template v-else-if="item.id === 'velocity'">
                            <LineChart
                                title="Velocity"
                                :data="stats?.velocity || []"
                                :loading="pendingStats"
                                @expand="toggleExpand('velocity')"
                                :is-expanded="(item as any).isExpanded"
                            />
                        </template>
                        <template v-else-if="item.id === 'status'">
                            <PieChart
                                title="By Status"
                                :data="stats?.byStatus || {}"
                                :loading="pendingStats"
                                @expand="toggleExpand('status')"
                                :is-expanded="(item as any).isExpanded"
                            />
                        </template>
                        <template v-else-if="item.id === 'labels'">
                            <PieChart
                                title="By Labels"
                                :data="stats?.byLabel || {}"
                                :loading="pendingStats"
                                @expand="toggleExpand('labels')"
                                :is-expanded="(item as any).isExpanded"
                            />
                        </template>
                        <template v-else-if="item.id === 'activity'">
                            <div
                                class="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl flex flex-col h-full group relative"
                            >
                                <div
                                    class="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div class="flex items-center gap-4">
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
                                            class="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div class="overflow-x-auto flex-1">
                                    <table class="w-full text-left">
                                        <thead
                                            class="bg-[#080808] text-zinc-600 text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            <tr>
                                                <th class="px-6 py-4">Content</th>
                                                <th class="px-6 py-4">Labels</th>
                                                <th class="px-6 py-4">Status</th>
                                                <th class="px-6 py-4">State</th>
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
                                                            class="text-sm font-semibold text-zinc-300 hover:text-blue-400 transition-colors line-clamp-1"
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
                        </template>
                    </div>
                </template>
            </div>
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
            @reorder="handleReorder"
            @save-view="saveView"
            @load-view="loadView"
            @delete-view="deleteView"
            @set-refresh-interval="refreshInterval = $event"
            @export="exportConfig"
            @import="importConfig"
        />

        <!-- Layout Settings Toggle -->
        <button
            v-if="!focusMode"
            @click="isLayoutOpen = true"
            data-tooltip="Customize Layout"
            class="fixed bottom-8 left-8 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all shadow-2xl"
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
