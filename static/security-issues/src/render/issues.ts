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
  const resolveIssueBtn = document.createElement("button");
  const spinner = document.createElement("div");
  const buttonText = document.createElement("span");
  buttonText.textContent = "show solution";

  spinner.classList.add("loading-spinner");
  spinner.style.display = "none";

  buttonText.classList.add("button-text");

  resolveIssueBtn.classList.add("resolve-issue-btn");

  resolveIssueBtn.appendChild(buttonText);
  resolveIssueBtn.appendChild(spinner);

  resolveIssueBtn.onclick = () => {
    getSolution(content, issue, resolveIssueBtn);
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
  content.appendChild(resolveIssueBtn);

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

async function getFullContext(path: string, start: number, end: number) {
  const url = `http://localhost:3000/embedding/get-context?path=${path}&start=${start}&end=${end}`;
  const data = await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      return data;
    });
  return data;
}

async function getSolution(
  content: HTMLDivElement,
  data: Issue,
  resolveIssueBtn: HTMLButtonElement
) {
  const url = "http://localhost:3000/embedding/resolveissue";
  const headers = {
    "Content-Type": "application/json",
  };
  const { message, lines } = data.extra;
  const { cwe, owasp } = data.extra.metadata;
  let context = "";
  let requestBody = "";
  if (
    data.extra.dataflow_trace?.intermediate_vars?.[0]?.location?.start?.line
  ) {
    const startLineNo =
      data.extra.dataflow_trace?.intermediate_vars?.[0]?.location?.start?.line;
    context = await getFullContext(data.path, startLineNo, data.end.line);
  }
  if (context) {
    requestBody = JSON.stringify({
      cwe,
      message,
      owasp,
      code: context,
    });
  } else {
    requestBody = JSON.stringify({ cwe, message, owasp, code: lines });
  }

  const loadingSpinner = resolveIssueBtn.querySelector(
    ".loading-spinner"
  ) as HTMLDivElement;
  const buttonText = resolveIssueBtn.querySelector(
    ".button-text"
  ) as HTMLSpanElement;
  buttonText.style.display = "none";
  loadingSpinner.style.display = "block";
  loadingSpinner.style.marginLeft = "20px";
  await fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBody,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const aiResult = document.createElement("div");
      const ul = document.createElement("ul");

      const solutionDescription = document.createElement("li");
      solutionDescription.innerHTML =
        "<strong>Description:</strong>" + data.solution_description;

      const updatedCode = document.createElement("li");
      const code = hljs.highlightAuto(data.updated_code).value;
      const language = hljs.highlightAuto(code).language;
      updatedCode.innerHTML = `<strong>Code:</strong><br/><pre><code class=${language} >${code}</code></pre`;

      ul.appendChild(solutionDescription);
      ul.appendChild(updatedCode);

      aiResult.appendChild(ul);

      content.appendChild(aiResult);

      loadingSpinner.style.display = "none";
      buttonText.style.display = "block";

      resolveIssueBtn.setAttribute("disabled", "true");
      resolveIssueBtn.style.border = "1px solid #999999";
      resolveIssueBtn.style.backgroundColor = "#cccccc";
      resolveIssueBtn.style.color = "#666666";
      resolveIssueBtn.style.cursor = "default";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
