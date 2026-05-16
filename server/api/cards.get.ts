import { mapGithubItem } from '~/utils/githubMapper';
import type { GithubCard } from '~/types/github';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const org = (query.org || query.owner) as string;
    const project = parseInt(query.project as string);

    if (!org || isNaN(project)) {
        return [];
    }

    const labelsFilter = (query.labels as string)?.split(',').filter(Boolean);
    const statesFilter = (query.states as string)?.split(',').filter(Boolean);
    const statusFilter = (query.status as string)?.split(',').filter(Boolean);

    const rawItems = await fetchGithubProjectItems(org, project, event);
    let cards: GithubCard[] = rawItems.map(mapGithubItem);

    if (labelsFilter?.length) {
        cards = cards.filter((card) => card.labels.some((label) => labelsFilter.includes(label)));
    }
    if (statesFilter?.length) {
        cards = cards.filter((card) => statesFilter.includes(card.state));
    }
    if (statusFilter?.length) {
        cards = cards.filter((card) => statusFilter.includes(card.status));
    }

    return cards;
});
