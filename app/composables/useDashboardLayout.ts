export interface LayoutItem {
    id: string;
    title: string;
    visible: boolean;
}

export function useDashboardLayout() {
    const defaultLayout: LayoutItem[] = [
        { id: 'total', title: 'Total Items', visible: true },
        { id: 'open', title: 'Open Items', visible: true },
        { id: 'closed', title: 'Closed Items', visible: true },
        { id: 'merged', title: 'Merged PRs', visible: true },
        { id: 'velocity', title: 'Velocity Chart', visible: true },
        { id: 'status', title: 'Status Chart', visible: true },
        { id: 'labels', title: 'Labels Chart', visible: true },
        { id: 'activity', title: 'Recent Activity', visible: true },
    ];

    const layout = ref<LayoutItem[]>([]);

    onMounted(() => {
        const saved = safeLocalStorage.getItem('dashboard-layout');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with default to handle new items
                layout.value = defaultLayout.map((d) => {
                    const item = parsed.find((p: any) => p.id === d.id);
                    return item ? { ...d, ...item } : d;
                });
            } catch (e) {
                layout.value = [...defaultLayout];
            }
        } else {
            layout.value = [...defaultLayout];
        }
    });

    watch(
        layout,
        (newVal) => {
            safeLocalStorage.setItem('dashboard-layout', JSON.stringify(newVal));
        },
        { deep: true }
    );

    function toggleVisibility(id: string) {
        const item = layout.value.find((i) => i.id === id);
        if (item) item.visible = !item.visible;
    }

    return {
        layout,
        toggleVisibility,
    };
}
