import { SecurityIssuesHashUrl } from "../security-issue-hash";

export class FilterImpactButtons {
  constructor(
    private readonly impactButtonsContainer: HTMLDivElement,
    allImpacts: string[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allImpacts.forEach((impact) => {
      const selectedImpacts = securityIssuesHashUrl.getImpacts();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.classList.add(`${impact.toLocaleLowerCase()}-button`);
      filterButton.textContent = `${impact}`;
      if (selectedImpacts.includes(impact)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          securityIssuesHashUrl.setImpacts([
            ...securityIssuesHashUrl.getImpacts(),
            impact,
          ]);
        } else {
          securityIssuesHashUrl.setImpacts(
            securityIssuesHashUrl.getImpacts().filter((imp) => imp !== impact)
          );
        }
        securityIssuesHashUrl.setPageNumber(1);
      });

      impactButtonsContainer.appendChild(filterButton);
    });
  }
}

export class FilterLanguageButtons {
  constructor(
    private readonly languageButtonsContainer: HTMLDivElement,
    allLanguages: string[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allLanguages.forEach((language) => {
      const selectedLanguages = securityIssuesHashUrl.getLanguages();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.textContent = `${language}`;
      if (selectedLanguages.includes(language)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          securityIssuesHashUrl.setLanguages([
            ...securityIssuesHashUrl.getLanguages(),
            language,
          ]);
        } else {
          securityIssuesHashUrl.setLanguages(
            securityIssuesHashUrl
              .getLanguages()
              .filter((lang) => lang !== language)
          );
        }
        securityIssuesHashUrl.setPageNumber(1);
      });

      languageButtonsContainer.appendChild(filterButton);
    });
  }
}
