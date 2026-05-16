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
    runtimeConfig: {
        // 🔒 Private - server only
        githubToken: process.env.GITHUB_TOKEN,
        allowGithubViaOAuth: ['true', '1', 'on', true].includes(process.env.GITHUB_VIA_OAUTH ?? false),
        mockOrgsAllowed: ['true', '1', 'on', true].includes(process.env.MOCK_ORGS_ALLOWED ?? false),

        defaultOrg: String((process.env.DEFAULT_GITHUB_ORG ?? process.env.DEFAULT_GITHUB_OWNER) || ''),
        defaultOwner: String((process.env.DEFAULT_GITHUB_OWNER ?? process.env.DEFAULT_GITHUB_ORG) || ''),
        defaultProject: process.env.DEFAULT_GITHUB_PROJECT,

        // Filtering
        allowedOrgs: process.env.ALLOWED_ORGS || '',
        excludedOrgs: process.env.EXCLUDED_ORGS || '',
        allowedProjects: process.env.ALLOWED_PROJECTS || '',
        excludedProjects: process.env.EXCLUDED_PROJECTS || '',
    },
});
