import { SecurityIssuesHashUrl } from "../security-issue-hash";
import { GlobalState } from "../state";

export class FilterImpactButtons {
  constructor(
    private readonly impactButtonsContainer: HTMLDivElement,
    allImpacts: string[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl,
    private readonly globalState: GlobalState
  ) {
    allImpacts.forEach((impact) => {
      const selectedImpacts = globalState.getImpacts();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.textContent = `${impact}`;
      if (selectedImpacts.includes(impact)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          globalState.setImpacts([...globalState.getImpacts(), impact]);
        } else {
          globalState.setImpacts(
            globalState.getImpacts().filter((imp) => imp !== impact)
          );
        }
        globalState.setPageNumber(1);
        securityIssuesHashUrl.updatePageNumber(globalState.getPageNumber());
        securityIssuesHashUrl.updateImpacts(globalState.getImpacts());
      });

      impactButtonsContainer.appendChild(filterButton);
    });
  }
}

export class FilterLanguageButtons {
  constructor(
    private readonly languageButtonsContainer: HTMLDivElement,
    allLanguages: string[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl,
    private readonly globalState: GlobalState
  ) {
    allLanguages.forEach((language) => {
      const selectedLanguages = globalState.getLanguages();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.textContent = `${language}`;
      if (selectedLanguages.includes(language)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          globalState.setLanguages([...globalState.getLanguages(), language]);
        } else {
          globalState.setLanguages(
            globalState.getLanguages().filter((lang) => lang !== language)
          );
        }
        globalState.setPageNumber(1);
        securityIssuesHashUrl.updatePageNumber(globalState.getPageNumber());
        securityIssuesHashUrl.updateLanguages(globalState.getLanguages());
      });

      languageButtonsContainer.appendChild(filterButton);
    });
  }
}