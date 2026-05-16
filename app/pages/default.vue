<template></template>

<script setup lang="ts">
const defaultProject = {
    org: 'tiagofrancafernandes',
    project: 1,
    query: {
        states: 'OPEN',
    },
};

const targetPath = [
    defaultProject.org,
    defaultProject.project,
    //
]
    .filter(Boolean)
    .join('/');

// /tiagofrancafernandes/1?states=OPEN
await navigateTo({
    // path: targetPath || undefined,
    name: 'org-project',
    params: {
        org: defaultProject.org,
        project: defaultProject.project,
    },
});
</script>
