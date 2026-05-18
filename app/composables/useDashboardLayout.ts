export interface LayoutItem {
    id: string;
    title: string;
    visible: boolean;
    cols: number; // 1 to 4
    path?: string; // JSON path in stats object
    type?: 'stat' | 'chart' | 'gauge' | 'list' | 'pie' | 'group';
    subLabel?: string; // New: editable sub-label
    children?: LayoutItem[]; // New: for nested groups
    customFn?: string; // New: Custom JS logic
    showValue?: boolean;
    showLabel?: boolean;
    format?: 'fixed' | 'percent';
    precision?: number;
}

export interface DashboardView {
    id: string;
    name: string;
    layout: LayoutItem[];
    refreshInterval: number;
}

export function useDashboardLayout() {
    const defaultLayout: LayoutItem[] = [
        {
            id: 'custom_demo',
            title: 'Custom Random Value',
            visible: false,
            cols: 1,
            type: 'stat',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
            customFn: 'return Math.floor(Math.random() * 100);',
        },
        {
            id: 'total',
            title: 'Total Items',
            visible: true,
            cols: 1,
            path: 'total',
            type: 'stat',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
        },
        {
            id: 'open',
            title: 'Open Items',
            visible: true,
            cols: 1,
            path: 'open',
            type: 'stat',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
        },
        {
            id: 'closed',
            title: 'Closed Items',
            visible: true,
            cols: 1,
            path: 'closed',
            type: 'stat',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
        },
        {
            id: 'merged',
            title: 'Merged PRs',
            visible: true,
            cols: 1,
            path: 'merged',
            type: 'stat',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
        },
        {
            id: 'velocity_gauge',
            title: 'Current Velocity',
            visible: true,
            cols: 1,
            path: 'weeklyVelocity',
            type: 'gauge',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
            subLabel: 'Items / Week',
        },
        { id: 'velocity', title: 'Velocity Chart', visible: true, cols: 3, path: 'velocity', type: 'gauge' },
        { id: 'status', title: 'Status Chart', visible: true, cols: 2, path: 'byStatus', type: 'pie' },
        { id: 'labels', title: 'Labels Chart', visible: true, cols: 2, path: 'byLabel', type: 'pie' },
        { id: 'activity', title: 'Recent Activity', visible: true, cols: 4, type: 'list' },
    ];

    const layout = ref<LayoutItem[]>([]);
    const views = ref<Record<string, DashboardView>>({});
    const currentViewId = ref<string>('default');
    const refreshInterval = ref<number>(15000); // 15s default

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
                refreshInterval.value = typeof parsed.refreshInterval === 'number' ? parsed.refreshInterval : 15000;

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

    function cloneView(id: string) {
        const view = views.value[id];
        if (view) {
            const newName = `${view.name} (Copy)`;
            const newId = `${id}-copy-${Date.now()}`;
            views.value[newId] = {
                ...JSON.parse(JSON.stringify(view)),
                id: newId,
                name: newName,
            };
        }
    }

    function addItem(type: LayoutItem['type'] = 'stat') {
        const id = `custom-${Date.now()}`;
        const item: LayoutItem = {
            id,
            title: type === 'group' ? 'New Group' : 'New Card',
            visible: true,
            cols: type === 'group' ? 2 : 1,
            type,
            path: '',
            showValue: true,
            showLabel: true,
            format: 'fixed',
            precision: 0,
        };

        if (type === 'group') {
            item.children = [];
        }

        layout.value.push(item);
    }

    function removeItem(id: string) {
        const index = layout.value.findIndex((i) => i.id === id);
        if (index > -1) {
            layout.value.splice(index, 1);
        }
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

    function updateItem(id: string, updates: Partial<LayoutItem>) {
        const findAndUpdate = (items: LayoutItem[]): boolean => {
            const item = items.find((i) => i.id === id);
            if (item) {
                Object.assign(item, updates);
                return true;
            }
            for (const i of items) {
                if (i.children && findAndUpdate(i.children)) return true;
            }
            return false;
        };
        findAndUpdate(layout.value);
    }

    const hasUnsavedChanges = computed(() => {
        const currentView = views.value[currentViewId.value];
        if (!currentView) return false;
        return (
            JSON.stringify(layout.value) !== JSON.stringify(currentView.layout) ||
            refreshInterval.value !== currentView.refreshInterval
        );
    });

    return {
        layout,
        views,
        currentViewId,
        refreshInterval,
        hasUnsavedChanges,
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
    };
}
