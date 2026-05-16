import { mapGithubItem, aggregateStats } from '~/utils/githubMapper';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const owner = (query.org || query.owner) as string;
    const project = parseInt(query.project as string);

    if (!owner || isNaN(project)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Org and Project are required',
        });
    }

    if (!isOrgAllowed(owner, event) || !isProjectAllowed(project, event)) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Access denied to this organization or project',
        });
    }

    const rawItems = await fetchGithubProjectItems(owner, project, event);
    const cards = rawItems.map(mapGithubItem);
    const stats = aggregateStats(cards);

    // Fetch project title
    const projects = await fetchGithubProjects(owner, event);
    const projectInfo = projects.find((p) => p.number === project);

    return {
        ...stats,
        projectTitle: projectInfo?.title || `Project #${project}`,
    };
});
