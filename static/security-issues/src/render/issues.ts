import { ITEMS_PER_PAGE } from "../constants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";
import { Impact, Issue } from "../types";
import { getImpactColor } from "./impact-color";

export const renderIssues = (
  container: HTMLDivElement,
  securityIssuesHashUrl: SecurityIssuesHashUrl,
  issues: Issue[]
) => {
  container.innerHTML = "";

  const startIndex =
    (securityIssuesHashUrl.getPageNumber() - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const itemsToRender = issues.slice(startIndex, endIndex);

  itemsToRender.forEach((issue, index) => {
    const securityIssueData = document.createElement("div");
    securityIssueData.classList.add("security-issue");

    // Create a header for the accordion
    const header = createAccordionHeader(issue, index);

    // Create a content container for the details
    const content = createAccordionContent(issue);

    // Add the header and content to the accordion
    securityIssueData.appendChild(header);
    securityIssueData.appendChild(content);

    container.appendChild(securityIssueData);
  });
};

function createAccordionHeader(issue: Issue, index: number): HTMLDivElement {
  const header = document.createElement("div");
  header.classList.add("accordion-header");
  header.innerHTML = `<strong>Path:</strong> ${issue.path}`;
  header.addEventListener("click", () => toggleAccordionContent(index));
  header.style.borderLeft = `5px solid ${getImpactColor(
    issue.extra.metadata.impact as Impact
  )}`;
  return header;
}

function createAccordionContent(issue: Issue): HTMLDivElement {
  const content = document.createElement("div");
  content.classList.add("accordion-content");
  content.classList.add("active");

  const ul = createUnorderedList([
    `CWE| ${issue.extra.metadata.cwe}`,
    `Message| ${issue.extra.message}`,
    `OWASP| ${issue.extra.metadata.owasp}`,
    `Code| ${issue.extra.lines}`,
  ]);

  content.style.borderLeft = `5px solid ${getImpactColor(
    issue.extra.metadata.impact as Impact
  )}`;

  appendChildren(content, [ul]);

  return content;
}

function toggleAccordionContent(index: number): void {
  const content = document.querySelectorAll(".accordion-content")[
    index
  ] as HTMLDivElement;
  content.classList.toggle("active");
}

function createUnorderedList(items: string[]): HTMLUListElement {
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    const parts = item.split("|");
    if (parts.length === 2) {
      li.innerHTML = `<strong>${parts[0]}:</strong> ${parts[1]}<br/>`;
    } else {
      console.log(parts);
      li.textContent = item;
    }
    ul.appendChild(li);
  });
  return ul;
}

function appendChildren(parent: HTMLElement, children: HTMLElement[]): void {
  children.forEach((child) => parent.appendChild(child));
}
