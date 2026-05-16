import { mapGithubItem, aggregateStats } from '~/utils/githubMapper';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const org = query.org as string;
    const project = parseInt(query.project as string);

    if (!org || isNaN(project)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Org and Project are required',
        });
    }

    const rawItems = await fetchGithubProjectItems(org, project);
    const cards = rawItems.map(mapGithubItem);
    const stats = aggregateStats(cards);

    return stats;
});
