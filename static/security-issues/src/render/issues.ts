import { ITEMS_PER_PAGE } from "../contants";
import { GlobalState } from "../state";
import { Impact, Issue } from "../types";
import { getImpactColor } from "./impact-color";

export const renderIssues = (container: HTMLDivElement, globalState: GlobalState, issues: Issue[]) => {
    container.innerHTML = "";

    const startIndex = (globalState.getPageNumber() - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToRender = issues.slice(startIndex, endIndex);

    itemsToRender.forEach((issue) => {
        const securityIssueData = document.createElement("div");
        securityIssueData.style.marginTop = "20px";
        securityIssueData.style.marginBottom = "20px";

        const path = document.createElement("p");
        path.innerHTML = "<strong>Path:</strong> " + issue.path;

        const impact = document.createElement("div");
        impact.innerHTML =
            "<strong>Security impact:</strong> " +
            issue.extra.metadata.impact +
            "<br/>";
        impact.style.borderLeft =
            "5px solid " + getImpactColor(issue.extra.metadata.impact as Impact);
        impact.style.padding = "4px";

        const ul = document.createElement("ul");

        const cwe = document.createElement("li");
        cwe.innerHTML =
            "<strong>CWE:</strong> " + issue.extra.metadata.cwe + "<br/>";

        const message = document.createElement("li");
        message.innerHTML =
            "<strong>Message:</strong> " + issue.extra.message + "<br/>";

        const owasp = document.createElement("li");
        owasp.innerHTML =
            "<strong>owasp:</strong> " + issue.extra.metadata.owasp + "<br/>";

        const code = document.createElement("li");
        code.innerHTML = "<strong>code:</strong>" + issue.extra.lines + "<br/>";

        ul.appendChild(cwe);
        ul.appendChild(owasp);
        ul.appendChild(message);
        ul.appendChild(code);

        securityIssueData.appendChild(document.createElement("hr"));

        securityIssueData.appendChild(path);
        securityIssueData.appendChild(impact);
        securityIssueData.appendChild(ul);

        container.appendChild(securityIssueData);
    });
}