import type { H3Event } from 'h3';
import type { NitroRuntimeConfig } from 'nitropack/types';

import type { GithubCard, GithubOrg, GithubProject } from '~/types/github';

let cache: { data: any; timestamp: number; key: string } | null = null;
const CACHE_TTL = 60 * 1000;

function getCache(key: string) {
    if (cache && cache.key === key && Date.now() - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }
    return null;
}

function setCache(key: string, data: any) {
    cache = { key, data, timestamp: Date.now() };
}

export function getRuntimeConfig(
    runtimeConfig: NitroRuntimeConfig | null = null,
    event: H3Event | null | undefined = null
) {
    if (event) {
        return useRuntimeConfig(event || undefined);
    }

    return runtimeConfig || useRuntimeConfig(event || undefined);
}

export function getGithubToken(event: H3Event | null | undefined = null, safe: boolean | null | undefined = null) {
    const config = getRuntimeConfig(null, event);
    const token = config.githubToken || process.env.GITHUB_TOKEN;

    if (!token && !safe) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GITHUB_TOKEN was not set',
        });
    }

    return token;
}

export async function fetchGithubOrgs(event: H3Event | null | undefined = null): Promise<GithubOrg[]> {
    const config = getRuntimeConfig(null, event);
    let mockOrgsAllowed = Boolean(config.mockOrgsAllowed);
    const token = getGithubToken(event, /* safe */ true);

    if (!token && mockOrgsAllowed) {
        return getMockOrgs();
    }

    if (!token) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GITHUB_TOKEN was not set',
        });
    }

    const cached = getCache('orgs');

    if (cached) return cached;

    const query = `
        query {
          viewer {
            login
            name
            avatarUrl
            organizations(first: 100) {
              nodes {
                login
                name
                avatarUrl
              }
            }
          }
        }
    `;

    const response: any = await $fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
    });

    const viewer = response.data?.viewer;
    if (!viewer) return getMockOrgs();

    const orgs: GithubOrg[] = [
        { login: viewer.login, name: viewer.name || viewer.login, avatarUrl: viewer.avatarUrl, type: 'User' },
        ...viewer.organizations.nodes.map((o: any) => ({ ...o, type: 'Organization' })),
    ];

    setCache('orgs', orgs);
    return orgs;
}

export async function fetchGithubProjects(
    owner: string,
    event: H3Event | null | undefined = null
): Promise<GithubProject[]> {
    const config = getRuntimeConfig(null, event);
    const mockOrgsAllowed = Boolean(config.mockOrgsAllowed);
    const token = getGithubToken(event, /* safe */ true);

    if (!token && mockOrgsAllowed) return getMockProjects(owner);
    if (!token) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GITHUB_TOKEN was not set',
        });
    }

    const cached = getCache(`projects:${owner}`);
    if (cached) return cached;

    const query = `
        query($owner: String!) {
          organization(login: $owner) {
            projectsV2(first: 100) {
              nodes { id number title url }
            }
          }
          user(login: $owner) {
            projectsV2(first: 100) {
              nodes { id number title url }
            }
          }
        }
    `;

    const response: any = await $fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, variables: { owner } }),
    });

    const projects = response.data?.organization?.projectsV2?.nodes || response.data?.user?.projectsV2?.nodes || [];
    setCache(`projects:${owner}`, projects);
    return projects;
}

export async function fetchGithubProjectItems(
    org: string,
    projectNumber: number,
    event: H3Event | null | undefined = null
) {
    const config = getRuntimeConfig(null, event);
    const mockOrgsAllowed = Boolean(config.mockOrgsAllowed);
    const token = getGithubToken(event, /* safe */ true);

    if (!token && mockOrgsAllowed) return getMockData();
    if (!token) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GITHUB_TOKEN was not set',
        });
    }

    const cacheKey = `items:${org}:${projectNumber}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const items: any[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    const query = `
        query($org: String!, $project: Int!, $after: String) {
          organization(login: $org) {
            projectV2(number: $project) {
              items(first: 100, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes {
                  id
                  fieldValues(first: 20) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                    }
                  }
                  content {
                    __typename
                    ... on Issue { title state createdAt updatedAt closedAt labels(first: 10) { nodes { name } } }
                    ... on PullRequest { title state createdAt updatedAt closedAt merged labels(first: 10) { nodes { name } } }
                    ... on DraftIssue { title createdAt updatedAt }
                  }
                }
              }
            }
          }
          user(login: $org) {
            projectV2(number: $project) {
              items(first: 100, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes {
                  id
                  fieldValues(first: 20) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                    }
                  }
                  content {
                    __typename
                    ... on Issue { title state createdAt updatedAt closedAt labels(first: 10) { nodes { name } } }
                    ... on PullRequest { title state createdAt updatedAt closedAt merged labels(first: 10) { nodes { name } } }
                    ... on DraftIssue { title createdAt updatedAt }
                  }
                }
              }
            }
          }
        }
    `;

    while (hasNextPage) {
        const response: any = await $fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ query, variables: { org, project: projectNumber, after: endCursor } }),
        });

        const project = response.data?.organization?.projectV2 || response.data?.user?.projectV2;
        if (!project) break;

        items.push(...project.items.nodes);
        hasNextPage = project.items.pageInfo.hasNextPage;
        endCursor = project.items.pageInfo.endCursor;
    }

    setCache(cacheKey, items);
    return items;
}

function getMockOrgs(): GithubOrg[] {
    return [
        {
            login: 'acme-corp',
            name: 'Acme Corp',
            avatarUrl: 'https://github.com/identicons/acme.png',
            type: 'Organization',
        },
        { login: 'tiago', name: 'Tiago', avatarUrl: 'https://github.com/identicons/tiago.png', type: 'User' },
    ];
}

function getMockProjects(owner: string): GithubProject[] {
    return [
        { id: '1', number: 1, title: `${owner} Main Roadmap`, url: '#' },
        { id: '2', number: 2, title: 'Bug Tracking', url: '#' },
        { id: '3', number: 3, title: 'Marketing Launch', url: '#' },
    ];
}

function getMockData(): any[] {
    const statuses = ['Todo', 'In Progress', 'Done', 'Backlog'];
    const labels = ['bug', 'feature', 'enhancement', 'frontend', 'backend'];
    const types = ['Issue', 'PullRequest', 'DraftIssue'];

    return Array.from({ length: 50 }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)];
        const state = Math.random() > 0.4 ? 'OPEN' : 'CLOSED';
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
        return {
            id: `mock-${i}`,
            fieldValues: {
                nodes: [{ name: statuses[Math.floor(Math.random() * statuses.length)], field: { name: 'Status' } }],
            },
            content: {
                __typename: type,
                title: `Mock ${type} ${i}`,
                state,
                merged: type === 'PullRequest' && state === 'CLOSED' && Math.random() > 0.2,
                createdAt,
                updatedAt: new Date().toISOString(),
                closedAt:
                    state === 'CLOSED'
                        ? new Date(
                              new Date(createdAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
                          ).toISOString()
                        : null,
                labels: {
                    nodes: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
                        name: labels[Math.floor(Math.random() * labels.length)],
                    })),
                },
            },
        };
    });
}
