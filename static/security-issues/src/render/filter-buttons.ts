import { SecurityIssuesHashUrl } from "../security-issue-hash";
import { GlobalState } from "../state";

export class FilterImpactButtons {
    constructor(private readonly impactButtonsContainer: HTMLDivElement, allImpacts: string[], private readonly securityIssuesHashUrl: SecurityIssuesHashUrl, private readonly globalState: GlobalState) {
        allImpacts.forEach((impact) => {
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.textContent = `${impact}`;

            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    globalState.setImpacts([...globalState.getImpacts(), impact]);
                }
                else {
                    globalState.setImpacts(globalState.getImpacts().filter((imp) => imp !== impact));
                }

                securityIssuesHashUrl.updateImpacts(globalState.getImpacts());
            });

            impactButtonsContainer.appendChild(filterButton);
        });
    }
}

export class FilterLanguageButtons {
    constructor(private readonly languageButtonsContainer: HTMLDivElement, allLanguages: string[], private readonly securityIssuesHashUrl: SecurityIssuesHashUrl, private readonly globalState: GlobalState) {
        allLanguages.forEach((language) => {
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.textContent = `${language}`;

            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    globalState.setLanguages([...globalState.getLanguages(), language]);
                }
                else {
                    globalState.setLanguages(globalState.getLanguages().filter((lang) => lang !== language));
                }

                securityIssuesHashUrl.updateLanguages(globalState.getLanguages());
            });

            languageButtonsContainer.appendChild(filterButton);
        });
    }
}