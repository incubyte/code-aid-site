let result;
let currentPage = 1;
const itemsPerPage = 10; // Adjust as needed


function getImpactColor(impact) {
    let color = "";
    if (impact === "HIGH") {
        color = "red";
    } else if (impact === "MEDIUM") {
        color = "yellow";
    } else {
        color = "green";
    }
    return color;
}

const impactSelection = document.getElementById("impact");
impactSelection.addEventListener("change", function () {
    const selectedImpact = impactSelection.value;
    filterBasedOnConfidence(selectedImpact, result);
});

async function getJsonData() {
    const res = await fetch('./scan_results.json');
    result = await res.json();
    filterToJava(result);
}

function filterToJava(data) {
    result = data.results.filter(obj => obj.path.includes(".java"));
    renderToHtml(result, currentPage, itemsPerPage);
}

function renderToHtml(data, currentPage, itemsPerPage) {
    console.log(location.href);
    if(impactSelection.value !== "all"){
        data = result.filter(issue => issue.extra.metadata.impact === impactSelection.value);
    }
    const container = document.getElementById("container");
    container.innerHTML = "";

    // Calculate the range of items to render
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToRender = data.slice(startIndex, endIndex);

    // Render each item
    itemsToRender.forEach(issue => {
        const securityIssueData = document.createElement("div");
        securityIssueData.style.marginTop = "20px";
        securityIssueData.style.marginBottom = "20px";

        title = issue.path.split("/").pop();
        // console.log(title);
        const path = document.createElement("p");
        path.innerHTML = "<strong>Path:</strong> " + issue.path;

        const impact = document.createElement("div");
        impact.innerHTML = "<strong>Security impact:</strong> " + issue.extra.metadata.impact + "<br/>";
        impact.style.borderLeft = "5px solid " + getImpactColor(issue.extra.metadata.impact);
        impact.style.padding = "4px";

        const ul = document.createElement("ul");

        const cwe = document.createElement("li");
        cwe.innerHTML = "<strong>CWE:</strong> " + issue.extra.metadata.cwe + "<br/>";

        const message = document.createElement("li");
        message.innerHTML = "<strong>Message:</strong> " + issue.extra.message + "<br/>";

        const code = document.createElement("li");
        code.innerHTML = "<strong>code:</strong>" + issue.extra.lines + "<br/>";

        ul.appendChild(cwe);
        ul.appendChild(message);
        ul.appendChild(code);

        securityIssueData.appendChild(document.createElement("hr"));

        securityIssueData.appendChild(path);
        securityIssueData.appendChild(impact);
        securityIssueData.appendChild(ul);

        container.appendChild(securityIssueData);
    });

    // Render the pagination controls

    renderPaginationControls(data.length, currentPage);
}


function filterBasedOnConfidence(impact, result) {

  if (impact === "all") {
      renderToHtml(result, 1, itemsPerPage);
      return;
  }
  const filteredData = result.filter(issue => issue.extra.metadata.impact === impact);
  renderToHtml(filteredData, currentPage, itemsPerPage);
}


function renderPaginationControls(totalItems, currentPage) {
  
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    // Render the "Previous" button
    const prevButton = document.createElement("button");
    if(currentPage == 1){
      prevButton.style.display="None";
    }
    prevButton.className = "page-link";
    prevButton.textContent = "Previous";
    prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderToHtml(result, currentPage, itemsPerPage);

        }
    });

    // Render the "Next" button
    const nextButton = document.createElement("button");
    if(currentPage == totalPages){
      nextButton.style.display="None";
    }
    nextButton.className = "page-link";
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;
            renderToHtml(result, currentPage, itemsPerPage);
        }
    });

    // Render the initial set of page numbers
    paginationContainer.appendChild(prevButton);
    const initialPageCount = 5;
    const startPage = Math.max(1, currentPage - Math.floor(initialPageCount / 2));
    const endPage = Math.min(totalPages, startPage + initialPageCount - 1);
    for (let i = startPage; i <= endPage; i++) {
        // Render a button for each page number

        const pageButton = document.createElement("button");
        if(totalPages == 1 ){
          pageButton.style.display="none";
        }

        pageButton.className = "page-link";
        pageButton.textContent = i;
        pageButton.addEventListener("click", function () {
            renderToHtml(result, i, itemsPerPage);
        });
        if (i === currentPage) {
          pageButton.style.color="white";
          pageButton.style.background="#0e3252";
          // pageButton.classList.add("current-page");
      }
        paginationContainer.appendChild(pageButton);
    }
    

    // Add an ellipsis and "More" button if needed
    if (endPage < totalPages) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);

        const moreButton = document.createElement("button");
        moreButton.className = "page-link";
        moreButton.textContent = "More";
        moreButton.addEventListener("click", function () {
            renderToHtml(result, endPage + 1, itemsPerPage);
        });
        paginationContainer.style.display="flex";
        
        paginationContainer.appendChild(moreButton);
    }

    // Add the "Previous" button before the page numbers


    // ... (your existing code for page numbers and "More" button)

    // Render the "Next" button
    paginationContainer.appendChild(nextButton);
}

// Fetch and render data when the page loads
getJsonData();


