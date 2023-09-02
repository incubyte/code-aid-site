import { ITEMS_PER_PAGE } from "../constants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";

export function renderDepedencyIssue(
  dependencyIssues: Issue[],
  container: HTMLDivElement,
  securityIssuesHashUrl: SecurityIssuesHashUrl
) {
  container.innerHTML = "";

  const startIndex =
    (securityIssuesHashUrl.getPageNumber() - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const itemsToRender = dependencyIssues.slice(startIndex, endIndex);

  itemsToRender.forEach((issue) => {
    container.appendChild(getIssueContainer(issue));
  });
}

const getIssueContainer = (issue: Issue): HTMLDivElement => {
  const issueContainer = document.createElement("div");
  issueContainer.classList.add("issue-container");

  const issueSection = document.createElement("section");
  issueSection.appendChild(getHeader(issue));

  addPacakges(issueSection, issue);
  addVulnerabilies(issueSection, issue);

  issueContainer.appendChild(issueSection);

  return issueContainer;
};

const getHeader = (issue: Issue): HTMLHeadElement => {
  const header = document.createElement("header");
  header.classList.add("header");
  const fileName = document.createElement("p");
  const filePath = document.createElement("p");
  fileName.innerHTML = "<strong>File Name:</strong> " + issue.fileName;
  filePath.innerHTML =
    "<strong>File Path:</strong> " + issue.filePath.replace(".node", "");
  header.appendChild(fileName);
  header.appendChild(filePath);
  return header;
};

function addPacakges(issueSection: HTMLElement, issue: Issue) {
  if (issue.packages?.length === undefined) return;
  const packages = document.createElement("div");

  const div = document.createElement("div");
  const p = document.createElement("p");

  const arrowSpan = getArrow();
  div.classList.add("d-none");

  p.classList.add("packages");
  p.innerHTML = "<strong>Packages:</strong>";
  p.prepend(arrowSpan);
  p.addEventListener("click", () => {
    div.classList.toggle("d-none");
    arrowSpan.classList.toggle("rotate-arrow");
  });

  const ul = document.createElement("ul");
  const li = document.createElement("li");
  const a = document.createElement("a");
  div.classList.add("collapsible-content");
  div.setAttribute("id", "collapsible-content-packages");

  issue?.packages?.forEach((issuePackage) => {
    a.setAttribute("href", issuePackage.url);
    a.textContent = issuePackage.id;
    div.appendChild(ul.appendChild(li.appendChild(a)));
  });

  packages.appendChild(p);
  packages.appendChild(div);
  issueSection.appendChild(packages);
}

const addVulnerabilies = (issueSection: HTMLElement, issue: Issue) => {
  const {
    description,
    severity,
    attackVector,
    confidentialImpact,
    integrityImpact,
    availabilityImpact,
    li,
    references,
    ul,
    vulnerabilities,
  } = getContentSkeleton();

  description.innerHTML =
    "<strong>Description:</strong> " + issue.vulnerabilities.description;
  severity.innerHTML =
    "<strong>Severity:</strong> " + issue.vulnerabilities.severity;
  severity.classList.add(
    "badge",
    `badge-${getSeverityBadge(issue.vulnerabilities.severity)}`
  );
  attackVector.innerHTML =
    "<strong>Threat vector:</strong> " +
    getCleanedAttackVector(issue.vulnerabilities.cvssv3?.attackVector);
  confidentialImpact.innerHTML =
    "<strong>Confidential impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.confidentialImpact);
  integrityImpact.innerHTML =
    "<strong>Integrity impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.integrityImpact);
  availabilityImpact.innerHTML =
    "<strong>Availiblity impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.availabilityImpact);

  if (issue.vulnerabilities?.description !== undefined) {
    li.appendChild(description);
  }

  if (issue.vulnerabilities.severity !== undefined) {
    li.appendChild(severity);
  }

  if (issue.vulnerabilities.cvssv3?.attackVector !== undefined) {
    li.appendChild(attackVector);
  }

  if (issue.vulnerabilities.cvssv3?.confidentialImpact !== undefined) {
    li.appendChild(confidentialImpact);
  }

  if (issue.vulnerabilities.cvssv3?.integrityImpact !== undefined) {
    li.appendChild(integrityImpact);
  }

  if (issue.vulnerabilities.cvssv3?.availabilityImpact !== undefined) {
    li.appendChild(availabilityImpact);
  }

  if (issue.vulnerabilities.references.length !== undefined) {
    const strong = document.createElement("strong");
    strong.innerHTML = "References:";
    strong.style.cursor = "pointer";

    const arrowSpan = getArrow();
    strong.prepend(arrowSpan);

    const div = document.createElement("div");
    div.classList.add("d-none");

    references.appendChild(strong);

    strong.addEventListener("click", () => {
      const arrow = document.getElementById("arrow") as HTMLSpanElement;
      div.classList.toggle("d-none");
      arrowSpan.classList.toggle("rotate-arrow");
    });

    issue.vulnerabilities?.references?.forEach((reference) => {
      const a = document.createElement("a");
      const li = document.createElement("li");
      a.setAttribute("href", reference.url);
      a.textContent = reference.url;

      div.appendChild(li.appendChild(a));
      references.appendChild(div);
    });
    li.appendChild(references);
  }

  li.style.border = "1px solid #ddd";
  li.style.padding = "10px";
  ul.appendChild(li);

  vulnerabilities.appendChild(ul);

  issueSection.appendChild(vulnerabilities);
};

function getArrow() {
  const arrowSpan = document.createElement("span");
  arrowSpan.innerHTML = "► ";
  arrowSpan.style.transition = "transform 0.3s ease";
  arrowSpan.style.display = "inline-block";
  arrowSpan.style.margin = "3px";
  return arrowSpan;
}

function getContentSkeleton() {
  const label = document.createElement("label");
  label.innerHTML = "<strong>Vulnerability:</strong>";
  const vulnerabilities = document.createElement("div");
  vulnerabilities.classList.add("vulnerabilities");
  vulnerabilities.appendChild(label);
  const ul = document.createElement("ul");
  // issue.vulnerabilities.forEach(.vulnerabilities?. => {
  const li = document.createElement("li");

  const description = document.createElement("p");
  const severity = document.createElement("p");
  const attackVector = document.createElement("p");
  const confidentialImpact = document.createElement("p");
  const integrityImpact = document.createElement("p");
  const availabilityImpact = document.createElement("p");
  const references = document.createElement("div");
  return {
    description,
    severity,
    attackVector,
    confidentialImpact,
    integrityImpact,
    availabilityImpact,
    li,
    references,
    ul,
    vulnerabilities,
  };
}

function getCleanedAttackVector(attackVector: string | undefined) {
  if (attackVector === "N") {
    return "NETWORK";
  }
  if (attackVector === "L") {
    return "LOCAL";
  }
  return attackVector;
}
function getCleanedImpact(impact: string) {
  if (impact === "N") {
    return "NONE";
  } else if (impact === "H") {
    return "HIGH";
  } else if (impact === "L") {
    return "LOW";
  } else if (impact === "M") {
    return "MEDIUM";
  } else {
    return impact;
  }
}
function getSeverityBadge(severity: string): string {
  if (severity === "CRITICAL") {
    return "critical";
  } else if (severity === "HIGH") {
    return "high";
  } else if (severity === "LOW") {
    return "low";
  } else if (severity === "MEDIUM") {
    return "medium";
  } else if (severity === "MODERATE") {
    return "moderate";
  } else {
    return severity;
  }
}
