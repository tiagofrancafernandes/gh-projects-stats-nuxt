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

const title = 'GH Insights - Plataforma Administrativa';
const description =
    'GH Insights and Dashboards para gestão de clientes, aprovação de contas, integrações de pagamento e configurações da plataforma.';

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
