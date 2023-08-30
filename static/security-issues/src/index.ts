import {
  filterIssues,
  getIssuesWithLanguageLabel,
  getSecurityIssues,
  getSecurityIssuesMetadata,
} from "./data-handler";
import {
  FilterImpactButtons,
  FilterLanguageButtons,
} from "./render/filter-buttons";
import { renderIssues } from "./render/issues";
import { renderPagination } from "./render/pagination";
import { SecurityIssuesHashUrl } from "./security-issue-hash";

const main = async () => {
  // 1. fetch JSON data
  const results = await getSecurityIssues();
  const resultsWithLanguages = getIssuesWithLanguageLabel(results);
  const { allImpactsWithCount, allLanguagesWithCount } =
    getSecurityIssuesMetadata(resultsWithLanguages);

  // 1. analyse the current browser URL (hash)
  const securityIssuesHashUrl = new SecurityIssuesHashUrl();
  if (securityIssuesHashUrl.isEmpty()) {
    securityIssuesHashUrl.setImpacts(allImpactsWithCount.map((o) => o.key));
    securityIssuesHashUrl.setLanguages(allLanguagesWithCount.map((o) => o.key));
  }

  const { impacts, languages } = securityIssuesHashUrl.getData();

  // 4. filter JSON data using global configuration
  const filteredResults = filterIssues(
    resultsWithLanguages,
    impacts,
    languages
  );

  // 5. render the buttons and pagination UI
  const filterImpactButtons = new FilterImpactButtons(
    document.getElementById("filter-impact-buttons") as HTMLDivElement,
    allImpactsWithCount,
    securityIssuesHashUrl
  );
  const filterLanguageButtons = new FilterLanguageButtons(
    document.getElementById("filter-language-buttons") as HTMLDivElement,
    allLanguagesWithCount,
    securityIssuesHashUrl
  );

  // 6. render the filtered data into HTML
  renderIssues(
    document.getElementById("container") as HTMLDivElement,
    securityIssuesHashUrl,
    filteredResults
  );
  renderPagination(
    document.getElementById("pagination") as HTMLDivElement,
    filteredResults.length,
    securityIssuesHashUrl
  );

  // 7. listen to hash change event
  window.addEventListener("hashchange", () => {
    const filteredResults = filterIssues(
      resultsWithLanguages,
      securityIssuesHashUrl.getImpacts(),
      securityIssuesHashUrl.getLanguages()
    );
    renderIssues(
      document.getElementById("container") as HTMLDivElement,
      securityIssuesHashUrl,
      filteredResults
    );
    renderPagination(
      document.getElementById("pagination") as HTMLDivElement,
      filteredResults.length,
      securityIssuesHashUrl
    );
  });
};

main();
