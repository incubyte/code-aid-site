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
exports.getSecurityIssuesMetadata = exports.getIssuesWithLanguageLabel = exports.getSecurityIssues = exports.filterIssues = void 0;
const filterIssues = (results, impacts, languages) => {
    impacts = impacts.map((impact) => impact.toUpperCase());
    return results.filter((obj) => languages.includes(obj.language) &&
        impacts.includes(obj.extra.metadata.impact));
};
exports.filterIssues = filterIssues;
const getSecurityIssues = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("./scan_results.json");
    const data = yield res.json();
    return data.results;
});
exports.getSecurityIssues = getSecurityIssues;
const getIssuesWithLanguageLabel = (results) => {
    return results.map((result) => {
        var _a;
        const language = (_a = result.path.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".").pop();
        return Object.assign(Object.assign({}, result), { language: language ? language : "" });
    });
};
exports.getIssuesWithLanguageLabel = getIssuesWithLanguageLabel;
const getSecurityIssuesMetadata = (results) => {
    const allLanguages = [];
    results.forEach((result) => {
        if (!allLanguages.includes(result.language)) {
            allLanguages.push(result.language);
        }
    });
    return { allImpacts: ["LOW", "MEDIUM", "HIGH"], allLanguages };
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
const filter_buttons_1 = __webpack_require__(/*! ./render/filter-buttons */ "./src/render/filter-buttons.ts");
const issues_1 = __webpack_require__(/*! ./render/issues */ "./src/render/issues.ts");
const pagination_1 = __webpack_require__(/*! ./render/pagination */ "./src/render/pagination.ts");
const security_issue_hash_1 = __webpack_require__(/*! ./security-issue-hash */ "./src/security-issue-hash.ts");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1. fetch JSON data
    const results = yield (0, data_handler_1.getSecurityIssues)();
    const resultsWithLanguages = (0, data_handler_1.getIssuesWithLanguageLabel)(results);
    const { allImpacts, allLanguages } = (0, data_handler_1.getSecurityIssuesMetadata)(resultsWithLanguages);
    // 1. analyse the current browser URL (hash)
    const securityIssuesHashUrl = new security_issue_hash_1.SecurityIssuesHashUrl();
    if (securityIssuesHashUrl.isEmpty()) {
        securityIssuesHashUrl.setImpacts(allImpacts);
        securityIssuesHashUrl.setLanguages(allLanguages);
    }
    const { impacts, languages, pageNumber } = securityIssuesHashUrl.getData();
    // 4. filter JSON data using global configuration
    const filteredResults = (0, data_handler_1.filterIssues)(resultsWithLanguages, impacts, languages);
    // 5. render the buttons and pagination UI
    const filterImpactButtons = new filter_buttons_1.FilterImpactButtons(document.getElementById("filter-impact-buttons"), allImpacts, securityIssuesHashUrl);
    const filterLanguageButtons = new filter_buttons_1.FilterLanguageButtons(document.getElementById("filter-language-buttons"), allLanguages, securityIssuesHashUrl);
    // 6. render the filtered data into HTML
    (0, issues_1.renderIssues)(document.getElementById("container"), securityIssuesHashUrl, filteredResults);
    (0, pagination_1.renderPagination)(document.getElementById("pagination"), filteredResults.length, securityIssuesHashUrl);
    // 7. listen to hash change event
    window.addEventListener("hashchange", () => {
        const filteredResults = (0, data_handler_1.filterIssues)(resultsWithLanguages, securityIssuesHashUrl.getImpacts(), securityIssuesHashUrl.getLanguages());
        (0, issues_1.renderIssues)(document.getElementById("container"), securityIssuesHashUrl, filteredResults);
        (0, pagination_1.renderPagination)(document.getElementById("pagination"), filteredResults.length, securityIssuesHashUrl);
    });
});
main();


/***/ }),

/***/ "./src/render/filter-buttons.ts":
/*!**************************************!*\
  !*** ./src/render/filter-buttons.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilterLanguageButtons = exports.FilterImpactButtons = void 0;
class FilterImpactButtons {
    constructor(impactButtonsContainer, allImpacts, securityIssuesHashUrl) {
        this.impactButtonsContainer = impactButtonsContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        allImpacts.forEach((impact) => {
            const selectedImpacts = securityIssuesHashUrl.getImpacts();
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.classList.add(`${impact.toLocaleLowerCase()}-button`);
            filterButton.textContent = `${impact}`;
            if (selectedImpacts.includes(impact)) {
                filterButton.classList.add("selected");
            }
            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    securityIssuesHashUrl.setImpacts([
                        ...securityIssuesHashUrl.getImpacts(),
                        impact,
                    ]);
                }
                else {
                    securityIssuesHashUrl.setImpacts(securityIssuesHashUrl.getImpacts().filter((imp) => imp !== impact));
                }
                securityIssuesHashUrl.setPageNumber(1);
            });
            impactButtonsContainer.appendChild(filterButton);
        });
    }
}
exports.FilterImpactButtons = FilterImpactButtons;
class FilterLanguageButtons {
    constructor(languageButtonsContainer, allLanguages, securityIssuesHashUrl) {
        this.languageButtonsContainer = languageButtonsContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        allLanguages.forEach((language) => {
            const selectedLanguages = securityIssuesHashUrl.getLanguages();
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.textContent = `${language}`;
            if (selectedLanguages.includes(language)) {
                filterButton.classList.add("selected");
            }
            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    securityIssuesHashUrl.setLanguages([
                        ...securityIssuesHashUrl.getLanguages(),
                        language,
                    ]);
                }
                else {
                    securityIssuesHashUrl.setLanguages(securityIssuesHashUrl
                        .getLanguages()
                        .filter((lang) => lang !== language));
                }
                securityIssuesHashUrl.setPageNumber(1);
            });
            languageButtonsContainer.appendChild(filterButton);
        });
    }
}
exports.FilterLanguageButtons = FilterLanguageButtons;


/***/ }),

/***/ "./src/render/impact-color.ts":
/*!************************************!*\
  !*** ./src/render/impact-color.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getImpactColor = void 0;
const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");
function getImpactColor(impact) {
    let color = "";
    if (impact === types_1.Impact.HIGH) {
        color = "#ff4500";
    }
    else if (impact === types_1.Impact.MEDIUM) {
        color = "#ff6600";
    }
    else {
        color = "#008a45";
    }
    return color;
}
exports.getImpactColor = getImpactColor;


/***/ }),

/***/ "./src/render/issues.ts":
/*!******************************!*\
  !*** ./src/render/issues.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderIssues = void 0;
const constants_1 = __webpack_require__(/*! ../constants */ "./src/constants.ts");
const impact_color_1 = __webpack_require__(/*! ./impact-color */ "./src/render/impact-color.ts");
const renderIssues = (container, securityIssuesHashUrl, issues) => {
    container.innerHTML = "";
    const startIndex = (securityIssuesHashUrl.getPageNumber() - 1) * constants_1.ITEMS_PER_PAGE;
    const endIndex = startIndex + constants_1.ITEMS_PER_PAGE;
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
exports.renderIssues = renderIssues;
function createAccordionHeader(issue, index) {
    const header = document.createElement("div");
    header.classList.add("accordion-header");
    header.innerHTML = `<strong>Path:</strong> ${issue.path}`;
    header.addEventListener("click", () => toggleAccordionContent(index));
    header.style.borderLeft = `5px solid ${(0, impact_color_1.getImpactColor)(issue.extra.metadata.impact)}`;
    return header;
}
function createAccordionContent(issue) {
    const content = document.createElement("div");
    content.classList.add("accordion-content");
    content.classList.add("active");
    const ul = createUnorderedList([
        `CWE| ${issue.extra.metadata.cwe}`,
        `Message| ${issue.extra.message}`,
        `OWASP| ${issue.extra.metadata.owasp}`,
        `Code| ${issue.extra.lines}`,
    ]);
    content.style.borderLeft = `5px solid ${(0, impact_color_1.getImpactColor)(issue.extra.metadata.impact)}`;
    appendChildren(content, [ul]);
    return content;
}
function toggleAccordionContent(index) {
    const content = document.querySelectorAll(".accordion-content")[index];
    content.classList.toggle("active");
}
function createUnorderedList(items) {
    const ul = document.createElement("ul");
    items.forEach((item) => {
        const li = document.createElement("li");
        const parts = item.split("|");
        if (parts.length === 2) {
            li.innerHTML = `<strong>${parts[0]}:</strong> ${parts[1]}<br/>`;
        }
        else {
            console.log(parts);
            li.textContent = item;
        }
        ul.appendChild(li);
    });
    return ul;
}
function appendChildren(parent, children) {
    children.forEach((child) => parent.appendChild(child));
}


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
        paginationContainer.style.display = "flex";
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
        this.impacts = [];
        this.languages = [];
        const data = this.getDataFromUrl(window.location.hash);
        this.pageNumber = data.pageNumber;
        this.impacts = data.impacts;
        this.languages = data.languages;
    }
    getStateAsUrl() {
        return window.location.hash.replace("#", "");
    }
    updateUrl() {
        const hashArray = [];
        if (this.impacts.length > 0) {
            hashArray.push(`impact=${this.impacts.join(",")}`);
        }
        if (this.languages.length > 0) {
            hashArray.push(`language=${this.languages.join(",")}`);
        }
        hashArray.push(`page=${this.pageNumber}`);
        window.location.hash = hashArray.join("&");
    }
    setImpacts(impacts) {
        this.impacts = impacts;
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
        const impacts = [];
        const languages = [];
        let pageNumber = 1;
        hashArray.forEach((hashItem) => {
            const [key, value] = hashItem.split("=");
            if (key === "impact") {
                const valueArray = value.split(",");
                valueArray.forEach((valueItem) => {
                    impacts.push(valueItem);
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
        return { impacts, languages, pageNumber };
    }
    getImpacts() {
        return this.impacts;
    }
    getLanguages() {
        return this.languages;
    }
    getPageNumber() {
        return this.pageNumber;
    }
    getData() {
        return {
            impacts: this.impacts,
            languages: this.languages,
            pageNumber: this.pageNumber,
        };
    }
    isEmpty() {
        return this.getStateAsUrl() === "";
    }
}
exports.SecurityIssuesHashUrl = SecurityIssuesHashUrl;


/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Impact = void 0;
var Impact;
(function (Impact) {
    Impact["HIGH"] = "HIGH";
    Impact["MEDIUM"] = "MEDIUM";
    Impact["LOW"] = "LOW";
})(Impact || (exports.Impact = Impact = {}));


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0Esd0JBQXdCOzs7Ozs7Ozs7OztBQ3BFWDtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHVCQUF1QjtBQUM1RDtBQUNBO0FBQ0EsdUNBQXVDLHlCQUF5QjtBQUNoRTtBQUNBLCtCQUErQixnQkFBZ0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCOzs7Ozs7Ozs7OztBQ25GaEI7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGFBQWEsY0FBYyxjQUFjOzs7Ozs7O1VDUjFDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9kYXRhLWhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9yZW5kZXIvZmlsdGVyLWJ1dHRvbnMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9pbXBhY3QtY29sb3IudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9pc3N1ZXMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9wYWdpbmF0aW9uLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9zZWN1cml0eS1pc3N1ZS1oYXNoLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy90eXBlcy50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JVEVNU19QRVJfUEFHRSA9IHZvaWQgMDtcbmV4cG9ydHMuSVRFTVNfUEVSX1BBR0UgPSAxMDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEgPSBleHBvcnRzLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gZXhwb3J0cy5nZXRTZWN1cml0eUlzc3VlcyA9IGV4cG9ydHMuZmlsdGVySXNzdWVzID0gdm9pZCAwO1xuY29uc3QgZmlsdGVySXNzdWVzID0gKHJlc3VsdHMsIGltcGFjdHMsIGxhbmd1YWdlcykgPT4ge1xuICAgIGltcGFjdHMgPSBpbXBhY3RzLm1hcCgoaW1wYWN0KSA9PiBpbXBhY3QudG9VcHBlckNhc2UoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHMuZmlsdGVyKChvYmopID0+IGxhbmd1YWdlcy5pbmNsdWRlcyhvYmoubGFuZ3VhZ2UpICYmXG4gICAgICAgIGltcGFjdHMuaW5jbHVkZXMob2JqLmV4dHJhLm1ldGFkYXRhLmltcGFjdCkpO1xufTtcbmV4cG9ydHMuZmlsdGVySXNzdWVzID0gZmlsdGVySXNzdWVzO1xuY29uc3QgZ2V0U2VjdXJpdHlJc3N1ZXMgPSAoKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICBjb25zdCByZXMgPSB5aWVsZCBmZXRjaChcIi4vc2Nhbl9yZXN1bHRzLmpzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IHlpZWxkIHJlcy5qc29uKCk7XG4gICAgcmV0dXJuIGRhdGEucmVzdWx0cztcbn0pO1xuZXhwb3J0cy5nZXRTZWN1cml0eUlzc3VlcyA9IGdldFNlY3VyaXR5SXNzdWVzO1xuY29uc3QgZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWwgPSAocmVzdWx0cykgPT4ge1xuICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSAoX2EgPSByZXN1bHQucGF0aC5zcGxpdChcIi9cIikucG9wKCkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zcGxpdChcIi5cIikucG9wKCk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdCksIHsgbGFuZ3VhZ2U6IGxhbmd1YWdlID8gbGFuZ3VhZ2UgOiBcIlwiIH0pO1xuICAgIH0pO1xufTtcbmV4cG9ydHMuZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWwgPSBnZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbDtcbmNvbnN0IGdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEgPSAocmVzdWx0cykgPT4ge1xuICAgIGNvbnN0IGFsbExhbmd1YWdlcyA9IFtdO1xuICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgIGlmICghYWxsTGFuZ3VhZ2VzLmluY2x1ZGVzKHJlc3VsdC5sYW5ndWFnZSkpIHtcbiAgICAgICAgICAgIGFsbExhbmd1YWdlcy5wdXNoKHJlc3VsdC5sYW5ndWFnZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4geyBhbGxJbXBhY3RzOiBbXCJMT1dcIiwgXCJNRURJVU1cIiwgXCJISUdIXCJdLCBhbGxMYW5ndWFnZXMgfTtcbn07XG5leHBvcnRzLmdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEgPSBnZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGRhdGFfaGFuZGxlcl8xID0gcmVxdWlyZShcIi4vZGF0YS1oYW5kbGVyXCIpO1xuY29uc3QgZmlsdGVyX2J1dHRvbnNfMSA9IHJlcXVpcmUoXCIuL3JlbmRlci9maWx0ZXItYnV0dG9uc1wiKTtcbmNvbnN0IGlzc3Vlc18xID0gcmVxdWlyZShcIi4vcmVuZGVyL2lzc3Vlc1wiKTtcbmNvbnN0IHBhZ2luYXRpb25fMSA9IHJlcXVpcmUoXCIuL3JlbmRlci9wYWdpbmF0aW9uXCIpO1xuY29uc3Qgc2VjdXJpdHlfaXNzdWVfaGFzaF8xID0gcmVxdWlyZShcIi4vc2VjdXJpdHktaXNzdWUtaGFzaFwiKTtcbmNvbnN0IG1haW4gPSAoKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAvLyAxLiBmZXRjaCBKU09OIGRhdGFcbiAgICBjb25zdCByZXN1bHRzID0geWllbGQgKDAsIGRhdGFfaGFuZGxlcl8xLmdldFNlY3VyaXR5SXNzdWVzKSgpO1xuICAgIGNvbnN0IHJlc3VsdHNXaXRoTGFuZ3VhZ2VzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsKShyZXN1bHRzKTtcbiAgICBjb25zdCB7IGFsbEltcGFjdHMsIGFsbExhbmd1YWdlcyB9ID0gKDAsIGRhdGFfaGFuZGxlcl8xLmdldFNlY3VyaXR5SXNzdWVzTWV0YWRhdGEpKHJlc3VsdHNXaXRoTGFuZ3VhZ2VzKTtcbiAgICAvLyAxLiBhbmFseXNlIHRoZSBjdXJyZW50IGJyb3dzZXIgVVJMIChoYXNoKVxuICAgIGNvbnN0IHNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IG5ldyBzZWN1cml0eV9pc3N1ZV9oYXNoXzEuU2VjdXJpdHlJc3N1ZXNIYXNoVXJsKCk7XG4gICAgaWYgKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5pc0VtcHR5KCkpIHtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldEltcGFjdHMoYWxsSW1wYWN0cyk7XG4gICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRMYW5ndWFnZXMoYWxsTGFuZ3VhZ2VzKTtcbiAgICB9XG4gICAgY29uc3QgeyBpbXBhY3RzLCBsYW5ndWFnZXMsIHBhZ2VOdW1iZXIgfSA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXREYXRhKCk7XG4gICAgLy8gNC4gZmlsdGVyIEpTT04gZGF0YSB1c2luZyBnbG9iYWwgY29uZmlndXJhdGlvblxuICAgIGNvbnN0IGZpbHRlcmVkUmVzdWx0cyA9ICgwLCBkYXRhX2hhbmRsZXJfMS5maWx0ZXJJc3N1ZXMpKHJlc3VsdHNXaXRoTGFuZ3VhZ2VzLCBpbXBhY3RzLCBsYW5ndWFnZXMpO1xuICAgIC8vIDUuIHJlbmRlciB0aGUgYnV0dG9ucyBhbmQgcGFnaW5hdGlvbiBVSVxuICAgIGNvbnN0IGZpbHRlckltcGFjdEJ1dHRvbnMgPSBuZXcgZmlsdGVyX2J1dHRvbnNfMS5GaWx0ZXJJbXBhY3RCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyLWltcGFjdC1idXR0b25zXCIpLCBhbGxJbXBhY3RzLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIGNvbnN0IGZpbHRlckxhbmd1YWdlQnV0dG9ucyA9IG5ldyBmaWx0ZXJfYnV0dG9uc18xLkZpbHRlckxhbmd1YWdlQnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlci1sYW5ndWFnZS1idXR0b25zXCIpLCBhbGxMYW5ndWFnZXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgLy8gNi4gcmVuZGVyIHRoZSBmaWx0ZXJlZCBkYXRhIGludG8gSFRNTFxuICAgICgwLCBpc3N1ZXNfMS5yZW5kZXJJc3N1ZXMpKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGFpbmVyXCIpLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwsIGZpbHRlcmVkUmVzdWx0cyk7XG4gICAgKDAsIHBhZ2luYXRpb25fMS5yZW5kZXJQYWdpbmF0aW9uKShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhZ2luYXRpb25cIiksIGZpbHRlcmVkUmVzdWx0cy5sZW5ndGgsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgLy8gNy4gbGlzdGVuIHRvIGhhc2ggY2hhbmdlIGV2ZW50XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmZpbHRlcklzc3VlcykocmVzdWx0c1dpdGhMYW5ndWFnZXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRJbXBhY3RzKCksIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRMYW5ndWFnZXMoKSk7XG4gICAgICAgICgwLCBpc3N1ZXNfMS5yZW5kZXJJc3N1ZXMpKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGFpbmVyXCIpLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwsIGZpbHRlcmVkUmVzdWx0cyk7XG4gICAgICAgICgwLCBwYWdpbmF0aW9uXzEucmVuZGVyUGFnaW5hdGlvbikoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYWdpbmF0aW9uXCIpLCBmaWx0ZXJlZFJlc3VsdHMubGVuZ3RoLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwpO1xuICAgIH0pO1xufSk7XG5tYWluKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gZXhwb3J0cy5GaWx0ZXJJbXBhY3RCdXR0b25zID0gdm9pZCAwO1xuY2xhc3MgRmlsdGVySW1wYWN0QnV0dG9ucyB7XG4gICAgY29uc3RydWN0b3IoaW1wYWN0QnV0dG9uc0NvbnRhaW5lciwgYWxsSW1wYWN0cywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSB7XG4gICAgICAgIHRoaXMuaW1wYWN0QnV0dG9uc0NvbnRhaW5lciA9IGltcGFjdEJ1dHRvbnNDb250YWluZXI7XG4gICAgICAgIHRoaXMuc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsO1xuICAgICAgICBhbGxJbXBhY3RzLmZvckVhY2goKGltcGFjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRJbXBhY3RzID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldEltcGFjdHMoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NOYW1lID0gXCJmaWx0ZXItYnV0dG9uXCI7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmFkZChgJHtpbXBhY3QudG9Mb2NhbGVMb3dlckNhc2UoKX0tYnV0dG9uYCk7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24udGV4dENvbnRlbnQgPSBgJHtpbXBhY3R9YDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZEltcGFjdHMuaW5jbHVkZXMoaW1wYWN0KSkge1xuICAgICAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwic2VsZWN0ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldEltcGFjdHMoW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldEltcGFjdHMoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcGFjdCxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0SW1wYWN0cyhzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0SW1wYWN0cygpLmZpbHRlcigoaW1wKSA9PiBpbXAgIT09IGltcGFjdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcigxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW1wYWN0QnV0dG9uc0NvbnRhaW5lci5hcHBlbmRDaGlsZChmaWx0ZXJCdXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkZpbHRlckltcGFjdEJ1dHRvbnMgPSBGaWx0ZXJJbXBhY3RCdXR0b25zO1xuY2xhc3MgRmlsdGVyTGFuZ3VhZ2VCdXR0b25zIHtcbiAgICBjb25zdHJ1Y3RvcihsYW5ndWFnZUJ1dHRvbnNDb250YWluZXIsIGFsbExhbmd1YWdlcywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSB7XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VCdXR0b25zQ29udGFpbmVyID0gbGFuZ3VhZ2VCdXR0b25zQ29udGFpbmVyO1xuICAgICAgICB0aGlzLnNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybDtcbiAgICAgICAgYWxsTGFuZ3VhZ2VzLmZvckVhY2goKGxhbmd1YWdlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZExhbmd1YWdlcyA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRMYW5ndWFnZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NOYW1lID0gXCJmaWx0ZXItYnV0dG9uXCI7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24udGV4dENvbnRlbnQgPSBgJHtsYW5ndWFnZX1gO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkTGFuZ3VhZ2VzLmluY2x1ZGVzKGxhbmd1YWdlKSkge1xuICAgICAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwic2VsZWN0ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnNldExhbmd1YWdlcyhbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0TGFuZ3VhZ2VzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0TGFuZ3VhZ2VzKHNlY3VyaXR5SXNzdWVzSGFzaFVybFxuICAgICAgICAgICAgICAgICAgICAgICAgLmdldExhbmd1YWdlcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChsYW5nKSA9PiBsYW5nICE9PSBsYW5ndWFnZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcigxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFuZ3VhZ2VCdXR0b25zQ29udGFpbmVyLmFwcGVuZENoaWxkKGZpbHRlckJ1dHRvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gRmlsdGVyTGFuZ3VhZ2VCdXR0b25zO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldEltcGFjdENvbG9yID0gdm9pZCAwO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuLi90eXBlc1wiKTtcbmZ1bmN0aW9uIGdldEltcGFjdENvbG9yKGltcGFjdCkge1xuICAgIGxldCBjb2xvciA9IFwiXCI7XG4gICAgaWYgKGltcGFjdCA9PT0gdHlwZXNfMS5JbXBhY3QuSElHSCkge1xuICAgICAgICBjb2xvciA9IFwiI2ZmNDUwMFwiO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbXBhY3QgPT09IHR5cGVzXzEuSW1wYWN0Lk1FRElVTSkge1xuICAgICAgICBjb2xvciA9IFwiI2ZmNjYwMFwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29sb3IgPSBcIiMwMDhhNDVcIjtcbiAgICB9XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuZXhwb3J0cy5nZXRJbXBhY3RDb2xvciA9IGdldEltcGFjdENvbG9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbmRlcklzc3VlcyA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4uL2NvbnN0YW50c1wiKTtcbmNvbnN0IGltcGFjdF9jb2xvcl8xID0gcmVxdWlyZShcIi4vaW1wYWN0LWNvbG9yXCIpO1xuY29uc3QgcmVuZGVySXNzdWVzID0gKGNvbnRhaW5lciwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLCBpc3N1ZXMpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgLSAxKSAqIGNvbnN0YW50c18xLklURU1TX1BFUl9QQUdFO1xuICAgIGNvbnN0IGVuZEluZGV4ID0gc3RhcnRJbmRleCArIGNvbnN0YW50c18xLklURU1TX1BFUl9QQUdFO1xuICAgIGNvbnN0IGl0ZW1zVG9SZW5kZXIgPSBpc3N1ZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICAgIGl0ZW1zVG9SZW5kZXIuZm9yRWFjaCgoaXNzdWUsIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHNlY3VyaXR5SXNzdWVEYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuY2xhc3NMaXN0LmFkZChcInNlY3VyaXR5LWlzc3VlXCIpO1xuICAgICAgICAvLyBDcmVhdGUgYSBoZWFkZXIgZm9yIHRoZSBhY2NvcmRpb25cbiAgICAgICAgY29uc3QgaGVhZGVyID0gY3JlYXRlQWNjb3JkaW9uSGVhZGVyKGlzc3VlLCBpbmRleCk7XG4gICAgICAgIC8vIENyZWF0ZSBhIGNvbnRlbnQgY29udGFpbmVyIGZvciB0aGUgZGV0YWlsc1xuICAgICAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlQWNjb3JkaW9uQ29udGVudChpc3N1ZSk7XG4gICAgICAgIC8vIEFkZCB0aGUgaGVhZGVyIGFuZCBjb250ZW50IHRvIHRoZSBhY2NvcmRpb25cbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWN1cml0eUlzc3VlRGF0YSk7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5yZW5kZXJJc3N1ZXMgPSByZW5kZXJJc3N1ZXM7XG5mdW5jdGlvbiBjcmVhdGVBY2NvcmRpb25IZWFkZXIoaXNzdWUsIGluZGV4KSB7XG4gICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZChcImFjY29yZGlvbi1oZWFkZXJcIik7XG4gICAgaGVhZGVyLmlubmVySFRNTCA9IGA8c3Ryb25nPlBhdGg6PC9zdHJvbmc+ICR7aXNzdWUucGF0aH1gO1xuICAgIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdG9nZ2xlQWNjb3JkaW9uQ29udGVudChpbmRleCkpO1xuICAgIGhlYWRlci5zdHlsZS5ib3JkZXJMZWZ0ID0gYDVweCBzb2xpZCAkeygwLCBpbXBhY3RfY29sb3JfMS5nZXRJbXBhY3RDb2xvcikoaXNzdWUuZXh0cmEubWV0YWRhdGEuaW1wYWN0KX1gO1xuICAgIHJldHVybiBoZWFkZXI7XG59XG5mdW5jdGlvbiBjcmVhdGVBY2NvcmRpb25Db250ZW50KGlzc3VlKSB7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGVudC5jbGFzc0xpc3QuYWRkKFwiYWNjb3JkaW9uLWNvbnRlbnRcIik7XG4gICAgY29udGVudC5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgIGNvbnN0IHVsID0gY3JlYXRlVW5vcmRlcmVkTGlzdChbXG4gICAgICAgIGBDV0V8ICR7aXNzdWUuZXh0cmEubWV0YWRhdGEuY3dlfWAsXG4gICAgICAgIGBNZXNzYWdlfCAke2lzc3VlLmV4dHJhLm1lc3NhZ2V9YCxcbiAgICAgICAgYE9XQVNQfCAke2lzc3VlLmV4dHJhLm1ldGFkYXRhLm93YXNwfWAsXG4gICAgICAgIGBDb2RlfCAke2lzc3VlLmV4dHJhLmxpbmVzfWAsXG4gICAgXSk7XG4gICAgY29udGVudC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDVweCBzb2xpZCAkeygwLCBpbXBhY3RfY29sb3JfMS5nZXRJbXBhY3RDb2xvcikoaXNzdWUuZXh0cmEubWV0YWRhdGEuaW1wYWN0KX1gO1xuICAgIGFwcGVuZENoaWxkcmVuKGNvbnRlbnQsIFt1bF0pO1xuICAgIHJldHVybiBjb250ZW50O1xufVxuZnVuY3Rpb24gdG9nZ2xlQWNjb3JkaW9uQ29udGVudChpbmRleCkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFjY29yZGlvbi1jb250ZW50XCIpW2luZGV4XTtcbiAgICBjb250ZW50LmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIik7XG59XG5mdW5jdGlvbiBjcmVhdGVVbm9yZGVyZWRMaXN0KGl0ZW1zKSB7XG4gICAgY29uc3QgdWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIik7XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgY29uc3QgcGFydHMgPSBpdGVtLnNwbGl0KFwifFwiKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gYDxzdHJvbmc+JHtwYXJ0c1swXX06PC9zdHJvbmc+ICR7cGFydHNbMV19PGJyLz5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGFydHMpO1xuICAgICAgICAgICAgbGkudGV4dENvbnRlbnQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdWw7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZHJlbihwYXJlbnQsIGNoaWxkcmVuKSB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZCkpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbmRlclBhZ2luYXRpb24gPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuLi9jb25zdGFudHNcIik7XG5jb25zdCByZW5kZXJQYWdpbmF0aW9uID0gKHBhZ2luYXRpb25Db250YWluZXIsIHRvdGFsSXRlbXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCkgPT4ge1xuICAgIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLmNlaWwodG90YWxJdGVtcyAvIGNvbnN0YW50c18xLklURU1TX1BFUl9QQUdFKTtcbiAgICBwYWdpbmF0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgY29uc3QgcHJldkJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgaWYgKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgPT09IDEpIHtcbiAgICAgICAgcHJldkJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuICAgIHByZXZCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICBwcmV2QnV0dG9uLnRleHRDb250ZW50ID0gXCJQcmV2aW91c1wiO1xuICAgIHByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgPiAxKSB7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpIC0gMSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IG5leHRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGlmIChzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpID09IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgbmV4dEJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJOb25lXCI7XG4gICAgfVxuICAgIG5leHRCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICBuZXh0QnV0dG9uLnRleHRDb250ZW50ID0gXCJOZXh0XCI7XG4gICAgbmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLmdldFBhZ2VOdW1iZXIoKSA8IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkgKyAxKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmV2QnV0dG9uKTtcbiAgICBjb25zdCBpbml0aWFsUGFnZUNvdW50ID0gNTtcbiAgICBjb25zdCBzdGFydFBhZ2UgPSBNYXRoLm1heCgxLCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuZ2V0UGFnZU51bWJlcigpIC0gTWF0aC5mbG9vcihpbml0aWFsUGFnZUNvdW50IC8gMikpO1xuICAgIGNvbnN0IGVuZFBhZ2UgPSBNYXRoLm1pbih0b3RhbFBhZ2VzLCBzdGFydFBhZ2UgKyBpbml0aWFsUGFnZUNvdW50IC0gMSk7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0UGFnZTsgaSA8PSBlbmRQYWdlOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGFnZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIGlmICh0b3RhbFBhZ2VzID09IDEpIHtcbiAgICAgICAgICAgIHBhZ2VCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgICAgIHBhZ2VCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICAgICAgcGFnZUJ1dHRvbi50ZXh0Q29udGVudCA9IGkgKyBcIlwiO1xuICAgICAgICBwYWdlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihpKTtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC5zZXRQYWdlTnVtYmVyKGkpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGkgPT09IHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXRQYWdlTnVtYmVyKCkpIHtcbiAgICAgICAgICAgIHBhZ2VCdXR0b24uc3R5bGUuY29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgICAgICBwYWdlQnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcIiMwZTMyNTJcIjtcbiAgICAgICAgfVxuICAgICAgICBwYWdpbmF0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKHBhZ2VCdXR0b24pO1xuICAgIH1cbiAgICBpZiAoZW5kUGFnZSA8IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgY29uc3QgZWxsaXBzaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgZWxsaXBzaXMudGV4dENvbnRlbnQgPSBcIi4uLlwiO1xuICAgICAgICBwYWdpbmF0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKGVsbGlwc2lzKTtcbiAgICAgICAgY29uc3QgbW9yZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIG1vcmVCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICAgICAgbW9yZUJ1dHRvbi50ZXh0Q29udGVudCA9IFwiTW9yZVwiO1xuICAgICAgICBtb3JlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihlbmRQYWdlICsgMSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwuc2V0UGFnZU51bWJlcihlbmRQYWdlICsgMSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdpbmF0aW9uQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChtb3JlQnV0dG9uKTtcbiAgICB9XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChuZXh0QnV0dG9uKTtcbn07XG5leHBvcnRzLnJlbmRlclBhZ2luYXRpb24gPSByZW5kZXJQYWdpbmF0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IHZvaWQgMDtcbmNsYXNzIFNlY3VyaXR5SXNzdWVzSGFzaFVybCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW1wYWN0cyA9IFtdO1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IFtdO1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5nZXREYXRhRnJvbVVybCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgICAgIHRoaXMucGFnZU51bWJlciA9IGRhdGEucGFnZU51bWJlcjtcbiAgICAgICAgdGhpcy5pbXBhY3RzID0gZGF0YS5pbXBhY3RzO1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IGRhdGEubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRTdGF0ZUFzVXJsKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZShcIiNcIiwgXCJcIik7XG4gICAgfVxuICAgIHVwZGF0ZVVybCgpIHtcbiAgICAgICAgY29uc3QgaGFzaEFycmF5ID0gW107XG4gICAgICAgIGlmICh0aGlzLmltcGFjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGFzaEFycmF5LnB1c2goYGltcGFjdD0ke3RoaXMuaW1wYWN0cy5qb2luKFwiLFwiKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sYW5ndWFnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGFzaEFycmF5LnB1c2goYGxhbmd1YWdlPSR7dGhpcy5sYW5ndWFnZXMuam9pbihcIixcIil9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaGFzaEFycmF5LnB1c2goYHBhZ2U9JHt0aGlzLnBhZ2VOdW1iZXJ9YCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaEFycmF5LmpvaW4oXCImXCIpO1xuICAgIH1cbiAgICBzZXRJbXBhY3RzKGltcGFjdHMpIHtcbiAgICAgICAgdGhpcy5pbXBhY3RzID0gaW1wYWN0cztcbiAgICAgICAgdGhpcy51cGRhdGVVcmwoKTtcbiAgICB9XG4gICAgc2V0TGFuZ3VhZ2VzKGxhbmd1YWdlcykge1xuICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IGxhbmd1YWdlcztcbiAgICAgICAgdGhpcy51cGRhdGVVcmwoKTtcbiAgICB9XG4gICAgc2V0UGFnZU51bWJlcihwYWdlTnVtYmVyKSB7XG4gICAgICAgIHRoaXMucGFnZU51bWJlciA9IHBhZ2VOdW1iZXI7XG4gICAgICAgIHRoaXMudXBkYXRlVXJsKCk7XG4gICAgfVxuICAgIGdldERhdGFGcm9tVXJsKGhhc2gpIHtcbiAgICAgICAgY29uc3QgaGFzaEFycmF5ID0gaGFzaC5yZXBsYWNlKFwiI1wiLCBcIlwiKS5zcGxpdChcIiZcIik7XG4gICAgICAgIGNvbnN0IGltcGFjdHMgPSBbXTtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2VzID0gW107XG4gICAgICAgIGxldCBwYWdlTnVtYmVyID0gMTtcbiAgICAgICAgaGFzaEFycmF5LmZvckVhY2goKGhhc2hJdGVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBoYXNoSXRlbS5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcImltcGFjdFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVBcnJheSA9IHZhbHVlLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICB2YWx1ZUFycmF5LmZvckVhY2goKHZhbHVlSXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbXBhY3RzLnB1c2godmFsdWVJdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gXCJsYW5ndWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVBcnJheSA9IHZhbHVlLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICB2YWx1ZUFycmF5LmZvckVhY2goKHZhbHVlSXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZXMucHVzaCh2YWx1ZUl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcInBhZ2VcIikge1xuICAgICAgICAgICAgICAgIHBhZ2VOdW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHsgaW1wYWN0cywgbGFuZ3VhZ2VzLCBwYWdlTnVtYmVyIH07XG4gICAgfVxuICAgIGdldEltcGFjdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltcGFjdHM7XG4gICAgfVxuICAgIGdldExhbmd1YWdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRQYWdlTnVtYmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYWdlTnVtYmVyO1xuICAgIH1cbiAgICBnZXREYXRhKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW1wYWN0czogdGhpcy5pbXBhY3RzLFxuICAgICAgICAgICAgbGFuZ3VhZ2VzOiB0aGlzLmxhbmd1YWdlcyxcbiAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHRoaXMucGFnZU51bWJlcixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGVBc1VybCgpID09PSBcIlwiO1xuICAgIH1cbn1cbmV4cG9ydHMuU2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gU2VjdXJpdHlJc3N1ZXNIYXNoVXJsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkltcGFjdCA9IHZvaWQgMDtcbnZhciBJbXBhY3Q7XG4oZnVuY3Rpb24gKEltcGFjdCkge1xuICAgIEltcGFjdFtcIkhJR0hcIl0gPSBcIkhJR0hcIjtcbiAgICBJbXBhY3RbXCJNRURJVU1cIl0gPSBcIk1FRElVTVwiO1xuICAgIEltcGFjdFtcIkxPV1wiXSA9IFwiTE9XXCI7XG59KShJbXBhY3QgfHwgKGV4cG9ydHMuSW1wYWN0ID0gSW1wYWN0ID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==