export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const owner = (query.org || query.owner) as string;

    if (!owner) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Owner is required',
        });
    }

    if (!isOrgAllowed(owner, event)) {
        return [];
    }

    const projects = await fetchGithubProjects(owner, event);
    return projects.filter(p => isProjectAllowed(p.number, event) || isProjectAllowed(p.title, event));
});
