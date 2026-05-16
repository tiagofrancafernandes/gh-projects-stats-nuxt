import type { H3Event } from 'h3';

export function getFilterConfig(event: H3Event) {
    const config = useRuntimeConfig(event);
    
    const parse = (val: string | undefined | null) => 
        val ? val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

    return {
        allowedOrgs: parse(config.allowedOrgs),
        excludedOrgs: parse(config.excludedOrgs),
        allowedProjects: parse(config.allowedProjects),
        excludedProjects: parse(config.excludedProjects)
    };
}

export function isOrgAllowed(org: string, event: H3Event) {
    const { allowedOrgs, excludedOrgs } = getFilterConfig(event);
    const target = org.toLowerCase();

    // If allowed list is present, it must be in it
    if (allowedOrgs.length > 0 && !allowedOrgs.includes(target)) return false;
    
    // If it's in excluded list, it's blocked
    if (excludedOrgs.includes(target)) return false;
    
    return true;
}

export function isProjectAllowed(projectIdentifier: string | number, event: H3Event) {
    const { allowedProjects, excludedProjects } = getFilterConfig(event);
    const target = String(projectIdentifier).toLowerCase();

    if (allowedProjects.length > 0 && !allowedProjects.includes(target)) return false;
    if (excludedProjects.includes(target)) return false;
    
    return true;
}
