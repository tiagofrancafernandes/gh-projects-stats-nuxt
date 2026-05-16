<template>
    <div class="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 animate-pulse">
        <div class="flex justify-between items-center mb-8">
            <div class="h-5 w-32 bg-zinc-800 rounded"></div>
            <div class="h-8 w-8 bg-zinc-800 rounded-lg"></div>
        </div>
        <div class="flex items-end gap-2 h-48 w-full">
            <div
                v-for="i in 12"
                :key="i"
                class="bg-zinc-800 rounded-t w-full"
                :style="{ height: Math.random() * 80 + 20 + '%' }"
            ></div>
        </div>
    </div>
</template>
