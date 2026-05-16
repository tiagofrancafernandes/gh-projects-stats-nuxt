export type GithubItemType = 'issue' | 'pr' | 'draft';
export type GithubItemState = 'OPEN' | 'CLOSED';

export interface GithubCard {
    id: string;
    title: string;
    type: GithubItemType;
    state: GithubItemState;
    merged: boolean;
    labels: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string | null;
}

export interface GithubStats {
    total: number;
    open: number;
    closed: number;
    merged: number;
    byStatus: Record<string, number>;
    byLabel: Record<string, number>;
    velocity: { date: string; closed: number }[];
    projectTitle?: string;
}

export interface GithubOrg {
    login: string;
    name: string;
    avatarUrl: string;
    type: 'Organization' | 'User';
}

export interface GithubProject {
    id: string;
    number: number;
    title: string;
    url: string;
}
