<script setup lang="ts">
import type { GithubCard, GithubStats } from '~/types/github';

const route = useRoute();
const org = computed(() => route.params.org as string);
const project = computed(() => Number(route.params.project));

const { cards, stats, pendingCards, pendingStats, filters, setFilters, resetFilters, refresh } = useGithub(
    org,
    project
);
const { layout, toggleVisibility } = useDashboardLayout();

const focusMode = ref(false);
const expandedCardId = ref<string | null>(null);
const isFiltersOpen = ref(false);
const itemSearch = ref('');

// Sync focusMode with query param 'view=tv'
onMounted(() => {
    if (route.query.view === 'tv') focusMode.value = true;
});

watch(focusMode, (val) => {
    const query = { ...route.query };
    if (val) query.view = 'tv';
    else delete query.view;
    useRouter().push({ query });
});

const filteredCards = computed(() => {
    if (!cards.value) return [];
    if (!itemSearch.value) return cards.value;
    const s = itemSearch.value.toLowerCase();
    return cards.value.filter((card) => card.title.toLowerCase().includes(s));
});

const availableLabels = computed(() => {
    if (!stats.value?.byLabel) return [];
    return Object.keys(stats.value.byLabel).sort();
});

const availableStatuses = computed(() => {
    if (!stats.value?.byStatus) return [];
    return Object.keys(stats.value.byStatus).sort();
});

const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('done')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s.includes('progress')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (s.includes('todo')) return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
};

function toggleExpand(id: string) {
    expandedCardId.value = expandedCardId.value === id ? null : id;
}

// Drag and drop logic for reordering
const draggingItem = ref<string | null>(null);

function handleDragStart(id: string) {
    draggingItem.value = id;
}

function handleDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    if (!draggingItem.value || draggingItem.value === id) return;

    const fromIndex = layout.value.findIndex((i) => i.id === draggingItem.value);
    const toIndex = layout.value.findIndex((i) => i.id === id);

    const item = layout.value.splice(fromIndex, 1)[0];
    layout.value.splice(toIndex, 0, item);
}

function handleDragEnd() {
    draggingItem.value = null;
}
</script>

<template>
    <div
        class="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-all duration-500"
        :class="{ 'p-0': focusMode }"
    >
        <!-- Expanded Card Overlay -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="expandedCardId"
                class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-8 flex flex-col group/expanded"
                @click="expandedCardId = null"
            >
                <!-- Exit button visible on hover -->
                <button
                    @click.stop="expandedCardId = null"
                    class="absolute top-8 right-8 z-[110] p-4 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-0 group-hover/expanded:opacity-100"
                >
                    <iconify-icon icon="mdi:fullscreen-exit" class="text-3xl"></iconify-icon>
                </button>

                <div class="flex-1 overflow-hidden pointer-events-none" @click.stop>
                    <template v-if="expandedCardId === 'total'">
                        <StatCard title="Total Items" :value="stats?.total || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'open'">
                        <StatCard title="Open Items" :value="stats?.open || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'closed'">
                        <StatCard title="Closed Items" :value="stats?.closed || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'merged'">
                        <StatCard title="Merged PRs" :value="stats?.merged || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'velocity'">
                        <LineChart title="Project Velocity" :data="stats?.velocity || []" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'status'">
                        <PieChart title="Status Distribution" :data="stats?.byStatus || {}" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'labels'">
                        <PieChart title="Labels Distribution" :data="stats?.byLabel || {}" is-expanded />
                    </template>
                </div>
            </div>
        </Transition>

        <!-- Navigation -->
        <nav v-if="!focusMode" class="border-b border-zinc-900/50 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center gap-6">
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
                            <div class="text-xs font-bold text-zinc-500 uppercase tracking-widest">{{ org }}</div>
                            <div class="text-sm font-bold text-zinc-100">Project #{{ project }}</div>
                        </div>
                    </NuxtLink>
                </div>

                <div class="flex items-center gap-4">
                    <button
                        @click="refresh"
                        class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                    >
                        <iconify-icon
                            icon="mdi:refresh"
                            :class="{ 'animate-spin': pendingCards || pendingStats }"
                        ></iconify-icon>
                    </button>
                    <button
                        @click="focusMode = true"
                        class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                    >
                        <iconify-icon icon="mdi:monitor-dashboard"></iconify-icon>
                    </button>
                    <div class="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                    <button
                        @click="isFiltersOpen = true"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 font-bold text-sm hover:bg-white transition-all shadow-xl shadow-white/5"
                    >
                        <iconify-icon icon="mdi:filter-variant" class="text-lg"></iconify-icon>
                        Filters
                    </button>
                </div>
            </div>
        </nav>

        <!-- Focus Mode Close Button -->
        <button
            v-if="focusMode"
            @click="focusMode = false"
            class="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-20 hover:opacity-100"
        >
            <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
        </button>

        <main class="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <!-- Layout Grid with Drag and Drop -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <template v-for="item in layout" :key="item.id">
                    <div
                        v-if="item.visible"
                        :draggable="!focusMode"
                        @dragstart="handleDragStart(item.id)"
                        @dragover="handleDragOver($event, item.id)"
                        @dragend="handleDragEnd"
                        :class="[
                            'transition-all duration-300',
                            {
                                'lg:col-span-2': item.id === 'velocity' || item.id === 'activity',
                                'lg:col-span-4': item.id === 'activity' && focusMode,
                                'opacity-50 scale-95': draggingItem === item.id,
                            },
                        ]"
                    >
                        <template v-if="item.id === 'total'">
                            <StatCard
                                title="Total"
                                :value="stats?.total || 0"
                                icon="mdi:clipboard-text-outline"
                                :loading="pendingStats"
                                @expand="toggleExpand('total')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'open'">
                            <StatCard
                                title="Open"
                                :value="stats?.open || 0"
                                icon="mdi:alert-circle-outline"
                                :loading="pendingStats"
                                @expand="toggleExpand('open')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'closed'">
                            <StatCard
                                title="Closed"
                                :value="stats?.closed || 0"
                                icon="mdi:check-circle-outline"
                                :loading="pendingStats"
                                @expand="toggleExpand('closed')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'merged'">
                            <StatCard
                                title="Merged"
                                :value="stats?.merged || 0"
                                icon="mdi:source-merge"
                                :loading="pendingStats"
                                @expand="toggleExpand('merged')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'velocity'">
                            <LineChart
                                title="Velocity"
                                :data="stats?.velocity || []"
                                :loading="pendingStats"
                                @expand="toggleExpand('velocity')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'status'">
                            <PieChart
                                title="By Status"
                                :data="stats?.byStatus || {}"
                                :loading="pendingStats"
                                @expand="toggleExpand('status')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'labels'">
                            <PieChart
                                title="By Labels"
                                :data="stats?.byLabel || {}"
                                :loading="pendingStats"
                                @expand="toggleExpand('labels')"
                                :show-handle="!focusMode"
                            />
                        </template>
                        <template v-else-if="item.id === 'activity'">
                            <div
                                class="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col h-full group relative"
                            >
                                <!-- Drag Handle -->
                                <div
                                    v-if="!focusMode"
                                    class="absolute left-1/2 -top-1 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-20"
                                >
                                    <iconify-icon
                                        icon="mdi:drag-horizontal"
                                        class="text-2xl text-zinc-600"
                                    ></iconify-icon>
                                </div>

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
                                                            class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-lg"
                                                        >
                                                            <iconify-icon
                                                                :icon="
                                                                    card.type === 'pr'
                                                                        ? 'mdi:source-pull'
                                                                        : card.type === 'issue'
                                                                          ? 'mdi:alert-circle-outline'
                                                                          : 'mdi:file-document-edit-outline'
                                                                "
                                                                :class="
                                                                    card.type === 'pr'
                                                                        ? 'text-purple-400'
                                                                        : card.type === 'issue'
                                                                          ? 'text-emerald-400'
                                                                          : 'text-zinc-500'
                                                                "
                                                            ></iconify-icon>
                                                        </div>
                                                        <div>
                                                            <div
                                                                class="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1"
                                                            >
                                                                {{ card.title }}
                                                            </div>
                                                            <div
                                                                class="text-[10px] text-zinc-600 font-medium mt-0.5 uppercase tracking-wider"
                                                            >
                                                                {{ formatDate(card.updatedAt) }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex flex-wrap gap-1.5">
                                                        <span
                                                            v-for="l in card.labels"
                                                            :key="l"
                                                            class="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-tight"
                                                        >
                                                            {{ l }}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <span
                                                        :class="[
                                                            'px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-widest',
                                                            getStatusColor(card.status),
                                                        ]"
                                                    >
                                                        {{ card.status }}
                                                    </span>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex items-center gap-2">
                                                        <div
                                                            :class="[
                                                                'w-1.5 h-1.5 rounded-full',
                                                                card.state === 'OPEN'
                                                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
                                                                    : 'bg-zinc-700',
                                                            ]"
                                                        ></div>
                                                        <span
                                                            :class="[
                                                                'text-[10px] font-bold uppercase tracking-wider',
                                                                card.state === 'OPEN'
                                                                    ? 'text-emerald-500'
                                                                    : 'text-zinc-600',
                                                            ]"
                                                        >
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

        <FiltersModal
            :is-open="isFiltersOpen"
            :available-labels="availableLabels"
            :available-statuses="availableStatuses"
            :current-filters="filters"
            :layout="layout"
            @close="isFiltersOpen = false"
            @apply="setFilters"
            @clear="resetFilters"
            @toggle-visibility="toggleVisibility"
            @reset-layout="
                () => {
                    safeLocalStorage.removeItem('dashboard-layout');
                    safeWindow.location.reload();
                }
            "
        />

        <!-- Layout Settings Toggle -->
        <button
            v-if="!focusMode"
            @click="isFiltersOpen = true"
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
    -webkit-line-clamp: 1;
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
