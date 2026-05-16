<script setup>
const { appSettings } = useAppConfig();
const { theme } = appSettings || {};

useHead({
    bodyAttrs: {
        class: computed(() => `color-${theme?.color || 'default'} theme-${theme?.type || 'default'}`),
    },
});

const router = useRouter();
</script>

<template>
    <div class="h-svh">
        <div class="m-auto h-full w-full flex flex-col items-center justify-center gap-2">
            <h1 class="text-[7rem] font-bold leading-tight">404</h1>
            <span class="font-medium">Oops! Page Not Found!</span>
            <p class="text-center text-muted-foreground">
                It seems like the page you're looking for
                <br />
                does not exist or might have been removed.
            </p>
            <div class="mt-6 flex gap-4">
                <button class="btn btn-ghost btn-sm px-6" @click="router.back()">Go Back</button>
                <button class="btn btn-white btn-sm px-6" @click="router.push('/')">Back to Home</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
