import { getImpactColor, Impact } from "./impact-color";

let result: any[];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

const impactSelection = document.getElementById("impact") as HTMLSelectElement;
impactSelection.addEventListener("change", function () {
  const selectedImpact = impactSelection.value;
  filterBasedOnImpact(selectedImpact, result);
});

async function getJsonData(): Promise<any> {
  const res = await fetch("./scan_results.json");
  result = await res.json();
  return result;
}

function filterIssues(data: any, pattern: string): any[] {
  result = data.results.filter((obj: any) => obj.path.includes(pattern));
  return result;
}

function renderToHtml(
  data: any[],
  currentPage: number,
  ITEMS_PER_PAGE: number
): void {
  if (impactSelection.value !== "all") {
    data = result.filter(
      (issue: any) => issue.extra.metadata.impact === impactSelection.value
    );
  }
  const container = document.getElementById("container") as HTMLDivElement;
  container.innerHTML = "";

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const itemsToRender = data.slice(startIndex, endIndex);

  itemsToRender.forEach((issue: any) => {
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

    const code = document.createElement("li");
    code.innerHTML = "<strong>code:</strong>" + issue.extra.lines + "<br/>";

    ul.appendChild(cwe);
    ul.appendChild(message);
    ul.appendChild(code);

    securityIssueData.appendChild(document.createElement("hr"));

    securityIssueData.appendChild(path);
    securityIssueData.appendChild(impact);
    securityIssueData.appendChild(ul);

    container.appendChild(securityIssueData);
  });

  renderPaginationControls(data.length, currentPage);
}

function filterBasedOnImpact(impact: string, result: any[]): void {
  if (impact === "all") {
    renderToHtml(result, 1, ITEMS_PER_PAGE);
    return;
  }
  const filteredData = result.filter(
    (issue: any) => issue.extra.metadata.impact === impact
  );
  renderToHtml(filteredData, currentPage, ITEMS_PER_PAGE);
}

function renderPaginationControls(
  totalItems: number,
  currentPage: number
): void {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginationContainer = document.getElementById(
    "pagination"
  ) as HTMLDivElement;
  paginationContainer.innerHTML = "";

  const prevButton = document.createElement("button");
  if (currentPage === 1) {
    prevButton.style.display = "none";
  }
  prevButton.className = "page-link";
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      window.location.hash = `${currentPage}`;
    }
  });

  const nextButton = document.createElement("button");
  if (currentPage == totalPages) {
    nextButton.style.display = "None";
  }
  nextButton.className = "page-link";
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      window.location.hash = `${currentPage}`;
    }
  });

  paginationContainer.appendChild(prevButton);
  const initialPageCount = 5;
  const startPage = Math.max(1, currentPage - Math.floor(initialPageCount / 2));
  const endPage = Math.min(totalPages, startPage + initialPageCount - 1);
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    if (totalPages == 1) {
      pageButton.style.display = "none";
    }

    pageButton.className = "page-link";
    pageButton.textContent = i + "";
    pageButton.addEventListener("click", function () {
      window.location.hash = `${i}`;
    });
    if (i === currentPage) {
      pageButton.style.color = "white";
      pageButton.style.background = "#0e3252";
    }
    paginationContainer.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    paginationContainer.appendChild(ellipsis);

    const moreButton = document.createElement("button");
    moreButton.className = "page-link";
    moreButton.textContent = "More";
    moreButton.addEventListener("click", function () {
      window.location.hash = `${endPage + 1}`;
      // renderToHtml(result, endPage + 1, ITEMS_PER_PAGE);
    });
    paginationContainer.style.display = "flex";

    paginationContainer.appendChild(moreButton);
  }

  paginationContainer.appendChild(nextButton);
}

async function main(): Promise<void> {
  const result = await getJsonData();
  const filteredIssues = filterIssues(result, ".java");
  const hash = parseInt(window.location.hash.replace("#", ""));
  let currentPage = 1;
  if (!isNaN(hash)) {
    currentPage = hash;
  }
  renderToHtml(filteredIssues, currentPage, ITEMS_PER_PAGE);
}

window.addEventListener("hashchange", () => {
  console.log(window.location.hash);

  let currentPage = parseInt(window.location.hash.replace("#", ""));
  if (isNaN(currentPage)) {
    currentPage = 1;
  }
  renderToHtml(result, currentPage, ITEMS_PER_PAGE);
});

main();
