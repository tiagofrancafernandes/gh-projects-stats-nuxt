import type { GithubCard, GithubStats } from '~/types/github';

export function useGithub(owner?: Ref<string | undefined>, projectNumber?: Ref<number | undefined>) {
    const route = useRoute();
    const router = useRouter();

    const filters = ref({
        labels: [] as string[],
        states: [] as string[],
        status: [] as string[],
    });

    // Initialize filters from query params
    onMounted(() => {
        if (route.query.labels) filters.value.labels = (route.query.labels as string).split(',');
        if (route.query.states) filters.value.states = (route.query.states as string).split(',');
        if (route.query.status) filters.value.status = (route.query.status as string).split(',');
    });

    // Sync filters to query params
    watch(
        filters,
        (newVal) => {
            const query = { ...route.query };
            if (newVal.labels.length) query.labels = newVal.labels.join(',');
            else delete query.labels;
            if (newVal.states.length) query.states = newVal.states.join(',');
            else delete query.states;
            if (newVal.status.length) query.status = newVal.status.join(',');
            else delete query.status;

            router.push({ query });
        },
        { deep: true }
    );

    const queryParams = computed(() => {
        const params: Record<string, string> = {};
        if (owner?.value) params.owner = owner.value;
        if (projectNumber?.value) params.project = String(projectNumber.value);
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
        immediate: !!owner?.value,
    });

    const {
        data: stats,
        refresh: refreshStats,
        pending: pendingStats,
    } = useFetch<GithubStats>('/api/stats', {
        query: queryParams,
        watch: [queryParams],
        immediate: !!owner?.value,
    });

    // Auto refresh every 30s
    let timer: any = null;
    onMounted(() => {
        timer = setInterval(() => {
            if (owner?.value) {
                refreshCards();
                refreshStats();
            }
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
