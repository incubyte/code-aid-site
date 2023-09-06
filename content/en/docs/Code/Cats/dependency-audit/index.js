/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.impactMap = exports.severityMap = exports.ITEMS_PER_PAGE = void 0;
exports.ITEMS_PER_PAGE = 10;
exports.severityMap = {
    CRITICAL: "critical",
    HIGH: "high",
    LOW: "low",
    MEDIUM: "medium",
    MODERATE: "moderate",
};
exports.impactMap = {
    N: "NONE",
    H: "HIGH",
    L: "LOW",
    M: "MEDIUM",
};


/***/ }),

/***/ "./src/data-handler.ts":
/*!*****************************!*\
  !*** ./src/data-handler.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSecurityIssuesMetadata = exports.getIssuesWithLanguageLabel = exports.filteredDependencyIssues = exports.getDependencyIssues = void 0;
const isIssuesEmpty = (issue) => {
    var _a;
    return ((_a = issue.vulnerabilities) === null || _a === void 0 ? void 0 : _a.length) === undefined;
};
const getDependencyIssues = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("./dependency-check-report.json");
    const data = yield res.json();
    const dependencyIssues = data.dependencies;
    const finalDependecyIssues = [];
    const filteredDependencyIssues = dependencyIssues.filter((issue) => {
        return !isIssuesEmpty(issue);
    });
    filteredDependencyIssues.forEach((issue) => {
        issue.filePath = issue.filePath.replace("/mnt/d/", "");
    });
    filteredDependencyIssues.forEach((issue) => {
        convertToSaprateEle(issue).forEach((ele) => finalDependecyIssues.push(ele));
    });
    finalDependecyIssues.forEach((issue) => {
        issue.vulnerabilities.severity =
            issue.vulnerabilities.severity.toUpperCase();
    });
    return finalDependecyIssues;
});
exports.getDependencyIssues = getDependencyIssues;
const filteredDependencyIssues = (results, languages, severities) => {
    return results.filter((obj) => languages.includes(obj.language) &&
        severities.includes(obj.vulnerabilities.severity));
};
exports.filteredDependencyIssues = filteredDependencyIssues;
const getIssuesWithLanguageLabel = (results) => {
    return results.map((result) => {
        var _a;
        const language = (_a = result.filePath.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".").pop();
        return Object.assign(Object.assign({}, result), { language: language ? language : "" });
    });
};
exports.getIssuesWithLanguageLabel = getIssuesWithLanguageLabel;
const getSecurityIssuesMetadata = (results) => {
    const allLanguagesWithCount = [];
    const allSeveritiesWithCount = [];
    results.forEach((result) => {
        var _a;
        const language = result.language;
        const severity = (_a = result.vulnerabilities) === null || _a === void 0 ? void 0 : _a.severity;
        const languageIndex = allLanguagesWithCount.findIndex((lang) => lang.key === language);
        const severityIndex = allSeveritiesWithCount.findIndex((sev) => sev.key === severity);
        if (languageIndex === -1) {
            allLanguagesWithCount.push({ key: language, value: 1 });
        }
        else {
            allLanguagesWithCount[languageIndex].value++;
        }
        if (severityIndex === -1) {
            allSeveritiesWithCount.push({ key: severity ? severity : "", value: 1 });
        }
        else {
            allSeveritiesWithCount[severityIndex].value++;
        }
    });
    return {
        allLanguagesWithCount,
        allSeverityWithCount: allSeveritiesWithCount,
    };
};
exports.getSecurityIssuesMetadata = getSecurityIssuesMetadata;
function convertToSaprateEle(issue) {
    const convertedIssues = [];
    const { filePath, fileName, language, packages, vulnerabilities } = issue;
    const singleIssue = {
        fileName,
        filePath,
        language,
        packages,
    };
    vulnerabilities === null || vulnerabilities === void 0 ? void 0 : vulnerabilities.forEach((vulnerability) => {
        convertedIssues.push(constructIssueObj(singleIssue, vulnerability));
    });
    return convertedIssues;
}
const constructIssueObj = (singleIssue, vulnerabilities) => {
    const obj = Object.assign(Object.assign({}, singleIssue), { vulnerabilities });
    return obj;
};


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const data_handler_1 = __webpack_require__(/*! ./data-handler */ "./src/data-handler.ts");
const dependecy_check_1 = __webpack_require__(/*! ./render/dependecy-check */ "./src/render/dependecy-check.ts");
const filter_buttons_1 = __webpack_require__(/*! ./render/filter-buttons */ "./src/render/filter-buttons.ts");
const pagination_1 = __webpack_require__(/*! ./render/pagination */ "./src/render/pagination.ts");
const security_issue_hash_1 = __webpack_require__(/*! ./security-issue-hash */ "./src/security-issue-hash.ts");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const dependencyIssues = yield (0, data_handler_1.getDependencyIssues)();
    const resultsWithLanguages = (0, data_handler_1.getIssuesWithLanguageLabel)(dependencyIssues);
    const { allLanguagesWithCount, allSeverityWithCount } = (0, data_handler_1.getSecurityIssuesMetadata)(resultsWithLanguages);
    const container = document.getElementById("container");
    const securityIssuesHashUrl = new security_issue_hash_1.SecurityIssuesHashUrl();
    if (securityIssuesHashUrl.isEmpty()) {
        securityIssuesHashUrl.setLanguages(allLanguagesWithCount.map((o) => o.key));
        securityIssuesHashUrl.setSeverities(allSeverityWithCount.map((o) => o.key));
    }
    (0, dependecy_check_1.renderDepedencyIssue)(dependencyIssues, container, securityIssuesHashUrl);
    (0, pagination_1.renderPagination)(document.getElementById("pagination"), dependencyIssues.length, securityIssuesHashUrl);
    const { languages, severity } = securityIssuesHashUrl.getData();
    const filteredResults = (0, data_handler_1.filteredDependencyIssues)(resultsWithLanguages, languages, severity);
    const filterLanguageButtons = new filter_buttons_1.FilterLanguageButtons(document.getElementById("filter-language-buttons"), allLanguagesWithCount, securityIssuesHashUrl);
    const filterSeverityButtons = new filter_buttons_1.FilterSeverityButtons(document.getElementById("filter-severity-buttons"), allSeverityWithCount, securityIssuesHashUrl);
    window.addEventListener("hashchange", () => {
        const filteredResults = (0, data_handler_1.filteredDependencyIssues)(resultsWithLanguages, securityIssuesHashUrl.getLanguages(), securityIssuesHashUrl.getSeverities());
        (0, dependecy_check_1.renderDepedencyIssue)(filteredResults, container, securityIssuesHashUrl);
        (0, pagination_1.renderPagination)(document.getElementById("pagination"), filteredResults.length, securityIssuesHashUrl);
    });
});
main();


/***/ }),

/***/ "./src/render/dependecy-check.ts":
/*!***************************************!*\
  !*** ./src/render/dependecy-check.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderDepedencyIssue = void 0;
const constants_1 = __webpack_require__(/*! ../constants */ "./src/constants.ts");
function renderDepedencyIssue(dependencyIssues, container, securityIssuesHashUrl) {
    container.innerHTML = "";
    const startIndex = (securityIssuesHashUrl.getPageNumber() - 1) * constants_1.ITEMS_PER_PAGE;
    const endIndex = startIndex + constants_1.ITEMS_PER_PAGE;
    const itemsToRender = dependencyIssues.slice(startIndex, endIndex);
    itemsToRender.forEach((issue) => {
        container.appendChild(getIssueContainer(issue));
    });
}
exports.renderDepedencyIssue = renderDepedencyIssue;
const getIssueContainer = (issue) => {
    const issueContainer = document.createElement("div");
    issueContainer.classList.add("issue-container");
    const issueSection = document.createElement("section");
    issueSection.appendChild(getHeader(issue));
    addPacakges(issueSection, issue);
    addVulnerabilies(issueSection, issue);
    issueContainer.appendChild(issueSection);
    return issueContainer;
};
const getHeader = (issue) => {
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
function addPacakges(issueSection, issue) {
    var _a, _b;
    if (((_a = issue.packages) === null || _a === void 0 ? void 0 : _a.length) === undefined)
        return;
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
    (_b = issue === null || issue === void 0 ? void 0 : issue.packages) === null || _b === void 0 ? void 0 : _b.forEach((issuePackage) => {
        a.setAttribute("href", issuePackage.url);
        a.textContent = issuePackage.id;
        div.appendChild(ul.appendChild(li.appendChild(a)));
    });
    packages.appendChild(p);
    packages.appendChild(div);
    issueSection.appendChild(packages);
}
const addVulnerabilies = (issueSection, issue) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { description, severity, attackVector, confidentialImpact, integrityImpact, availabilityImpact, li, references, ul, vulnerabilities, } = getContentSkeleton();
    description.innerHTML =
        "<strong>Description:</strong> " + issue.vulnerabilities.description;
    severity.innerHTML =
        "<strong>Severity:</strong> " + issue.vulnerabilities.severity;
    severity.classList.add("badge", `badge-${getSeverityBadge(issue.vulnerabilities.severity)}`);
    attackVector.innerHTML =
        "<strong>Threat vector:</strong> " +
            getCleanedAttackVector((_a = issue.vulnerabilities.cvssv3) === null || _a === void 0 ? void 0 : _a.attackVector);
    confidentialImpact.innerHTML =
        "<strong>Confidentiality impact:</strong> " +
            getCleanedImpact((_b = issue.vulnerabilities.cvssv3) === null || _b === void 0 ? void 0 : _b.confidentialityImpact);
    integrityImpact.innerHTML =
        "<strong>Integrity impact:</strong> " +
            getCleanedImpact((_c = issue.vulnerabilities.cvssv3) === null || _c === void 0 ? void 0 : _c.integrityImpact);
    availabilityImpact.innerHTML =
        "<strong>Availiblity impact:</strong> " +
            getCleanedImpact((_d = issue.vulnerabilities.cvssv3) === null || _d === void 0 ? void 0 : _d.availabilityImpact);
    if ((_e = issue.vulnerabilities) === null || _e === void 0 ? void 0 : _e.description) {
        li.appendChild(description);
    }
    if (issue.vulnerabilities.severity) {
        li.appendChild(severity);
    }
    if ((_f = issue.vulnerabilities.cvssv3) === null || _f === void 0 ? void 0 : _f.attackVector) {
        li.appendChild(attackVector);
    }
    if ((_g = issue.vulnerabilities.cvssv3) === null || _g === void 0 ? void 0 : _g.confidentialityImpact) {
        li.appendChild(confidentialImpact);
    }
    if ((_h = issue.vulnerabilities.cvssv3) === null || _h === void 0 ? void 0 : _h.integrityImpact) {
        li.appendChild(integrityImpact);
    }
    if ((_j = issue.vulnerabilities.cvssv3) === null || _j === void 0 ? void 0 : _j.availabilityImpact) {
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
function addReferences(references, issue, li) {
    var _a, _b;
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
    (_b = (_a = issue.vulnerabilities) === null || _a === void 0 ? void 0 : _a.references) === null || _b === void 0 ? void 0 : _b.forEach((reference) => {
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
function getCleanedAttackVector(attackVector) {
    if (attackVector === "N") {
        return "NETWORK";
    }
    if (attackVector === "L") {
        return "LOCAL";
    }
    return attackVector;
}
function getCleanedImpact(impact) {
    return constants_1.impactMap[impact] || impact;
}
function getSeverityBadge(severity) {
    return constants_1.severityMap[severity] || severity;
}


/***/ }),

/***/ "./src/render/filter-buttons.ts":
/*!**************************************!*\
  !*** ./src/render/filter-buttons.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterLanguageButtons = exports.FilterSeverityButtons = void 0;
const customSort = (data) => {
    const order = ["CRITICAL", "HIGH", "MODERATE", "MEDIUM", "LOW"];
    return data.sort((a, b) => {
        const indexA = order.indexOf(a.key);
        const indexB = order.indexOf(b.key);
        if (indexA === indexB) {
            return b.value - a.value;
        }
        return indexA - indexB;
    });
};
class FilterSeverityButtons {
    constructor(severityButtonsContainer, allSeveritiesWithCount, securityIssuesHashUrl) {
        this.severityButtonsContainer = severityButtonsContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        allSeveritiesWithCount = customSort(allSeveritiesWithCount);
        allSeveritiesWithCount.forEach((severityWithCount) => {
            const selectedSeverities = securityIssuesHashUrl.getSeverities();
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.classList.add(`${severityWithCount.key.toLocaleLowerCase()}-button`);
            filterButton.textContent = `${severityWithCount.key} (x${severityWithCount.value})`;
            if (selectedSeverities.includes(severityWithCount.key)) {
                filterButton.classList.add("selected");
            }
            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    securityIssuesHashUrl.setSeverities([
                        ...securityIssuesHashUrl.getSeverities(),
                        severityWithCount.key,
                    ]);
                }
                else {
                    securityIssuesHashUrl.setSeverities(securityIssuesHashUrl
                        .getSeverities()
                        .filter((serverity) => serverity !== severityWithCount.key));
                }
                securityIssuesHashUrl.setPageNumber(1);
            });
            severityButtonsContainer.appendChild(filterButton);
        });
    }
}
exports.FilterSeverityButtons = FilterSeverityButtons;
class FilterLanguageButtons {
    constructor(languageListContainer, allLanguagesWithCount, securityIssuesHashUrl) {
        this.languageListContainer = languageListContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        allLanguagesWithCount.forEach((language) => {
            const selectedLanguages = securityIssuesHashUrl.getLanguages();
            const languageContainer = document.createElement("div");
            const languageLabel = document.createElement("label");
            const checkboxButton = document.createElement("INPUT");
            checkboxButton.setAttribute("type", "checkbox");
            checkboxButton.classList.add("checkbox");
            checkboxButton.setAttribute("id", `${language.key}`);
            languageLabel.textContent = `${language.key} (x${language.value})`;
            languageLabel.setAttribute("for", `${language.key}`);
            if (selectedLanguages.includes(language.key)) {
                checkboxButton.setAttribute("checked", "true");
                checkboxButton.classList.add("checked");
            }
            checkboxButton.addEventListener("change", function () {
                checkboxButton.classList.toggle("checked");
                if (checkboxButton.classList.contains("checked")) {
                    securityIssuesHashUrl.setLanguages([
                        ...securityIssuesHashUrl.getLanguages(),
                        language.key,
                    ]);
                }
                else {
                    securityIssuesHashUrl.setLanguages(securityIssuesHashUrl
                        .getLanguages()
                        .filter((lang) => lang !== language.key));
                }
                securityIssuesHashUrl.setPageNumber(1);
            });
            languageContainer.appendChild(checkboxButton);
            languageContainer.appendChild(languageLabel);
            languageContainer.classList.add("language-margin");
            languageListContainer.classList.add("language-list");
            languageListContainer.appendChild(languageContainer);
        });
    }
}
exports.FilterLanguageButtons = FilterLanguageButtons;


/***/ }),

/***/ "./src/render/pagination.ts":
/*!**********************************!*\
  !*** ./src/render/pagination.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderPagination = void 0;
const constants_1 = __webpack_require__(/*! ../constants */ "./src/constants.ts");
const renderPagination = (paginationContainer, totalItems, securityIssuesHashUrl) => {
    const totalPages = Math.ceil(totalItems / constants_1.ITEMS_PER_PAGE);
    paginationContainer.innerHTML = "";
    const prevButton = getPreviousBtn(securityIssuesHashUrl);
    const nextButton = getNextBtn(securityIssuesHashUrl, totalPages);
    paginationContainer.appendChild(prevButton);
    const initialPageCount = 5;
    const startPage = Math.max(1, securityIssuesHashUrl.getPageNumber() - Math.floor(initialPageCount / 2));
    const endPage = Math.min(totalPages, startPage + initialPageCount - 1);
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = getPageNumBtn(totalPages, i, securityIssuesHashUrl);
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
            securityIssuesHashUrl.setPageNumber(endPage + 1);
            securityIssuesHashUrl.setPageNumber(endPage + 1);
        });
        paginationContainer.appendChild(moreButton);
    }
    paginationContainer.appendChild(nextButton);
};
exports.renderPagination = renderPagination;
function getPageNumBtn(totalPages, i, securityIssuesHashUrl) {
    const pageButton = document.createElement("button");
    if (totalPages == 1) {
        pageButton.style.display = "none";
    }
    pageButton.className = "page-link";
    pageButton.textContent = i + "";
    pageButton.addEventListener("click", function () {
        securityIssuesHashUrl.setPageNumber(i);
        securityIssuesHashUrl.setPageNumber(i);
    });
    if (i === securityIssuesHashUrl.getPageNumber()) {
        pageButton.style.color = "white";
        pageButton.style.background = "#0e3252";
    }
    return pageButton;
}
function getNextBtn(securityIssuesHashUrl, totalPages) {
    const nextButton = document.createElement("button");
    if (securityIssuesHashUrl.getPageNumber() == totalPages) {
        nextButton.style.display = "None";
    }
    nextButton.className = "page-link";
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", function () {
        if (securityIssuesHashUrl.getPageNumber() < totalPages) {
            securityIssuesHashUrl.setPageNumber(securityIssuesHashUrl.getPageNumber() + 1);
            securityIssuesHashUrl.setPageNumber(securityIssuesHashUrl.getPageNumber());
        }
    });
    return nextButton;
}
function getPreviousBtn(securityIssuesHashUrl) {
    const prevButton = document.createElement("button");
    if (securityIssuesHashUrl.getPageNumber() === 1) {
        prevButton.style.display = "none";
    }
    prevButton.className = "page-link";
    prevButton.textContent = "Previous";
    prevButton.addEventListener("click", function () {
        if (securityIssuesHashUrl.getPageNumber() > 1) {
            securityIssuesHashUrl.setPageNumber(securityIssuesHashUrl.getPageNumber() - 1);
            securityIssuesHashUrl.setPageNumber(securityIssuesHashUrl.getPageNumber());
        }
    });
    return prevButton;
}


/***/ }),

/***/ "./src/security-issue-hash.ts":
/*!************************************!*\
  !*** ./src/security-issue-hash.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SecurityIssuesHashUrl = void 0;
class SecurityIssuesHashUrl {
    constructor() {
        this.severities = [];
        this.languages = [];
        const data = this.getDataFromUrl(window.location.hash);
        this.pageNumber = data.pageNumber;
        this.severities = data.serverities;
        this.languages = data.languages;
    }
    getStateAsUrl() {
        return window.location.hash.replace("#", "");
    }
    updateUrl() {
        const hashArray = [];
        if (this.severities.length > 0) {
            hashArray.push(`severity=${this.severities.join(",")}`);
        }
        if (this.languages.length > 0) {
            hashArray.push(`language=${this.languages.join(",")}`);
        }
        hashArray.push(`page=${this.pageNumber}`);
        window.location.hash = hashArray.join("&");
    }
    setSeverities(serverity) {
        this.severities = serverity;
        this.updateUrl();
    }
    setLanguages(languages) {
        this.languages = languages;
        this.updateUrl();
    }
    setPageNumber(pageNumber) {
        this.pageNumber = pageNumber;
        this.updateUrl();
    }
    getDataFromUrl(hash) {
        const hashArray = hash.replace("#", "").split("&");
        const severity = [];
        const languages = [];
        let pageNumber = 1;
        hashArray.forEach((hashItem) => {
            const [key, value] = hashItem.split("=");
            if (key === "severity") {
                const valueArray = value.split(",");
                valueArray.forEach((valueItem) => {
                    severity.push(valueItem);
                });
            }
            else if (key === "language") {
                const valueArray = value.split(",");
                valueArray.forEach((valueItem) => {
                    languages.push(valueItem);
                });
            }
            else if (key === "page") {
                pageNumber = Number(value);
            }
        });
        return { serverities: severity, languages, pageNumber };
    }
    getSeverities() {
        return this.severities;
    }
    getLanguages() {
        return this.languages;
    }
    getPageNumber() {
        return this.pageNumber;
    }
    getData() {
        return {
            severity: this.severities,
            languages: this.languages,
            pageNumber: this.pageNumber,
        };
    }
    isEmpty() {
        return this.getStateAsUrl() === "";
    }
}
exports.SecurityIssuesHashUrl = SecurityIssuesHashUrl;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7Ozs7Ozs7Ozs7QUMvRWE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QywwQkFBMEI7QUFDakU7QUFDQTtBQUNBLHVDQUF1Qyx5QkFBeUI7QUFDaEU7QUFDQSwrQkFBK0IsZ0JBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qjs7Ozs7OztVQ25GN0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2RhdGEtaGFuZGxlci50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9kZXBlbmRlY3ktY2hlY2sudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9maWx0ZXItYnV0dG9ucy50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvcmVuZGVyL3BhZ2luYXRpb24udHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3NlY3VyaXR5LWlzc3VlLWhhc2gudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaW1wYWN0TWFwID0gZXhwb3J0cy5zZXZlcml0eU1hcCA9IGV4cG9ydHMuSVRFTVNfUEVSX1BBR0UgPSB2b2lkIDA7XG5leHBvcnRzLklURU1TX1BFUl9QQUdFID0gMTA7XG5leHBvcnRzLnNldmVyaXR5TWFwID0ge1xuICAgIENSSVRJQ0FMOiBcImNyaXRpY2FsXCIsXG4gICAgSElHSDogXCJoaWdoXCIsXG4gICAgTE9XOiBcImxvd1wiLFxuICAgIE1FRElVTTogXCJtZWRpdW1cIixcbiAgICBNT0RFUkFURTogXCJtb2RlcmF0ZVwiLFxufTtcbmV4cG9ydHMuaW1wYWN0TWFwID0ge1xuICAgIE46IFwiTk9ORVwiLFxuICAgIEg6IFwiSElHSFwiLFxuICAgIEw6IFwiTE9XXCIsXG4gICAgTTogXCJNRURJVU1cIixcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gZXhwb3J0cy5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCA9IGV4cG9ydHMuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gZXhwb3J0cy5nZXREZXBlbmRlbmN5SXNzdWVzID0gdm9pZCAwO1xuY29uc3QgaXNJc3N1ZXNFbXB0eSA9IChpc3N1ZSkgPT4ge1xuICAgIHZhciBfYTtcbiAgICByZXR1cm4gKChfYSA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkgPT09IHVuZGVmaW5lZDtcbn07XG5jb25zdCBnZXREZXBlbmRlbmN5SXNzdWVzID0gKCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgY29uc3QgcmVzID0geWllbGQgZmV0Y2goXCIuL2RlcGVuZGVuY3ktY2hlY2stcmVwb3J0Lmpzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IHlpZWxkIHJlcy5qc29uKCk7XG4gICAgY29uc3QgZGVwZW5kZW5jeUlzc3VlcyA9IGRhdGEuZGVwZW5kZW5jaWVzO1xuICAgIGNvbnN0IGZpbmFsRGVwZW5kZWN5SXNzdWVzID0gW107XG4gICAgY29uc3QgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gZGVwZW5kZW5jeUlzc3Vlcy5maWx0ZXIoKGlzc3VlKSA9PiB7XG4gICAgICAgIHJldHVybiAhaXNJc3N1ZXNFbXB0eShpc3N1ZSk7XG4gICAgfSk7XG4gICAgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGlzc3VlLmZpbGVQYXRoID0gaXNzdWUuZmlsZVBhdGgucmVwbGFjZShcIi9tbnQvZC9cIiwgXCJcIik7XG4gICAgfSk7XG4gICAgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGNvbnZlcnRUb1NhcHJhdGVFbGUoaXNzdWUpLmZvckVhY2goKGVsZSkgPT4gZmluYWxEZXBlbmRlY3lJc3N1ZXMucHVzaChlbGUpKTtcbiAgICB9KTtcbiAgICBmaW5hbERlcGVuZGVjeUlzc3Vlcy5mb3JFYWNoKChpc3N1ZSkgPT4ge1xuICAgICAgICBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuc2V2ZXJpdHkgPVxuICAgICAgICAgICAgaXNzdWUudnVsbmVyYWJpbGl0aWVzLnNldmVyaXR5LnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsRGVwZW5kZWN5SXNzdWVzO1xufSk7XG5leHBvcnRzLmdldERlcGVuZGVuY3lJc3N1ZXMgPSBnZXREZXBlbmRlbmN5SXNzdWVzO1xuY29uc3QgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gKHJlc3VsdHMsIGxhbmd1YWdlcywgc2V2ZXJpdGllcykgPT4ge1xuICAgIHJldHVybiByZXN1bHRzLmZpbHRlcigob2JqKSA9PiBsYW5ndWFnZXMuaW5jbHVkZXMob2JqLmxhbmd1YWdlKSAmJlxuICAgICAgICBzZXZlcml0aWVzLmluY2x1ZGVzKG9iai52dWxuZXJhYmlsaXRpZXMuc2V2ZXJpdHkpKTtcbn07XG5leHBvcnRzLmZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcyA9IGZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcztcbmNvbnN0IGdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gKHJlc3VsdHMpID0+IHtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlID0gKF9hID0gcmVzdWx0LmZpbGVQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNwbGl0KFwiLlwiKS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0KSwgeyBsYW5ndWFnZTogbGFuZ3VhZ2UgPyBsYW5ndWFnZSA6IFwiXCIgfSk7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCA9IGdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsO1xuY29uc3QgZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YSA9IChyZXN1bHRzKSA9PiB7XG4gICAgY29uc3QgYWxsTGFuZ3VhZ2VzV2l0aENvdW50ID0gW107XG4gICAgY29uc3QgYWxsU2V2ZXJpdGllc1dpdGhDb3VudCA9IFtdO1xuICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSByZXN1bHQubGFuZ3VhZ2U7XG4gICAgICAgIGNvbnN0IHNldmVyaXR5ID0gKF9hID0gcmVzdWx0LnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNldmVyaXR5O1xuICAgICAgICBjb25zdCBsYW5ndWFnZUluZGV4ID0gYWxsTGFuZ3VhZ2VzV2l0aENvdW50LmZpbmRJbmRleCgobGFuZykgPT4gbGFuZy5rZXkgPT09IGxhbmd1YWdlKTtcbiAgICAgICAgY29uc3Qgc2V2ZXJpdHlJbmRleCA9IGFsbFNldmVyaXRpZXNXaXRoQ291bnQuZmluZEluZGV4KChzZXYpID0+IHNldi5rZXkgPT09IHNldmVyaXR5KTtcbiAgICAgICAgaWYgKGxhbmd1YWdlSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBhbGxMYW5ndWFnZXNXaXRoQ291bnQucHVzaCh7IGtleTogbGFuZ3VhZ2UsIHZhbHVlOiAxIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxsTGFuZ3VhZ2VzV2l0aENvdW50W2xhbmd1YWdlSW5kZXhdLnZhbHVlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNldmVyaXR5SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBhbGxTZXZlcml0aWVzV2l0aENvdW50LnB1c2goeyBrZXk6IHNldmVyaXR5ID8gc2V2ZXJpdHkgOiBcIlwiLCB2YWx1ZTogMSB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFsbFNldmVyaXRpZXNXaXRoQ291bnRbc2V2ZXJpdHlJbmRleF0udmFsdWUrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGFsbExhbmd1YWdlc1dpdGhDb3VudCxcbiAgICAgICAgYWxsU2V2ZXJpdHlXaXRoQ291bnQ6IGFsbFNldmVyaXRpZXNXaXRoQ291bnQsXG4gICAgfTtcbn07XG5leHBvcnRzLmdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEgPSBnZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhO1xuZnVuY3Rpb24gY29udmVydFRvU2FwcmF0ZUVsZShpc3N1ZSkge1xuICAgIGNvbnN0IGNvbnZlcnRlZElzc3VlcyA9IFtdO1xuICAgIGNvbnN0IHsgZmlsZVBhdGgsIGZpbGVOYW1lLCBsYW5ndWFnZSwgcGFja2FnZXMsIHZ1bG5lcmFiaWxpdGllcyB9ID0gaXNzdWU7XG4gICAgY29uc3Qgc2luZ2xlSXNzdWUgPSB7XG4gICAgICAgIGZpbGVOYW1lLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgIHBhY2thZ2VzLFxuICAgIH07XG4gICAgdnVsbmVyYWJpbGl0aWVzID09PSBudWxsIHx8IHZ1bG5lcmFiaWxpdGllcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogdnVsbmVyYWJpbGl0aWVzLmZvckVhY2goKHZ1bG5lcmFiaWxpdHkpID0+IHtcbiAgICAgICAgY29udmVydGVkSXNzdWVzLnB1c2goY29uc3RydWN0SXNzdWVPYmooc2luZ2xlSXNzdWUsIHZ1bG5lcmFiaWxpdHkpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29udmVydGVkSXNzdWVzO1xufVxuY29uc3QgY29uc3RydWN0SXNzdWVPYmogPSAoc2luZ2xlSXNzdWUsIHZ1bG5lcmFiaWxpdGllcykgPT4ge1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgc2luZ2xlSXNzdWUpLCB7IHZ1bG5lcmFiaWxpdGllcyB9KTtcbiAgICByZXR1cm4gb2JqO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBkYXRhX2hhbmRsZXJfMSA9IHJlcXVpcmUoXCIuL2RhdGEtaGFuZGxlclwiKTtcbmNvbnN0IGRlcGVuZGVjeV9jaGVja18xID0gcmVxdWlyZShcIi4vcmVuZGVyL2RlcGVuZGVjeS1jaGVja1wiKTtcbmNvbnN0IGZpbHRlcl9idXR0b25zXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvZmlsdGVyLWJ1dHRvbnNcIik7XG5jb25zdCBwYWdpbmF0aW9uXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvcGFnaW5hdGlvblwiKTtcbmNvbnN0IHNlY3VyaXR5X2lzc3VlX2hhc2hfMSA9IHJlcXVpcmUoXCIuL3NlY3VyaXR5LWlzc3VlLWhhc2hcIik7XG5jb25zdCBtYWluID0gKCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgY29uc3QgZGVwZW5kZW5jeUlzc3VlcyA9IHlpZWxkICgwLCBkYXRhX2hhbmRsZXJfMS5nZXREZXBlbmRlbmN5SXNzdWVzKSgpO1xuICAgIGNvbnN0IHJlc3VsdHNXaXRoTGFuZ3VhZ2VzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsKShkZXBlbmRlbmN5SXNzdWVzKTtcbiAgICBjb25zdCB7IGFsbExhbmd1YWdlc1dpdGhDb3VudCwgYWxsU2V2ZXJpdHlXaXRoQ291bnQgfSA9ICgwLCBkYXRhX2hhbmRsZXJfMS5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhKShyZXN1bHRzV2l0aExhbmd1YWdlcyk7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250YWluZXJcIik7XG4gICAgY29uc3Qgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gbmV3IHNlY3VyaXR5X2lzc3VlX2hhc2hfMS5TZWN1cml0eUlzc3Vlc0hhc2hVcmwoKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmlzRW1wdHkoKSkge1xuICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0TGFuZ3VhZ2VzKGFsbExhbmd1YWdlc1dpdGhDb3VudC5tYXAoKG8pID0+IG8ua2V5KSk7XG4gICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRTZXZlcml0aWVzKGFsbFNldmVyaXR5V2l0aENvdW50Lm1hcCgobykgPT4gby5rZXkpKTtcbiAgICB9XG4gICAgKDAsIGRlcGVuZGVjeV9jaGVja18xLnJlbmRlckRlcGVkZW5jeUlzc3VlKShkZXBlbmRlbmN5SXNzdWVzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgKDAsIHBhZ2luYXRpb25fMS5yZW5kZXJQYWdpbmF0aW9uKShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhZ2luYXRpb25cIiksIGRlcGVuZGVuY3lJc3N1ZXMubGVuZ3RoLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIGNvbnN0IHsgbGFuZ3VhZ2VzLCBzZXZlcml0eSB9ID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldERhdGEoKTtcbiAgICBjb25zdCBmaWx0ZXJlZFJlc3VsdHMgPSAoMCwgZGF0YV9oYW5kbGVyXzEuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzKShyZXN1bHRzV2l0aExhbmd1YWdlcywgbGFuZ3VhZ2VzLCBzZXZlcml0eSk7XG4gICAgY29uc3QgZmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gbmV3IGZpbHRlcl9idXR0b25zXzEuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyLWxhbmd1YWdlLWJ1dHRvbnNcIiksIGFsbExhbmd1YWdlc1dpdGhDb3VudCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICBjb25zdCBmaWx0ZXJTZXZlcml0eUJ1dHRvbnMgPSBuZXcgZmlsdGVyX2J1dHRvbnNfMS5GaWx0ZXJTZXZlcml0eUJ1dHRvbnMoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXItc2V2ZXJpdHktYnV0dG9uc1wiKSwgYWxsU2V2ZXJpdHlXaXRoQ291bnQsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcykocmVzdWx0c1dpdGhMYW5ndWFnZXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRMYW5ndWFnZXMoKSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFNldmVyaXRpZXMoKSk7XG4gICAgICAgICgwLCBkZXBlbmRlY3lfY2hlY2tfMS5yZW5kZXJEZXBlZGVuY3lJc3N1ZSkoZmlsdGVyZWRSZXN1bHRzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgICAgICgwLCBwYWdpbmF0aW9uXzEucmVuZGVyUGFnaW5hdGlvbikoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYWdpbmF0aW9uXCIpLCBmaWx0ZXJlZFJlc3VsdHMubGVuZ3RoLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIH0pO1xufSk7XG5tYWluKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVuZGVyRGVwZWRlbmN5SXNzdWUgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuLi9jb25zdGFudHNcIik7XG5mdW5jdGlvbiByZW5kZXJEZXBlZGVuY3lJc3N1ZShkZXBlbmRlbmN5SXNzdWVzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCkge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSAtIDEpICogY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0U7XG4gICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0U7XG4gICAgY29uc3QgaXRlbXNUb1JlbmRlciA9IGRlcGVuZGVuY3lJc3N1ZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICAgIGl0ZW1zVG9SZW5kZXIuZm9yRWFjaCgoaXNzdWUpID0+IHtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdldElzc3VlQ29udGFpbmVyKGlzc3VlKSk7XG4gICAgfSk7XG59XG5leHBvcnRzLnJlbmRlckRlcGVkZW5jeUlzc3VlID0gcmVuZGVyRGVwZWRlbmN5SXNzdWU7XG5jb25zdCBnZXRJc3N1ZUNvbnRhaW5lciA9IChpc3N1ZSkgPT4ge1xuICAgIGNvbnN0IGlzc3VlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpc3N1ZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaXNzdWUtY29udGFpbmVyXCIpO1xuICAgIGNvbnN0IGlzc3VlU2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZChnZXRIZWFkZXIoaXNzdWUpKTtcbiAgICBhZGRQYWNha2dlcyhpc3N1ZVNlY3Rpb24sIGlzc3VlKTtcbiAgICBhZGRWdWxuZXJhYmlsaWVzKGlzc3VlU2VjdGlvbiwgaXNzdWUpO1xuICAgIGlzc3VlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlzc3VlU2VjdGlvbik7XG4gICAgcmV0dXJuIGlzc3VlQ29udGFpbmVyO1xufTtcbmNvbnN0IGdldEhlYWRlciA9IChpc3N1ZSkgPT4ge1xuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoZWFkZXJcIik7XG4gICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJoZWFkZXJcIik7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGZpbGVOYW1lLmlubmVySFRNTCA9IFwiPHN0cm9uZz5GaWxlIE5hbWU6PC9zdHJvbmc+IFwiICsgaXNzdWUuZmlsZU5hbWU7XG4gICAgZmlsZVBhdGguaW5uZXJIVE1MID0gXCI8c3Ryb25nPkZpbGUgUGF0aDo8L3N0cm9uZz4gXCIgKyBpc3N1ZS5maWxlUGF0aDtcbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoZmlsZU5hbWUpO1xuICAgIGhlYWRlci5hcHBlbmRDaGlsZChmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGhlYWRlcjtcbn07XG5mdW5jdGlvbiBhZGRQYWNha2dlcyhpc3N1ZVNlY3Rpb24sIGlzc3VlKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBpZiAoKChfYSA9IGlzc3VlLnBhY2thZ2VzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoKSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgcGFja2FnZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGNvbnN0IGFycm93U3BhbiA9IGdldEFycm93KCk7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XG4gICAgcC5jbGFzc0xpc3QuYWRkKFwicGFja2FnZXNcIik7XG4gICAgcC5pbm5lckhUTUwgPSBcIjxzdHJvbmc+UGFja2FnZXM6PC9zdHJvbmc+XCI7XG4gICAgcC5wcmVwZW5kKGFycm93U3Bhbik7XG4gICAgcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBkaXYuY2xhc3NMaXN0LnRvZ2dsZShcImQtbm9uZVwiKTtcbiAgICAgICAgYXJyb3dTcGFuLmNsYXNzTGlzdC50b2dnbGUoXCJyb3RhdGUtYXJyb3dcIik7XG4gICAgfSk7XG4gICAgY29uc3QgdWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIik7XG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiY29sbGFwc2libGUtY29udGVudFwiKTtcbiAgICBkaXYuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb2xsYXBzaWJsZS1jb250ZW50LXBhY2thZ2VzXCIpO1xuICAgIChfYiA9IGlzc3VlID09PSBudWxsIHx8IGlzc3VlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpc3N1ZS5wYWNrYWdlcykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmZvckVhY2goKGlzc3VlUGFja2FnZSkgPT4ge1xuICAgICAgICBhLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgaXNzdWVQYWNrYWdlLnVybCk7XG4gICAgICAgIGEudGV4dENvbnRlbnQgPSBpc3N1ZVBhY2thZ2UuaWQ7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZCh1bC5hcHBlbmRDaGlsZChsaS5hcHBlbmRDaGlsZChhKSkpO1xuICAgIH0pO1xuICAgIHBhY2thZ2VzLmFwcGVuZENoaWxkKHApO1xuICAgIHBhY2thZ2VzLmFwcGVuZENoaWxkKGRpdik7XG4gICAgaXNzdWVTZWN0aW9uLmFwcGVuZENoaWxkKHBhY2thZ2VzKTtcbn1cbmNvbnN0IGFkZFZ1bG5lcmFiaWxpZXMgPSAoaXNzdWVTZWN0aW9uLCBpc3N1ZSkgPT4ge1xuICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2gsIF9qO1xuICAgIGNvbnN0IHsgZGVzY3JpcHRpb24sIHNldmVyaXR5LCBhdHRhY2tWZWN0b3IsIGNvbmZpZGVudGlhbEltcGFjdCwgaW50ZWdyaXR5SW1wYWN0LCBhdmFpbGFiaWxpdHlJbXBhY3QsIGxpLCByZWZlcmVuY2VzLCB1bCwgdnVsbmVyYWJpbGl0aWVzLCB9ID0gZ2V0Q29udGVudFNrZWxldG9uKCk7XG4gICAgZGVzY3JpcHRpb24uaW5uZXJIVE1MID1cbiAgICAgICAgXCI8c3Ryb25nPkRlc2NyaXB0aW9uOjwvc3Ryb25nPiBcIiArIGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5kZXNjcmlwdGlvbjtcbiAgICBzZXZlcml0eS5pbm5lckhUTUwgPVxuICAgICAgICBcIjxzdHJvbmc+U2V2ZXJpdHk6PC9zdHJvbmc+IFwiICsgaXNzdWUudnVsbmVyYWJpbGl0aWVzLnNldmVyaXR5O1xuICAgIHNldmVyaXR5LmNsYXNzTGlzdC5hZGQoXCJiYWRnZVwiLCBgYmFkZ2UtJHtnZXRTZXZlcml0eUJhZGdlKGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5zZXZlcml0eSl9YCk7XG4gICAgYXR0YWNrVmVjdG9yLmlubmVySFRNTCA9XG4gICAgICAgIFwiPHN0cm9uZz5UaHJlYXQgdmVjdG9yOjwvc3Ryb25nPiBcIiArXG4gICAgICAgICAgICBnZXRDbGVhbmVkQXR0YWNrVmVjdG9yKChfYSA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5jdnNzdjMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hdHRhY2tWZWN0b3IpO1xuICAgIGNvbmZpZGVudGlhbEltcGFjdC5pbm5lckhUTUwgPVxuICAgICAgICBcIjxzdHJvbmc+Q29uZmlkZW50aWFsaXR5IGltcGFjdDo8L3N0cm9uZz4gXCIgK1xuICAgICAgICAgICAgZ2V0Q2xlYW5lZEltcGFjdCgoX2IgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY29uZmlkZW50aWFsaXR5SW1wYWN0KTtcbiAgICBpbnRlZ3JpdHlJbXBhY3QuaW5uZXJIVE1MID1cbiAgICAgICAgXCI8c3Ryb25nPkludGVncml0eSBpbXBhY3Q6PC9zdHJvbmc+IFwiICtcbiAgICAgICAgICAgIGdldENsZWFuZWRJbXBhY3QoKF9jID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmludGVncml0eUltcGFjdCk7XG4gICAgYXZhaWxhYmlsaXR5SW1wYWN0LmlubmVySFRNTCA9XG4gICAgICAgIFwiPHN0cm9uZz5BdmFpbGlibGl0eSBpbXBhY3Q6PC9zdHJvbmc+IFwiICtcbiAgICAgICAgICAgIGdldENsZWFuZWRJbXBhY3QoKF9kID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmF2YWlsYWJpbGl0eUltcGFjdCk7XG4gICAgaWYgKChfZSA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICB9XG4gICAgaWYgKGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5zZXZlcml0eSkge1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChzZXZlcml0eSk7XG4gICAgfVxuICAgIGlmICgoX2YgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2YuYXR0YWNrVmVjdG9yKSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGF0dGFja1ZlY3Rvcik7XG4gICAgfVxuICAgIGlmICgoX2cgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2cuY29uZmlkZW50aWFsaXR5SW1wYWN0KSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbmZpZGVudGlhbEltcGFjdCk7XG4gICAgfVxuICAgIGlmICgoX2ggPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2guaW50ZWdyaXR5SW1wYWN0KSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGludGVncml0eUltcGFjdCk7XG4gICAgfVxuICAgIGlmICgoX2ogPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2ouYXZhaWxhYmlsaXR5SW1wYWN0KSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGF2YWlsYWJpbGl0eUltcGFjdCk7XG4gICAgfVxuICAgIGlmIChpc3N1ZS52dWxuZXJhYmlsaXRpZXMucmVmZXJlbmNlcy5sZW5ndGgpIHtcbiAgICAgICAgYWRkUmVmZXJlbmNlcyhyZWZlcmVuY2VzLCBpc3N1ZSwgbGkpO1xuICAgIH1cbiAgICBsaS5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCAjZGRkXCI7XG4gICAgbGkuc3R5bGUucGFkZGluZyA9IFwiMTBweFwiO1xuICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcbiAgICB2dWxuZXJhYmlsaXRpZXMuYXBwZW5kQ2hpbGQodWwpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZCh2dWxuZXJhYmlsaXRpZXMpO1xufTtcbmZ1bmN0aW9uIGFkZFJlZmVyZW5jZXMocmVmZXJlbmNlcywgaXNzdWUsIGxpKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCByZWZlcmVuY2VMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIik7XG4gICAgcmVmZXJlbmNlTGFiZWwuaW5uZXJIVE1MID0gXCJSZWZlcmVuY2VzOlwiO1xuICAgIHJlZmVyZW5jZUxhYmVsLnN0eWxlLmN1cnNvciA9IFwicG9pbnRlclwiO1xuICAgIGNvbnN0IGFycm93U3BhbiA9IGdldEFycm93KCk7XG4gICAgcmVmZXJlbmNlTGFiZWwucHJlcGVuZChhcnJvd1NwYW4pO1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XG4gICAgcmVmZXJlbmNlcy5hcHBlbmRDaGlsZChyZWZlcmVuY2VMYWJlbCk7XG4gICAgcmVmZXJlbmNlTGFiZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC50b2dnbGUoXCJkLW5vbmVcIik7XG4gICAgICAgIGFycm93U3Bhbi5jbGFzc0xpc3QudG9nZ2xlKFwicm90YXRlLWFycm93XCIpO1xuICAgIH0pO1xuICAgIChfYiA9IChfYSA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnJlZmVyZW5jZXMpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5mb3JFYWNoKChyZWZlcmVuY2UpID0+IHtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBjb25zdCByZWZlcmVuY2VMaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgYS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHJlZmVyZW5jZS51cmwpO1xuICAgICAgICBhLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgICAgICAgYS50ZXh0Q29udGVudCA9IHJlZmVyZW5jZS5uYW1lO1xuICAgICAgICByZWZlcmVuY2VMaS5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgZGl2LnN0eWxlLnBhZGRpbmdMZWZ0ID0gXCIxNXB4XCI7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChyZWZlcmVuY2VMaSk7XG4gICAgICAgIHJlZmVyZW5jZXMuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB9KTtcbiAgICBsaS5hcHBlbmRDaGlsZChyZWZlcmVuY2VzKTtcbn1cbmZ1bmN0aW9uIGdldEFycm93KCkge1xuICAgIGNvbnN0IGFycm93U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGFycm93U3Bhbi5pbm5lckhUTUwgPSBcIuKWuiBcIjtcbiAgICBhcnJvd1NwYW4uc3R5bGUudHJhbnNpdGlvbiA9IFwidHJhbnNmb3JtIDAuM3MgZWFzZVwiO1xuICAgIGFycm93U3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICBhcnJvd1NwYW4uc3R5bGUubWFyZ2luID0gXCIzcHhcIjtcbiAgICByZXR1cm4gYXJyb3dTcGFuO1xufVxuZnVuY3Rpb24gZ2V0Q29udGVudFNrZWxldG9uKCkge1xuICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgIGxhYmVsLmlubmVySFRNTCA9IFwiPHN0cm9uZz5WdWxuZXJhYmlsaXR5Ojwvc3Ryb25nPlwiO1xuICAgIGNvbnN0IHZ1bG5lcmFiaWxpdGllcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdnVsbmVyYWJpbGl0aWVzLmNsYXNzTGlzdC5hZGQoXCJ2dWxuZXJhYmlsaXRpZXNcIik7XG4gICAgdnVsbmVyYWJpbGl0aWVzLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICBjb25zdCB1bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGNvbnN0IHNldmVyaXR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgYXR0YWNrVmVjdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgY29uZmlkZW50aWFsSW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgaW50ZWdyaXR5SW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgYXZhaWxhYmlsaXR5SW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgcmVmZXJlbmNlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIHNldmVyaXR5LFxuICAgICAgICBhdHRhY2tWZWN0b3IsXG4gICAgICAgIGNvbmZpZGVudGlhbEltcGFjdCxcbiAgICAgICAgaW50ZWdyaXR5SW1wYWN0LFxuICAgICAgICBhdmFpbGFiaWxpdHlJbXBhY3QsXG4gICAgICAgIGxpLFxuICAgICAgICByZWZlcmVuY2VzLFxuICAgICAgICB1bCxcbiAgICAgICAgdnVsbmVyYWJpbGl0aWVzLFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRDbGVhbmVkQXR0YWNrVmVjdG9yKGF0dGFja1ZlY3Rvcikge1xuICAgIGlmIChhdHRhY2tWZWN0b3IgPT09IFwiTlwiKSB7XG4gICAgICAgIHJldHVybiBcIk5FVFdPUktcIjtcbiAgICB9XG4gICAgaWYgKGF0dGFja1ZlY3RvciA9PT0gXCJMXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiTE9DQUxcIjtcbiAgICB9XG4gICAgcmV0dXJuIGF0dGFja1ZlY3Rvcjtcbn1cbmZ1bmN0aW9uIGdldENsZWFuZWRJbXBhY3QoaW1wYWN0KSB7XG4gICAgcmV0dXJuIGNvbnN0YW50c18xLmltcGFjdE1hcFtpbXBhY3RdIHx8IGltcGFjdDtcbn1cbmZ1bmN0aW9uIGdldFNldmVyaXR5QmFkZ2Uoc2V2ZXJpdHkpIHtcbiAgICByZXR1cm4gY29uc3RhbnRzXzEuc2V2ZXJpdHlNYXBbc2V2ZXJpdHldIHx8IHNldmVyaXR5O1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkZpbHRlckxhbmd1YWdlQnV0dG9ucyA9IGV4cG9ydHMuRmlsdGVyU2V2ZXJpdHlCdXR0b25zID0gdm9pZCAwO1xuY29uc3QgY3VzdG9tU29ydCA9IChkYXRhKSA9PiB7XG4gICAgY29uc3Qgb3JkZXIgPSBbXCJDUklUSUNBTFwiLCBcIkhJR0hcIiwgXCJNT0RFUkFURVwiLCBcIk1FRElVTVwiLCBcIkxPV1wiXTtcbiAgICByZXR1cm4gZGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4QSA9IG9yZGVyLmluZGV4T2YoYS5rZXkpO1xuICAgICAgICBjb25zdCBpbmRleEIgPSBvcmRlci5pbmRleE9mKGIua2V5KTtcbiAgICAgICAgaWYgKGluZGV4QSA9PT0gaW5kZXhCKSB7XG4gICAgICAgICAgICByZXR1cm4gYi52YWx1ZSAtIGEudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZGV4QSAtIGluZGV4QjtcbiAgICB9KTtcbn07XG5jbGFzcyBGaWx0ZXJTZXZlcml0eUJ1dHRvbnMge1xuICAgIGNvbnN0cnVjdG9yKHNldmVyaXR5QnV0dG9uc0NvbnRhaW5lciwgYWxsU2V2ZXJpdGllc1dpdGhDb3VudCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSB7XG4gICAgICAgIHRoaXMuc2V2ZXJpdHlCdXR0b25zQ29udGFpbmVyID0gc2V2ZXJpdHlCdXR0b25zQ29udGFpbmVyO1xuICAgICAgICB0aGlzLnNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybDtcbiAgICAgICAgYWxsU2V2ZXJpdGllc1dpdGhDb3VudCA9IGN1c3RvbVNvcnQoYWxsU2V2ZXJpdGllc1dpdGhDb3VudCk7XG4gICAgICAgIGFsbFNldmVyaXRpZXNXaXRoQ291bnQuZm9yRWFjaCgoc2V2ZXJpdHlXaXRoQ291bnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkU2V2ZXJpdGllcyA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRTZXZlcml0aWVzKCk7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICAgICAgZmlsdGVyQnV0dG9uLmNsYXNzTmFtZSA9IFwiZmlsdGVyLWJ1dHRvblwiO1xuICAgICAgICAgICAgZmlsdGVyQnV0dG9uLmNsYXNzTGlzdC5hZGQoYCR7c2V2ZXJpdHlXaXRoQ291bnQua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCl9LWJ1dHRvbmApO1xuICAgICAgICAgICAgZmlsdGVyQnV0dG9uLnRleHRDb250ZW50ID0gYCR7c2V2ZXJpdHlXaXRoQ291bnQua2V5fSAoeCR7c2V2ZXJpdHlXaXRoQ291bnQudmFsdWV9KWA7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRTZXZlcml0aWVzLmluY2x1ZGVzKHNldmVyaXR5V2l0aENvdW50LmtleSkpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyQnV0dG9uLmNsYXNzTGlzdC5jb250YWlucyhcInNlbGVjdGVkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRTZXZlcml0aWVzKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRTZXZlcml0aWVzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcml0eVdpdGhDb3VudC5rZXksXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFNldmVyaXRpZXMoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0U2V2ZXJpdGllcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChzZXJ2ZXJpdHkpID0+IHNlcnZlcml0eSAhPT0gc2V2ZXJpdHlXaXRoQ291bnQua2V5KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXZlcml0eUJ1dHRvbnNDb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsdGVyQnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWx0ZXJTZXZlcml0eUJ1dHRvbnMgPSBGaWx0ZXJTZXZlcml0eUJ1dHRvbnM7XG5jbGFzcyBGaWx0ZXJMYW5ndWFnZUJ1dHRvbnMge1xuICAgIGNvbnN0cnVjdG9yKGxhbmd1YWdlTGlzdENvbnRhaW5lciwgYWxsTGFuZ3VhZ2VzV2l0aENvdW50LCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZUxpc3RDb250YWluZXIgPSBsYW5ndWFnZUxpc3RDb250YWluZXI7XG4gICAgICAgIHRoaXMuc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsO1xuICAgICAgICBhbGxMYW5ndWFnZXNXaXRoQ291bnQuZm9yRWFjaCgobGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkTGFuZ3VhZ2VzID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldExhbmd1YWdlcygpO1xuICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2VMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIklOUFVUXCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uY2xhc3NMaXN0LmFkZChcImNoZWNrYm94XCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGFuZ3VhZ2Uua2V5fWApO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMYWJlbC50ZXh0Q29udGVudCA9IGAke2xhbmd1YWdlLmtleX0gKHgke2xhbmd1YWdlLnZhbHVlfSlgO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgYCR7bGFuZ3VhZ2Uua2V5fWApO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkTGFuZ3VhZ2VzLmluY2x1ZGVzKGxhbmd1YWdlLmtleSkpIHtcbiAgICAgICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveEJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoXCJjaGVja2VkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRMYW5ndWFnZXMoW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldExhbmd1YWdlcygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2Uua2V5LFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRMYW5ndWFnZXMoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0TGFuZ3VhZ2VzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGxhbmcpID0+IGxhbmcgIT09IGxhbmd1YWdlLmtleSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcigxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFuZ3VhZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3hCdXR0b24pO1xuICAgICAgICAgICAgbGFuZ3VhZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQobGFuZ3VhZ2VMYWJlbCk7XG4gICAgICAgICAgICBsYW5ndWFnZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwibGFuZ3VhZ2UtbWFyZ2luXCIpO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMaXN0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJsYW5ndWFnZS1saXN0XCIpO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMaXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGxhbmd1YWdlQ29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWx0ZXJMYW5ndWFnZUJ1dHRvbnMgPSBGaWx0ZXJMYW5ndWFnZUJ1dHRvbnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVuZGVyUGFnaW5hdGlvbiA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4uL2NvbnN0YW50c1wiKTtcbmNvbnN0IHJlbmRlclBhZ2luYXRpb24gPSAocGFnaW5hdGlvbkNvbnRhaW5lciwgdG90YWxJdGVtcywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSA9PiB7XG4gICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbCh0b3RhbEl0ZW1zIC8gY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0UpO1xuICAgIHBhZ2luYXRpb25Db250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBjb25zdCBwcmV2QnV0dG9uID0gZ2V0UHJldmlvdXNCdG4oc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICBjb25zdCBuZXh0QnV0dG9uID0gZ2V0TmV4dEJ0bihzZWN1cml0eUlzc3Vlc0hhc2hVcmwsIHRvdGFsUGFnZXMpO1xuICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQocHJldkJ1dHRvbik7XG4gICAgY29uc3QgaW5pdGlhbFBhZ2VDb3VudCA9IDU7XG4gICAgY29uc3Qgc3RhcnRQYWdlID0gTWF0aC5tYXgoMSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSAtIE1hdGguZmxvb3IoaW5pdGlhbFBhZ2VDb3VudCAvIDIpKTtcbiAgICBjb25zdCBlbmRQYWdlID0gTWF0aC5taW4odG90YWxQYWdlcywgc3RhcnRQYWdlICsgaW5pdGlhbFBhZ2VDb3VudCAtIDEpO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFBhZ2U7IGkgPD0gZW5kUGFnZTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBhZ2VCdXR0b24gPSBnZXRQYWdlTnVtQnRuKHRvdGFsUGFnZXMsIGksIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQocGFnZUJ1dHRvbik7XG4gICAgfVxuICAgIGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuICAgICAgICBjb25zdCBlbGxpcHNpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBlbGxpcHNpcy50ZXh0Q29udGVudCA9IFwiLi4uXCI7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQoZWxsaXBzaXMpO1xuICAgICAgICBjb25zdCBtb3JlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgbW9yZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgICAgICBtb3JlQnV0dG9uLnRleHRDb250ZW50ID0gXCJNb3JlXCI7XG4gICAgICAgIG1vcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGVuZFBhZ2UgKyAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGVuZFBhZ2UgKyAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobW9yZUJ1dHRvbik7XG4gICAgfVxuICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobmV4dEJ1dHRvbik7XG59O1xuZXhwb3J0cy5yZW5kZXJQYWdpbmF0aW9uID0gcmVuZGVyUGFnaW5hdGlvbjtcbmZ1bmN0aW9uIGdldFBhZ2VOdW1CdG4odG90YWxQYWdlcywgaSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSB7XG4gICAgY29uc3QgcGFnZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgaWYgKHRvdGFsUGFnZXMgPT0gMSkge1xuICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgcGFnZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgIHBhZ2VCdXR0b24udGV4dENvbnRlbnQgPSBpICsgXCJcIjtcbiAgICBwYWdlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGkpO1xuICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihpKTtcbiAgICB9KTtcbiAgICBpZiAoaSA9PT0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSkge1xuICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmNvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcIiMwZTMyNTJcIjtcbiAgICB9XG4gICAgcmV0dXJuIHBhZ2VCdXR0b247XG59XG5mdW5jdGlvbiBnZXROZXh0QnRuKHNlY3VyaXR5SXNzdWVzSGFzaFVybCwgdG90YWxQYWdlcykge1xuICAgIGNvbnN0IG5leHRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGlmIChzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpID09IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgbmV4dEJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJOb25lXCI7XG4gICAgfVxuICAgIG5leHRCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICBuZXh0QnV0dG9uLnRleHRDb250ZW50ID0gXCJOZXh0XCI7XG4gICAgbmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA8IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgKyAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5leHRCdXR0b247XG59XG5mdW5jdGlvbiBnZXRQcmV2aW91c0J0bihzZWN1cml0eUlzc3Vlc0hhc2hVcmwpIHtcbiAgICBjb25zdCBwcmV2QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA9PT0gMSkge1xuICAgICAgICBwcmV2QnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgcHJldkJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgIHByZXZCdXR0b24udGV4dENvbnRlbnQgPSBcIlByZXZpb3VzXCI7XG4gICAgcHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA+IDEpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgLSAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHByZXZCdXR0b247XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gdm9pZCAwO1xuY2xhc3MgU2VjdXJpdHlJc3N1ZXNIYXNoVXJsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zZXZlcml0aWVzID0gW107XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VzID0gW107XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGFGcm9tVXJsKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgICAgICAgdGhpcy5wYWdlTnVtYmVyID0gZGF0YS5wYWdlTnVtYmVyO1xuICAgICAgICB0aGlzLnNldmVyaXRpZXMgPSBkYXRhLnNlcnZlcml0aWVzO1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IGRhdGEubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRTdGF0ZUFzVXJsKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZShcIiNcIiwgXCJcIik7XG4gICAgfVxuICAgIHVwZGF0ZVVybCgpIHtcbiAgICAgICAgY29uc3QgaGFzaEFycmF5ID0gW107XG4gICAgICAgIGlmICh0aGlzLnNldmVyaXRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGFzaEFycmF5LnB1c2goYHNldmVyaXR5PSR7dGhpcy5zZXZlcml0aWVzLmpvaW4oXCIsXCIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhbmd1YWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYXNoQXJyYXkucHVzaChgbGFuZ3VhZ2U9JHt0aGlzLmxhbmd1YWdlcy5qb2luKFwiLFwiKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNoQXJyYXkucHVzaChgcGFnZT0ke3RoaXMucGFnZU51bWJlcn1gKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoQXJyYXkuam9pbihcIiZcIik7XG4gICAgfVxuICAgIHNldFNldmVyaXRpZXMoc2VydmVyaXR5KSB7XG4gICAgICAgIHRoaXMuc2V2ZXJpdGllcyA9IHNlcnZlcml0eTtcbiAgICAgICAgdGhpcy51cGRhdGVVcmwoKTtcbiAgICB9XG4gICAgc2V0TGFuZ3VhZ2VzKGxhbmd1YWdlcykge1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IGxhbmd1YWdlcztcbiAgICAgICAgdGhpcy51cGRhdGVVcmwoKTtcbiAgICB9XG4gICAgc2V0UGFnZU51bWJlcihwYWdlTnVtYmVyKSB7XG4gICAgICAgIHRoaXMucGFnZU51bWJlciA9IHBhZ2VOdW1iZXI7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIGdldERhdGFGcm9tVXJsKGhhc2gpIHtcbiAgICAgICAgY29uc3QgaGFzaEFycmF5ID0gaGFzaC5yZXBsYWNlKFwiI1wiLCBcIlwiKS5zcGxpdChcIiZcIik7XG4gICAgICAgIGNvbnN0IHNldmVyaXR5ID0gW107XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlcyA9IFtdO1xuICAgICAgICBsZXQgcGFnZU51bWJlciA9IDE7XG4gICAgICAgIGhhc2hBcnJheS5mb3JFYWNoKChoYXNoSXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gaGFzaEl0ZW0uc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJzZXZlcml0eVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVBcnJheSA9IHZhbHVlLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICB2YWx1ZUFycmF5LmZvckVhY2goKHZhbHVlSXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXZlcml0eS5wdXNoKHZhbHVlSXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IFwibGFuZ3VhZ2VcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlQXJyYXkgPSB2YWx1ZS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgdmFsdWVBcnJheS5mb3JFYWNoKCh2YWx1ZUl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2VzLnB1c2godmFsdWVJdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gXCJwYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBwYWdlTnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IHNlcnZlcml0aWVzOiBzZXZlcml0eSwgbGFuZ3VhZ2VzLCBwYWdlTnVtYmVyIH07XG4gICAgfVxuICAgIGdldFNldmVyaXRpZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldmVyaXRpZXM7XG4gICAgfVxuICAgIGdldExhbmd1YWdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRQYWdlTnVtYmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYWdlTnVtYmVyO1xuICAgIH1cbiAgICBnZXREYXRhKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2V2ZXJpdHk6IHRoaXMuc2V2ZXJpdGllcyxcbiAgICAgICAgICAgIGxhbmd1YWdlczogdGhpcy5sYW5ndWFnZXMsXG4gICAgICAgICAgICBwYWdlTnVtYmVyOiB0aGlzLnBhZ2VOdW1iZXIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlQXNVcmwoKSA9PT0gXCJcIjtcbiAgICB9XG59XG5leHBvcnRzLlNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IFNlY3VyaXR5SXNzdWVzSGFzaFVybDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==