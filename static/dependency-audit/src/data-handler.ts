import { Counter } from "./render/filter-buttons";

const isIssuesEmpty = (issue: DependencyIssue) => {
  return issue.vulnerabilities?.length === undefined;
};

export const getDependencyIssues = async (): Promise<Issue[]> => {
  const res = await fetch("./cats-dependency-check-report.json");
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
    if (issue.filePath.includes("package-lock.json")) {
      issue.filePath = issue.filePath + ".node";
    }
  });

  filteredDependencyIssues.forEach((issue: DependencyIssue) => {
    convertToSaprateEle(issue).forEach((ele) => finalDependecyIssues.push(ele));
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
    const language = result.filePath.split("/").pop()?.split(".").pop();
    return { ...result, language: language ? language : "" };
  });
};

export const getSecurityIssuesMetadata = (
  results: Issue[]
): { allLanguagesWithCount: Counter[]; allSeverityWithCount: Counter[] } => {
  const allLanguagesWithCount: Counter[] = [];
  const allSeveritiesWithCount: Counter[] = [];
  results.forEach((result) => {
    const language = result.language;
    const severity = result.vulnerabilities?.severity;
    const languageIndex = allLanguagesWithCount.findIndex(
      (lang) => lang.key === language
    );
    const severityIndex = allSeveritiesWithCount.findIndex(
      (sev) => sev.key === severity
    );
    if (languageIndex === -1) {
      allLanguagesWithCount.push({ key: language, value: 1 });
    } else {
      allLanguagesWithCount[languageIndex].value++;
    }
    if (severityIndex === -1) {
      allSeveritiesWithCount.push({ key: severity ? severity : "", value: 1 });
    } else {
      allSeveritiesWithCount[severityIndex].value++;
    }
  });
  return {
    allLanguagesWithCount,
    allSeverityWithCount: allSeveritiesWithCount,
  };
};

function convertToSaprateEle(issue: DependencyIssue): Issue[] {
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
