export interface LayoutItem {
    id: string;
    title: string;
    visible: boolean;
    cols: number; // 1 to 4
}

export interface DashboardView {
    id: string;
    name: string;
    layout: LayoutItem[];
    refreshInterval: number;
}

export function useDashboardLayout() {
    const defaultLayout: LayoutItem[] = [
        { id: 'total', title: 'Total Items', visible: true, cols: 1 },
        { id: 'open', title: 'Open Items', visible: true, cols: 1 },
        { id: 'closed', title: 'Closed Items', visible: true, cols: 1 },
        { id: 'merged', title: 'Merged PRs', visible: true, cols: 1 },
        { id: 'velocity', title: 'Velocity Chart', visible: true, cols: 2 },
        { id: 'status', title: 'Status Chart', visible: true, cols: 2 },
        { id: 'labels', title: 'Labels Chart', visible: true, cols: 4 },
        { id: 'activity', title: 'Recent Activity', visible: true, cols: 4 },
    ];

    const layout = ref<LayoutItem[]>([]);
    const views = ref<Record<string, DashboardView>>({});
    const currentViewId = ref<string>('default');
    const refreshInterval = ref<number>(30000); // 30s default

    function saveToStorage() {
        const data = {
            layout: layout.value,
            views: views.value,
            currentViewId: currentViewId.value,
            refreshInterval: refreshInterval.value,
        };
        safeLocalStorage.setItem('dashboard-config-v2', JSON.stringify(data));
    }

    onMounted(() => {
        const saved = safeLocalStorage.getItem('dashboard-config-v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                views.value = parsed.views || {};
                currentViewId.value = parsed.currentViewId || 'default';
                refreshInterval.value = parsed.refreshInterval || 30000;

                // Load current layout or fallback
                const savedLayout = parsed.layout;
                layout.value = defaultLayout.map((d) => {
                    const item = savedLayout.find((p: any) => p.id === d.id);
                    return item ? { ...d, ...item } : d;
                });
            } catch (e) {
                layout.value = [...defaultLayout];
            }
        } else {
            layout.value = [...defaultLayout];
        }
    });

    watch([layout, views, currentViewId, refreshInterval], () => saveToStorage(), { deep: true });

    function toggleVisibility(id: string) {
        const item = layout.value.find((i) => i.id === id);
        if (item) item.visible = !item.visible;
    }

    function setCols(id: string, cols: number) {
        const item = layout.value.find((i) => i.id === id);
        if (item) item.cols = Math.max(1, Math.min(4, cols));
    }

    function saveView(name: string) {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        views.value[id] = {
            id,
            name,
            layout: JSON.parse(JSON.stringify(layout.value)),
            refreshInterval: refreshInterval.value,
        };
        currentViewId.value = id;
    }

    function loadView(id: string) {
        const view = views.value[id];
        if (view) {
            layout.value = JSON.parse(JSON.stringify(view.layout));
            refreshInterval.value = view.refreshInterval;
            currentViewId.value = id;
        }
    }

    function deleteView(id: string) {
        delete views.value[id];
        if (currentViewId.value === id) currentViewId.value = 'default';
    }

    function exportConfig() {
        const data = {
            layout: layout.value,
            views: views.value,
            refreshInterval: refreshInterval.value,
            version: '2.0',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gh-dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importConfig(json: string) {
        try {
            const parsed = JSON.parse(json);
            if (parsed.layout) layout.value = parsed.layout;
            if (parsed.views) views.value = parsed.views;
            if (parsed.refreshInterval) refreshInterval.value = parsed.refreshInterval;
            return true;
        } catch (e) {
            console.error('Failed to import config', e);
            return false;
        }
    }

    return {
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
    };
}
