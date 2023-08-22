import { Issue } from "./types";

export const filterIssues = (results: Issue[], impacts: string[], languages: string[]): Issue[] => {
    impacts = impacts.map((impact) => impact.toUpperCase());
    return results.filter((obj) => languages.includes(obj.language) && impacts.includes(obj.extra.metadata.impact));
}

export const getSecurityIssues = async (): Promise<Issue[]> => {
    const res = await fetch("./scan_results.json");
    const data = await res.json();
    return data.results;
}

export const getIssuesWithLanguageLabel = (results: Issue[]): Issue[] => {
    return results.map((result) => {
        const language = result.path.split("/").pop()?.split(".").pop();
        return { ...result, language: language ? language : "" };
    });
}

export const getSecurityIssuesMetadata = (results: Issue[]): { allImpacts: string[], allLanguages: string[] } => {
    const allLanguages: string[] = [];
    results.forEach((result) => {
        if (!allLanguages.includes(result.language)) {
            allLanguages.push(result.language);
        }
    });
    return { allImpacts: ["LOW", "MEDIUM", "HIGH"], allLanguages };
}