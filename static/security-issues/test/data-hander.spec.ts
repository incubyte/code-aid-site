import { getSecurityIssues } from "../src/data-handler";

import fetchMock from "jest-fetch-mock";
import { Impact, Issue } from "../src/types";

fetchMock.enableMocks();

describe("getSecurityIssues", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("fetches security issues from scan_results.json", async () => {
    const mockResponse: Issue[] = [
      {
        path: "filepath/goes/here",
        extra: {
          lines: "lines of code",
          message: "message related to security issue",
          metadata: {
            cwe: "CWE-798: Use of Hard-coded Credentials",
            impact: Impact.HIGH,
            owasp: ["A07:2021 - Identification and Authentication Failures"],
          },
        },
        language: "",
      },
      {
        path: "filepath2/goes/here",
        extra: {
          lines: "line of code goes here",
          message: "message related to issue",
          metadata: {
            cwe: "CWE-798: Use of Hard-coded Credentials",
            impact: Impact.LOW,
            owasp: ["A07:2021 - Identification and Authentication Failures"],
          },
        },
        language: "",
      },
    ];
    fetchMock.mockResponse(JSON.stringify({ results: mockResponse }));
    const issues = await getSecurityIssues();

    expect(fetchMock).toHaveBeenCalledWith("./scan_results.json");
    expect(issues).toHaveLength(2);
  });
}); 
