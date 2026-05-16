<script setup lang="ts">
import type { GithubOrg, GithubProject, GithubCard, GithubStats } from '~/types/github';

const { cards, stats, pendingCards, pendingStats, filters, setFilters, resetFilters, refresh } = useGithub();

type Step = 'ORG_SELECT' | 'PROJECT_SELECT' | 'DASHBOARD';
const currentStep = ref<Step>('ORG_SELECT');
const focusMode = ref(false);
const expandedCardId = ref<string | null>(null);
const isFiltersOpen = ref(false);

const selectedOrg = ref<GithubOrg | null>(null);
const selectedProject = ref<GithubProject | null>(null);

const { data: orgs, pending: pendingOrgs } = useFetch<GithubOrg[]>('/api/orgs');
const {
    data: projects,
    pending: pendingProjects,
    refresh: refreshProjects,
} = useFetch<GithubProject[]>('/api/projects', {
    query: computed(() => ({ owner: selectedOrg.value?.login })),
    immediate: false,
    watch: false,
});

function handleOrgSelect(org: GithubOrg) {
    selectedOrg.value = org;
    currentStep.value = 'PROJECT_SELECT';
    refreshProjects();
}

function handleProjectSelect(project: GithubProject) {
    selectedProject.value = project;
    // Set query params in useGithub context
    // In a real app, useGithub would take these as params
    // For now, we'll just pass them via query in the fetch calls
    currentStep.value = 'DASHBOARD';
}

// Override useGithub fetch logic with selected org/project
const queryParams = computed(() => ({
    org: selectedOrg.value?.login,
    project: selectedProject.value?.number,
    ...filters.value,
}));

// We'll re-fetch cards and stats manually when step becomes DASHBOARD
watch(currentStep, (newStep) => {
    if (newStep === 'DASHBOARD') {
        refreshDashboard();
    }
});

function refreshDashboard() {
    refreshCards();
    refreshStats();
}

// For simplicity in this demo, we'll just use the fetch with the computed params
const {
    data: dashboardCards,
    pending: dashboardPendingCards,
    refresh: refreshCards,
} = useFetch<GithubCard[]>('/api/cards', {
    query: queryParams,
    immediate: false,
});

const {
    data: dashboardStats,
    pending: dashboardPendingStats,
    refresh: refreshStats,
} = useFetch<GithubStats>('/api/stats', {
    query: queryParams,
    immediate: false,
});

function refreshAll() {
    refreshCards();
    refreshStats();
}

function toggleExpand(id: string) {
    if (expandedCardId.value === id) {
        expandedCardId.value = null;
    } else {
        expandedCardId.value = id;
    }
}

const availableLabels = computed(() => {
    if (!dashboardStats.value?.byLabel) return [];
    return Object.keys(dashboardStats.value.byLabel).sort();
});

const availableStatuses = computed(() => {
    if (!dashboardStats.value?.byStatus) return [];
    return Object.keys(dashboardStats.value.byStatus).sort();
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
            <div v-if="expandedCardId" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-8 flex flex-col">
                <div class="flex justify-end mb-4">
                    <button
                        @click="expandedCardId = null"
                        class="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                    >
                        <iconify-icon icon="mdi:close" class="text-3xl"></iconify-icon>
                    </button>
                </div>
                <div class="flex-1 overflow-hidden">
                    <template v-if="expandedCardId === 'total'">
                        <StatCard title="Total Items" :value="dashboardStats?.total || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'open'">
                        <StatCard title="Open Items" :value="dashboardStats?.open || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'closed'">
                        <StatCard title="Closed Items" :value="dashboardStats?.closed || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'merged'">
                        <StatCard title="Merged PRs" :value="dashboardStats?.merged || 0" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'velocity'">
                        <LineChart title="Project Velocity" :data="dashboardStats?.velocity || []" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'status'">
                        <PieChart title="Status Distribution" :data="dashboardStats?.byStatus || {}" is-expanded />
                    </template>
                    <template v-if="expandedCardId === 'labels'">
                        <PieChart title="Labels Distribution" :data="dashboardStats?.byLabel || {}" is-expanded />
                    </template>
                </div>
            </div>
        </Transition>

        <!-- Selection Flow -->
        <div v-if="currentStep !== 'DASHBOARD'" class="min-h-screen flex items-center justify-center p-6 relative">
            <!-- Background Glow -->
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"
            ></div>

            <div class="w-full max-w-xl relative z-10">
                <div class="text-center mb-12">
                    <div
                        class="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/10"
                    >
                        <iconify-icon icon="mdi:github" class="text-3xl text-zinc-100"></iconify-icon>
                    </div>
                    <h1 class="text-3xl font-bold tracking-tight mb-2">
                        {{ currentStep === 'ORG_SELECT' ? 'Connect to GitHub' : 'Select Project' }}
                    </h1>
                    <p class="text-zinc-500 text-sm">
                        {{
                            currentStep === 'ORG_SELECT'
                                ? 'Choose an organization or user to begin'
                                : `Browsing projects in ${selectedOrg?.name}`
                        }}
                    </p>
                </div>

                <div class="space-y-6">
                    <template v-if="currentStep === 'ORG_SELECT'">
                        <TypeaheadSelect
                            v-model="selectedOrg"
                            :items="orgs || []"
                            placeholder="Search organization..."
                            label-key="name"
                            :loading="pendingOrgs"
                            @select="handleOrgSelect"
                        >
                            <template #item="{ item }">
                                <img :src="item.avatarUrl" class="w-6 h-6 rounded-md" />
                                <div class="flex flex-col">
                                    <span class="text-zinc-200 text-sm font-medium">{{ item.name }}</span>
                                    <span class="text-zinc-600 text-[10px] uppercase font-bold">{{ item.type }}</span>
                                </div>
                            </template>
                        </TypeaheadSelect>
                    </template>

                    <template v-else-if="currentStep === 'PROJECT_SELECT'">
                        <div class="flex items-center gap-2 mb-4">
                            <button
                                @click="currentStep = 'ORG_SELECT'"
                                class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                            >
                                <iconify-icon icon="mdi:arrow-left"></iconify-icon>
                                Back
                            </button>
                        </div>
                        <TypeaheadSelect
                            v-model="selectedProject"
                            :items="projects || []"
                            placeholder="Search project..."
                            label-key="title"
                            :loading="pendingProjects"
                            @select="handleProjectSelect"
                        />
                    </template>
                </div>
            </div>
        </div>

        <!-- Dashboard View -->
        <template v-else>
            <!-- Navigation -->
            <nav
                v-if="!focusMode"
                class="border-b border-zinc-900/50 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40"
            >
                <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div class="flex items-center gap-6">
                        <button @click="currentStep = 'ORG_SELECT'" class="flex items-center gap-3 group">
                            <div
                                class="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center group-hover:border-zinc-700 transition-all"
                            >
                                <img v-if="selectedOrg" :src="selectedOrg.avatarUrl" class="w-6 h-6 rounded" />
                                <iconify-icon v-else icon="mdi:github" class="text-xl"></iconify-icon>
                            </div>
                            <div class="text-left">
                                <div class="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    {{ selectedOrg?.name }}
                                </div>
                                <div class="text-sm font-bold text-zinc-100">{{ selectedProject?.title }}</div>
                            </div>
                        </button>
                    </div>

                    <div class="flex items-center gap-4">
                        <button
                            @click="refreshAll"
                            class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                            title="Refresh Data"
                        >
                            <iconify-icon
                                icon="mdi:refresh"
                                :class="{ 'animate-spin': dashboardPendingCards || dashboardPendingStats }"
                            ></iconify-icon>
                        </button>
                        <button
                            @click="focusMode = true"
                            class="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 transition-all"
                            title="TV Mode"
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
                class="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-0 hover:opacity-100"
            >
                <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
            </button>

            <main class="max-w-7xl mx-auto px-6 py-12 space-y-12">
                <!-- Stat Grid -->
                <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total"
                        :value="dashboardStats?.total || 0"
                        icon="mdi:clipboard-text-outline"
                        :loading="dashboardPendingStats"
                        @expand="toggleExpand('total')"
                    />
                    <StatCard
                        title="Open"
                        :value="dashboardStats?.open || 0"
                        icon="mdi:alert-circle-outline"
                        :loading="dashboardPendingStats"
                        @expand="toggleExpand('open')"
                    />
                    <StatCard
                        title="Closed"
                        :value="dashboardStats?.closed || 0"
                        icon="mdi:check-circle-outline"
                        :loading="dashboardPendingStats"
                        @expand="toggleExpand('closed')"
                    />
                    <StatCard
                        title="Merged"
                        :value="dashboardStats?.merged || 0"
                        icon="mdi:source-merge"
                        :loading="dashboardPendingStats"
                        @expand="toggleExpand('merged')"
                    />
                </section>

                <!-- Charts -->
                <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <LineChart
                            title="Velocity"
                            :data="dashboardStats?.velocity || []"
                            :loading="dashboardPendingStats"
                            @expand="toggleExpand('velocity')"
                        />
                    </div>
                    <div>
                        <PieChart
                            title="By Status"
                            :data="dashboardStats?.byStatus || {}"
                            :loading="dashboardPendingStats"
                            @expand="toggleExpand('status')"
                        />
                    </div>
                </section>

                <!-- Items Table -->
                <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                        <PieChart
                            title="By Labels"
                            :data="dashboardStats?.byLabel || {}"
                            :loading="dashboardPendingStats"
                            @expand="toggleExpand('labels')"
                        />
                    </div>
                    <div
                        class="lg:col-span-2 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col"
                    >
                        <div class="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
                            <h3 class="text-zinc-500 font-bold text-xs uppercase tracking-widest">Recent Activity</h3>
                            <span class="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">
                                {{ dashboardCards?.length || 0 }} ITEMS
                            </span>
                        </div>

                        <div class="overflow-x-auto">
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
                                        v-for="card in dashboardCards"
                                        :key="card.id"
                                        class="hover:bg-zinc-800/20 transition-all group"
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
                                                        card.state === 'OPEN' ? 'text-emerald-500' : 'text-zinc-600',
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
                </section>
            </main>
        </template>

        <!-- Filters -->
        <FiltersModal
            :is-open="isFiltersOpen"
            :available-labels="availableLabels"
            :available-statuses="availableStatuses"
            :current-filters="filters"
            @close="isFiltersOpen = false"
            @apply="setFilters"
            @clear="resetFilters"
        />
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
