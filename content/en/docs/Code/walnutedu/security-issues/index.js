/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/contants.ts":
/*!*************************!*\
  !*** ./src/contants.ts ***!
  \*************************/
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
    return results.filter((obj) => languages.includes(obj.language) && impacts.includes(obj.extra.metadata.impact));
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
const state_1 = __webpack_require__(/*! ./state */ "./src/state.ts");
// global data layer
// URL layer
// HTML layer
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1. analyse the current browser URL (hash)
    const securityIssuesHashUrl = new security_issue_hash_1.SecurityIssuesHashUrl(window.location.hash);
    const { impacts, languages, pageNumber } = securityIssuesHashUrl.getData();
    // 3. assign data to global state configuration
    const globalState = new state_1.GlobalState(impacts, languages, pageNumber);
    // 4. fetch JSON data and filter data using global configuration
    const results = yield (0, data_handler_1.getSecurityIssues)();
    const resultsWithLanguages = (0, data_handler_1.getIssuesWithLanguageLabel)(results);
    const { allImpacts, allLanguages } = (0, data_handler_1.getSecurityIssuesMetadata)(resultsWithLanguages);
    const filteredResults = (0, data_handler_1.filterIssues)(resultsWithLanguages, globalState.getImpacts(), globalState.getLanguages());
    // 5. render the buttons and pagination UI
    const filterImpactButtons = new filter_buttons_1.FilterImpactButtons(document.getElementById("filter-impact-buttons"), allImpacts, securityIssuesHashUrl, globalState);
    const filterLanguageButtons = new filter_buttons_1.FilterLanguageButtons(document.getElementById("filter-language-buttons"), allLanguages, securityIssuesHashUrl, globalState);
    // 6. render the filtered data into HTML
    (0, issues_1.renderIssues)(document.getElementById("container"), globalState, filteredResults);
    (0, pagination_1.renderPagination)(document.getElementById("pagination"), filteredResults.length, globalState, securityIssuesHashUrl);
    // 7. listen to hash change event
    window.addEventListener("hashchange", () => {
        const filteredResults = (0, data_handler_1.filterIssues)(resultsWithLanguages, globalState.getImpacts(), globalState.getLanguages());
        (0, issues_1.renderIssues)(document.getElementById("container"), globalState, filteredResults);
        (0, pagination_1.renderPagination)(document.getElementById("pagination"), filteredResults.length, globalState, securityIssuesHashUrl);
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
    constructor(impactButtonsContainer, allImpacts, securityIssuesHashUrl, globalState) {
        this.impactButtonsContainer = impactButtonsContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        this.globalState = globalState;
        allImpacts.forEach((impact) => {
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.textContent = `${impact}`;
            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    globalState.setImpacts([...globalState.getImpacts(), impact]);
                }
                else {
                    globalState.setImpacts(globalState.getImpacts().filter((imp) => imp !== impact));
                }
                securityIssuesHashUrl.updateImpacts(globalState.getImpacts());
            });
            impactButtonsContainer.appendChild(filterButton);
        });
    }
}
exports.FilterImpactButtons = FilterImpactButtons;
class FilterLanguageButtons {
    constructor(languageButtonsContainer, allLanguages, securityIssuesHashUrl, globalState) {
        this.languageButtonsContainer = languageButtonsContainer;
        this.securityIssuesHashUrl = securityIssuesHashUrl;
        this.globalState = globalState;
        allLanguages.forEach((language) => {
            const filterButton = document.createElement("button");
            filterButton.className = "filter-button";
            filterButton.textContent = `${language}`;
            filterButton.addEventListener("click", function () {
                filterButton.classList.toggle("selected");
                if (filterButton.classList.contains("selected")) {
                    globalState.setLanguages([...globalState.getLanguages(), language]);
                }
                else {
                    globalState.setLanguages(globalState.getLanguages().filter((lang) => lang !== language));
                }
                securityIssuesHashUrl.updateLanguages(globalState.getLanguages());
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
        color = "red";
    }
    else if (impact === types_1.Impact.MEDIUM) {
        color = "yellow";
    }
    else {
        color = "green";
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
const contants_1 = __webpack_require__(/*! ../contants */ "./src/contants.ts");
const impact_color_1 = __webpack_require__(/*! ./impact-color */ "./src/render/impact-color.ts");
const renderIssues = (container, globalState, issues) => {
    container.innerHTML = "";
    const startIndex = (globalState.getPageNumber() - 1) * contants_1.ITEMS_PER_PAGE;
    const endIndex = startIndex + contants_1.ITEMS_PER_PAGE;
    const itemsToRender = issues.slice(startIndex, endIndex);
    itemsToRender.forEach((issue) => {
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
            "5px solid " + (0, impact_color_1.getImpactColor)(issue.extra.metadata.impact);
        impact.style.padding = "4px";
        const ul = document.createElement("ul");
        const cwe = document.createElement("li");
        cwe.innerHTML =
            "<strong>CWE:</strong> " + issue.extra.metadata.cwe + "<br/>";
        const message = document.createElement("li");
        message.innerHTML =
            "<strong>Message:</strong> " + issue.extra.message + "<br/>";
        const owasp = document.createElement("li");
        owasp.innerHTML =
            "<strong>owasp:</strong> " + issue.extra.metadata.owasp + "<br/>";
        const code = document.createElement("li");
        code.innerHTML = "<strong>code:</strong>" + issue.extra.lines + "<br/>";
        ul.appendChild(cwe);
        ul.appendChild(owasp);
        ul.appendChild(message);
        ul.appendChild(code);
        securityIssueData.appendChild(document.createElement("hr"));
        securityIssueData.appendChild(path);
        securityIssueData.appendChild(impact);
        securityIssueData.appendChild(ul);
        container.appendChild(securityIssueData);
    });
};
exports.renderIssues = renderIssues;


/***/ }),

/***/ "./src/render/pagination.ts":
/*!**********************************!*\
  !*** ./src/render/pagination.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderPagination = void 0;
const contants_1 = __webpack_require__(/*! ../contants */ "./src/contants.ts");
const renderPagination = (paginationContainer, totalItems, globalState, securityIssuesHashUrl) => {
    const totalPages = Math.ceil(totalItems / contants_1.ITEMS_PER_PAGE);
    paginationContainer.innerHTML = "";
    const prevButton = document.createElement("button");
    if (globalState.getPageNumber() === 1) {
        prevButton.style.display = "none";
    }
    prevButton.className = "page-link";
    prevButton.textContent = "Previous";
    prevButton.addEventListener("click", function () {
        if (globalState.getPageNumber() > 1) {
            globalState.setPageNumber(globalState.getPageNumber() - 1);
            securityIssuesHashUrl.updatePageNumber(globalState.getPageNumber());
        }
    });
    const nextButton = document.createElement("button");
    if (globalState.getPageNumber() == totalPages) {
        nextButton.style.display = "None";
    }
    nextButton.className = "page-link";
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", function () {
        if (globalState.getPageNumber() < totalPages) {
            globalState.setPageNumber(globalState.getPageNumber() + 1);
            securityIssuesHashUrl.updatePageNumber(globalState.getPageNumber());
        }
    });
    paginationContainer.appendChild(prevButton);
    const initialPageCount = 5;
    const startPage = Math.max(1, globalState.getPageNumber() - Math.floor(initialPageCount / 2));
    const endPage = Math.min(totalPages, startPage + initialPageCount - 1);
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        if (totalPages == 1) {
            pageButton.style.display = "none";
        }
        pageButton.className = "page-link";
        pageButton.textContent = i + "";
        pageButton.addEventListener("click", function () {
            securityIssuesHashUrl.updatePageNumber(i);
        });
        if (i === globalState.getPageNumber()) {
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
            globalState.setPageNumber(endPage + 1);
            securityIssuesHashUrl.updatePageNumber(endPage + 1);
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
    constructor(hash) {
        this.hash = hash;
        this.impacts = [];
        this.languages = [];
        const data = this.getDataFromUrl(hash);
        this.pageNumber = data.pageNumber;
        this.impacts = data.impacts;
        this.languages = data.languages;
    }
    getHash() {
        return this.hash;
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
    updateImpacts(impacts) {
        this.impacts = impacts;
        this.updateUrl();
    }
    updateLanguages(languages) {
        this.languages = languages;
        this.updateUrl();
    }
    updatePageNumber(pageNumber) {
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
    getData() {
        return { impacts: this.impacts, languages: this.languages, pageNumber: this.pageNumber };
    }
    isEmpty() {
        return this.hash === "";
    }
}
exports.SecurityIssuesHashUrl = SecurityIssuesHashUrl;


/***/ }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalState = void 0;
class GlobalState {
    constructor(impacts, languages, pageNumber) {
        this.impacts = impacts;
        this.languages = languages;
        this.pageNumber = pageNumber;
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
    setImpacts(impacts) {
        const uniqueImpacts = [...new Set(impacts)];
        this.impacts = uniqueImpacts;
    }
    setLanguages(languages) {
        const uniqueLanguages = [...new Set(languages)];
        this.languages = uniqueLanguages;
    }
    setPageNumber(pageNumber) {
        this.pageNumber = pageNumber;
    }
}
exports.GlobalState = GlobalState;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qjs7Ozs7Ozs7Ozs7QUN2RWhCO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7Ozs7Ozs7Ozs7O0FDOUJOO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxhQUFhLGNBQWMsY0FBYzs7Ozs7OztVQ1IxQztVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2NvbnRhbnRzLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9kYXRhLWhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9yZW5kZXIvZmlsdGVyLWJ1dHRvbnMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9pbXBhY3QtY29sb3IudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9pc3N1ZXMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzLy4vc3JjL3JlbmRlci9wYWdpbmF0aW9uLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9zZWN1cml0eS1pc3N1ZS1oYXNoLnRzIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy8uL3NyYy9zdGF0ZS50cyIsIndlYnBhY2s6Ly9zZWN1cml0eS1pc3N1ZXMvLi9zcmMvdHlwZXMudHMiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3NlY3VyaXR5LWlzc3Vlcy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc2VjdXJpdHktaXNzdWVzL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSVRFTVNfUEVSX1BBR0UgPSB2b2lkIDA7XG5leHBvcnRzLklURU1TX1BFUl9QQUdFID0gMTA7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gZXhwb3J0cy5nZXRJc3N1ZXNXaXRoTGFuZ3VhZ2VMYWJlbCA9IGV4cG9ydHMuZ2V0U2VjdXJpdHlJc3N1ZXMgPSBleHBvcnRzLmZpbHRlcklzc3VlcyA9IHZvaWQgMDtcbmNvbnN0IGZpbHRlcklzc3VlcyA9IChyZXN1bHRzLCBpbXBhY3RzLCBsYW5ndWFnZXMpID0+IHtcbiAgICBpbXBhY3RzID0gaW1wYWN0cy5tYXAoKGltcGFjdCkgPT4gaW1wYWN0LnRvVXBwZXJDYXNlKCkpO1xuICAgIHJldHVybiByZXN1bHRzLmZpbHRlcigob2JqKSA9PiBsYW5ndWFnZXMuaW5jbHVkZXMob2JqLmxhbmd1YWdlKSAmJiBpbXBhY3RzLmluY2x1ZGVzKG9iai5leHRyYS5tZXRhZGF0YS5pbXBhY3QpKTtcbn07XG5leHBvcnRzLmZpbHRlcklzc3VlcyA9IGZpbHRlcklzc3VlcztcbmNvbnN0IGdldFNlY3VyaXR5SXNzdWVzID0gKCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgY29uc3QgcmVzID0geWllbGQgZmV0Y2goXCIuL3NjYW5fcmVzdWx0cy5qc29uXCIpO1xuICAgIGNvbnN0IGRhdGEgPSB5aWVsZCByZXMuanNvbigpO1xuICAgIHJldHVybiBkYXRhLnJlc3VsdHM7XG59KTtcbmV4cG9ydHMuZ2V0U2VjdXJpdHlJc3N1ZXMgPSBnZXRTZWN1cml0eUlzc3VlcztcbmNvbnN0IGdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gKHJlc3VsdHMpID0+IHtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlID0gKF9hID0gcmVzdWx0LnBhdGguc3BsaXQoXCIvXCIpLnBvcCgpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXN1bHQpLCB7IGxhbmd1YWdlOiBsYW5ndWFnZSA/IGxhbmd1YWdlIDogXCJcIiB9KTtcbiAgICB9KTtcbn07XG5leHBvcnRzLmdldElzc3Vlc1dpdGhMYW5ndWFnZUxhYmVsID0gZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWw7XG5jb25zdCBnZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gKHJlc3VsdHMpID0+IHtcbiAgICBjb25zdCBhbGxMYW5ndWFnZXMgPSBbXTtcbiAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAoIWFsbExhbmd1YWdlcy5pbmNsdWRlcyhyZXN1bHQubGFuZ3VhZ2UpKSB7XG4gICAgICAgICAgICBhbGxMYW5ndWFnZXMucHVzaChyZXN1bHQubGFuZ3VhZ2UpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHsgYWxsSW1wYWN0czogW1wiTE9XXCIsIFwiTUVESVVNXCIsIFwiSElHSFwiXSwgYWxsTGFuZ3VhZ2VzIH07XG59O1xuZXhwb3J0cy5nZXRTZWN1cml0eUlzc3Vlc01ldGFkYXRhID0gZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBkYXRhX2hhbmRsZXJfMSA9IHJlcXVpcmUoXCIuL2RhdGEtaGFuZGxlclwiKTtcbmNvbnN0IGZpbHRlcl9idXR0b25zXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvZmlsdGVyLWJ1dHRvbnNcIik7XG5jb25zdCBpc3N1ZXNfMSA9IHJlcXVpcmUoXCIuL3JlbmRlci9pc3N1ZXNcIik7XG5jb25zdCBwYWdpbmF0aW9uXzEgPSByZXF1aXJlKFwiLi9yZW5kZXIvcGFnaW5hdGlvblwiKTtcbmNvbnN0IHNlY3VyaXR5X2lzc3VlX2hhc2hfMSA9IHJlcXVpcmUoXCIuL3NlY3VyaXR5LWlzc3VlLWhhc2hcIik7XG5jb25zdCBzdGF0ZV8xID0gcmVxdWlyZShcIi4vc3RhdGVcIik7XG4vLyBnbG9iYWwgZGF0YSBsYXllclxuLy8gVVJMIGxheWVyXG4vLyBIVE1MIGxheWVyXG5jb25zdCBtYWluID0gKCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgLy8gMS4gYW5hbHlzZSB0aGUgY3VycmVudCBicm93c2VyIFVSTCAoaGFzaClcbiAgICBjb25zdCBzZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSBuZXcgc2VjdXJpdHlfaXNzdWVfaGFzaF8xLlNlY3VyaXR5SXNzdWVzSGFzaFVybCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgY29uc3QgeyBpbXBhY3RzLCBsYW5ndWFnZXMsIHBhZ2VOdW1iZXIgfSA9IHNlY3VyaXR5SXNzdWVzSGFzaFVybC5nZXREYXRhKCk7XG4gICAgLy8gMy4gYXNzaWduIGRhdGEgdG8gZ2xvYmFsIHN0YXRlIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBnbG9iYWxTdGF0ZSA9IG5ldyBzdGF0ZV8xLkdsb2JhbFN0YXRlKGltcGFjdHMsIGxhbmd1YWdlcywgcGFnZU51bWJlcik7XG4gICAgLy8gNC4gZmV0Y2ggSlNPTiBkYXRhIGFuZCBmaWx0ZXIgZGF0YSB1c2luZyBnbG9iYWwgY29uZmlndXJhdGlvblxuICAgIGNvbnN0IHJlc3VsdHMgPSB5aWVsZCAoMCwgZGF0YV9oYW5kbGVyXzEuZ2V0U2VjdXJpdHlJc3N1ZXMpKCk7XG4gICAgY29uc3QgcmVzdWx0c1dpdGhMYW5ndWFnZXMgPSAoMCwgZGF0YV9oYW5kbGVyXzEuZ2V0SXNzdWVzV2l0aExhbmd1YWdlTGFiZWwpKHJlc3VsdHMpO1xuICAgIGNvbnN0IHsgYWxsSW1wYWN0cywgYWxsTGFuZ3VhZ2VzIH0gPSAoMCwgZGF0YV9oYW5kbGVyXzEuZ2V0U2VjdXJpdHlJc3N1ZXNNZXRhZGF0YSkocmVzdWx0c1dpdGhMYW5ndWFnZXMpO1xuICAgIGNvbnN0IGZpbHRlcmVkUmVzdWx0cyA9ICgwLCBkYXRhX2hhbmRsZXJfMS5maWx0ZXJJc3N1ZXMpKHJlc3VsdHNXaXRoTGFuZ3VhZ2VzLCBnbG9iYWxTdGF0ZS5nZXRJbXBhY3RzKCksIGdsb2JhbFN0YXRlLmdldExhbmd1YWdlcygpKTtcbiAgICAvLyA1LiByZW5kZXIgdGhlIGJ1dHRvbnMgYW5kIHBhZ2luYXRpb24gVUlcbiAgICBjb25zdCBmaWx0ZXJJbXBhY3RCdXR0b25zID0gbmV3IGZpbHRlcl9idXR0b25zXzEuRmlsdGVySW1wYWN0QnV0dG9ucyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlci1pbXBhY3QtYnV0dG9uc1wiKSwgYWxsSW1wYWN0cywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLCBnbG9iYWxTdGF0ZSk7XG4gICAgY29uc3QgZmlsdGVyTGFuZ3VhZ2VCdXR0b25zID0gbmV3IGZpbHRlcl9idXR0b25zXzEuRmlsdGVyTGFuZ3VhZ2VCdXR0b25zKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyLWxhbmd1YWdlLWJ1dHRvbnNcIiksIGFsbExhbmd1YWdlcywgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLCBnbG9iYWxTdGF0ZSk7XG4gICAgLy8gNi4gcmVuZGVyIHRoZSBmaWx0ZXJlZCBkYXRhIGludG8gSFRNTFxuICAgICgwLCBpc3N1ZXNfMS5yZW5kZXJJc3N1ZXMpKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGFpbmVyXCIpLCBnbG9iYWxTdGF0ZSwgZmlsdGVyZWRSZXN1bHRzKTtcbiAgICAoMCwgcGFnaW5hdGlvbl8xLnJlbmRlclBhZ2luYXRpb24pKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFnaW5hdGlvblwiKSwgZmlsdGVyZWRSZXN1bHRzLmxlbmd0aCwgZ2xvYmFsU3RhdGUsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCk7XG4gICAgLy8gNy4gbGlzdGVuIHRvIGhhc2ggY2hhbmdlIGV2ZW50XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRSZXN1bHRzID0gKDAsIGRhdGFfaGFuZGxlcl8xLmZpbHRlcklzc3VlcykocmVzdWx0c1dpdGhMYW5ndWFnZXMsIGdsb2JhbFN0YXRlLmdldEltcGFjdHMoKSwgZ2xvYmFsU3RhdGUuZ2V0TGFuZ3VhZ2VzKCkpO1xuICAgICAgICAoMCwgaXNzdWVzXzEucmVuZGVySXNzdWVzKShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRhaW5lclwiKSwgZ2xvYmFsU3RhdGUsIGZpbHRlcmVkUmVzdWx0cyk7XG4gICAgICAgICgwLCBwYWdpbmF0aW9uXzEucmVuZGVyUGFnaW5hdGlvbikoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYWdpbmF0aW9uXCIpLCBmaWx0ZXJlZFJlc3VsdHMubGVuZ3RoLCBnbG9iYWxTdGF0ZSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKTtcbiAgICB9KTtcbn0pO1xubWFpbigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkZpbHRlckxhbmd1YWdlQnV0dG9ucyA9IGV4cG9ydHMuRmlsdGVySW1wYWN0QnV0dG9ucyA9IHZvaWQgMDtcbmNsYXNzIEZpbHRlckltcGFjdEJ1dHRvbnMge1xuICAgIGNvbnN0cnVjdG9yKGltcGFjdEJ1dHRvbnNDb250YWluZXIsIGFsbEltcGFjdHMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCwgZ2xvYmFsU3RhdGUpIHtcbiAgICAgICAgdGhpcy5pbXBhY3RCdXR0b25zQ29udGFpbmVyID0gaW1wYWN0QnV0dG9uc0NvbnRhaW5lcjtcbiAgICAgICAgdGhpcy5zZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSBzZWN1cml0eUlzc3Vlc0hhc2hVcmw7XG4gICAgICAgIHRoaXMuZ2xvYmFsU3RhdGUgPSBnbG9iYWxTdGF0ZTtcbiAgICAgICAgYWxsSW1wYWN0cy5mb3JFYWNoKChpbXBhY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NOYW1lID0gXCJmaWx0ZXItYnV0dG9uXCI7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24udGV4dENvbnRlbnQgPSBgJHtpbXBhY3R9YDtcbiAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKFwic2VsZWN0ZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoXCJzZWxlY3RlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWxTdGF0ZS5zZXRJbXBhY3RzKFsuLi5nbG9iYWxTdGF0ZS5nZXRJbXBhY3RzKCksIGltcGFjdF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU3RhdGUuc2V0SW1wYWN0cyhnbG9iYWxTdGF0ZS5nZXRJbXBhY3RzKCkuZmlsdGVyKChpbXApID0+IGltcCAhPT0gaW1wYWN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC51cGRhdGVJbXBhY3RzKGdsb2JhbFN0YXRlLmdldEltcGFjdHMoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGltcGFjdEJ1dHRvbnNDb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsdGVyQnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWx0ZXJJbXBhY3RCdXR0b25zID0gRmlsdGVySW1wYWN0QnV0dG9ucztcbmNsYXNzIEZpbHRlckxhbmd1YWdlQnV0dG9ucyB7XG4gICAgY29uc3RydWN0b3IobGFuZ3VhZ2VCdXR0b25zQ29udGFpbmVyLCBhbGxMYW5ndWFnZXMsIHNlY3VyaXR5SXNzdWVzSGFzaFVybCwgZ2xvYmFsU3RhdGUpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZUJ1dHRvbnNDb250YWluZXIgPSBsYW5ndWFnZUJ1dHRvbnNDb250YWluZXI7XG4gICAgICAgIHRoaXMuc2VjdXJpdHlJc3N1ZXNIYXNoVXJsID0gc2VjdXJpdHlJc3N1ZXNIYXNoVXJsO1xuICAgICAgICB0aGlzLmdsb2JhbFN0YXRlID0gZ2xvYmFsU3RhdGU7XG4gICAgICAgIGFsbExhbmd1YWdlcy5mb3JFYWNoKChsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgICAgIGZpbHRlckJ1dHRvbi5jbGFzc05hbWUgPSBcImZpbHRlci1idXR0b25cIjtcbiAgICAgICAgICAgIGZpbHRlckJ1dHRvbi50ZXh0Q29udGVudCA9IGAke2xhbmd1YWdlfWA7XG4gICAgICAgICAgICBmaWx0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcInNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJCdXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwic2VsZWN0ZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU3RhdGUuc2V0TGFuZ3VhZ2VzKFsuLi5nbG9iYWxTdGF0ZS5nZXRMYW5ndWFnZXMoKSwgbGFuZ3VhZ2VdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFN0YXRlLnNldExhbmd1YWdlcyhnbG9iYWxTdGF0ZS5nZXRMYW5ndWFnZXMoKS5maWx0ZXIoKGxhbmcpID0+IGxhbmcgIT09IGxhbmd1YWdlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC51cGRhdGVMYW5ndWFnZXMoZ2xvYmFsU3RhdGUuZ2V0TGFuZ3VhZ2VzKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYW5ndWFnZUJ1dHRvbnNDb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsdGVyQnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWx0ZXJMYW5ndWFnZUJ1dHRvbnMgPSBGaWx0ZXJMYW5ndWFnZUJ1dHRvbnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0SW1wYWN0Q29sb3IgPSB2b2lkIDA7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4uL3R5cGVzXCIpO1xuZnVuY3Rpb24gZ2V0SW1wYWN0Q29sb3IoaW1wYWN0KSB7XG4gICAgbGV0IGNvbG9yID0gXCJcIjtcbiAgICBpZiAoaW1wYWN0ID09PSB0eXBlc18xLkltcGFjdC5ISUdIKSB7XG4gICAgICAgIGNvbG9yID0gXCJyZWRcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW1wYWN0ID09PSB0eXBlc18xLkltcGFjdC5NRURJVU0pIHtcbiAgICAgICAgY29sb3IgPSBcInllbGxvd1wiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29sb3IgPSBcImdyZWVuXCI7XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cbmV4cG9ydHMuZ2V0SW1wYWN0Q29sb3IgPSBnZXRJbXBhY3RDb2xvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZW5kZXJJc3N1ZXMgPSB2b2lkIDA7XG5jb25zdCBjb250YW50c18xID0gcmVxdWlyZShcIi4uL2NvbnRhbnRzXCIpO1xuY29uc3QgaW1wYWN0X2NvbG9yXzEgPSByZXF1aXJlKFwiLi9pbXBhY3QtY29sb3JcIik7XG5jb25zdCByZW5kZXJJc3N1ZXMgPSAoY29udGFpbmVyLCBnbG9iYWxTdGF0ZSwgaXNzdWVzKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IChnbG9iYWxTdGF0ZS5nZXRQYWdlTnVtYmVyKCkgLSAxKSAqIGNvbnRhbnRzXzEuSVRFTVNfUEVSX1BBR0U7XG4gICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgY29udGFudHNfMS5JVEVNU19QRVJfUEFHRTtcbiAgICBjb25zdCBpdGVtc1RvUmVuZGVyID0gaXNzdWVzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICBpdGVtc1RvUmVuZGVyLmZvckVhY2goKGlzc3VlKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlY3VyaXR5SXNzdWVEYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuc3R5bGUubWFyZ2luVG9wID0gXCIyMHB4XCI7XG4gICAgICAgIHNlY3VyaXR5SXNzdWVEYXRhLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMjBweFwiO1xuICAgICAgICBjb25zdCBwYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgIHBhdGguaW5uZXJIVE1MID0gXCI8c3Ryb25nPlBhdGg6PC9zdHJvbmc+IFwiICsgaXNzdWUucGF0aDtcbiAgICAgICAgY29uc3QgaW1wYWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgaW1wYWN0LmlubmVySFRNTCA9XG4gICAgICAgICAgICBcIjxzdHJvbmc+U2VjdXJpdHkgaW1wYWN0Ojwvc3Ryb25nPiBcIiArXG4gICAgICAgICAgICAgICAgaXNzdWUuZXh0cmEubWV0YWRhdGEuaW1wYWN0ICtcbiAgICAgICAgICAgICAgICBcIjxici8+XCI7XG4gICAgICAgIGltcGFjdC5zdHlsZS5ib3JkZXJMZWZ0ID1cbiAgICAgICAgICAgIFwiNXB4IHNvbGlkIFwiICsgKDAsIGltcGFjdF9jb2xvcl8xLmdldEltcGFjdENvbG9yKShpc3N1ZS5leHRyYS5tZXRhZGF0YS5pbXBhY3QpO1xuICAgICAgICBpbXBhY3Quc3R5bGUucGFkZGluZyA9IFwiNHB4XCI7XG4gICAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO1xuICAgICAgICBjb25zdCBjd2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGN3ZS5pbm5lckhUTUwgPVxuICAgICAgICAgICAgXCI8c3Ryb25nPkNXRTo8L3N0cm9uZz4gXCIgKyBpc3N1ZS5leHRyYS5tZXRhZGF0YS5jd2UgKyBcIjxici8+XCI7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID1cbiAgICAgICAgICAgIFwiPHN0cm9uZz5NZXNzYWdlOjwvc3Ryb25nPiBcIiArIGlzc3VlLmV4dHJhLm1lc3NhZ2UgKyBcIjxici8+XCI7XG4gICAgICAgIGNvbnN0IG93YXNwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBvd2FzcC5pbm5lckhUTUwgPVxuICAgICAgICAgICAgXCI8c3Ryb25nPm93YXNwOjwvc3Ryb25nPiBcIiArIGlzc3VlLmV4dHJhLm1ldGFkYXRhLm93YXNwICsgXCI8YnIvPlwiO1xuICAgICAgICBjb25zdCBjb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBjb2RlLmlubmVySFRNTCA9IFwiPHN0cm9uZz5jb2RlOjwvc3Ryb25nPlwiICsgaXNzdWUuZXh0cmEubGluZXMgKyBcIjxici8+XCI7XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKGN3ZSk7XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKG93YXNwKTtcbiAgICAgICAgdWwuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKGNvZGUpO1xuICAgICAgICBzZWN1cml0eUlzc3VlRGF0YS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuICAgICAgICBzZWN1cml0eUlzc3VlRGF0YS5hcHBlbmRDaGlsZChwYXRoKTtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuYXBwZW5kQ2hpbGQoaW1wYWN0KTtcbiAgICAgICAgc2VjdXJpdHlJc3N1ZURhdGEuYXBwZW5kQ2hpbGQodWwpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2VjdXJpdHlJc3N1ZURhdGEpO1xuICAgIH0pO1xufTtcbmV4cG9ydHMucmVuZGVySXNzdWVzID0gcmVuZGVySXNzdWVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbmRlclBhZ2luYXRpb24gPSB2b2lkIDA7XG5jb25zdCBjb250YW50c18xID0gcmVxdWlyZShcIi4uL2NvbnRhbnRzXCIpO1xuY29uc3QgcmVuZGVyUGFnaW5hdGlvbiA9IChwYWdpbmF0aW9uQ29udGFpbmVyLCB0b3RhbEl0ZW1zLCBnbG9iYWxTdGF0ZSwgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsKSA9PiB7XG4gICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbCh0b3RhbEl0ZW1zIC8gY29udGFudHNfMS5JVEVNU19QRVJfUEFHRSk7XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGNvbnN0IHByZXZCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGlmIChnbG9iYWxTdGF0ZS5nZXRQYWdlTnVtYmVyKCkgPT09IDEpIHtcbiAgICAgICAgcHJldkJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuICAgIHByZXZCdXR0b24uY2xhc3NOYW1lID0gXCJwYWdlLWxpbmtcIjtcbiAgICBwcmV2QnV0dG9uLnRleHRDb250ZW50ID0gXCJQcmV2aW91c1wiO1xuICAgIHByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGdsb2JhbFN0YXRlLmdldFBhZ2VOdW1iZXIoKSA+IDEpIHtcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlLnNldFBhZ2VOdW1iZXIoZ2xvYmFsU3RhdGUuZ2V0UGFnZU51bWJlcigpIC0gMSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwudXBkYXRlUGFnZU51bWJlcihnbG9iYWxTdGF0ZS5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgaWYgKGdsb2JhbFN0YXRlLmdldFBhZ2VOdW1iZXIoKSA9PSB0b3RhbFBhZ2VzKSB7XG4gICAgICAgIG5leHRCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwiTm9uZVwiO1xuICAgIH1cbiAgICBuZXh0QnV0dG9uLmNsYXNzTmFtZSA9IFwicGFnZS1saW5rXCI7XG4gICAgbmV4dEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiTmV4dFwiO1xuICAgIG5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGdsb2JhbFN0YXRlLmdldFBhZ2VOdW1iZXIoKSA8IHRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlLnNldFBhZ2VOdW1iZXIoZ2xvYmFsU3RhdGUuZ2V0UGFnZU51bWJlcigpICsgMSk7XG4gICAgICAgICAgICBzZWN1cml0eUlzc3Vlc0hhc2hVcmwudXBkYXRlUGFnZU51bWJlcihnbG9iYWxTdGF0ZS5nZXRQYWdlTnVtYmVyKCkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcGFnaW5hdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmV2QnV0dG9uKTtcbiAgICBjb25zdCBpbml0aWFsUGFnZUNvdW50ID0gNTtcbiAgICBjb25zdCBzdGFydFBhZ2UgPSBNYXRoLm1heCgxLCBnbG9iYWxTdGF0ZS5nZXRQYWdlTnVtYmVyKCkgLSBNYXRoLmZsb29yKGluaXRpYWxQYWdlQ291bnQgLyAyKSk7XG4gICAgY29uc3QgZW5kUGFnZSA9IE1hdGgubWluKHRvdGFsUGFnZXMsIHN0YXJ0UGFnZSArIGluaXRpYWxQYWdlQ291bnQgLSAxKTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRQYWdlOyBpIDw9IGVuZFBhZ2U7IGkrKykge1xuICAgICAgICBjb25zdCBwYWdlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgaWYgKHRvdGFsUGFnZXMgPT0gMSkge1xuICAgICAgICAgICAgcGFnZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICAgICAgcGFnZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgICAgICBwYWdlQnV0dG9uLnRleHRDb250ZW50ID0gaSArIFwiXCI7XG4gICAgICAgIHBhZ2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5SXNzdWVzSGFzaFVybC51cGRhdGVQYWdlTnVtYmVyKGkpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGkgPT09IGdsb2JhbFN0YXRlLmdldFBhZ2VOdW1iZXIoKSkge1xuICAgICAgICAgICAgcGFnZUJ1dHRvbi5zdHlsZS5jb2xvciA9IFwid2hpdGVcIjtcbiAgICAgICAgICAgIHBhZ2VCdXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzBlMzI1MlwiO1xuICAgICAgICB9XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQocGFnZUJ1dHRvbik7XG4gICAgfVxuICAgIGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xuICAgICAgICBjb25zdCBlbGxpcHNpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBlbGxpcHNpcy50ZXh0Q29udGVudCA9IFwiLi4uXCI7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQoZWxsaXBzaXMpO1xuICAgICAgICBjb25zdCBtb3JlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgbW9yZUJ1dHRvbi5jbGFzc05hbWUgPSBcInBhZ2UtbGlua1wiO1xuICAgICAgICBtb3JlQnV0dG9uLnRleHRDb250ZW50ID0gXCJNb3JlXCI7XG4gICAgICAgIG1vcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlLnNldFBhZ2VOdW1iZXIoZW5kUGFnZSArIDEpO1xuICAgICAgICAgICAgc2VjdXJpdHlJc3N1ZXNIYXNoVXJsLnVwZGF0ZVBhZ2VOdW1iZXIoZW5kUGFnZSArIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobW9yZUJ1dHRvbik7XG4gICAgfVxuICAgIHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQobmV4dEJ1dHRvbik7XG59O1xuZXhwb3J0cy5yZW5kZXJQYWdpbmF0aW9uID0gcmVuZGVyUGFnaW5hdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZWN1cml0eUlzc3Vlc0hhc2hVcmwgPSB2b2lkIDA7XG5jbGFzcyBTZWN1cml0eUlzc3Vlc0hhc2hVcmwge1xuICAgIGNvbnN0cnVjdG9yKGhhc2gpIHtcbiAgICAgICAgdGhpcy5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhpcy5pbXBhY3RzID0gW107XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VzID0gW107XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGFGcm9tVXJsKGhhc2gpO1xuICAgICAgICB0aGlzLnBhZ2VOdW1iZXIgPSBkYXRhLnBhZ2VOdW1iZXI7XG4gICAgICAgIHRoaXMuaW1wYWN0cyA9IGRhdGEuaW1wYWN0cztcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSBkYXRhLmxhbmd1YWdlcztcbiAgICB9XG4gICAgZ2V0SGFzaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzaDtcbiAgICB9XG4gICAgdXBkYXRlVXJsKCkge1xuICAgICAgICBjb25zdCBoYXNoQXJyYXkgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuaW1wYWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYXNoQXJyYXkucHVzaChgaW1wYWN0PSR7dGhpcy5pbXBhY3RzLmpvaW4oXCIsXCIpfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhbmd1YWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYXNoQXJyYXkucHVzaChgbGFuZ3VhZ2U9JHt0aGlzLmxhbmd1YWdlcy5qb2luKFwiLFwiKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNoQXJyYXkucHVzaChgcGFnZT0ke3RoaXMucGFnZU51bWJlcn1gKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoQXJyYXkuam9pbihcIiZcIik7XG4gICAgfVxuICAgIHVwZGF0ZUltcGFjdHMoaW1wYWN0cykge1xuICAgICAgICB0aGlzLmltcGFjdHMgPSBpbXBhY3RzO1xuICAgICAgICB0aGlzLnVwZGF0ZVVybCgpO1xuICAgIH1cbiAgICB1cGRhdGVMYW5ndWFnZXMobGFuZ3VhZ2VzKSB7XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VzID0gbGFuZ3VhZ2VzO1xuICAgICAgICB0aGlzLnVwZGF0ZVVybCgpO1xuICAgIH1cbiAgICB1cGRhdGVQYWdlTnVtYmVyKHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgdGhpcy5wYWdlTnVtYmVyID0gcGFnZU51bWJlcjtcbiAgICAgICAgdGhpcy51cGRhdGVVcmwoKTtcbiAgICB9XG4gICAgZ2V0RGF0YUZyb21VcmwoaGFzaCkge1xuICAgICAgICBjb25zdCBoYXNoQXJyYXkgPSBoYXNoLnJlcGxhY2UoXCIjXCIsIFwiXCIpLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgY29uc3QgaW1wYWN0cyA9IFtdO1xuICAgICAgICBjb25zdCBsYW5ndWFnZXMgPSBbXTtcbiAgICAgICAgbGV0IHBhZ2VOdW1iZXIgPSAxO1xuICAgICAgICBoYXNoQXJyYXkuZm9yRWFjaCgoaGFzaEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGhhc2hJdGVtLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiaW1wYWN0XCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaCgodmFsdWVJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGltcGFjdHMucHVzaCh2YWx1ZUl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcImxhbmd1YWdlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaCgodmFsdWVJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlcy5wdXNoKHZhbHVlSXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IFwicGFnZVwiKSB7XG4gICAgICAgICAgICAgICAgcGFnZU51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBpbXBhY3RzLCBsYW5ndWFnZXMsIHBhZ2VOdW1iZXIgfTtcbiAgICB9XG4gICAgZ2V0RGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHsgaW1wYWN0czogdGhpcy5pbXBhY3RzLCBsYW5ndWFnZXM6IHRoaXMubGFuZ3VhZ2VzLCBwYWdlTnVtYmVyOiB0aGlzLnBhZ2VOdW1iZXIgfTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzaCA9PT0gXCJcIjtcbiAgICB9XG59XG5leHBvcnRzLlNlY3VyaXR5SXNzdWVzSGFzaFVybCA9IFNlY3VyaXR5SXNzdWVzSGFzaFVybDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5HbG9iYWxTdGF0ZSA9IHZvaWQgMDtcbmNsYXNzIEdsb2JhbFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihpbXBhY3RzLCBsYW5ndWFnZXMsIHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgdGhpcy5pbXBhY3RzID0gaW1wYWN0cztcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSBsYW5ndWFnZXM7XG4gICAgICAgIHRoaXMucGFnZU51bWJlciA9IHBhZ2VOdW1iZXI7XG4gICAgfVxuICAgIGdldEltcGFjdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltcGFjdHM7XG4gICAgfVxuICAgIGdldExhbmd1YWdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFuZ3VhZ2VzO1xuICAgIH1cbiAgICBnZXRQYWdlTnVtYmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYWdlTnVtYmVyO1xuICAgIH1cbiAgICBzZXRJbXBhY3RzKGltcGFjdHMpIHtcbiAgICAgICAgY29uc3QgdW5pcXVlSW1wYWN0cyA9IFsuLi5uZXcgU2V0KGltcGFjdHMpXTtcbiAgICAgICAgdGhpcy5pbXBhY3RzID0gdW5pcXVlSW1wYWN0cztcbiAgICB9XG4gICAgc2V0TGFuZ3VhZ2VzKGxhbmd1YWdlcykge1xuICAgICAgICBjb25zdCB1bmlxdWVMYW5ndWFnZXMgPSBbLi4ubmV3IFNldChsYW5ndWFnZXMpXTtcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSB1bmlxdWVMYW5ndWFnZXM7XG4gICAgfVxuICAgIHNldFBhZ2VOdW1iZXIocGFnZU51bWJlcikge1xuICAgICAgICB0aGlzLnBhZ2VOdW1iZXIgPSBwYWdlTnVtYmVyO1xuICAgIH1cbn1cbmV4cG9ydHMuR2xvYmFsU3RhdGUgPSBHbG9iYWxTdGF0ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JbXBhY3QgPSB2b2lkIDA7XG52YXIgSW1wYWN0O1xuKGZ1bmN0aW9uIChJbXBhY3QpIHtcbiAgICBJbXBhY3RbXCJISUdIXCJdID0gXCJISUdIXCI7XG4gICAgSW1wYWN0W1wiTUVESVVNXCJdID0gXCJNRURJVU1cIjtcbiAgICBJbXBhY3RbXCJMT1dcIl0gPSBcIkxPV1wiO1xufSkoSW1wYWN0IHx8IChleHBvcnRzLkltcGFjdCA9IEltcGFjdCA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=