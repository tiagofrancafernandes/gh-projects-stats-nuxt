import type { GithubCard, GithubStats } from '~/types/github';

export function useGithub() {
    const filters = ref({
        labels: [] as string[],
        states: [] as string[],
        status: [] as string[],
    });

    const queryParams = computed(() => {
        const params: Record<string, string> = {};
        if (filters.value.labels.length) params.labels = filters.value.labels.join(',');
        if (filters.value.states.length) params.states = filters.value.states.join(',');
        if (filters.value.status.length) params.status = filters.value.status.join(',');
        return params;
    });

    const {
        data: cards,
        refresh: refreshCards,
        pending: pendingCards,
    } = useFetch<GithubCard[]>('/api/cards', {
        query: queryParams,
        watch: [queryParams],
    });

    const { data: stats, refresh: refreshStats, pending: pendingStats } = useFetch<GithubStats>('/api/stats');

    // Auto refresh every 30s
    let timer: any = null;
    onMounted(() => {
        timer = setInterval(() => {
            refreshCards();
            refreshStats();
        }, 30000);
    });

    onUnmounted(() => {
        if (timer) clearInterval(timer);
    });

    function setFilters(newFilters: Partial<typeof filters.value>) {
        filters.value = { ...filters.value, ...newFilters };
    }

    function resetFilters() {
        filters.value = {
            labels: [],
            states: [],
            status: [],
        };
    }

    return {
        cards,
        stats,
        pendingCards,
        pendingStats,
        filters,
        setFilters,
        resetFilters,
        refresh: () => {
            refreshCards();
            refreshStats();
        },
    };
}
