import { Counter } from "./render/filter-buttons";

const isIssuesEmpty = (issue: DependencyIssue) => {
  return issue.vulnerabilities?.length === undefined;
};

export const getDependencyIssues = async (): Promise<DependencyIssue[]> => {
  const res = await fetch("./telebright-dependency-check-report.json");
  const data = await res.json();
  const dependencyIssues = data.dependencies;
  const finalDependecyIssues: Issue[] = [];
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

  filteredDependencyIssues.forEach((issue: DependencyIssue) => {
    convertToSaprateEle(issue).forEach((ele) => finalDependecyIssues.push(ele));

    // finalDependecyIssues.(convertToSaprateEle(issue));
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

function convertToSaprateEle(issue: DependencyIssue): Issue[] {
  const convertedIssues: Issue[] = [];
  const { filePath, fileName, language, packages, vulnerabilities } = issue;
  const singleIssue: Issue = {
    fileName,
    filePath,
    language,
  };
  vulnerabilities?.forEach((vulnerability) => {
    convertedIssues.push(constructIssueObj(singleIssue, vulnerability));
  });

  return convertedIssues;
}

const constructIssueObj = (
  singleIssue: Issue,
  vulnerability: Vulnerability
): Issue => {
  const obj = {
    ...singleIssue,
    vulnerability,
  };
  return obj;
};
