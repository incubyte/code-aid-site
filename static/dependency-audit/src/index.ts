import {
  filteredDependencyIssues,
  getDependencyIssues,
  getIssuesWithLanguageLabel,
  getSecurityIssuesMetadata,
} from "./data-handler";
import { renderDepedencyIssue } from "./render/dependecy-check";
import {
  FilterLanguageButtons,
  FilterSeverityButtons,
} from "./render/filter-buttons";
import { renderPagination } from "./render/pagination";
import { SecurityIssuesHashUrl } from "./security-issue-hash";

const main = async () => {
  const dependencyIssues = await getDependencyIssues();
  const resultsWithLanguages = getIssuesWithLanguageLabel(dependencyIssues);
  const { allLanguagesWithCount, allSeverityWithCount } =
    getSecurityIssuesMetadata(resultsWithLanguages);

  const container = document.getElementById("container") as HTMLDivElement;
  const securityIssuesHashUrl = new SecurityIssuesHashUrl();
  if (securityIssuesHashUrl.isEmpty()) {
    securityIssuesHashUrl.setLanguages(
      allLanguagesWithCount.map((o: any) => o.key)
    );
    securityIssuesHashUrl.setSeverities(
      allSeverityWithCount.map((o: any) => o.key)
    );
  }

  renderDepedencyIssue(dependencyIssues, container, securityIssuesHashUrl);
  renderPagination(
    document.getElementById("pagination") as HTMLDivElement,
    dependencyIssues.length,
    securityIssuesHashUrl
  );

  const { languages, severity } = securityIssuesHashUrl.getData();

  const filteredResults = filteredDependencyIssues(
    resultsWithLanguages,
    languages,
    severity
  );

  const filterLanguageButtons = new FilterLanguageButtons(
    document.getElementById("filter-language-buttons") as HTMLDivElement,
    allLanguagesWithCount,
    securityIssuesHashUrl
  );

  const filterSeverityButtons = new FilterSeverityButtons(
    document.getElementById("filter-severity-buttons") as HTMLDivElement,
    allSeverityWithCount,
    securityIssuesHashUrl
  );

  window.addEventListener("hashchange", () => {
    const filteredResults = filteredDependencyIssues(
      resultsWithLanguages,
      securityIssuesHashUrl.getLanguages(),
      securityIssuesHashUrl.getSeverities()
    );

    renderDepedencyIssue(filteredResults, container, securityIssuesHashUrl);
    renderPagination(
      document.getElementById("pagination") as HTMLDivElement,
      filteredResults.length,
      securityIssuesHashUrl
    );
  });
};

main();
