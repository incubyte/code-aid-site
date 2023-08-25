import { SecurityIssuesHashUrl } from "../security-issue-hash";

export type Counter = {
  key: string;
  value: number;
}

export class FilterImpactButtons {
  constructor(
    private readonly impactButtonsContainer: HTMLDivElement,
    allImpactsWithCount: Counter[],
    private readonly securityIssuesHashUrl: SecurityIssuesHashUrl
  ) {
    allImpactsWithCount.forEach((impactWithCount) => {
      const selectedImpacts = securityIssuesHashUrl.getImpacts();
      const filterButton = document.createElement("button");
      filterButton.className = "filter-button";
      filterButton.classList.add(`${impactWithCount.key.toLocaleLowerCase()}-button`);
      filterButton.textContent = `${impactWithCount.key} (x${impactWithCount.value})`;
      if (selectedImpacts.includes(impactWithCount.key)) {
        filterButton.classList.add("selected");
      }

      filterButton.addEventListener("click", function () {
        filterButton.classList.toggle("selected");
        if (filterButton.classList.contains("selected")) {
          securityIssuesHashUrl.setImpacts([
            ...securityIssuesHashUrl.getImpacts(),
            impactWithCount.key,
          ]);
        } else {
          securityIssuesHashUrl.setImpacts(
            securityIssuesHashUrl.getImpacts().filter((imp) => imp !== impactWithCount.key)
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
      checkboxButton.setAttribute("id", `${language}`);

      languageLabel.textContent = `${language.key} (x${language.value})`;
      languageLabel.setAttribute("for", `${language}`);
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
