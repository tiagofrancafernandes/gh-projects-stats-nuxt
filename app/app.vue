<script setup lang="ts">
import 'iconify-icon';
const { appSettings } = useAppConfig();
const { theme } = appSettings || {};

useHead({
    meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: {
        lang: 'pt-BR',
    },
    bodyAttrs: {
        class: computed(() => `body-computed-class theme-color-${theme.color}`),
    },
});

const title = 'GH Insights';
const description =
    'Painel de alta performance para visualizar e analisar métricas de projetos do GitHub (Projects v2) com layouts customizáveis, métricas programáveis e modo TV.';

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
