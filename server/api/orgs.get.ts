export default defineEventHandler(async () => {
    return await fetchGithubOrgs();
});
