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
    var _a, _b;
    return (((_a = issue.packages) === null || _a === void 0 ? void 0 : _a.length) === undefined &&
        ((_b = issue.vulnerabilities) === null || _b === void 0 ? void 0 : _b.length) === undefined);
};
const getDependencyIssues = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("./telebright-dependency-check-report.json");
    const data = yield res.json();
    const dependencyIssues = data.dependencies;
    const filteredDependencyIssues = dependencyIssues.filter((issue) => {
        return !isIssuesEmpty(issue);
    });
    filteredDependencyIssues.forEach((issue) => {
        issue.filePath = issue.filePath.replace("/mnt/c/Users/DELL/Desktop/dev/", "");
    });
    return filteredDependencyIssues;
});
exports.getDependencyIssues = getDependencyIssues;
const filteredDependencyIssues = (results, languages) => {
    return results.filter((obj) => languages.includes(obj.language));
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
    const allImpactsWithCount = [];
    results.forEach((result) => {
        const language = result.language;
        const languageIndex = allLanguagesWithCount.findIndex((lang) => lang.key === language);
        if (languageIndex === -1) {
            allLanguagesWithCount.push({ key: language, value: 1 });
        }
        else {
            allLanguagesWithCount[languageIndex].value++;
        }
    });
    return { allLanguagesWithCount };
};
exports.getSecurityIssuesMetadata = getSecurityIssuesMetadata;


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
    const { allLanguagesWithCount } = (0, data_handler_1.getSecurityIssuesMetadata)(resultsWithLanguages);
    const container = document.getElementById("container");
    const securityIssuesHashUrl = new security_issue_hash_1.SecurityIssuesHashUrl();
    if (securityIssuesHashUrl.isEmpty()) {
        securityIssuesHashUrl.setLanguages(allLanguagesWithCount.map((o) => o.key));
    }
    (0, dependecy_check_1.renderDepedencyIssue)(dependencyIssues, container, securityIssuesHashUrl);
    (0, pagination_1.renderPagination)(document.getElementById("pagination"), dependencyIssues.length, securityIssuesHashUrl);
    const { languages } = securityIssuesHashUrl.getData();
    const filteredResults = (0, data_handler_1.filteredDependencyIssues)(resultsWithLanguages, languages);
    const filterLanguageButtons = new filter_buttons_1.FilterLanguageButtons(document.getElementById("filter-language-buttons"), allLanguagesWithCount, securityIssuesHashUrl);
    window.addEventListener("hashchange", () => {
        const filteredResults = (0, data_handler_1.filteredDependencyIssues)(resultsWithLanguages, securityIssuesHashUrl.getLanguages());
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
    var _a;
    if (((_a = issue.vulnerabilities) === null || _a === void 0 ? void 0 : _a.length) === undefined) {
        return;
    }
    const label = document.createElement("label");
    label.innerHTML = "<strong>Vulnerabilities:</strong>";
    const vulnerabilities = document.createElement("div");
    vulnerabilities.classList.add("vulnerabilities");
    vulnerabilities.appendChild(label);
    const ul = document.createElement("ul");
    issue.vulnerabilities.forEach((vulnerability) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        severity.classList.add("badge", "badge-pill", "badge-success");
        attackVector.innerHTML =
            "<strong>Threat vector:</strong> " +
                getCleanedAttackVector((_a = vulnerability.cvssv3) === null || _a === void 0 ? void 0 : _a.attackVector);
        confidentialImpact.innerHTML =
            "<strong>Confidential impact:</strong> " +
                getCleanedImpact((_b = vulnerability.cvssv3) === null || _b === void 0 ? void 0 : _b.confidentialImpact);
        integrityImpact.innerHTML =
            "<strong>Integrity impact:</strong> " +
                getCleanedImpact((_c = vulnerability.cvssv3) === null || _c === void 0 ? void 0 : _c.integrityImpact);
        availabilityImpact.innerHTML =
            "<strong>Availiblity impact:</strong> " +
                getCleanedImpact((_d = vulnerability.cvssv3) === null || _d === void 0 ? void 0 : _d.availabilityImpact);
        if (vulnerability.description !== undefined) {
            li.appendChild(description);
        }
        if (vulnerability.severity !== undefined) {
            li.appendChild(severity);
        }
        if (((_e = vulnerability.cvssv3) === null || _e === void 0 ? void 0 : _e.attackVector) !== undefined) {
            li.appendChild(attackVector);
        }
        if (((_f = vulnerability.cvssv3) === null || _f === void 0 ? void 0 : _f.confidentialImpact) !== undefined) {
            li.appendChild(confidentialImpact);
        }
        if (((_g = vulnerability.cvssv3) === null || _g === void 0 ? void 0 : _g.integrityImpact) !== undefined) {
            li.appendChild(integrityImpact);
        }
        if (((_h = vulnerability.cvssv3) === null || _h === void 0 ? void 0 : _h.availabilityImpact) !== undefined) {
            li.appendChild(availabilityImpact);
        }
        if (((_j = vulnerability.references) === null || _j === void 0 ? void 0 : _j.length) !== undefined) {
            const strong = document.createElement("strong");
            strong.textContent = "References:";
            references.appendChild(strong);
            (_k = vulnerability.references) === null || _k === void 0 ? void 0 : _k.forEach((reference) => {
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


/***/ }),

/***/ "./src/render/filter-buttons.ts":
/*!**************************************!*\
  !*** ./src/render/filter-buttons.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterLanguageButtons = void 0;
class FilterLanguageButtons {
    constructor(languageListContainer, allLanguagesWithCount, securityIssuesHashUrl) {
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
        this.severity = [];
        this.languages = [];
        const data = this.getDataFromUrl(window.location.hash);
        this.pageNumber = data.pageNumber;
        this.severity = data.impacts;
        this.languages = data.languages;
    }
    getStateAsUrl() {
        return window.location.hash.replace("#", "");
    }
    updateUrl() {
        const hashArray = [];
        if (this.severity.length > 0) {
            hashArray.push(`impact=${this.severity.join(",")}`);
        }
        if (this.languages.length > 0) {
            hashArray.push(`language=${this.languages.join(",")}`);
        }
        hashArray.push(`page=${this.pageNumber}`);
        window.location.hash = hashArray.join("&");
    }
    setSeverity(impacts) {
        this.severity = impacts;
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
        return { impacts: severity, languages, pageNumber };
    }
    getSeverity() {
        return this.severity;
    }
    getLanguages() {
        return this.languages;
    }
    getPageNumber() {
        return this.pageNumber;
    }
    getData() {
        return {
            severity: this.severity,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qjs7Ozs7Ozs7Ozs7QUNuRVg7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyx3QkFBd0I7QUFDN0Q7QUFDQTtBQUNBLHVDQUF1Qyx5QkFBeUI7QUFDaEU7QUFDQSwrQkFBK0IsZ0JBQWdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qjs7Ozs7OztVQ25GN0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2RhdGEtaGFuZGxlci50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9kZXBlbmRlY3ktY2hlY2sudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9maWx0ZXItYnV0dG9ucy50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvcmVuZGVyL3BhZ2luYXRpb24udHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3NlY3VyaXR5LWlzc3VlLWhhc2gudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSVRFTVNfUEVSX1BBR0UgPSB2b2lkIDA7XG5leHBvcnRzLklURU1TX1BFUl9QQUdFID0gMTA7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gZXhwb3J0cy5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCA9IGV4cG9ydHMuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gZXhwb3J0cy5nZXREZXBlbmRlbmN5SXNzdWVzID0gdm9pZCAwO1xuY29uc3QgaXNJc3N1ZXNFbXB0eSA9IChpc3N1ZSkgPT4ge1xuICAgIHZhciBfYSwgX2I7XG4gICAgcmV0dXJuICgoKF9hID0gaXNzdWUucGFja2FnZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5sZW5ndGgpID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKChfYiA9IGlzc3VlLnZ1bG5lcmFiaWxpdGllcykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmxlbmd0aCkgPT09IHVuZGVmaW5lZCk7XG59O1xuY29uc3QgZ2V0RGVwZW5kZW5jeUlzc3VlcyA9ICgpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIGNvbnN0IHJlcyA9IHlpZWxkIGZldGNoKFwiLi90ZWxlYnJpZ2h0LWRlcGVuZGVuY3ktY2hlY2stcmVwb3J0Lmpzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IHlpZWxkIHJlcy5qc29uKCk7XG4gICAgY29uc3QgZGVwZW5kZW5jeUlzc3VlcyA9IGRhdGEuZGVwZW5kZW5jaWVzO1xuICAgIGNvbnN0IGZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcyA9IGRlcGVuZGVuY3lJc3N1ZXMuZmlsdGVyKChpc3N1ZSkgPT4ge1xuICAgICAgICByZXR1cm4gIWlzSXNzdWVzRW1wdHkoaXNzdWUpO1xuICAgIH0pO1xuICAgIGZpbHRlcmVkRGVwZW5kZW5jeUlzc3Vlcy5mb3JFYWNoKChpc3N1ZSkgPT4ge1xuICAgICAgICBpc3N1ZS5maWxlUGF0aCA9IGlzc3VlLmZpbGVQYXRoLnJlcGxhY2UoXCIvbW50L2MvVXNlcnMvREVMTC9EZXNrdG9wL2Rldi9cIiwgXCJcIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbHRlcmVkRGVwZW5kZW5jeUlzc3Vlcztcbn0pO1xuZXhwb3J0cy5nZXREZXBlbmRlbmN5SXNzdWVzID0gZ2V0RGVwZW5kZW5jeUlzc3VlcztcbmNvbnN0IGZpbHRlcmVkRGVwZW5kZW5jeUlzc3VlcyA9IChyZXN1bHRzLCBsYW5ndWFnZXMpID0+IHtcbiAgICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKG9iaikgPT4gbGFuZ3VhZ2VzLmluY2x1ZGVzKG9iai5sYW5ndWFnZSkpO1xufTtcbmV4cG9ydHMuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzID0gZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzO1xuY29uc3QgZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWwgPSAocmVzdWx0cykgPT4ge1xuICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSAoX2EgPSByZXN1bHQuZmlsZVBhdGguc3BsaXQoXCIvXCIpLnBvcCgpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXN1bHQpLCB7IGxhbmd1YWdlOiBsYW5ndWFnZSA/IGxhbmd1YWdlIDogXCJcIiB9KTtcbiAgICB9KTtcbn07XG5leHBvcnRzLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWw7XG5jb25zdCBnZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gKHJlc3VsdHMpID0+IHtcbiAgICBjb25zdCBhbGxMYW5ndWFnZXNXaXRoQ291bnQgPSBbXTtcbiAgICBjb25zdCBhbGxJbXBhY3RzV2l0aENvdW50ID0gW107XG4gICAgcmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSByZXN1bHQubGFuZ3VhZ2U7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlSW5kZXggPSBhbGxMYW5ndWFnZXNXaXRoQ291bnQuZmluZEluZGV4KChsYW5nKSA9PiBsYW5nLmtleSA9PT0gbGFuZ3VhZ2UpO1xuICAgICAgICBpZiAobGFuZ3VhZ2VJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGFsbExhbmd1YWdlc1dpdGhDb3VudC5wdXNoKHsga2V5OiBsYW5ndWFnZSwgdmFsdWU6IDEgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGxMYW5ndWFnZXNXaXRoQ291bnRbbGFuZ3VhZ2VJbmRleF0udmFsdWUrKztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7IGFsbExhbmd1YWdlc1dpdGhDb3VudCB9O1xufTtcbmV4cG9ydHMuZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YSA9IGdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGE7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZGF0YV9oYW5kbGVyXzEgPSByZXF1aXJlKFwiLi9kYXRhLWhhbmRsZXJcIik7XG5jb25zdCBkZXBlbmRlY3lfY2hlY2tfMSA9IHJlcXVpcmUoXCIuL3JlbmRlci9kZXBlbmRlY3ktY2hlY2tcIik7XG5jb25zdCBmaWx0ZXJfYnV0dG9uc18xID0gcmVxdWlyZShcIi4vcmVuZGVyL2ZpbHRlci1idXR0b25zXCIpO1xuY29uc3QgcGFnaW5hdGlvbl8xID0gcmVxdWlyZShcIi4vcmVuZGVyL3BhZ2luYXRpb25cIik7XG5jb25zdCBzZWN1cml0eV9pc3N1ZV9oYXNoXzEgPSByZXF1aXJlKFwiLi9zZWN1cml0eS1pc3N1ZS1oYXNoXCIpO1xuY29uc3QgbWFpbiA9ICgpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIGNvbnN0IGRlcGVuZGVuY3lJc3N1ZXMgPSB5aWVsZCAoMCwgZGF0YV9oYW5kbGVyXzEuZ2V0RGVwZW5kZW5jeUlzc3VlcykoKTtcbiAgICBjb25zdCByZXN1bHRzV2l0aExhbmd1YWdlcyA9ICgwLCBkYXRhX2hhbmRsZXJfMS5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCkoZGVwZW5kZW5jeUlzc3Vlcyk7XG4gICAgY29uc3QgeyBhbGxMYW5ndWFnZXNXaXRoQ291bnQgfSA9ICgwLCBkYXRhX2hhbmRsZXJfMS5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhKShyZXN1bHRzV2l0aExhbmd1YWdlcyk7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250YWluZXJcIik7XG4gICAgY29uc3Qgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gbmV3IHNlY3VyaXR5X2lzc3VlX2hhc2hfMS5TZWN1cml0eUlzc3Vlc0hhc2hVcmwoKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmlzRW1wdHkoKSkge1xuICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0TGFuZ3VhZ2VzKGFsbExhbmd1YWdlc1dpdGhDb3VudC5tYXAoKG8pID0+IG8ua2V5KSk7XG4gICAgfVxuICAgICgwLCBkZXBlbmRlY3lfY2hlY2tfMS5yZW5kZXJEZXBlZGVuY3lJc3N1ZSkoZGVwZW5kZW5jeUlzc3VlcywgY29udGFpbmVyLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgICgwLCBwYWdpbmF0aW9uXzEucmVuZGVyUGFnaW5hdGlvbikoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYWdpbmF0aW9uXCIpLCBkZXBlbmRlbmN5SXNzdWVzLmxlbmd0aCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICBjb25zdCB7IGxhbmd1YWdlcyB9ID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldERhdGEoKTtcbiAgICBjb25zdCBmaWx0ZXJlZFJlc3VsdHMgPSAoMCwgZGF0YV9oYW5kbGVyXzEuZmlsdGVyZWREZXBlbmRlbmN5SXNzdWVzKShyZXN1bHRzV2l0aExhbmd1YWdlcywgbGFuZ3VhZ2VzKTtcbiAgICBjb25zdCBmaWx0ZXJMYW5ndWFnZUJ1dHRvbnMgPSBuZXcgZmlsdGVyX2J1dHRvbnNfMS5GaWx0ZXJMYW5ndWFnZUJ1dHRvbnMoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXItbGFuZ3VhZ2UtYnV0dG9uc1wiKSwgYWxsTGFuZ3VhZ2VzV2l0aENvdW50LCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkUmVzdWx0cyA9ICgwLCBkYXRhX2hhbmRsZXJfMS5maWx0ZXJlZERlcGVuZGVuY3lJc3N1ZXMpKHJlc3VsdHNXaXRoTGFuZ3VhZ2VzLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0TGFuZ3VhZ2VzKCkpO1xuICAgICAgICAoMCwgZGVwZW5kZWN5X2NoZWNrXzEucmVuZGVyRGVwZWRlbmN5SXNzdWUpKGZpbHRlcmVkUmVzdWx0cywgY29udGFpbmVyLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgICAgICAoMCwgcGFnaW5hdGlvbl8xLnJlbmRlclBhZ2luYXRpb24pKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFnaW5hdGlvblwiKSwgZmlsdGVyZWRSZXN1bHRzLmxlbmd0aCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICB9KTtcbn0pO1xubWFpbigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbmRlckRlcGVkZW5jeUlzc3VlID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi4vY29uc3RhbnRzXCIpO1xuZnVuY3Rpb24gcmVuZGVyRGVwZWRlbmN5SXNzdWUoZGVwZW5kZW5jeUlzc3VlcywgY29udGFpbmVyLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpIHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgLSAxKSAqIGNvbnN0YW50c18xLklURU1TX1BFUl9QQUdFO1xuICAgIGNvbnN0IGVuZEluZGV4ID0gc3RhcnRJbmRleCArIGNvbnN0YW50c18xLklURU1TX1BFUl9QQUdFO1xuICAgIGNvbnN0IGl0ZW1zVG9SZW5kZXIgPSBkZXBlbmRlbmN5SXNzdWVzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICBpdGVtc1RvUmVuZGVyLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnZXRJc3N1ZUNvbnRhaW5lcihpc3N1ZSkpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5yZW5kZXJEZXBlZGVuY3lJc3N1ZSA9IHJlbmRlckRlcGVkZW5jeUlzc3VlO1xuY29uc3QgZ2V0SXNzdWVDb250YWluZXIgPSAoaXNzdWUpID0+IHtcbiAgICBjb25zdCBpc3N1ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaXNzdWVDb250YWluZXIuY2xhc3NMaXN0LmFkZChcImlzc3VlLWNvbnRhaW5lclwiKTtcbiAgICBjb25zdCBpc3N1ZVNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VjdGlvblwiKTtcbiAgICBpc3N1ZVNlY3Rpb24uYXBwZW5kQ2hpbGQoZ2V0SGVhZGVyKGlzc3VlKSk7XG4gICAgYWRkUGFjYWtnZXMoaXNzdWVTZWN0aW9uLCBpc3N1ZSk7XG4gICAgYWRkVnVsbmVyYWJpbGllcyhpc3N1ZVNlY3Rpb24sIGlzc3VlKTtcbiAgICBpc3N1ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpc3N1ZVNlY3Rpb24pO1xuICAgIHJldHVybiBpc3N1ZUNvbnRhaW5lcjtcbn07XG5jb25zdCBnZXRIZWFkZXIgPSAoaXNzdWUpID0+IHtcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaGVhZGVyXCIpO1xuICAgIGNvbnN0IGZpbGVOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgY29uc3QgZmlsZVBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBmaWxlTmFtZS5pbm5lckhUTUwgPSBcIjxzdHJvbmc+RmlsZSBOYW1lOjwvc3Ryb25nPiBcIiArIGlzc3VlLmZpbGVOYW1lO1xuICAgIGZpbGVQYXRoLmlubmVySFRNTCA9IFwiPHN0cm9uZz5GaWxlIFBhdGg6PC9zdHJvbmc+IFwiICsgaXNzdWUuZmlsZVBhdGg7XG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGZpbGVOYW1lKTtcbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoZmlsZVBhdGgpO1xuICAgIHJldHVybiBoZWFkZXI7XG59O1xuZnVuY3Rpb24gYWRkUGFjYWtnZXMoaXNzdWVTZWN0aW9uLCBpc3N1ZSkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgaWYgKCgoX2EgPSBpc3N1ZS5wYWNrYWdlcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHBhY2thZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwLmNsYXNzTGlzdC5hZGQoXCJwYWNrYWdlc1wiKTtcbiAgICBwLmlubmVySFRNTCA9IFwiPHN0cm9uZz5QYWNrYWdlczo8L3N0cm9uZz5cIjtcbiAgICBwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QudG9nZ2xlKFwiZC1ub25lXCIpO1xuICAgIH0pO1xuICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO1xuICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChcImNvbGxhcHNpYmxlLWNvbnRlbnRcIik7XG4gICAgZGl2LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29sbGFwc2libGUtY29udGVudC1wYWNrYWdlc1wiKTtcbiAgICAoX2IgPSBpc3N1ZSA9PT0gbnVsbCB8fCBpc3N1ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXNzdWUucGFja2FnZXMpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5mb3JFYWNoKChpc3N1ZVBhY2thZ2UpID0+IHtcbiAgICAgICAgYS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGlzc3VlUGFja2FnZS51cmwpO1xuICAgICAgICBhLnRleHRDb250ZW50ID0gaXNzdWVQYWNrYWdlLmlkO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQodWwuYXBwZW5kQ2hpbGQobGkuYXBwZW5kQ2hpbGQoYSkpKTtcbiAgICB9KTtcbiAgICBwYWNrYWdlcy5hcHBlbmRDaGlsZChwKTtcbiAgICBwYWNrYWdlcy5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZChwYWNrYWdlcyk7XG59XG5jb25zdCBhZGRWdWxuZXJhYmlsaWVzID0gKGlzc3VlU2VjdGlvbiwgaXNzdWUpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgaWYgKCgoX2EgPSBpc3N1ZS52dWxuZXJhYmlsaXRpZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5sZW5ndGgpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBcIjxzdHJvbmc+VnVsbmVyYWJpbGl0aWVzOjwvc3Ryb25nPlwiO1xuICAgIGNvbnN0IHZ1bG5lcmFiaWxpdGllcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdnVsbmVyYWJpbGl0aWVzLmNsYXNzTGlzdC5hZGQoXCJ2dWxuZXJhYmlsaXRpZXNcIik7XG4gICAgdnVsbmVyYWJpbGl0aWVzLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICBjb25zdCB1bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcbiAgICBpc3N1ZS52dWxuZXJhYmlsaXRpZXMuZm9yRWFjaCgodnVsbmVyYWJpbGl0eSkgPT4ge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oLCBfaiwgX2s7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBjb25zdCBzZXZlcml0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBjb25zdCBhdHRhY2tWZWN0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgY29uc3QgY29uZmlkZW50aWFsSW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgIGNvbnN0IGludGVncml0eUltcGFjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlJbXBhY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBkZXNjcmlwdGlvbi5pbm5lckhUTUwgPVxuICAgICAgICAgICAgXCI8c3Ryb25nPkRlc2NyaXB0aW9uOjwvc3Ryb25nPiBcIiArIHZ1bG5lcmFiaWxpdHkuZGVzY3JpcHRpb247XG4gICAgICAgIHNldmVyaXR5LmlubmVySFRNTCA9IFwiPHN0cm9uZz5TZXZlcml0eTo8L3N0cm9uZz4gXCIgKyB2dWxuZXJhYmlsaXR5LnNldmVyaXR5O1xuICAgICAgICBzZXZlcml0eS5jbGFzc0xpc3QuYWRkKFwiYmFkZ2VcIiwgXCJiYWRnZS1waWxsXCIsIFwiYmFkZ2Utc3VjY2Vzc1wiKTtcbiAgICAgICAgYXR0YWNrVmVjdG9yLmlubmVySFRNTCA9XG4gICAgICAgICAgICBcIjxzdHJvbmc+VGhyZWF0IHZlY3Rvcjo8L3N0cm9uZz4gXCIgK1xuICAgICAgICAgICAgICAgIGdldENsZWFuZWRBdHRhY2tWZWN0b3IoKF9hID0gdnVsbmVyYWJpbGl0eS5jdnNzdjMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hdHRhY2tWZWN0b3IpO1xuICAgICAgICBjb25maWRlbnRpYWxJbXBhY3QuaW5uZXJIVE1MID1cbiAgICAgICAgICAgIFwiPHN0cm9uZz5Db25maWRlbnRpYWwgaW1wYWN0Ojwvc3Ryb25nPiBcIiArXG4gICAgICAgICAgICAgICAgZ2V0Q2xlYW5lZEltcGFjdCgoX2IgPSB2dWxuZXJhYmlsaXR5LmN2c3N2MykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNvbmZpZGVudGlhbEltcGFjdCk7XG4gICAgICAgIGludGVncml0eUltcGFjdC5pbm5lckhUTUwgPVxuICAgICAgICAgICAgXCI8c3Ryb25nPkludGVncml0eSBpbXBhY3Q6PC9zdHJvbmc+IFwiICtcbiAgICAgICAgICAgICAgICBnZXRDbGVhbmVkSW1wYWN0KChfYyA9IHZ1bG5lcmFiaWxpdHkuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuaW50ZWdyaXR5SW1wYWN0KTtcbiAgICAgICAgYXZhaWxhYmlsaXR5SW1wYWN0LmlubmVySFRNTCA9XG4gICAgICAgICAgICBcIjxzdHJvbmc+QXZhaWxpYmxpdHkgaW1wYWN0Ojwvc3Ryb25nPiBcIiArXG4gICAgICAgICAgICAgICAgZ2V0Q2xlYW5lZEltcGFjdCgoX2QgPSB2dWxuZXJhYmlsaXR5LmN2c3N2MykgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmF2YWlsYWJpbGl0eUltcGFjdCk7XG4gICAgICAgIGlmICh2dWxuZXJhYmlsaXR5LmRlc2NyaXB0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodnVsbmVyYWJpbGl0eS5zZXZlcml0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChzZXZlcml0eSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoX2UgPSB2dWxuZXJhYmlsaXR5LmN2c3N2MykgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLmF0dGFja1ZlY3RvcikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoYXR0YWNrVmVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKChfZiA9IHZ1bG5lcmFiaWxpdHkuY3Zzc3YzKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2YuY29uZmlkZW50aWFsSW1wYWN0KSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb25maWRlbnRpYWxJbXBhY3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoKF9nID0gdnVsbmVyYWJpbGl0eS5jdnNzdjMpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5pbnRlZ3JpdHlJbXBhY3QpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGludGVncml0eUltcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoX2ggPSB2dWxuZXJhYmlsaXR5LmN2c3N2MykgPT09IG51bGwgfHwgX2ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9oLmF2YWlsYWJpbGl0eUltcGFjdCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoYXZhaWxhYmlsaXR5SW1wYWN0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKChfaiA9IHZ1bG5lcmFiaWxpdHkucmVmZXJlbmNlcykgPT09IG51bGwgfHwgX2ogPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9qLmxlbmd0aCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3Qgc3Ryb25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0cm9uZ1wiKTtcbiAgICAgICAgICAgIHN0cm9uZy50ZXh0Q29udGVudCA9IFwiUmVmZXJlbmNlczpcIjtcbiAgICAgICAgICAgIHJlZmVyZW5jZXMuYXBwZW5kQ2hpbGQoc3Ryb25nKTtcbiAgICAgICAgICAgIChfayA9IHZ1bG5lcmFiaWxpdHkucmVmZXJlbmNlcykgPT09IG51bGwgfHwgX2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9rLmZvckVhY2goKHJlZmVyZW5jZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICAgICAgICAgIGEuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCByZWZlcmVuY2UudXJsKTtcbiAgICAgICAgICAgICAgICBhLnRleHRDb250ZW50ID0gcmVmZXJlbmNlLnVybDtcbiAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobGkuYXBwZW5kQ2hpbGQoYSkpO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZXMuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQocmVmZXJlbmNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgbGkuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgI2RkZFwiO1xuICAgICAgICBsaS5zdHlsZS5wYWRkaW5nID0gXCIxMHB4XCI7XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9KTtcbiAgICB2dWxuZXJhYmlsaXRpZXMuYXBwZW5kQ2hpbGQodWwpO1xuICAgIGlzc3VlU2VjdGlvbi5hcHBlbmRDaGlsZCh2dWxuZXJhYmlsaXRpZXMpO1xufTtcbmZ1bmN0aW9uIGdldENsZWFuZWRBdHRhY2tWZWN0b3IoYXR0YWNrVmVjdG9yKSB7XG4gICAgaWYgKGF0dGFja1ZlY3RvciA9PT0gXCJOXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiTkVUV09SS1wiO1xuICAgIH1cbiAgICBpZiAoYXR0YWNrVmVjdG9yID09PSBcIkxcIikge1xuICAgICAgICByZXR1cm4gXCJMT0NBTFwiO1xuICAgIH1cbiAgICByZXR1cm4gYXR0YWNrVmVjdG9yO1xufVxuZnVuY3Rpb24gZ2V0Q2xlYW5lZEltcGFjdChpbXBhY3QpIHtcbiAgICBpZiAoaW1wYWN0ID09PSBcIk5cIikge1xuICAgICAgICByZXR1cm4gXCJOT05FXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGltcGFjdCA9PT0gXCJIXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiSElHSFwiO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbXBhY3QgPT09IFwiTFwiKSB7XG4gICAgICAgIHJldHVybiBcIkxPV1wiO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbXBhY3QgPT09IFwiTVwiKSB7XG4gICAgICAgIHJldHVybiBcIk1FRElVTVwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGltcGFjdDtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gdm9pZCAwO1xuY2xhc3MgRmlsdGVyTGFuZ3VhZ2VCdXR0b25zIHtcbiAgICBjb25zdHJ1Y3RvcihsYW5ndWFnZUxpc3RDb250YWluZXIsIGFsbExhbmd1YWdlc1dpdGhDb3VudCwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSB7XG4gICAgICAgIHRoaXMuc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsO1xuICAgICAgICBhbGxMYW5ndWFnZXNXaXRoQ291bnQuZm9yRWFjaCgobGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkTGFuZ3VhZ2VzID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldExhbmd1YWdlcygpO1xuICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2VMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIklOUFVUXCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uY2xhc3NMaXN0LmFkZChcImNoZWNrYm94XCIpO1xuICAgICAgICAgICAgY2hlY2tib3hCdXR0b24uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGFuZ3VhZ2Uua2V5fWApO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMYWJlbC50ZXh0Q29udGVudCA9IGAke2xhbmd1YWdlLmtleX0gKHgke2xhbmd1YWdlLnZhbHVlfSlgO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgYCR7bGFuZ3VhZ2Uua2V5fWApO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkTGFuZ3VhZ2VzLmluY2x1ZGVzKGxhbmd1YWdlLmtleSkpIHtcbiAgICAgICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICBjaGVja2JveEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94QnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveEJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoXCJjaGVja2VkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRMYW5ndWFnZXMoW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldExhbmd1YWdlcygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2Uua2V5LFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRMYW5ndWFnZXMoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZ2V0TGFuZ3VhZ2VzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGxhbmcpID0+IGxhbmcgIT09IGxhbmd1YWdlLmtleSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcigxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFuZ3VhZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3hCdXR0b24pO1xuICAgICAgICAgICAgbGFuZ3VhZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQobGFuZ3VhZ2VMYWJlbCk7XG4gICAgICAgICAgICBsYW5ndWFnZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwibGFuZ3VhZ2UtbWFyZ2luXCIpO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMaXN0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJsYW5ndWFnZS1saXN0XCIpO1xuICAgICAgICAgICAgbGFuZ3VhZ2VMaXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGxhbmd1YWdlQ29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWx0ZXJMYW5ndWFnZUJ1dHRvbnMgPSBGaWx0ZXJMYW5ndWFnZUJ1dHRvbnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVuZGVyUGFnaW5hdGlvbiA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4uL2NvbnN0YW50c1wiKTtcbmNvbnN0IHJlbmRlclBhZ2luYXRpb24gPSAocGFnaW5hdGlvbkNvbnRhaW5lciwgdG90YWxJdGVtcywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSA9PiB7XG4gICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbCh0b3RhbEl0ZW1zIC8gY29uc3RhbnRzXzEuSVRFTVNfUEVSX1BBR0UpO1xuICAgIHBhZ2luYXRpb25Db250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBjb25zdCBwcmV2QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA9PT0gMSkge1xuICAgICAgICBwcmV2QnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgcHJldkJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgIHByZXZCdXR0b24udGV4dENvbnRlbnQgPSBcIlByZXZpb3VzXCI7XG4gICAgcHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA+IDEpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgLSAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgaWYgKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgPT0gdG90YWxQYWdlcykge1xuICAgICAgICBuZXh0QnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcIk5vbmVcIjtcbiAgICB9XG4gICAgbmV4dEJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgIG5leHRCdXR0b24udGV4dENvbnRlbnQgPSBcIk5leHRcIjtcbiAgICBuZXh0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpIDwgdG90YWxQYWdlcykge1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSArIDEpO1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBwYWdpbmF0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKHByZXZCdXR0b24pO1xuICAgIGNvbnN0IGluaXRpYWxQYWdlQ291bnQgPSA1O1xuICAgIGNvbnN0IHN0YXJ0UGFnZSA9IE1hdGgubWF4KDEsIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgLSBNYXRoLmZsb29yKGluaXRpYWxQYWdlQ291bnQgLyAyKSk7XG4gICAgY29uc3QgZW5kUGFnZSA9IE1hdGgubWluKHRvdGFsUGFnZXMsIHN0YXJ0UGFnZSArIGluaXRpYWxQYWdlQ291bnQgLSAxKTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuICAgICAgICBjb25zdCBwYWdlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgaWYgKHRvdGFsUGFnZXMgPT0gMSkge1xuICAgICAgICAgICAgcGFnZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICAgICAgcGFnZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgICAgICBwYWdlQnV0dG9uLnRleHRDb250ZW50ID0gaSArIFwiXCI7XG4gICAgICAgIHBhZ2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGkpO1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldFBhZ2VOdW1iZXIoaSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaSA9PT0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSkge1xuICAgICAgICAgICAgcGFnZUJ1dHRvbi5zdHlsZS5jb2xvciA9IFwid2hpdGVcIjtcbiAgICAgICAgICAgIHBhZ2VCdXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzBlMzI1MlwiO1xuICAgICAgICB9XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQocGFnZUJ1dHRvbik7XG4gICAgfVxuICAgIGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuICAgICAgICBjb25zdCBlbGxpcHNpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBlbGxpcHNpcy50ZXh0Q29udGVudCA9IFwiLi4uXCI7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQoZWxsaXBzaXMpO1xuICAgICAgICBjb25zdCBtb3JlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgbW9yZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgICAgICBtb3JlQnV0dG9uLnRleHRDb250ZW50ID0gXCJNb3JlXCI7XG4gICAgICAgIG1vcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGVuZFBhZ2UgKyAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGVuZFBhZ2UgKyAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobW9yZUJ1dHRvbik7XG4gICAgfVxuICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobmV4dEJ1dHRvbik7XG59O1xuZXhwb3J0cy5yZW5kZXJQYWdpbmF0aW9uID0gcmVuZGVyUGFnaW5hdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSB2b2lkIDA7XG5jbGFzcyBTZWN1cml0eUlzc3Vlc0hhc2hVcmwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNldmVyaXR5ID0gW107XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VzID0gW107XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGFGcm9tVXJsKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgICAgICAgdGhpcy5wYWdlTnVtYmVyID0gZGF0YS5wYWdlTnVtYmVyO1xuICAgICAgICB0aGlzLnNldmVyaXR5ID0gZGF0YS5pbXBhY3RzO1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IGRhdGEubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRTdGF0ZUFzVXJsKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZShcIiNcIiwgXCJcIik7XG4gICAgfVxuICAgIHVwZGF0ZVVybCgpIHtcbiAgICAgICAgY29uc3QgaGFzaEFycmF5ID0gW107XG4gICAgICAgIGlmICh0aGlzLnNldmVyaXR5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhc2hBcnJheS5wdXNoKGBpbXBhY3Q9JHt0aGlzLnNldmVyaXR5LmpvaW4oXCIsXCIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhbmd1YWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYXNoQXJyYXkucHVzaChgbGFuZ3VhZ2U9JHt0aGlzLmxhbmd1YWdlcy5qb2luKFwiLFwiKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNoQXJyYXkucHVzaChgcGFnZT0ke3RoaXMucGFnZU51bWJlcn1gKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoQXJyYXkuam9pbihcIiZcIik7XG4gICAgfVxuICAgIHNldFNldmVyaXR5KGltcGFjdHMpIHtcbiAgICAgICAgdGhpcy5zZXZlcml0eSA9IGltcGFjdHM7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIHNldExhbmd1YWdlcyhsYW5ndWFnZXMpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSBsYW5ndWFnZXM7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIHNldFBhZ2VOdW1iZXIocGFnZU51bWJlcikge1xuICAgICAgICB0aGlzLnBhZ2VOdW1iZXIgPSBwYWdlTnVtYmVyO1xuICAgICAgICB0aGlzLnVwZGF0ZVVybCgpO1xuICAgIH1cbiAgICBnZXREYXRhRnJvbVVybChoYXNoKSB7XG4gICAgICAgIGNvbnN0IGhhc2hBcnJheSA9IGhhc2gucmVwbGFjZShcIiNcIiwgXCJcIikuc3BsaXQoXCImXCIpO1xuICAgICAgICBjb25zdCBzZXZlcml0eSA9IFtdO1xuICAgICAgICBjb25zdCBsYW5ndWFnZXMgPSBbXTtcbiAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICBoYXNoQXJyYXkuZm9yRWFjaCgoaGFzaEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGhhc2hJdGVtLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwic2V2ZXJpdHlcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlQXJyYXkgPSB2YWx1ZS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgdmFsdWVBcnJheS5mb3JFYWNoKCh2YWx1ZUl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V2ZXJpdHkucHVzaCh2YWx1ZUl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImxhbmd1YWdlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaCgodmFsdWVJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlcy5wdXNoKHZhbHVlSXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IFwicGFnZVwiKSB7XG4gICAgICAgICAgICAgICAgcGFnZU51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBpbXBhY3RzOiBzZXZlcml0eSwgbGFuZ3VhZ2VzLCBwYWdlTnVtYmVyIH07XG4gICAgfVxuICAgIGdldFNldmVyaXR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXZlcml0eTtcbiAgICB9XG4gICAgZ2V0TGFuZ3VhZ2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYW5ndWFnZXM7XG4gICAgfVxuICAgIGdldFBhZ2VOdW1iZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhZ2VOdW1iZXI7XG4gICAgfVxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXZlcml0eTogdGhpcy5zZXZlcml0eSxcbiAgICAgICAgICAgIGxhbmd1YWdlczogdGhpcy5sYW5ndWFnZXMsXG4gICAgICAgICAgICBwYWdlTnVtYmVyOiB0aGlzLnBhZ2VOdW1iZXIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlQXNVcmwoKSA9PT0gXCJcIjtcbiAgICB9XG59XG5leHBvcnRzLlNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IFNlY3VyaXR5SXNzdWVzSGFzaFVybDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==