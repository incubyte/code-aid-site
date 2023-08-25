import { Counter } from "./render/filter-buttons";
import { Issue } from "./types";

export const filterIssues = (
  results: Issue[],
  impacts: string[],
  languages: string[]
): Issue[] => {
  impacts = impacts.map((impact) => impact.toUpperCase());
  return results.filter(
    (obj) =>
      languages.includes(obj.language) &&
      impacts.includes(obj.extra.metadata.impact)
  );
};

export const getSecurityIssues = async (): Promise<Issue[]> => {
  const res = await fetch("./scan_results.json");
  const data = await res.json();
  return data.results;
};

export const getIssuesWithLanguageLabel = (results: Issue[]): Issue[] => {
  return results.map((result) => {
    const language = result.path.split("/").pop()?.split(".").pop();
    return { ...result, language: language ? language : "" };
  });
};

export const getSecurityIssuesMetadata = (
  results: Issue[]
): { allImpactsWithCount: Counter[]; allLanguagesWithCount: Counter[] } => {
  const allLanguagesWithCount: Counter[] = [];
  const allImpactsWithCount: Counter[] = [];
  results.forEach((result) => {
    const language = result.language;
    const impact = result.extra.metadata.impact;
    const languageIndex = allLanguagesWithCount.findIndex((lang) => lang.key === language);
    const impactIndex = allImpactsWithCount.findIndex((imp) => imp.key === impact);
    if (languageIndex === -1) {
      allLanguagesWithCount.push({ key: language, value: 1 });
    } else {
      allLanguagesWithCount[languageIndex].value++;
    }
    if (impactIndex === -1) {
      allImpactsWithCount.push({ key: impact, value: 1 });
    } else {
      allImpactsWithCount[impactIndex].value++;
    }
  });
  return { allImpactsWithCount, allLanguagesWithCount };
};
