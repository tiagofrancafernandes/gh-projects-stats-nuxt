<script setup lang="ts">
import draggable from 'vuedraggable';
import type { LayoutItem } from '~/composables/useDashboardLayout';

const props = defineProps<{
    id: string;
    title: string;
    children: LayoutItem[];
    loading?: boolean;
    isExpanded?: boolean;
    stats: any;
    customResults?: Record<string, any>;
}>();

const emit = defineEmits(['expand', 'update', 'updateChild']);

const isEditing = ref(false);
const editTitle = ref(props.title);

function save() {
    emit('update', { title: editTitle.value });
    isEditing.value = false;
}

function cancel() {
    editTitle.value = props.title;
    isEditing.value = false;
}

function resolveValue(item: any) {
    if (item.customFn && props.customResults?.[item.id] !== undefined) {
        return props.customResults[item.id];
    }
    return resolvePath(props.stats, item.path) ?? 0;
}

function resolvePath(obj: any, path: string | undefined) {
    if (!path || !obj) return null;
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
}

const localChildren = computed({
    get: () => props.children,
    set: (val) => emit('update', { children: val }),
});
</script>

<template>
    <div
        class="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 flex flex-col group relative transition-all duration-500"
        :class="[isExpanded ? 'fixed inset-4 z-50 overflow-auto bg-[#050505]' : 'h-full']"
    >
        <div class="flex items-center justify-between mb-6 relative z-10">
            <div class="flex items-center gap-3">
                <div
                    class="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center"
                >
                    <iconify-icon icon="mdi:layers-outline" class="text-zinc-400"></iconify-icon>
                </div>
                <h3 v-if="!isEditing" class="text-zinc-100 font-bold text-sm uppercase tracking-widest">{{ title }}</h3>
                <input
                    v-else
                    v-model="editTitle"
                    class="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
            </div>

            <div class="flex items-center gap-1">
                <template v-if="isEditing">
                    <button @click="save" class="btn btn-white btn-sm px-3">Save</button>
                    <button @click="cancel" class="btn btn-ghost btn-sm px-3">Cancel</button>
                </template>
                <template v-else>
                    <button
                        @click.stop="isEditing = true"
                        v-tippy="'Configure Group'"
                        class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm px-2"
                    >
                        <iconify-icon icon="mdi:cog" class="text-base text-zinc-500"></iconify-icon>
                    </button>
                    <button
                        @click.stop="$emit('expand')"
                        v-tippy="isExpanded ? 'Minimize' : 'Expand'"
                        class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm px-2"
                    >
                        <iconify-icon
                            :icon="isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                            class="text-base text-zinc-500"
                        ></iconify-icon>
                    </button>
                </template>
            </div>
        </div>

        <draggable
            :model-value="localChildren"
            @update:model-value="localChildren = $event"
            item-key="id"
            group="cards"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-[100px] p-2 rounded-xl bg-zinc-950/20 border border-dashed border-zinc-800/50"
            handle=".drag-handle"
        >
            <template #item="{ element: item }">
                <div
                    v-if="item.visible"
                    class="relative group"
                    :class="[item.cols === 1 ? 'col-span-1' : 'col-span-2']"
                >
                    <StatCard
                        v-if="item.type === 'stat'"
                        :title="item.title"
                        :path="item.path"
                        :value="resolveValue(item)"
                        :loading="loading"
                        :show-value="item.showValue"
                        :show-label="item.showLabel"
                        :format="item.format"
                        :precision="item.precision"
                        :sub-label="item.subLabel"
                        :custom-fn="item.customFn"
                        @update="$emit('updateChild', item.id, $event)"
                    />
                    <GaugeChart
                        v-else-if="item.type === 'gauge'"
                        :title="item.title"
                        :path="item.path"
                        :value="resolveValue(item)"
                        :max="50"
                        :loading="loading"
                        :sub-label="item.subLabel"
                        :custom-fn="item.customFn"
                        @update="$emit('updateChild', item.id, $event)"
                    />
                    <div
                        v-else
                        class="p-4 bg-zinc-900 rounded-xl text-[10px] text-zinc-600 uppercase font-bold text-center border border-zinc-800"
                    >
                        {{ item.type }} not supported in groups yet
                    </div>

                    <div
                        class="drag-handle absolute top-4 left-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg hover:bg-white/10 z-20 backdrop-blur-sm border border-transparent hover:border-white/20"
                    >
                        <iconify-icon icon="mdi:drag-variant" class="text-zinc-500 text-lg"></iconify-icon>
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>
