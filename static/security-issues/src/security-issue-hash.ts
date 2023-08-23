export class SecurityIssuesHashUrl {
  private impacts: string[] = [];
  private languages: string[] = [];
  private pageNumber;

  constructor() {
    const data = this.getDataFromUrl(window.location.hash);
    this.pageNumber = data.pageNumber;
    this.impacts = data.impacts;
    this.languages = data.languages;
  }

  getStateAsUrl(): string {
    return window.location.hash.replace("#", "");
  }

  updateUrl(): void {
    const hashArray: string[] = [];
    if (this.impacts.length > 0) {
      hashArray.push(`impact=${this.impacts.join(",")}`);
    }
    if (this.languages.length > 0) {
      hashArray.push(`language=${this.languages.join(",")}`);
    }
    hashArray.push(`page=${this.pageNumber}`);
    window.location.hash = hashArray.join("&");
  }

  setImpacts(impacts: string[]): void {
    this.impacts = impacts;
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
    impacts: string[];
    languages: string[];
    pageNumber: number;
  } {
    const hashArray: string[] = hash.replace("#", "").split("&");
    const impacts: string[] = [];
    const languages: string[] = [];
    let pageNumber = 1;
    hashArray.forEach((hashItem) => {
      const [key, value] = hashItem.split("=");
      if (key === "impact") {
        const valueArray = value.split(",");
        valueArray.forEach((valueItem) => {
          impacts.push(valueItem);
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
    return { impacts, languages, pageNumber };
  }

  getImpacts(): string[] {
    return this.impacts;
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getPageNumber(): number {
    return this.pageNumber;
  }

  getData(): { impacts: string[]; languages: string[]; pageNumber: number } {
    return {
      impacts: this.impacts,
      languages: this.languages,
      pageNumber: this.pageNumber,
    };
  }

  isEmpty(): boolean {
    return this.getStateAsUrl() === "";
  }
}
