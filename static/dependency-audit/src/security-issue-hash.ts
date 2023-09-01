export class SecurityIssuesHashUrl {
  private severities: string[] = [];
  private languages: string[] = [];
  private pageNumber;

  constructor() {
    const data = this.getDataFromUrl(window.location.hash);
    this.pageNumber = data.pageNumber;
    this.severities = data.serverities;
    this.languages = data.languages;
  }

  getStateAsUrl(): string {
    return window.location.hash.replace("#", "");
  }

  updateUrl(): void {
    const hashArray: string[] = [];
    if (this.severities.length > 0) {
      hashArray.push(`severity=${this.severities.join(",")}`);
    }
    if (this.languages.length > 0) {
      hashArray.push(`language=${this.languages.join(",")}`);
    }
    hashArray.push(`page=${this.pageNumber}`);
    window.location.hash = hashArray.join("&");
  }

  setSeverities(serverity: string[]): void {
    this.severities = serverity;
    this.updateUrl();
  }

  setLanguages(languages: string[]): void {
    this.languages = languages;
    this.updateUrl();
  }

  setPageNumber(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.updateUrl();
  }

  getDataFromUrl(hash: string): {
    serverities: string[];
    languages: string[];
    pageNumber: number;
  } {
    const hashArray: string[] = hash.replace("#", "").split("&");
    const severity: string[] = [];
    const languages: string[] = [];
    let pageNumber = 1;
    hashArray.forEach((hashItem) => {
      const [key, value] = hashItem.split("=");
      if (key === "severity") {
        const valueArray = value.split(",");
        valueArray.forEach((valueItem) => {
          severity.push(valueItem);
        });
      } else if (key === "language") {
        const valueArray = value.split(",");
        valueArray.forEach((valueItem) => {
          languages.push(valueItem);
        });
      } else if (key === "page") {
        pageNumber = Number(value);
      }
    });
    return { serverities: severity, languages, pageNumber };
  }

  getSeverities(): string[] {
    return this.severities;
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getPageNumber(): number {
    return this.pageNumber;
  }

  getData(): { severity: string[]; languages: string[]; pageNumber: number } {
    return {
      severity: this.severities,
      languages: this.languages,
      pageNumber: this.pageNumber,
    };
  }

  isEmpty(): boolean {
    return this.getStateAsUrl() === "";
  }
}
