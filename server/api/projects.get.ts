export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const owner = (query.org || query.owner) as string;

    if (!owner) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Owner is required',
        });
    }

    return await fetchGithubProjects(owner, event);
});
