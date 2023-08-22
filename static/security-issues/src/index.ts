import { filterIssues, getIssuesWithLanguageLabel, getSecurityIssues, getSecurityIssuesMetadata } from "./data-handler";
import { FilterImpactButtons, FilterLanguageButtons } from "./render/filter-buttons";
import { renderIssues } from "./render/issues";
import { renderPagination } from "./render/pagination";
import { SecurityIssuesHashUrl } from "./security-issue-hash";
import { GlobalState } from "./state";

// global data layer
// URL layer
// HTML layer

const main = async () => {
    // 1. analyse the current browser URL (hash)
    const securityIssuesHashUrl = new SecurityIssuesHashUrl(window.location.hash);

    const { impacts, languages, pageNumber } = securityIssuesHashUrl.getData();
    // 3. assign data to global state configuration
    const globalState = new GlobalState(impacts, languages, pageNumber);

    // 4. fetch JSON data and filter data using global configuration
    const results = await getSecurityIssues();
    const resultsWithLanguages = getIssuesWithLanguageLabel(results);
    const { allImpacts, allLanguages } = getSecurityIssuesMetadata(resultsWithLanguages);
    const filteredResults = filterIssues(resultsWithLanguages, globalState.getImpacts(), globalState.getLanguages());

    // 5. render the buttons and pagination UI
    const filterImpactButtons = new FilterImpactButtons(document.getElementById("filter-impact-buttons") as HTMLDivElement, allImpacts, securityIssuesHashUrl, globalState);
    const filterLanguageButtons = new FilterLanguageButtons(document.getElementById("filter-language-buttons") as HTMLDivElement, allLanguages, securityIssuesHashUrl, globalState);

    // 6. render the filtered data into HTML
    renderIssues(document.getElementById("container") as HTMLDivElement, globalState, filteredResults);
    renderPagination(document.getElementById("pagination") as HTMLDivElement, filteredResults.length, globalState, securityIssuesHashUrl);

    // 7. listen to hash change event
    window.addEventListener("hashchange", () => {
        const filteredResults = filterIssues(resultsWithLanguages, globalState.getImpacts(), globalState.getLanguages());
        renderIssues(document.getElementById("container") as HTMLDivElement, globalState, filteredResults);
        renderPagination(document.getElementById("pagination") as HTMLDivElement, filteredResults.length, globalState, securityIssuesHashUrl);
    });
}

main();