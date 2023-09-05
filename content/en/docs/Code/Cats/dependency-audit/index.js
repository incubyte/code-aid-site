/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ITEMS_PER_PAGE = void 0;
exports.ITEMS_PER_PAGE = 10;


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
    const res = yield fetch("./cats-dependency-check-report.json");
    const data = yield res.json();
    const dependencyIssues = data.dependencies;
    const finalDependecyIssues = [];
    const filteredDependencyIssues = dependencyIssues.filter((issue) => {
        return !isIssuesEmpty(issue);
    });
    filteredDependencyIssues.forEach((issue) => {
        issue.filePath = issue.filePath.replace("/mnt/d/", "");
        if (issue.filePath.includes("package-lock.json")) {
            issue.filePath = issue.filePath + ".node";
        }
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
    filePath.innerHTML =
        "<strong>File Path:</strong> " + issue.filePath.replace(".node", "");
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
        "<strong>Confidential impact:</strong> " +
            getCleanedImpact((_b = issue.vulnerabilities.cvssv3) === null || _b === void 0 ? void 0 : _b.confidentialImpact);
    integrityImpact.innerHTML =
        "<strong>Integrity impact:</strong> " +
            getCleanedImpact((_c = issue.vulnerabilities.cvssv3) === null || _c === void 0 ? void 0 : _c.integrityImpact);
    availabilityImpact.innerHTML =
        "<strong>Availiblity impact:</strong> " +
            getCleanedImpact((_d = issue.vulnerabilities.cvssv3) === null || _d === void 0 ? void 0 : _d.availabilityImpact);
    if (((_e = issue.vulnerabilities) === null || _e === void 0 ? void 0 : _e.description) !== undefined) {
        li.appendChild(description);
    }
    if (issue.vulnerabilities.severity !== undefined) {
        li.appendChild(severity);
    }
    if (((_f = issue.vulnerabilities.cvssv3) === null || _f === void 0 ? void 0 : _f.attackVector) !== undefined) {
        li.appendChild(attackVector);
    }
    if (((_g = issue.vulnerabilities.cvssv3) === null || _g === void 0 ? void 0 : _g.confidentialImpact) !== undefined) {
        li.appendChild(confidentialImpact);
    }
    if (((_h = issue.vulnerabilities.cvssv3) === null || _h === void 0 ? void 0 : _h.integrityImpact) !== undefined) {
        li.appendChild(integrityImpact);
    }
    if (((_j = issue.vulnerabilities.cvssv3) === null || _j === void 0 ? void 0 : _j.availabilityImpact) !== undefined) {
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
            div.classList.toggle("d-none");
            arrowSpan.classList.toggle("rotate-arrow");
        });
        (_l = (_k = issue.vulnerabilities) === null || _k === void 0 ? void 0 : _k.references) === null || _l === void 0 ? void 0 : _l.forEach((reference) => {
            const a = document.createElement("a");
            const referenceLi = document.createElement("li");
            a.setAttribute("href", reference.url);
            a.textContent = reference.url;
            referenceLi.appendChild(a);
            div.style.paddingLeft = "15px";
            div.appendChild(referenceLi);
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
    if (impact === "N") {
        return "NONE";
    }
    else if (impact === "H") {
        return "HIGH";
    }
    else if (impact === "L") {
        return "LOW";
    }
    else if (impact === "M") {
        return "MEDIUM";
    }
    else {
        return impact;
    }
}
function getSeverityBadge(severity) {
    if (severity === "CRITICAL") {
        return "critical";
    }
    else if (severity === "HIGH") {
        return "high";
    }
    else if (severity === "LOW") {
        return "low";
    }
    else if (severity === "MEDIUM") {
        return "medium";
    }
    else if (severity === "MODERATE") {
        return "moderate";
    }
    else {
        return severity;
    }
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
        console.log(allSeveritiesWithCount);
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
    paginationContainer.appendChild(prevButton);
    const initialPageCount = 5;
    const startPage = Math.max(1, securityIssuesHashUrl.getPageNumber() - Math.floor(initialPageCount / 2));
    const endPage = Math.min(totalPages, startPage + initialPageCount - 1);
    for (let i = startPage; i <= endPage; i++) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7Ozs7Ozs7Ozs7O0FDbkVYO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsMEJBQTBCO0FBQ2pFO0FBQ0E7QUFDQSx1Q0FBdUMseUJBQXlCO0FBQ2hFO0FBQ0EsK0JBQStCLGdCQUFnQjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7Ozs7Ozs7VUNuRjdCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9kYXRhLWhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9yZW5kZXIvZGVwZW5kZWN5LWNoZWNrLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9yZW5kZXIvZmlsdGVyLWJ1dHRvbnMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9wYWdpbmF0aW9uLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9zZWN1cml0eS1pc3N1ZS1oYXNoLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLklURU1TX1BFUl9QQUdFID0gdm9pZCAwO1xuZXhwb3J0cy5JVEVNU19QRVJfUEFHRSA9IDEwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YSA9IGV4cG9ydHMuZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWwgPSBleHBvcnRzLmZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcyA9IGV4cG9ydHMuZ2V0RGVwZW5kZW5jeUlzc3VlcyA9IHZvaWQgMDtcbmNvbnN0IGlzSXNzdWVzRW1wdHkgPSAoaXNzdWUpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgcmV0dXJuICgoX2EgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5sZW5ndGgpID09PSB1bmRlZmluZWQ7XG59O1xuY29uc3QgZ2V0RGVwZW5kZW5jeUlzc3VlcyA9ICgpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIGNvbnN0IHJlcyA9IHlpZWxkIGZldGNoKFwiLi9jYXRzLWRlcGVuZGVuY3ktY2hlY2stcmVwb3J0Lmpzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IHlpZWxkIHJlcy5qc29uKCk7XG4gICAgY29uc3QgZGVwZW5kZW5jeUlzc3VlcyA9IGRhdGEuZGVwZW5kZW5jaWVzO1xuICAgIGNvbnN0IGZpbmFsRGVwZW5kZWN5SXNzdWVzID0gW107XG4gICAgY29uc3QgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gZGVwZW5kZW5jeUlzc3Vlcy5maWx0ZXIoKGlzc3VlKSA9PiB7XG4gICAgICAgIHJldHVybiAhaXNJc3N1ZXNFbXB0eShpc3N1ZSk7XG4gICAgfSk7XG4gICAgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGlzc3VlLmZpbGVQYXRoID0gaXNzdWUuZmlsZVBhdGgucmVwbGFjZShcIi9tbnQvZC9cIiwgXCJcIik7XG4gICAgICAgIGlmIChpc3N1ZS5maWxlUGF0aC5pbmNsdWRlcyhcInBhY2thZ2UtbG9jay5qc29uXCIpKSB7XG4gICAgICAgICAgICBpc3N1ZS5maWxlUGF0aCA9IGlzc3VlLmZpbGVQYXRoICsgXCIubm9kZVwiO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGNvbnZlcnRUb1NhcHJhdGVFbGUoaXNzdWUpLmZvckVhY2goKGVsZSkgPT4gZmluYWxEZXBlbmRlY3lJc3N1ZXMucHVzaChlbGUpKTtcbiAgICB9KTtcbiAgICBmaW5hbERlcGVuZGVjeUlzc3Vlcy5mb3JFYWNoKChpc3N1ZSkgPT4ge1xuICAgICAgICBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuc2V2ZXJpdHkgPVxuICAgICAgICAgICAgaXNzdWUudnVsbmVyYWJpbGl0aWVzLnNldmVyaXR5LnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsRGVwZW5kZWN5SXNzdWVzO1xufSk7XG5leHBvcnRzLmdldERlcGVuZGVuY3lJc3N1ZXMgPSBnZXREZXBlbmRlbmN5SXNzdWVzO1xuY29uc3QgZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gKHJlc3VsdHMsIGxhbmd1YWdlcywgc2V2ZXJpdGllcykgPT4ge1xuICAgIHJldHVybiByZXN1bHRzLmZpbHRlcigob2JqKSA9PiBsYW5ndWFnZXMuaW5jbHVkZXMob2JqLmxhbmd1YWdlKSAmJlxuICAgICAgICBzZXZlcml0aWVzLmluY2x1ZGVzKG9iai52dWxuZXJhYmlsaXRpZXMuc2V2ZXJpdHkpKTtcbn07XG5leHBvcnRzLmZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcyA9IGZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcztcbmNvbnN0IGdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gKHJlc3VsdHMpID0+IHtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlID0gKF9hID0gcmVzdWx0LmZpbGVQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNwbGl0KFwiLlwiKS5wb3AoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0KSwgeyBsYW5ndWFnZTogbGFuZ3VhZ2UgPyBsYW5ndWFnZSA6IFwiXCIgfSk7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCA9IGdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsO1xuY29uc3QgZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YSA9IChyZXN1bHRzKSA9PiB7XG4gICAgY29uc3QgYWxsTGFuZ3VhZ2VzV2l0aENvdW50ID0gW107XG4gICAgY29uc3QgYWxsU2V2ZXJpdGllc1dpdGhDb3VudCA9IFtdO1xuICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSByZXN1bHQubGFuZ3VhZ2U7XG4gICAgICAgIGNvbnN0IHNldmVyaXR5ID0gKF9hID0gcmVzdWx0LnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNldmVyaXR5O1xuICAgICAgICBjb25zdCBsYW5ndWFnZUluZGV4ID0gYWxsTGFuZ3VhZ2VzV2l0aENvdW50LmZpbmRJbmRleCgobGFuZykgPT4gbGFuZy5rZXkgPT09IGxhbmd1YWdlKTtcbiAgICAgICAgY29uc3Qgc2V2ZXJpdHlJbmRleCA9IGFsbFNldmVyaXRpZXNXaXRoQ291bnQuZmluZEluZGV4KChzZXYpID0+IHNldi5rZXkgPT09IHNldmVyaXR5KTtcbiAgICAgICAgaWYgKGxhbmd1YWdlSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBhbGxMYW5ndWFnZXNXaXRoQ291bnQucHVzaCh7IGtleTogbGFuZ3VhZ2UsIHZhbHVlOiAxIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxsTGFuZ3VhZ2VzV2l0aENvdW50W2xhbmd1YWdlSW5kZXhdLnZhbHVlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNldmVyaXR5SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBhbGxTZXZlcml0aWVzV2l0aENvdW50LnB1c2goeyBrZXk6IHNldmVyaXR5ID8gc2V2ZXJpdHkgOiBcIlwiLCB2YWx1ZTogMSB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFsbFNldmVyaXRpZXNXaXRoQ291bnRbc2V2ZXJpdHlJbmRleF0udmFsdWUrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGFsbExhbmd1YWdlc1dpdGhDb3VudCxcbiAgICAgICAgYWxsU2V2ZXJpdHlXaXRoQ291bnQ6IGFsbFNldmVyaXRpZXNXaXRoQ291bnQsXG4gICAgfTtcbn07XG5leHBvcnRzLmdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEgPSBnZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhO1xuZnVuY3Rpb24gY29udmVydFRvU2FwcmF0ZUVsZShpc3N1ZSkge1xuICAgIGNvbnN0IGNvbnZlcnRlZElzc3VlcyA9IFtdO1xuICAgIGNvbnN0IHsgZmlsZVBhdGgsIGZpbGVOYW1lLCBsYW5ndWFnZSwgcGFja2FnZXMsIHZ1bG5lcmFiaWxpdGllcyB9ID0gaXNzdWU7XG4gICAgY29uc3Qgc2luZ2xlSXNzdWUgPSB7XG4gICAgICAgIGZpbGVOYW1lLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgIHBhY2thZ2VzLFxuICAgIH07XG4gICAgdnVsbmVyYWJpbGl0aWVzID09PSBudWxsIHx8IHZ1bG5lcmFiaWxpdGllcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogdnVsbmVyYWJpbGl0aWVzLmZvckVhY2goKHZ1bG5lcmFiaWxpdHkpID0+IHtcbiAgICAgICAgY29udmVydGVkSXNzdWVzLnB1c2goY29uc3RydWN0SXNzdWVPYmooc2luZ2xlSXNzdWUsIHZ1bG5lcmFiaWxpdHkpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29udmVydGVkSXNzdWVzO1xufVxuY29uc3QgY29uc3RydWN0SXNzdWVPYmogPSAoc2luZ2xlSXNzdWUsIHZ1bG5lcmFiaWxpdGllcykgPT4ge1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgc2luZ2xlSXNzdWUpLCB7IHZ1bG5lcmFiaWxpdGllcyB9KTtcbiAgICByZXR1cm4gb2JqO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBkYXRhX2hhbmRsZXJfMSA9IHJlcXVpcmUoXCIuL2RhdGEtaGFuZGxlclwiKTtcbmNvbnN0IGRlcGVuZGVjeV9jaGVja18xID0gcmVxdWlyZShcIi4vcmVuZGVyL2RlcGVuZGVjeS1jaGVja1wiKTtcbmNvbnN0IGZpbHRlcl9idXR0b25zXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvZmlsdGVyLWJ1dHRvbnNcIik7XG5jb25zdCBwYWdpbmF0aW9uXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvcGFnaW5hdGlvblwiKTtcbmNvbnN0IHNlY3VyaXR5X2lzc3VlX2hhc2hfMSA9IHJlcXVpcmUoXCIuL3NlY3VyaXR5LWlzc3VlLWhhc2hcIik7XG5jb25zdCBtYWluID0gKCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgY29uc3QgZGVwZW5kZW5jeUlzc3VlcyA9IHlpZWxkICgwLCBkYXRhX2hhbmRsZXJfMS5nZXREZXBlbmRlbmN5SXNzdWVzKSgpO1xuICAgIGNvbnN0IHJlc3VsdHNXaXRoTGFuZ3VhZ2VzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsKShkZXBlbmRlbmN5SXNzdWVzKTtcbiAgICBjb25zdCB7IGFsbExhbmd1YWdlc1dpdGhDb3VudCwgYWxsU2V2ZXJpdHlXaXRoQ291bnQgfSA9ICgwLCBkYXRhX2hhbmRsZXJfMS5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhKShyZXN1bHRzV2l0aExhbmd1YWdlcyk7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250YWluZXJcIik7XG4gICAgY29uc3Qgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gbmV3IHNlY3VyaXR5X2lzc3VlX2hhc2hfMS5TZWN1cml0eUlzc3Vlc0hhc2hVcmwoKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmlzRW1wdHkoKSkge1xuICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0TGFuZ3VhZ2VzKGFsbExhbmd1YWdlc1dpdGhDb3VudC5tYXAoKG8pID0+IG8ua2V5KSk7XG4gICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRTZXZlcml0aWVzKGFsbFNldmVyaXR5V2l0aENvdW50Lm1hcCgobykgPT4gby5rZXkpKTtcbiAgICB9XG4gICAgKDAsIGRlcGVuZGVjeV9jaGVja18xLnJlbmRlckRlcGVkZW5jeUlzc3VlKShkZXBlbmRlbmN5SXNzdWVzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgKDAsIHBhZ2luYXRpb25fMS5yZW5kZXJQYWdpbmF0aW9uKShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhZ2luYXRpb25cIiksIGRlcGVuZGVuY3lJc3N1ZXMubGVuZ3RoLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIGNvbnN0IHsgbGFuZ3VhZ2VzLCBzZXZlcml0eSB9ID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldERhdGEoKTtcbiAgICBjb25zdCBmaWx0ZXJlZFJlc3VsdHMgPSAoMCwgZGF0YV9oYW5kbGVyXzEuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzKShyZXN1bHRzV2l0aExhbmd1YWdlcywgbGFuZ3VhZ2VzLCBzZXZlcml0eSk7XG4gICAgY29uc3QgZmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gbmV3IGZpbHRlcl9idXR0b25zXzEuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyLWxhbmd1YWdlLWJ1dHRvbnNcIiksIGFsbExhbmd1YWdlc1dpdGhDb3VudCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICBjb25zdCBmaWx0ZXJTZXZlcml0eUJ1dHRvbnMgPSBuZXcgZmlsdGVyX2J1dHRvbnNfMS5GaWx0ZXJTZXZlcml0eUJ1dHRvbnMoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXItc2V2ZXJpdHktYnV0dG9uc1wiKSwgYWxsU2V2ZXJpdHlXaXRoQ291bnQsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcykocmVzdWx0c1dpdGhMYW5ndWFnZXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRMYW5ndWFnZXMoKSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFNldmVyaXRpZXMoKSk7XG4gICAgICAgICgwLCBkZXBlbmRlY3lfY2hlY2tfMS5yZW5kZXJEZXBlZGVuY3lJc3N1ZSkoZmlsdGVyZWRSZXN1bHRzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgICAgICgwLCBwYWdpbmF0aW9uXzEucmVuZGVyUGFnaW5hdGlvbikoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYWdpbmF0aW9uXCIpLCBmaWx0ZXJlZFJlc3VsdHMubGVuZ3RoLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIH0pO1xufSk7XG5tYWluKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVuZGVyRGVwZWRlbmN5SXNzdWUgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuLi9jb25zdGFudHNcIik7XG5mdW5jdGlvbiByZW5kZXJEZXBlZGVuY3lJc3N1ZShkZXBlbmRlbmN5SXNzdWVzLCBjb250YWluZXIsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCkge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSAtIDEpICogY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0U7XG4gICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0U7XG4gICAgY29uc3QgaXRlbXNUb1JlbmRlciA9IGRlcGVuZGVuY3lJc3N1ZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICAgIGl0ZW1zVG9SZW5kZXIuZm9yRWFjaCgoaXNzdWUpID0+IHtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdldElzc3VlQ29udGFpbmVyKGlzc3VlKSk7XG4gICAgfSk7XG59XG5leHBvcnRzLnJlbmRlckRlcGVkZW5jeUlzc3VlID0gcmVuZGVyRGVwZWRlbmN5SXNzdWU7XG5jb25zdCBnZXRJc3N1ZUNvbnRhaW5lciA9IChpc3N1ZSkgPT4ge1xuICAgIGNvbnN0IGlzc3VlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpc3N1ZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaXNzdWUtY29udGFpbmVyXCIpO1xuICAgIGNvbnN0IGlzc3VlU2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZChnZXRIZWFkZXIoaXNzdWUpKTtcbiAgICBhZGRQYWNha2dlcyhpc3N1ZVNlY3Rpb24sIGlzc3VlKTtcbiAgICBhZGRWdWxuZXJhYmlsaWVzKGlzc3VlU2VjdGlvbiwgaXNzdWUpO1xuICAgIGlzc3VlQ29udGFpbmVyLmFwcGVuZENoaWxkKGlzc3VlU2VjdGlvbik7XG4gICAgcmV0dXJuIGlzc3VlQ29udGFpbmVyO1xufTtcbmNvbnN0IGdldEhlYWRlciA9IChpc3N1ZSkgPT4ge1xuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoZWFkZXJcIik7XG4gICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJoZWFkZXJcIik7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGZpbGVOYW1lLmlubmVySFRNTCA9IFwiPHN0cm9uZz5GaWxlIE5hbWU6PC9zdHJvbmc+IFwiICsgaXNzdWUuZmlsZU5hbWU7XG4gICAgZmlsZVBhdGguaW5uZXJIVE1MID1cbiAgICAgICAgXCI8c3Ryb25nPkZpbGUgUGF0aDo8L3N0cm9uZz4gXCIgKyBpc3N1ZS5maWxlUGF0aC5yZXBsYWNlKFwiLm5vZGVcIiwgXCJcIik7XG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGZpbGVOYW1lKTtcbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoZmlsZVBhdGgpO1xuICAgIHJldHVybiBoZWFkZXI7XG59O1xuZnVuY3Rpb24gYWRkUGFjYWtnZXMoaXNzdWVTZWN0aW9uLCBpc3N1ZSkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgaWYgKCgoX2EgPSBpc3N1ZS5wYWNrYWdlcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHBhY2thZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBjb25zdCBhcnJvd1NwYW4gPSBnZXRBcnJvdygpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xuICAgIHAuY2xhc3NMaXN0LmFkZChcInBhY2thZ2VzXCIpO1xuICAgIHAuaW5uZXJIVE1MID0gXCI8c3Ryb25nPlBhY2thZ2VzOjwvc3Ryb25nPlwiO1xuICAgIHAucHJlcGVuZChhcnJvd1NwYW4pO1xuICAgIHAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC50b2dnbGUoXCJkLW5vbmVcIik7XG4gICAgICAgIGFycm93U3Bhbi5jbGFzc0xpc3QudG9nZ2xlKFwicm90YXRlLWFycm93XCIpO1xuICAgIH0pO1xuICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO1xuICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChcImNvbGxhcHNpYmxlLWNvbnRlbnRcIik7XG4gICAgZGl2LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29sbGFwc2libGUtY29udGVudC1wYWNrYWdlc1wiKTtcbiAgICAoX2IgPSBpc3N1ZSA9PT0gbnVsbCB8fCBpc3N1ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXNzdWUucGFja2FnZXMpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5mb3JFYWNoKChpc3N1ZVBhY2thZ2UpID0+IHtcbiAgICAgICAgYS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGlzc3VlUGFja2FnZS51cmwpO1xuICAgICAgICBhLnRleHRDb250ZW50ID0gaXNzdWVQYWNrYWdlLmlkO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQodWwuYXBwZW5kQ2hpbGQobGkuYXBwZW5kQ2hpbGQoYSkpKTtcbiAgICB9KTtcbiAgICBwYWNrYWdlcy5hcHBlbmRDaGlsZChwKTtcbiAgICBwYWNrYWdlcy5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZChwYWNrYWdlcyk7XG59XG5jb25zdCBhZGRWdWxuZXJhYmlsaWVzID0gKGlzc3VlU2VjdGlvbiwgaXNzdWUpID0+IHtcbiAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oLCBfaiwgX2ssIF9sO1xuICAgIGNvbnN0IHsgZGVzY3JpcHRpb24sIHNldmVyaXR5LCBhdHRhY2tWZWN0b3IsIGNvbmZpZGVudGlhbEltcGFjdCwgaW50ZWdyaXR5SW1wYWN0LCBhdmFpbGFiaWxpdHlJbXBhY3QsIGxpLCByZWZlcmVuY2VzLCB1bCwgdnVsbmVyYWJpbGl0aWVzLCB9ID0gZ2V0Q29udGVudFNrZWxldG9uKCk7XG4gICAgZGVzY3JpcHRpb24uaW5uZXJIVE1MID1cbiAgICAgICAgXCI8c3Ryb25nPkRlc2NyaXB0aW9uOjwvc3Ryb25nPiBcIiArIGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5kZXNjcmlwdGlvbjtcbiAgICBzZXZlcml0eS5pbm5lckhUTUwgPVxuICAgICAgICBcIjxzdHJvbmc+U2V2ZXJpdHk6PC9zdHJvbmc+IFwiICsgaXNzdWUudnVsbmVyYWJpbGl0aWVzLnNldmVyaXR5O1xuICAgIHNldmVyaXR5LmNsYXNzTGlzdC5hZGQoXCJiYWRnZVwiLCBgYmFkZ2UtJHtnZXRTZXZlcml0eUJhZGdlKGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5zZXZlcml0eSl9YCk7XG4gICAgYXR0YWNrVmVjdG9yLmlubmVySFRNTCA9XG4gICAgICAgIFwiPHN0cm9uZz5UaHJlYXQgdmVjdG9yOjwvc3Ryb25nPiBcIiArXG4gICAgICAgICAgICBnZXRDbGVhbmVkQXR0YWNrVmVjdG9yKChfYSA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5jdnNzdjMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hdHRhY2tWZWN0b3IpO1xuICAgIGNvbmZpZGVudGlhbEltcGFjdC5pbm5lckhUTUwgPVxuICAgICAgICBcIjxzdHJvbmc+Q29uZmlkZW50aWFsIGltcGFjdDo8L3N0cm9uZz4gXCIgK1xuICAgICAgICAgICAgZ2V0Q2xlYW5lZEltcGFjdCgoX2IgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY29uZmlkZW50aWFsSW1wYWN0KTtcbiAgICBpbnRlZ3JpdHlJbXBhY3QuaW5uZXJIVE1MID1cbiAgICAgICAgXCI8c3Ryb25nPkludGVncml0eSBpbXBhY3Q6PC9zdHJvbmc+IFwiICtcbiAgICAgICAgICAgIGdldENsZWFuZWRJbXBhY3QoKF9jID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmludGVncml0eUltcGFjdCk7XG4gICAgYXZhaWxhYmlsaXR5SW1wYWN0LmlubmVySFRNTCA9XG4gICAgICAgIFwiPHN0cm9uZz5BdmFpbGlibGl0eSBpbXBhY3Q6PC9zdHJvbmc+IFwiICtcbiAgICAgICAgICAgIGdldENsZWFuZWRJbXBhY3QoKF9kID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmF2YWlsYWJpbGl0eUltcGFjdCk7XG4gICAgaWYgKCgoX2UgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5kZXNjcmlwdGlvbikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XG4gICAgfVxuICAgIGlmIChpc3N1ZS52dWxuZXJhYmlsaXRpZXMuc2V2ZXJpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChzZXZlcml0eSk7XG4gICAgfVxuICAgIGlmICgoKF9mID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLmF0dGFja1ZlY3RvcikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChhdHRhY2tWZWN0b3IpO1xuICAgIH1cbiAgICBpZiAoKChfZyA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcy5jdnNzdjMpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5jb25maWRlbnRpYWxJbXBhY3QpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29uZmlkZW50aWFsSW1wYWN0KTtcbiAgICB9XG4gICAgaWYgKCgoX2ggPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2guaW50ZWdyaXR5SW1wYWN0KSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGludGVncml0eUltcGFjdCk7XG4gICAgfVxuICAgIGlmICgoKF9qID0gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmN2c3N2MykgPT09IG51bGwgfHwgX2ogPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9qLmF2YWlsYWJpbGl0eUltcGFjdCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChhdmFpbGFiaWxpdHlJbXBhY3QpO1xuICAgIH1cbiAgICBpZiAoaXNzdWUudnVsbmVyYWJpbGl0aWVzLnJlZmVyZW5jZXMubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3Qgc3Ryb25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0cm9uZ1wiKTtcbiAgICAgICAgc3Ryb25nLmlubmVySFRNTCA9IFwiUmVmZXJlbmNlczpcIjtcbiAgICAgICAgc3Ryb25nLnN0eWxlLmN1cnNvciA9IFwicG9pbnRlclwiO1xuICAgICAgICBjb25zdCBhcnJvd1NwYW4gPSBnZXRBcnJvdygpO1xuICAgICAgICBzdHJvbmcucHJlcGVuZChhcnJvd1NwYW4pO1xuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcbiAgICAgICAgcmVmZXJlbmNlcy5hcHBlbmRDaGlsZChzdHJvbmcpO1xuICAgICAgICBzdHJvbmcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QudG9nZ2xlKFwiZC1ub25lXCIpO1xuICAgICAgICAgICAgYXJyb3dTcGFuLmNsYXNzTGlzdC50b2dnbGUoXCJyb3RhdGUtYXJyb3dcIik7XG4gICAgICAgIH0pO1xuICAgICAgICAoX2wgPSAoX2sgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMpID09PSBudWxsIHx8IF9rID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfay5yZWZlcmVuY2VzKSA9PT0gbnVsbCB8fCBfbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2wuZm9yRWFjaCgocmVmZXJlbmNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2VMaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgICAgIGEuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCByZWZlcmVuY2UudXJsKTtcbiAgICAgICAgICAgIGEudGV4dENvbnRlbnQgPSByZWZlcmVuY2UudXJsO1xuICAgICAgICAgICAgcmVmZXJlbmNlTGkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgICAgICAgICBkaXYuc3R5bGUucGFkZGluZ0xlZnQgPSBcIjE1cHhcIjtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChyZWZlcmVuY2VMaSk7XG4gICAgICAgICAgICByZWZlcmVuY2VzLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIH0pO1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChyZWZlcmVuY2VzKTtcbiAgICB9XG4gICAgbGkuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgI2RkZFwiO1xuICAgIGxpLnN0eWxlLnBhZGRpbmcgPSBcIjEwcHhcIjtcbiAgICB1bC5hcHBlbmRDaGlsZChsaSk7XG4gICAgdnVsbmVyYWJpbGl0aWVzLmFwcGVuZENoaWxkKHVsKTtcbiAgICBpc3N1ZVNlY3Rpb24uYXBwZW5kQ2hpbGQodnVsbmVyYWJpbGl0aWVzKTtcbn07XG5mdW5jdGlvbiBnZXRBcnJvdygpIHtcbiAgICBjb25zdCBhcnJvd1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBhcnJvd1NwYW4uaW5uZXJIVE1MID0gXCLilrogXCI7XG4gICAgYXJyb3dTcGFuLnN0eWxlLnRyYW5zaXRpb24gPSBcInRyYW5zZm9ybSAwLjNzIGVhc2VcIjtcbiAgICBhcnJvd1NwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgYXJyb3dTcGFuLnN0eWxlLm1hcmdpbiA9IFwiM3B4XCI7XG4gICAgcmV0dXJuIGFycm93U3Bhbjtcbn1cbmZ1bmN0aW9uIGdldENvbnRlbnRTa2VsZXRvbigpIHtcbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBcIjxzdHJvbmc+VnVsbmVyYWJpbGl0eTo8L3N0cm9uZz5cIjtcbiAgICBjb25zdCB2dWxuZXJhYmlsaXRpZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHZ1bG5lcmFiaWxpdGllcy5jbGFzc0xpc3QuYWRkKFwidnVsbmVyYWJpbGl0aWVzXCIpO1xuICAgIHZ1bG5lcmFiaWxpdGllcy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgY29uc3QgdWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIik7XG4gICAgLy8gaXNzdWUudnVsbmVyYWJpbGl0aWVzLmZvckVhY2goLnZ1bG5lcmFiaWxpdGllcz8uID0+IHtcbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGNvbnN0IHNldmVyaXR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgYXR0YWNrVmVjdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgY29uZmlkZW50aWFsSW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgaW50ZWdyaXR5SW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgYXZhaWxhYmlsaXR5SW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgcmVmZXJlbmNlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIHNldmVyaXR5LFxuICAgICAgICBhdHRhY2tWZWN0b3IsXG4gICAgICAgIGNvbmZpZGVudGlhbEltcGFjdCxcbiAgICAgICAgaW50ZWdyaXR5SW1wYWN0LFxuICAgICAgICBhdmFpbGFiaWxpdHlJbXBhY3QsXG4gICAgICAgIGxpLFxuICAgICAgICByZWZlcmVuY2VzLFxuICAgICAgICB1bCxcbiAgICAgICAgdnVsbmVyYWJpbGl0aWVzLFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRDbGVhbmVkQXR0YWNrVmVjdG9yKGF0dGFja1ZlY3Rvcikge1xuICAgIGlmIChhdHRhY2tWZWN0b3IgPT09IFwiTlwiKSB7XG4gICAgICAgIHJldHVybiBcIk5FVFdPUktcIjtcbiAgICB9XG4gICAgaWYgKGF0dGFja1ZlY3RvciA9PT0gXCJMXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiTE9DQUxcIjtcbiAgICB9XG4gICAgcmV0dXJuIGF0dGFja1ZlY3Rvcjtcbn1cbmZ1bmN0aW9uIGdldENsZWFuZWRJbXBhY3QoaW1wYWN0KSB7XG4gICAgaWYgKGltcGFjdCA9PT0gXCJOXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiTk9ORVwiO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbXBhY3QgPT09IFwiSFwiKSB7XG4gICAgICAgIHJldHVybiBcIkhJR0hcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW1wYWN0ID09PSBcIkxcIikge1xuICAgICAgICByZXR1cm4gXCJMT1dcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW1wYWN0ID09PSBcIk1cIikge1xuICAgICAgICByZXR1cm4gXCJNRURJVU1cIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBpbXBhY3Q7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0U2V2ZXJpdHlCYWRnZShzZXZlcml0eSkge1xuICAgIGlmIChzZXZlcml0eSA9PT0gXCJDUklUSUNBTFwiKSB7XG4gICAgICAgIHJldHVybiBcImNyaXRpY2FsXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNldmVyaXR5ID09PSBcIkhJR0hcIikge1xuICAgICAgICByZXR1cm4gXCJoaWdoXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNldmVyaXR5ID09PSBcIkxPV1wiKSB7XG4gICAgICAgIHJldHVybiBcImxvd1wiO1xuICAgIH1cbiAgICBlbHNlIGlmIChzZXZlcml0eSA9PT0gXCJNRURJVU1cIikge1xuICAgICAgICByZXR1cm4gXCJtZWRpdW1cIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2V2ZXJpdHkgPT09IFwiTU9ERVJBVEVcIikge1xuICAgICAgICByZXR1cm4gXCJtb2RlcmF0ZVwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNldmVyaXR5O1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5GaWx0ZXJMYW5ndWFnZUJ1dHRvbnMgPSBleHBvcnRzLkZpbHRlclNldmVyaXR5QnV0dG9ucyA9IHZvaWQgMDtcbmNvbnN0IGN1c3RvbVNvcnQgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IG9yZGVyID0gW1wiQ1JJVElDQUxcIiwgXCJISUdIXCIsIFwiTU9ERVJBVEVcIiwgXCJNRURJVU1cIiwgXCJMT1dcIl07XG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBpbmRleEEgPSBvcmRlci5pbmRleE9mKGEua2V5KTtcbiAgICAgICAgY29uc3QgaW5kZXhCID0gb3JkZXIuaW5kZXhPZihiLmtleSk7XG4gICAgICAgIGlmIChpbmRleEEgPT09IGluZGV4Qikge1xuICAgICAgICAgICAgcmV0dXJuIGIudmFsdWUgLSBhLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleEEgLSBpbmRleEI7XG4gICAgfSk7XG59O1xuY2xhc3MgRmlsdGVyU2V2ZXJpdHlCdXR0b25zIHtcbiAgICBjb25zdHJ1Y3RvcihzZXZlcml0eUJ1dHRvbnNDb250YWluZXIsIGFsbFNldmVyaXRpZXNXaXRoQ291bnQsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCkge1xuICAgICAgICB0aGlzLnNldmVyaXR5QnV0dG9uc0NvbnRhaW5lciA9IHNldmVyaXR5QnV0dG9uc0NvbnRhaW5lcjtcbiAgICAgICAgdGhpcy5zZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSBzZWN1cml0eUlzc3Vlc0hhc2hVcmw7XG4gICAgICAgIGNvbnNvbGUubG9nKGFsbFNldmVyaXRpZXNXaXRoQ291bnQpO1xuICAgICAgICBhbGxTZXZlcml0aWVzV2l0aENvdW50ID0gY3VzdG9tU29ydChhbGxTZXZlcml0aWVzV2l0aENvdW50KTtcbiAgICAgICAgYWxsU2V2ZXJpdGllc1dpdGhDb3VudC5mb3JFYWNoKChzZXZlcml0eVdpdGhDb3VudCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRTZXZlcml0aWVzID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFNldmVyaXRpZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NOYW1lID0gXCJmaWx0ZXItYnV0dG9uXCI7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmFkZChgJHtzZXZlcml0eVdpdGhDb3VudC5rZXkudG9Mb2NhbGVMb3dlckNhc2UoKX0tYnV0dG9uYCk7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24udGV4dENvbnRlbnQgPSBgJHtzZXZlcml0eVdpdGhDb3VudC5rZXl9ICh4JHtzZXZlcml0eVdpdGhDb3VudC52YWx1ZX0pYDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFNldmVyaXRpZXMuaW5jbHVkZXMoc2V2ZXJpdHlXaXRoQ291bnQua2V5KSkge1xuICAgICAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwic2VsZWN0ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFNldmVyaXRpZXMoW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFNldmVyaXRpZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldmVyaXR5V2l0aENvdW50LmtleSxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0U2V2ZXJpdGllcyhzZWN1cml0eUlzc3Vlc0hhc2hVcmxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRTZXZlcml0aWVzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHNlcnZlcml0eSkgPT4gc2VydmVyaXR5ICE9PSBzZXZlcml0eVdpdGhDb3VudC5rZXkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldmVyaXR5QnV0dG9uc0NvbnRhaW5lci5hcHBlbmRDaGlsZChmaWx0ZXJCdXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkZpbHRlclNldmVyaXR5QnV0dG9ucyA9IEZpbHRlclNldmVyaXR5QnV0dG9ucztcbmNsYXNzIEZpbHRlckxhbmd1YWdlQnV0dG9ucyB7XG4gICAgY29uc3RydWN0b3IobGFuZ3VhZ2VMaXN0Q29udGFpbmVyLCBhbGxMYW5ndWFnZXNXaXRoQ291bnQsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCkge1xuICAgICAgICB0aGlzLmxhbmd1YWdlTGlzdENvbnRhaW5lciA9IGxhbmd1YWdlTGlzdENvbnRhaW5lcjtcbiAgICAgICAgdGhpcy5zZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSBzZWN1cml0eUlzc3Vlc0hhc2hVcmw7XG4gICAgICAgIGFsbExhbmd1YWdlc1dpdGhDb3VudC5mb3JFYWNoKChsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRMYW5ndWFnZXMgPSBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0TGFuZ3VhZ2VzKCk7XG4gICAgICAgICAgICBjb25zdCBsYW5ndWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBjb25zdCBsYW5ndWFnZUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgICAgICAgICAgY29uc3QgY2hlY2tib3hCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiSU5QVVRcIik7XG4gICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XG4gICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiY2hlY2tib3hcIik7XG4gICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsYW5ndWFnZS5rZXl9YCk7XG4gICAgICAgICAgICBsYW5ndWFnZUxhYmVsLnRleHRDb250ZW50ID0gYCR7bGFuZ3VhZ2Uua2V5fSAoeCR7bGFuZ3VhZ2UudmFsdWV9KWA7XG4gICAgICAgICAgICBsYW5ndWFnZUxhYmVsLnNldEF0dHJpYnV0ZShcImZvclwiLCBgJHtsYW5ndWFnZS5rZXl9YCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRMYW5ndWFnZXMuaW5jbHVkZXMobGFuZ3VhZ2Uua2V5KSkge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcImNoZWNrZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrYm94QnV0dG9uLmNsYXNzTGlzdC5jb250YWlucyhcImNoZWNrZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldExhbmd1YWdlcyhbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0TGFuZ3VhZ2VzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZS5rZXksXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldExhbmd1YWdlcyhzZWN1cml0eUlzc3Vlc0hhc2hVcmxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRMYW5ndWFnZXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigobGFuZykgPT4gbGFuZyAhPT0gbGFuZ3VhZ2Uua2V5KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYW5ndWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGVja2JveEJ1dHRvbik7XG4gICAgICAgICAgICBsYW5ndWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChsYW5ndWFnZUxhYmVsKTtcbiAgICAgICAgICAgIGxhbmd1YWdlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJsYW5ndWFnZS1tYXJnaW5cIik7XG4gICAgICAgICAgICBsYW5ndWFnZUxpc3RDb250YWluZXIuY2xhc3NMaXN0LmFkZChcImxhbmd1YWdlLWxpc3RcIik7XG4gICAgICAgICAgICBsYW5ndWFnZUxpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQobGFuZ3VhZ2VDb250YWluZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkZpbHRlckxhbmd1YWdlQnV0dG9ucyA9IEZpbHRlckxhbmd1YWdlQnV0dG9ucztcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZW5kZXJQYWdpbmF0aW9uID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi4vY29uc3RhbnRzXCIpO1xuY29uc3QgcmVuZGVyUGFnaW5hdGlvbiA9IChwYWdpbmF0aW9uQ29udGFpbmVyLCB0b3RhbEl0ZW1zLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpID0+IHtcbiAgICBjb25zdCB0b3RhbFBhZ2VzID0gTWF0aC5jZWlsKHRvdGFsSXRlbXMgLyBjb25zdGFudHNfMS5JVEVNU19QRVJfUEFHRSk7XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGNvbnN0IHByZXZCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGlmIChzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpID09PSAxKSB7XG4gICAgICAgIHByZXZCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbiAgICBwcmV2QnV0dG9uLmNsYXNzTmFtZSA9IFwicGFnZS1saW5rXCI7XG4gICAgcHJldkJ1dHRvbi50ZXh0Q29udGVudCA9IFwiUHJldmlvdXNcIjtcbiAgICBwcmV2QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpID4gMSkge1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSAtIDEpO1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBuZXh0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA9PSB0b3RhbFBhZ2VzKSB7XG4gICAgICAgIG5leHRCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwiTm9uZVwiO1xuICAgIH1cbiAgICBuZXh0QnV0dG9uLmNsYXNzTmFtZSA9IFwicGFnZS1saW5rXCI7XG4gICAgbmV4dEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiTmV4dFwiO1xuICAgIG5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgPCB0b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpICsgMSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQocHJldkJ1dHRvbik7XG4gICAgY29uc3QgaW5pdGlhbFBhZ2VDb3VudCA9IDU7XG4gICAgY29uc3Qgc3RhcnRQYWdlID0gTWF0aC5tYXgoMSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSAtIE1hdGguZmxvb3IoaW5pdGlhbFBhZ2VDb3VudCAvIDIpKTtcbiAgICBjb25zdCBlbmRQYWdlID0gTWF0aC5taW4odG90YWxQYWdlcywgc3RhcnRQYWdlICsgaW5pdGlhbFBhZ2VDb3VudCAtIDEpO1xuICAgIGZvciAobGV0IGkgPSBzdGFydFBhZ2U7IGkgPD0gZW5kUGFnZTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBhZ2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICBpZiAodG90YWxQYWdlcyA9PSAxKSB7XG4gICAgICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfVxuICAgICAgICBwYWdlQnV0dG9uLmNsYXNzTmFtZSA9IFwicGFnZS1saW5rXCI7XG4gICAgICAgIHBhZ2VCdXR0b24udGV4dENvbnRlbnQgPSBpICsgXCJcIjtcbiAgICAgICAgcGFnZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoaSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpID09PSBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpKSB7XG4gICAgICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmNvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICAgICAgcGFnZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMGUzMjUyXCI7XG4gICAgICAgIH1cbiAgICAgICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChwYWdlQnV0dG9uKTtcbiAgICB9XG4gICAgaWYgKGVuZFBhZ2UgPCB0b3RhbFBhZ2VzKSB7XG4gICAgICAgIGNvbnN0IGVsbGlwc2lzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGVsbGlwc2lzLnRleHRDb250ZW50ID0gXCIuLi5cIjtcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGxpcHNpcyk7XG4gICAgICAgIGNvbnN0IG1vcmVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICBtb3JlQnV0dG9uLmNsYXNzTmFtZSA9IFwicGFnZS1saW5rXCI7XG4gICAgICAgIG1vcmVCdXR0b24udGV4dENvbnRlbnQgPSBcIk1vcmVcIjtcbiAgICAgICAgbW9yZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoZW5kUGFnZSArIDEpO1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoZW5kUGFnZSArIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChtb3JlQnV0dG9uKTtcbiAgICB9XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChuZXh0QnV0dG9uKTtcbn07XG5leHBvcnRzLnJlbmRlclBhZ2luYXRpb24gPSByZW5kZXJQYWdpbmF0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IHZvaWQgMDtcbmNsYXNzIFNlY3VyaXR5SXNzdWVzSGFzaFVybCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc2V2ZXJpdGllcyA9IFtdO1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IFtdO1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5nZXREYXRhRnJvbVVybCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgICAgIHRoaXMucGFnZU51bWJlciA9IGRhdGEucGFnZU51bWJlcjtcbiAgICAgICAgdGhpcy5zZXZlcml0aWVzID0gZGF0YS5zZXJ2ZXJpdGllcztcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSBkYXRhLmxhbmd1YWdlcztcbiAgICB9XG4gICAgZ2V0U3RhdGVBc1VybCgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoXCIjXCIsIFwiXCIpO1xuICAgIH1cbiAgICB1cGRhdGVVcmwoKSB7XG4gICAgICAgIGNvbnN0IGhhc2hBcnJheSA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zZXZlcml0aWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhc2hBcnJheS5wdXNoKGBzZXZlcml0eT0ke3RoaXMuc2V2ZXJpdGllcy5qb2luKFwiLFwiKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sYW5ndWFnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGFzaEFycmF5LnB1c2goYGxhbmd1YWdlPSR7dGhpcy5sYW5ndWFnZXMuam9pbihcIixcIil9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaGFzaEFycmF5LnB1c2goYHBhZ2U9JHt0aGlzLnBhZ2VOdW1iZXJ9YCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaEFycmF5LmpvaW4oXCImXCIpO1xuICAgIH1cbiAgICBzZXRTZXZlcml0aWVzKHNlcnZlcml0eSkge1xuICAgICAgICB0aGlzLnNldmVyaXRpZXMgPSBzZXJ2ZXJpdHk7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIHNldExhbmd1YWdlcyhsYW5ndWFnZXMpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSBsYW5ndWFnZXM7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIHNldFBhZ2VOdW1iZXIocGFnZU51bWJlcikge1xuICAgICAgICB0aGlzLnBhZ2VOdW1iZXIgPSBwYWdlTnVtYmVyO1xuICAgICAgICB0aGlzLnVwZGF0ZVVybCgpO1xuICAgIH1cbiAgICBnZXREYXRhRnJvbVVybChoYXNoKSB7XG4gICAgICAgIGNvbnN0IGhhc2hBcnJheSA9IGhhc2gucmVwbGFjZShcIiNcIiwgXCJcIikuc3BsaXQoXCImXCIpO1xuICAgICAgICBjb25zdCBzZXZlcml0eSA9IFtdO1xuICAgICAgICBjb25zdCBsYW5ndWFnZXMgPSBbXTtcbiAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICBoYXNoQXJyYXkuZm9yRWFjaCgoaGFzaEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGhhc2hJdGVtLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwic2V2ZXJpdHlcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlQXJyYXkgPSB2YWx1ZS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgdmFsdWVBcnJheS5mb3JFYWNoKCh2YWx1ZUl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V2ZXJpdHkucHVzaCh2YWx1ZUl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImxhbmd1YWdlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaCgodmFsdWVJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlcy5wdXNoKHZhbHVlSXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IFwicGFnZVwiKSB7XG4gICAgICAgICAgICAgICAgcGFnZU51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBzZXJ2ZXJpdGllczogc2V2ZXJpdHksIGxhbmd1YWdlcywgcGFnZU51bWJlciB9O1xuICAgIH1cbiAgICBnZXRTZXZlcml0aWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXZlcml0aWVzO1xuICAgIH1cbiAgICBnZXRMYW5ndWFnZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhbmd1YWdlcztcbiAgICB9XG4gICAgZ2V0UGFnZU51bWJlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFnZU51bWJlcjtcbiAgICB9XG4gICAgZ2V0RGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNldmVyaXR5OiB0aGlzLnNldmVyaXRpZXMsXG4gICAgICAgICAgICBsYW5ndWFnZXM6IHRoaXMubGFuZ3VhZ2VzLFxuICAgICAgICAgICAgcGFnZU51bWJlcjogdGhpcy5wYWdlTnVtYmVyLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZUFzVXJsKCkgPT09IFwiXCI7XG4gICAgfVxufVxuZXhwb3J0cy5TZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSBTZWN1cml0eUlzc3Vlc0hhc2hVcmw7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=