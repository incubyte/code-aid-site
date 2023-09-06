import { ITEMS_PER_PAGE, impactMap, severityMap } from "../constants";
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
  filePath.innerHTML = "<strong>File Path:</strong> " + issue.filePath;
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
    "<strong>Confidentiality impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.confidentialityImpact);
  integrityImpact.innerHTML =
    "<strong>Integrity impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.integrityImpact);
  availabilityImpact.innerHTML =
    "<strong>Availiblity impact:</strong> " +
    getCleanedImpact(issue.vulnerabilities.cvssv3?.availabilityImpact);

  if (issue.vulnerabilities?.description) {
    li.appendChild(description);
  }

  if (issue.vulnerabilities.severity) {
    li.appendChild(severity);
  }

  if (issue.vulnerabilities.cvssv3?.attackVector) {
    li.appendChild(attackVector);
  }

  if (issue.vulnerabilities.cvssv3?.confidentialityImpact) {
    li.appendChild(confidentialImpact);
  }

  if (issue.vulnerabilities.cvssv3?.integrityImpact) {
    li.appendChild(integrityImpact);
  }

  if (issue.vulnerabilities.cvssv3?.availabilityImpact) {
    li.appendChild(availabilityImpact);
  }

  if (issue.vulnerabilities.references.length) {
    addReferences(references, issue, li);
  }

  li.style.border = "1px solid #ddd";
  li.style.padding = "10px";
  ul.appendChild(li);

  vulnerabilities.appendChild(ul);

  issueSection.appendChild(vulnerabilities);
};

function addReferences(
  references: HTMLDivElement,
  issue: Issue,
  li: HTMLLIElement
) {
  const referenceLabel = document.createElement("strong");
  referenceLabel.innerHTML = "References:";
  referenceLabel.style.cursor = "pointer";

  const arrowSpan = getArrow();
  referenceLabel.prepend(arrowSpan);

  const div = document.createElement("div");
  div.classList.add("d-none");

  references.appendChild(referenceLabel);

  referenceLabel.addEventListener("click", () => {
    div.classList.toggle("d-none");
    arrowSpan.classList.toggle("rotate-arrow");
  });

  issue.vulnerabilities?.references?.forEach((reference) => {
    const a = document.createElement("a");
    const referenceLi = document.createElement("li");
    a.setAttribute("href", reference.url);
    a.setAttribute("target", "_blank");
    a.textContent = reference.name;
    referenceLi.appendChild(a);
    div.style.paddingLeft = "15px";
    div.appendChild(referenceLi);
    references.appendChild(div);
  });
  li.appendChild(references);
}

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
  return impactMap[impact] || impact;
}

function getSeverityBadge(severity: string): string {
  return severityMap[severity] || severity;
}
