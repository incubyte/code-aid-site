import { SecurityIssuesHashUrl } from "../security-issue-hash";

export type Counter = {
  key: string ;
  value: number;
};

export class FilterSeverityButtons {
  constructor(
    private readonly severityButtonsContainer: HTMLDivElement,
    allSeveritiesWithCount: Counter[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allSeveritiesWithCount.forEach((severityWithCount) => {
      const selectedSeverities = securityIssuesHashUrl.getSeverities();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.classList.add(
        `${severityWithCount.key.toLocaleLowerCase()}-button`
      );
      filterButton.textContent = `${severityWithCount.key} (x${severityWithCount.value})`;
      if (selectedSeverities.includes(severityWithCount.key)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          securityIssuesHashUrl.setSeverities([
            ...securityIssuesHashUrl.getSeverities(),
            severityWithCount.key,
          ]);
        } else {
          securityIssuesHashUrl.setSeverities(
            securityIssuesHashUrl
              .getSeverities()
              .filter((serverity) => serverity !== severityWithCount.key)
          );
        }
        securityIssuesHashUrl.setPageNumber(1);
      });

      severityButtonsContainer.appendChild(filterButton);
    });
  }
}

export class FilterLanguageButtons {
  constructor(
    private readonly languageListContainer: HTMLDivElement,
    allLanguagesWithCount: Counter[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allLanguagesWithCount.forEach((language) => {
      const selectedLanguages = securityIssuesHashUrl.getLanguages();

      const languageContainer = document.createElement("div");
      const languageLabel = document.createElement("label");
      const checkboxButton = document.createElement("INPUT");
      checkboxButton.setAttribute("type", "checkbox");
      checkboxButton.classList.add("checkbox");
      checkboxButton.setAttribute("id", `${language.key}`);

      languageLabel.textContent = `${language.key} (x${language.value})`;
      languageLabel.setAttribute("for", `${language.key}`);
      if (selectedLanguages.includes(language.key)) {
        checkboxButton.setAttribute("checked", "true");
        checkboxButton.classList.add("checked");
      }

      checkboxButton.addEventListener("change", function () {
        checkboxButton.classList.toggle("checked");
        if (checkboxButton.classList.contains("checked")) {
          securityIssuesHashUrl.setLanguages([
            ...securityIssuesHashUrl.getLanguages(),
            language.key,
          ]);
        } else {
          securityIssuesHashUrl.setLanguages(
            securityIssuesHashUrl
              .getLanguages()
              .filter((lang) => lang !== language.key)
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
