<script setup lang="ts">
import type { GithubOrg, GithubProject } from '~/types/github';

const router = useRouter();

const currentStep = ref<'ORG_SELECT' | 'PROJECT_SELECT'>('ORG_SELECT');
const selectedOrg = ref<GithubOrg | null>(null);
const selectedProject = ref<GithubProject | null>(null);

const { data: orgs, pending: pendingOrgs } = useFetch<GithubOrg[]>('/api/orgs');
const {
    data: projects,
    pending: pendingProjects,
    refresh: refreshProjects,
} = useFetch<GithubProject[]>('/api/projects', {
    query: computed(() => ({ owner: selectedOrg.value?.login })),
    immediate: false,
    watch: false,
});

function handleOrgSelect(org: GithubOrg) {
    selectedOrg.value = org;
    currentStep.value = 'PROJECT_SELECT';
    refreshProjects();
}

function handleProjectSelect(project: GithubProject) {
    selectedProject.value = project;
    if (selectedOrg.value && project) {
        router.push(`/${selectedOrg.value.login}/${project.number}`);
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30 flex items-center justify-center p-6 relative overflow-hidden"
    >
        <!-- Background Glow -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"
        ></div>

        <div class="w-full max-w-xl relative z-10">
            <div class="text-center mb-12">
                <div
                    class="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/10"
                >
                    <iconify-icon icon="mdi:github" class="text-3xl text-zinc-100"></iconify-icon>
                </div>
                <h1 class="text-3xl font-bold tracking-tight mb-2">
                    {{ currentStep === 'ORG_SELECT' ? 'Connect to GitHub' : 'Select Project' }}
                </h1>
                <p class="text-zinc-500 text-sm">
                    {{
                        currentStep === 'ORG_SELECT'
                            ? 'Choose an organization or user to begin'
                            : `Browsing projects in ${selectedOrg?.name}`
                    }}
                </p>
            </div>

            <div class="space-y-6">
                <template v-if="currentStep === 'ORG_SELECT'">
                    <TypeaheadSelect
                        v-model="selectedOrg"
                        :items="orgs || []"
                        placeholder="Search organization..."
                        label-key="name"
                        :loading="pendingOrgs"
                        @select="handleOrgSelect"
                    >
                        <template #item="{ item }">
                            <img :src="item.avatarUrl" class="w-6 h-6 rounded-md" />
                            <div class="flex flex-col">
                                <span class="text-zinc-200 text-sm font-medium">{{ item.name }}</span>
                                <span class="text-zinc-600 text-[10px] uppercase font-bold">{{ item.type }}</span>
                            </div>
                        </template>
                    </TypeaheadSelect>
                </template>

                <template v-else-if="currentStep === 'PROJECT_SELECT'">
                    <div class="flex items-center gap-2 mb-4">
                        <button
                            @click="currentStep = 'ORG_SELECT'"
                            class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                        >
                            <iconify-icon icon="mdi:arrow-left"></iconify-icon>
                            Back
                        </button>
                    </div>
                    <TypeaheadSelect
                        v-model="selectedProject"
                        :items="projects || []"
                        placeholder="Search project..."
                        label-key="title"
                        :loading="pendingProjects"
                        @select="handleProjectSelect"
                    />
                </template>
            </div>
        </div>
    </div>
</template>
