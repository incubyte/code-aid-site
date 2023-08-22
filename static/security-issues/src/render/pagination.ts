import { ITEMS_PER_PAGE } from "../contants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";
import { GlobalState } from "../state";

export const renderPagination = (paginationContainer: HTMLDivElement, totalItems: number, globalState: GlobalState, securityIssuesHashUrl: SecurityIssuesHashUrl) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
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
}