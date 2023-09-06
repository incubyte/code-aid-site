import { ITEMS_PER_PAGE } from "../constants";
import { SecurityIssuesHashUrl } from "../security-issue-hash";

export const renderPagination = (
  paginationContainer: HTMLDivElement,
  totalItems: number,
  securityIssuesHashUrl: SecurityIssuesHashUrl
) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  paginationContainer.innerHTML = "";

  const prevButton = getPreviousBtn(securityIssuesHashUrl);

  const nextButton = getNextBtn(securityIssuesHashUrl, totalPages);

  paginationContainer.appendChild(prevButton);
  const initialPageCount = 5;
  const startPage = Math.max(
    1,
    securityIssuesHashUrl.getPageNumber() - Math.floor(initialPageCount / 2)
  );

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

function getPageNumBtn(
  totalPages: number,
  i: number,
  securityIssuesHashUrl: SecurityIssuesHashUrl
) {
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

function getNextBtn(
  securityIssuesHashUrl: SecurityIssuesHashUrl,
  totalPages: number
) {
  const nextButton = document.createElement("button");
  if (securityIssuesHashUrl.getPageNumber() == totalPages) {
    nextButton.style.display = "None";
  }
  nextButton.className = "page-link";
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", function () {
    if (securityIssuesHashUrl.getPageNumber() < totalPages) {
      securityIssuesHashUrl.setPageNumber(
        securityIssuesHashUrl.getPageNumber() + 1
      );
      securityIssuesHashUrl.setPageNumber(
        securityIssuesHashUrl.getPageNumber()
      );
    }
  });
  return nextButton;
}

function getPreviousBtn(securityIssuesHashUrl: SecurityIssuesHashUrl) {
  const prevButton = document.createElement("button");
  if (securityIssuesHashUrl.getPageNumber() === 1) {
    prevButton.style.display = "none";
  }
  prevButton.className = "page-link";
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", function () {
    if (securityIssuesHashUrl.getPageNumber() > 1) {
      securityIssuesHashUrl.setPageNumber(
        securityIssuesHashUrl.getPageNumber() - 1
      );
      securityIssuesHashUrl.setPageNumber(
        securityIssuesHashUrl.getPageNumber()
      );
    }
  });
  return prevButton;
}
