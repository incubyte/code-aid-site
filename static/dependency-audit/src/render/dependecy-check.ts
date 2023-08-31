import { ITEMS_PER_PAGE } from "../constants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";

export function renderDepedencyIssue(
  dependencyIssues: DependencyIssue[],
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

const getIssueContainer = (issue: DependencyIssue): HTMLDivElement => {
  const issueContainer = document.createElement("div");
  issueContainer.classList.add("issue-container");

  const issueSection = document.createElement("section");
  issueSection.appendChild(getHeader(issue));

  addPacakges(issueSection, issue);
  addVulnerabilies(issueSection, issue);

  issueContainer.appendChild(issueSection);

  return issueContainer;
};

const getHeader = (issue: DependencyIssue): HTMLHeadElement => {
  const header = document.createElement("header");
  const fileName = document.createElement("p");
  const filePath = document.createElement("p");
  fileName.innerHTML = "<strong>File Name:</strong> " + issue.fileName;
  filePath.innerHTML = "<strong>File Path:</strong> " + issue.filePath;
  header.appendChild(fileName);
  header.appendChild(filePath);
  return header;
};

function addPacakges(issueSection: HTMLElement, issue: DependencyIssue) {
  if (issue.packages?.length === undefined) return;
  const packages = document.createElement("div");
  const div = document.createElement("div");

  const p = document.createElement("p");

  p.classList.add("packages");
  p.innerHTML = "<strong>Packages:</strong>";
  p.addEventListener("click", () => {
    div.classList.toggle("d-none");
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

const addVulnerabilies = (
  issueSection: HTMLElement,
  issue: DependencyIssue
) => {
  if (issue.vulnerabilities?.length === undefined) {
    return;
  }
  const label = document.createElement("label");
  label.innerHTML = "<strong>Vulnerabilities:</strong>";
  const vulnerabilities = document.createElement("div");
  vulnerabilities.classList.add("vulnerabilities");
  vulnerabilities.appendChild(label);

  const ul = document.createElement("ul");
  issue.vulnerabilities.forEach((vulnerability) => {
    const li = document.createElement("li");

    const description = document.createElement("p");
    const severity = document.createElement("p");
    const attackVector = document.createElement("p");
    const confidentialImpact = document.createElement("p");
    const integrityImpact = document.createElement("p");
    const availabilityImpact = document.createElement("p");
    const references = document.createElement("p");

    description.innerHTML =
      "<strong>Description:</strong> " + vulnerability.description;
    severity.innerHTML = "<strong>Severity:</strong> " + vulnerability.severity;
    severity.classList.add("badge", "badge-primary");
    attackVector.innerHTML =
      "<strong>Threat vector:</strong> " +
      getCleanedAttackVector(vulnerability.cvssv3?.attackVector);
    confidentialImpact.innerHTML =
      "<strong>Confidential impact:</strong> " +
      getCleanedImpact(vulnerability.cvssv3?.confidentialImpact);
    integrityImpact.innerHTML =
      "<strong>Integrity impact:</strong> " +
      getCleanedImpact(vulnerability.cvssv3?.integrityImpact);
    availabilityImpact.innerHTML =
      "<strong>Availiblity impact:</strong> " +
      getCleanedImpact(vulnerability.cvssv3?.availabilityImpact);

    if (vulnerability.description !== undefined) {
      li.appendChild(description);
    }

    if (vulnerability.severity !== undefined) {
      li.appendChild(severity);
    }

    if (vulnerability.cvssv3?.attackVector !== undefined) {
      li.appendChild(attackVector);
    }

    if (vulnerability.cvssv3?.confidentialImpact !== undefined) {
      li.appendChild(confidentialImpact);
    }

    if (vulnerability.cvssv3?.integrityImpact !== undefined) {
      li.appendChild(integrityImpact);
    }

    if (vulnerability.cvssv3?.availabilityImpact !== undefined) {
      li.appendChild(availabilityImpact);
    }

    if (vulnerability.references?.length !== undefined) {
      const strong = document.createElement("strong");
      strong.textContent = "References:";
      references.appendChild(strong);
      strong.addEventListener("click", () => {});
      vulnerability.references?.forEach((reference) => {
        const div = document.createElement("div");
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
  });

  vulnerabilities.appendChild(ul);

  issueSection.appendChild(vulnerabilities);
};
function getCleanedAttackVector(attackVector: string) {
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
