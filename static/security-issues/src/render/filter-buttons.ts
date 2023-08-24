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
    private readonly languageListContainer: HTMLDivElement,
    allLanguages: string[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allLanguages.forEach((language) => {
      const selectedLanguages = securityIssuesHashUrl.getLanguages();

      const languageContainer = document.createElement("div");
      const languageLabel = document.createElement("label");
      const checkboxButton = document.createElement("INPUT");
      checkboxButton.setAttribute("type", "checkbox");
      checkboxButton.classList.add("checkbox");
      checkboxButton.setAttribute("id", `${language}`);

      languageLabel.textContent = `${language}`;
      languageLabel.setAttribute("for", `${language}`);
      if (selectedLanguages.includes(language)) {
        checkboxButton.setAttribute("checked", "true");
        checkboxButton.classList.add("checked");
      }

      checkboxButton.addEventListener("change", function () {
        checkboxButton.classList.toggle("checked");
        if (checkboxButton.classList.contains("checked")) {
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
      languageContainer.appendChild(checkboxButton);
      languageContainer.appendChild(languageLabel);

      languageContainer.classList.add("language-margin");
      languageListContainer.classList.add("language-list");

      languageListContainer.appendChild(languageContainer);
    });
  }
}
