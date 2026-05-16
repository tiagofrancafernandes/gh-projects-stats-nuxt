<script setup lang="ts">
const props = defineProps<{
    modelValue: any;
    items: any[];
    placeholder: string;
    labelKey?: string;
    valueKey?: string;
    loading?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const search = ref('');
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const filteredItems = computed(() => {
    if (!search.value) return props.items;
    const s = search.value.toLowerCase();
    return props.items.filter((item) => {
        const label = props.labelKey ? item[props.labelKey] : item;
        return String(label).toLowerCase().includes(s);
    });
});

const selectedLabel = computed(() => {
    if (!props.modelValue) return '';
    if (props.labelKey) return props.modelValue[props.labelKey];
    return props.modelValue;
});

function select(item: any) {
    emit('update:modelValue', item);
    emit('select', item);
    isOpen.value = false;
    search.value = '';
}

onClickOutside(containerRef, () => (isOpen.value = false));

function open() {
    isOpen.value = true;
    search.value = '';
}
</script>

<template>
    <div ref="containerRef" class="relative w-full">
        <div
            @click="open"
            class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all group"
            :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': isOpen }"
        >
            <div class="flex items-center gap-3 overflow-hidden">
                <iconify-icon icon="mdi:magnify" class="text-zinc-500 group-hover:text-zinc-300"></iconify-icon>
                <div v-if="!isOpen && selectedLabel" class="text-zinc-100 font-medium truncate">
                    {{ selectedLabel }}
                </div>
                <input
                    v-else
                    v-model="search"
                    :placeholder="placeholder"
                    class="bg-transparent border-none outline-none text-zinc-100 w-full placeholder:text-zinc-600"
                    @click.stop="open"
                />
            </div>
            <iconify-icon
                icon="mdi:chevron-down"
                class="text-zinc-500 transition-transform"
                :class="{ 'rotate-180': isOpen }"
            ></iconify-icon>
        </div>

        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <div
                v-if="isOpen"
                class="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
            >
                <div v-if="loading" class="p-4 flex justify-center">
                    <div class="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
                </div>
                <template v-else>
                    <div
                        v-for="(item, index) in filteredItems"
                        :key="index"
                        @click="select(item)"
                        class="px-4 py-3 hover:bg-zinc-800 cursor-pointer transition-colors flex items-center gap-3"
                    >
                        <slot name="item" :item="item">
                            <span class="text-zinc-300 text-sm">{{ labelKey ? item[labelKey] : item }}</span>
                        </slot>
                    </div>
                    <div v-if="filteredItems.length === 0" class="p-4 text-zinc-500 text-sm text-center">
                        No results found
                    </div>
                </template>
            </div>
        </Transition>
    </div>
</template>
