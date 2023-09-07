import { Counter } from "./render/filter-buttons";

const isIssuesEmpty = (issue: DependencyIssue) => {
  return issue.vulnerabilities?.length === undefined;
};

export const getDependencyIssues = async (): Promise<Issue[]> => {
  const res = await fetch("./dependency-check-report.json");
  const data = await res.json();
  const dependencyIssues = data.dependencies;
  const finalDependecyIssues: Issue[] = [];
  const filteredDependencyIssues = dependencyIssues.filter(
    (issue: DependencyIssue) => {
      return !isIssuesEmpty(issue);
    }
  );
  filteredDependencyIssues.forEach((issue: DependencyIssue) => {
    issue.filePath = issue.filePath.replace("/mnt/d/", "");
  });

  filteredDependencyIssues.forEach((issue: DependencyIssue) => {
    splitByVulnerablity(issue).forEach((ele) => finalDependecyIssues.push(ele));
  });

  finalDependecyIssues.forEach((issue) => {
    issue.vulnerabilities.severity =
      issue.vulnerabilities.severity.toUpperCase();
  });

  return finalDependecyIssues;
};

export const filteredDependencyIssues = (
  results: Issue[],
  languages: string[],
  severities: string[]
): Issue[] => {
  return results.filter(
    (obj) =>
      languages.includes(obj.language) &&
      severities.includes(obj.vulnerabilities.severity)
  );
};

export const getIssuesWithLanguageLabel = (results: Issue[]): Issue[] => {
  return results.map((result) => {
    if (result.filePath.includes("package-lock.json")) {
      const language = "node";
      return { ...result, language: language ? language : "" };
    }
    const language = result.filePath.split("/").pop()?.split(".").pop();
    return { ...result, language: language ? language : "" };
  });
};

const mapToArray = (map: any) =>
  Array.from(map, ([key, value]) => ({ key, value }));

export const getSecurityIssuesMetadata = (
  results: Issue[]
): { allLanguagesWithCount: Counter[]; allSeverityWithCount: Counter[] } => {
  const allLanguagesWithCount: Map<string, number> = new Map();
  const allSeveritiesWithCount: Map<string, number> = new Map();

  results.forEach((result) => {
    const language = result.language || "Unknown";
    const severity = result.vulnerabilities?.severity || "Unknown";

    allLanguagesWithCount.set(
      language,
      (allLanguagesWithCount.get(language) || 0) + 1
    );

    allSeveritiesWithCount.set(
      severity,
      (allSeveritiesWithCount.get(severity) || 0) + 1
    );
  });

  return {
    allLanguagesWithCount: mapToArray(allLanguagesWithCount),
    allSeverityWithCount: mapToArray(allSeveritiesWithCount),
  };
};

function splitByVulnerablity(issue: DependencyIssue): Issue[] {
  const convertedIssues: Issue[] = [];
  const { filePath, fileName, language, packages, vulnerabilities } = issue;
  const singleIssue: any = {
    fileName,
    filePath,
    language,
    packages,
  };
  vulnerabilities?.forEach((vulnerability) => {
    convertedIssues.push(constructIssueObj(singleIssue, vulnerability));
  });

  return convertedIssues;
}

const constructIssueObj = (
  singleIssue: any,
  vulnerabilities: Vulnerability
): Issue => {
  const obj = {
    ...singleIssue,
    vulnerabilities,
  };
  return obj;
};
