import { Counter } from "./render/filter-buttons";

const isIssuesEmpty = (issue: DependencyIssue) => {
  return (
    issue.packages?.length === undefined &&
    issue.vulnerabilities?.length === undefined
  );
};

export const getDependencyIssues = async (): Promise<DependencyIssue[]> => {
  const res = await fetch("./telebright-dependency-check-report.json");
  const data = await res.json();
  const dependencyIssues = data.dependencies;
  const filteredDependencyIssues = dependencyIssues.filter(
    (issue: DependencyIssue) => {
      return !isIssuesEmpty(issue);
    }
  );
  filteredDependencyIssues.forEach((issue: DependencyIssue) => {
    issue.filePath = issue.filePath.replace(
      "/mnt/c/Users/DELL/Desktop/dev/",
      ""
    );
  });

  return filteredDependencyIssues;
};

export const filteredDependencyIssues = (
  results: DependencyIssue[],
  languages: string[]
): DependencyIssue[] => {
  return results.filter((obj) => languages.includes(obj.language));
};

export const getIssuesWithLanguageLabel = (
  results: DependencyIssue[]
): DependencyIssue[] => {
  return results.map((result) => {
    const language = result.filePath.split("/").pop()?.split(".").pop();
    return { ...result, language: language ? language : "" };
  });
};

export const getSecurityIssuesMetadata = (
  results: DependencyIssue[]
): { allLanguagesWithCount: Counter[] } => {
  const allLanguagesWithCount: Counter[] = [];
  const allImpactsWithCount: Counter[] = [];
  results.forEach((result) => {
    const language = result.language;
    const languageIndex = allLanguagesWithCount.findIndex(
      (lang) => lang.key === language
    );
    if (languageIndex === -1) {
      allLanguagesWithCount.push({ key: language, value: 1 });
    } else {
      allLanguagesWithCount[languageIndex].value++;
    }
  });
  return { allLanguagesWithCount };
};
