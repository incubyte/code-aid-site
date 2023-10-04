import {
  filterIssues,
  getIssuesWithLanguageLabel,
  getSecurityIssues,
  getSecurityIssuesMetadata,
} from "./data-handler";
import {
  FilterImpactButtons,
  FilterLanguageButtons,
} from "./render/filter-buttons";
import { renderIssues } from "./render/issues";
import { renderPagination } from "./render/pagination";
import { SecurityIssuesHashUrl } from "./security-issue-hash";
import { Issue } from "./types";

async function getFullContext(path: string, start: number, end: number) {
  const url = `http://localhost:3000/security-issues/get-context?path=${path}&start=${start}&end=${end}`;
  const data = await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      return data;
    });
  return data;
}

async function addContextToFile(intial_results: Issue[]): Promise<Issue[]> {
  for (const data of intial_results) {
    const filePath =
      "C:\\Development\\CodeAid\\Java-Jdbc\\" + data.path.replace("/", "\\");
    let context: string = "";

    if (
      data.extra.dataflow_trace?.intermediate_vars?.[0]?.location?.start?.line
    ) {
      const startLineNo =
        data.extra.dataflow_trace?.intermediate_vars?.[0]?.location?.start
          ?.line;
      context = await getFullContext(filePath, startLineNo, data.end.line);
    } else if (data.extra.metavars.$SQL?.propagated_value?.svalue_start?.line) {
      const startLineNo =
        data.extra.metavars.$SQL?.propagated_value?.svalue_start?.line;
      context = await getFullContext(filePath, startLineNo, data.end.line);
    }

    data.context = context;
  }

  return intial_results;
}

const main = async () => {
  
  const intial_results = await getSecurityIssues();
  const results = await addContextToFile(intial_results);
  const resultsWithLanguages = getIssuesWithLanguageLabel(results);
  const { allImpactsWithCount, allLanguagesWithCount } =
    getSecurityIssuesMetadata(resultsWithLanguages);

  
  const securityIssuesHashUrl = new SecurityIssuesHashUrl();
  if (securityIssuesHashUrl.isEmpty()) {
    securityIssuesHashUrl.setImpacts(allImpactsWithCount.map((o) => o.key));
    securityIssuesHashUrl.setLanguages(allLanguagesWithCount.map((o) => o.key));
  }

  const { impacts, languages } = securityIssuesHashUrl.getData();

  
  const filteredResults = filterIssues(
    resultsWithLanguages,
    impacts,
    languages
  );

  
  const filterImpactButtons = new FilterImpactButtons(
    document.getElementById("filter-impact-buttons") as HTMLDivElement,
    allImpactsWithCount,
    securityIssuesHashUrl
  );
  const filterLanguageButtons = new FilterLanguageButtons(
    document.getElementById("filter-language-buttons") as HTMLDivElement,
    allLanguagesWithCount,
    securityIssuesHashUrl
  );

  
  renderIssues(
    document.getElementById("container") as HTMLDivElement,
    securityIssuesHashUrl,
    filteredResults
  );
  renderPagination(
    document.getElementById("pagination") as HTMLDivElement,
    filteredResults.length,
    securityIssuesHashUrl
  );

  
  window.addEventListener("hashchange", () => {
    const filteredResults = filterIssues(
      resultsWithLanguages,
      securityIssuesHashUrl.getImpacts(),
      securityIssuesHashUrl.getLanguages()
    );
    renderIssues(
      document.getElementById("container") as HTMLDivElement,
      securityIssuesHashUrl,
      filteredResults
    );
    renderPagination(
      document.getElementById("pagination") as HTMLDivElement,
      filteredResults.length,
      securityIssuesHashUrl
    );
  });
};

main();
