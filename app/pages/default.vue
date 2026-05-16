<template></template>

<script setup lang="ts">

const config = useRuntimeConfig();

const defaultOwner = config.defaultOwner || config.defaultOrg || null;
const defaultProject = parseInt(config.defaultProject) || null;

if (!defaultOwner || !defaultProject) {
    await navigateTo({
        path: '/'
    });
}

const defaultValues = {
    org: defaultOwner,
    project: defaultProject,
    query: {
        states: 'OPEN',
    },
};

const targetPath = [
    defaultValues.org,
    defaultValues.project,
    //
]
    .filter(Boolean)
    .join('/').trim();

// /tiagofrancafernandes/1?states=OPEN
await navigateTo({
    // path: targetPath || undefined,
    name: 'org-project',
    params: {
        org: defaultValues.org,
        project: defaultValues.project,
    },
});
</script>
