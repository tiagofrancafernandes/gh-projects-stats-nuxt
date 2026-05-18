<script setup lang="ts">
import 'iconify-icon';
const { appSettings } = useAppConfig();
const { theme } = appSettings || {};

useHead({
    meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: {
        lang: 'en',
    },
    bodyAttrs: {
        class: computed(() => `body-computed-class theme-color-${theme.color}`),
    },
});

const title = 'GH Insights';
const description =
    'High-performance dashboard to visualize and analyze GitHub Projects v2 metrics with customizable layouts, programmable metrics, and TV mode.';

useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    twitterCard: 'summary',
});

const router = useRouter();
</script>

<template>
    <div class="overscroll-none antialiased bg-background text-foreground">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
