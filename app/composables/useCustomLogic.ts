import { ref, watch } from 'vue';
import type { LayoutItem } from './useDashboardLayout';

export function useCustomLogic() {
    const results = ref<Record<string, any>>({});
    const isRunning = ref(false);

    async function executeItem(item: LayoutItem, stats: any, cards: any[]) {
        if (!item.customFn) return null;

        try {
            // Safe wrapper for async function
            // Arguments: stats (aggregated), cards (raw list)
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
            const runner = new AsyncFunction(
                'stats',
                'cards',
                `
                try {
                    ${item.customFn}
                } catch (e) {
                    console.error('Custom function error in item ${item.id}:', e);
                    return null;
                }
            `
            );

            const result = await runner(stats, cards);

            // Validation based on type
            if (item.type === 'stat' || item.type === 'gauge') {
                const num = parseFloat(result);
                return isNaN(num) ? 0 : num;
            }

            if (item.type === 'chart' || item.type === 'pie') {
                return Array.isArray(result) || typeof result === 'object' ? result : [];
            }

            return result;
        } catch (err) {
            console.error('Failed to compile custom function for item:', item.id, err);
            return item.type === 'stat' ? 0 : [];
        }
    }

    async function runAll(layout: LayoutItem[], stats: any, cards: any[]) {
        isRunning.value = true;
        const newResults: Record<string, any> = {};

        const promises = layout.map(async (item) => {
            if (item.customFn) {
                newResults[item.id] = await executeItem(item, stats, cards);
            }

            // Handle nested groups
            if (item.children) {
                for (const child of item.children) {
                    if (child.customFn) {
                        newResults[child.id] = await executeItem(child, stats, cards);
                    }
                }
            }
        });

        await Promise.all(promises);
        results.value = newResults;
        isRunning.value = false;
    }

    return {
        results,
        isRunning,
        runAll,
        executeItem,
    };
}
