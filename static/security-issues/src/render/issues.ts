import { ITEMS_PER_PAGE } from "../constants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";
import { Impact, Issue } from "../types";
import { getImpactColor } from "./impact-color";
const hljs = require("highlight.js");

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
  const resolveIssue = document.createElement("button");
  resolveIssue.innerHTML = "show solution";
  resolveIssue.onclick = () => {
    getSolution(content, issue);
  };
  content.classList.add("accordion-content");
  content.classList.add("active");

  const ul = createUnorderedList([
    `CWE||| ${issue.extra.metadata.cwe}`,
    `Message||| ${issue.extra.message}`,
    `OWASP||| ${issue.extra.metadata.owasp}`,
    `Code||| ${issue.extra.lines}`,
  ]);

  content.style.borderLeft = `5px solid ${getImpactColor(
    issue.extra.metadata.impact as Impact
  )}`;

  appendChildren(content, [ul]);
  content.appendChild(resolveIssue);

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
    const parts = item.split("|||");
    if (parts.length === 2) {
      if (parts[0] === "Code") {
        const code = hljs.highlightAuto(parts[1]).value;
        li.innerHTML = `<strong>${parts[0]}:</strong><br/><pre><code>${code}</code></pre>`;
      } else {
        li.innerHTML = `<strong>${parts[0]}:</strong> ${parts[1]}<br/>`;
      }
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

async function getSolution(content: HTMLDivElement, data: Issue) {
  const url = "http://localhost:3000/embedding/resolveissue";
  const headers = {
    "Content-Type": "application/json", // Specify the content type as JSON
  };
  const { message, lines } = data.extra;
  const { cwe, owasp } = data.extra.metadata;

  const requestBody = JSON.stringify({ cwe, message, owasp, code: lines });

  await fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBody,
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response:", data);

      const aiResult = document.createElement("ul");
      const solutionDescription = document.createElement("li");
      solutionDescription.innerHTML =
        "<strong>Description:</strong>" + data.solution_description;
      const updatedCode = document.createElement("li");
      const code = hljs.highlightAuto(data.updated_code).value;
      const language = hljs.highlightAuto(code).language;
      console.log(code);

      updatedCode.innerHTML = `<strong>Code:</strong><br/><pre><code class=${language} >${code}</code></pre`;
      aiResult.appendChild(solutionDescription);
      aiResult.appendChild(updatedCode);
      content.appendChild(aiResult);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
