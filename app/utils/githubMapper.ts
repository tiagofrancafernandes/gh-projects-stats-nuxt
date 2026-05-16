import type { GithubCard, GithubStats, GithubItemType } from '~/types/github';

export function mapGithubItem(item: any): GithubCard {
    const content = item.content || {};
    const type: GithubItemType =
        item.content?.__typename === 'Issue' ? 'issue' : item.content?.__typename === 'PullRequest' ? 'pr' : 'draft';

    const statusField = item.fieldValues?.nodes?.find((f: any) => f.field?.name === 'Status');
    const status = statusField?.name || statusField?.optionId || 'Unknown';

    return {
        id: item.id,
        title: content.title || item.content?.title || 'No Title',
        type,
        state: content.state || 'OPEN',
        merged: content.merged || false,
        labels: content.labels?.nodes?.map((l: any) => l.name) || [],
        status,
        createdAt: content.createdAt || item.createdAt || '',
        updatedAt: content.updatedAt || item.updatedAt || '',
        closedAt: content.closedAt || null,
    };
}

export function aggregateStats(cards: GithubCard[]): GithubStats {
    const stats: GithubStats = {
        total: cards.length,
        open: 0,
        closed: 0,
        merged: 0,
        byStatus: {},
        byLabel: {},
        customKey: 777,
        velocity: [],
    };

    const velocityMap: Record<string, number> = {};

    for (const card of cards) {
        if (card.state === 'OPEN') {
            stats.open++;
        } else {
            stats.closed++;
        }

        if (card.merged) {
            stats.merged++;
        }

        stats.byStatus[card.status] = (stats.byStatus[card.status] || 0) + 1;

        for (const label of card.labels) {
            stats.byLabel[label] = (stats.byLabel[label] || 0) + 1;
        }

        if (card.closedAt) {
            const date = card.closedAt.split('T')[0];
            velocityMap[date] = (velocityMap[date] || 0) + 1;
        }
    }

    stats.velocity = Object.entries(velocityMap)
        .map(([date, closed]) => ({ date, closed }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate weekly velocity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    stats.weeklyVelocity = stats.velocity
        .filter((v) => v.date >= sevenDaysAgoStr)
        .reduce((acc, v) => acc + v.closed, 0);

    return stats;
}
