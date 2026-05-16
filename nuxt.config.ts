import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: true,
    },
    modules: ['@vueuse/nuxt'],
    vite: {
        plugins: [tailwindcss()],
    },
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => tag === 'iconify-icon',
        },
    },
    css: ['./app/assets/css/main.css'],
    future: {
        compatibilityVersion: 4,
    },
});
