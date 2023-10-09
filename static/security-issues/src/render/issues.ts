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
    issue.index = index;
    const securityIssueData = document.createElement("div");
    securityIssueData.classList.add("security-issue");

    const header = createAccordionHeader(issue, index);
    securityIssueData.appendChild(header);

    const content = createAccordionContent(issue);
    securityIssueData.appendChild(content);

    container.appendChild(securityIssueData);
  });
};

function createAccordionHeader(issue: Issue, index: number): HTMLDivElement {
  const headerContainer = document.createElement("div");
  const content = document.createElement("div");
  const path = document.createElement("div");
  const cwe = document.createElement("div");
  const accordionArrow = document.createElement("span");

  path.innerHTML = `<strong>Path:</strong> ${issue.path}`;
  cwe.innerHTML = `<strong>CWE:</strong> ${issue.extra.metadata.cwe[0]}`;
  accordionArrow.innerHTML = "&#9658;";

  headerContainer.classList.add("accordion-header");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  content.appendChild(path);
  content.appendChild(cwe);
  headerContainer.appendChild(content);
  headerContainer.appendChild(accordionArrow);
  headerContainer.addEventListener("click", () =>
    toggleAccordionContent(index, issue, accordionArrow)
  );
  headerContainer.style.borderLeft = `5px solid ${getImpactColor(
    issue.extra.metadata.impact as Impact
  )}`;
  return headerContainer;
}

function createAccordionContent(issue: Issue): HTMLDivElement {
  const content = document.createElement("div");
  content.classList.add("accordion-content");
  content.classList.add("active");
  // content.setAttribute("id",`${issue.index}`);

  const ul = createUnorderedList([
    `Message||| ${issue.extra.message}`,
    `OWASP||| ${issue.extra.metadata.owasp}`,
    `Context||| ${issue.context ? issue.context : issue.extra.lines}`,
    `Solution|||${issue.index}`,
  ]);

  content.style.borderLeft = `5px solid ${getImpactColor(
    issue.extra.metadata.impact as Impact
  )}`;

  appendChildren(content, [ul]);

  return content;
}

async function generatePR(message: string, index: number | undefined) {
  const generatePRBtn = document.getElementById(
    `generatebtn${index}`
  ) as HTMLButtonElement;
  const url = `http://localhost:3000/security-issues/generate-pr?path=${message}`;
  await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });

  generatePRBtn.setAttribute("disabled", "true");
  generatePRBtn.style.backgroundColor = "#cccccc";
  generatePRBtn.style.color = "#666666";
}

async function updateCode(issue: Issue) {
  const updateCodeBtn = document.getElementById(
    `updatebtn${issue.index}`
  ) as HTMLButtonElement;
  const url = "http://localhost:3000/security-issues/update-file";
  const { path, context, solution } = issue;
  const filePath = "D:\\poc\\java_project\\" + path.replace("/", "\\");
  let updateResponse = "";
  const headers = {
    "Content-Type": "application/json",
  };
  let requestBody = "";
  requestBody = JSON.stringify({
    path: filePath,
    context,
    AiCode: solution,
  });

  await fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBody,
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });

  updateCodeBtn.setAttribute("disabled", "true");
  updateCodeBtn.style.backgroundColor = "#cccccc";
  updateCodeBtn.style.color = "#666666";
}

function toggleAccordionContent(
  index: number,
  issue: Issue,
  arrowContainer: HTMLSpanElement
): void {
  let isOpen = false;
  if (!isOpen) {
    isOpen = !isOpen;
    arrowContainer.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
  }
  const content = document.getElementById(`${index}`) as HTMLDivElement;
  if (issue.solution == null) {
    getSolution(issue);
  }
  const accordionContent = document.querySelectorAll(".accordion-content")[
    index
  ] as HTMLDivElement;
  accordionContent.classList.toggle("active");
}

function createUnorderedList(items: string[]): HTMLUListElement {
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    const parts = item.split("|||");
    if (parts.length === 2) {
      if (parts[0] == "Context") {
        const context = hljs.highlightAuto(parts[1]).value;
        li.innerHTML = `<strong>${parts[0]}:</strong><br/><pre><code>${context}</code></pre>`;
      } else if (parts[0] == "Solution") {
        li.innerHTML = `<div id="AiSolution"><strong> ${parts[0]}: </strong> <div id="solutionContainer${parts[1]}"> <span id="spinner${parts[1]}"></span> <div id="loadingMessage${parts[1]}"></div></div><div id="${parts[1]}"></div> </div>`;
      } else {
        li.innerHTML = `<strong>${parts[0]}:</strong> ${parts[1]}<br/>`;
      }
    } else {
      li.textContent = item;
    }
    ul.appendChild(li);
  });
  return ul;
}

function appendChildren(parent: HTMLElement, children: HTMLElement[]): void {
  children.forEach((child) => parent.appendChild(child));
}

async function getSolution(data: Issue) {
  const url = "http://localhost:3000/security-issues/resolveissue";
  const headers = {
    "Content-Type": "application/json",
  };
  const { message, lines } = data.extra;
  const { cwe, owasp } = data.extra.metadata;
  const filePath = "D:\\poc\\java_project\\" + data.path.replace("/", "\\");
  let context = data.context;
  let requestBody = "";

  if (context) {
    requestBody = JSON.stringify({
      cwe,
      message,
      owasp,
      code: context,
      path: filePath,
    });
  } else {
    requestBody = JSON.stringify({
      cwe,
      message,
      owasp,
      code: lines,
      path: filePath,
    });
  }

  const aiSolutionSpinner = document.getElementById(
    `spinner${data.index}`
  ) as HTMLSpanElement;
  const loadingMessage = document.getElementById(
    `loadingMessage${data.index}`
  ) as HTMLDivElement;
  const solutionContainer = document.getElementById(
    `solutionContainer${data.index}`
  ) as HTMLDivElement;
  solutionContainer.style.marginLeft = "90px";
  solutionContainer.style.display = "flex";
  loadingMessage.style.marginLeft = "10px";
  loadingMessage.style.marginTop = "3px";
  const spinner = document.createElement("div");
  spinner.classList.add("loading-spinner");
  spinner.style.display = "block";
  spinner.style.marginLeft = "20px";
  aiSolutionSpinner.appendChild(spinner);
  loadingMessage.innerHTML = "Generating code from AI.....";

  await fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBody,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((response) => {
      const updatedCode = document.createElement("div");
      const code = hljs.highlightAuto(response).value;
      const language = hljs.highlightAuto(code).language;
      updatedCode.innerHTML = `<pre><code class=${language} >${code}</code></pre>`;
      data.solution = response;

      let solutionContainer = document.getElementById(
        `${data.index}`
      ) as HTMLDivElement;
      spinner.style.display = "none";
      loadingMessage.innerHTML = "";
      solutionContainer.appendChild(updatedCode);
      addActions(solutionContainer, data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addActions(container: HTMLDivElement, issue: Issue) {
  const updateCodeBtn = document.createElement("button");
  const generatePRBtn = document.createElement("button");

  const buttonText = document.createElement("span");
  const generatePRText = document.createElement("span");
  buttonText.textContent = "Try Solution";
  generatePRText.textContent = "Generate PR";

  updateCodeBtn.setAttribute("id", `updatebtn${issue.index}`);
  generatePRBtn.setAttribute("id", `generatebtn${issue.index}`);

  buttonText.classList.add("button-text");
  generatePRText.classList.add("button-text");
  updateCodeBtn.classList.add("resolve-issue-btn");
  generatePRBtn.classList.add("resolve-issue-btn");

  updateCodeBtn.appendChild(buttonText);
  generatePRBtn.appendChild(generatePRText);

  updateCodeBtn.onclick = () => {
    updateCode(issue);
  };

  generatePRBtn.onclick = () => {
    generatePR("this is commit message", issue.index);
  };

  container.appendChild(updateCodeBtn);
  container.appendChild(generatePRBtn);
}
