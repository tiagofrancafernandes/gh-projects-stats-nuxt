export default defineEventHandler(async (event) => {
    const orgs = await fetchGithubOrgs(event);
    return orgs.filter(o => isOrgAllowed(o.login, event));
});
