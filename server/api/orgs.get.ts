export default defineEventHandler(async (event) => {
    return await fetchGithubOrgs(event);
});
