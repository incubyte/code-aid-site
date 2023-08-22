export class SecurityIssuesHashUrl {
    private impacts: string[] = [];
    private languages: string[] = [];
    private pageNumber;

    constructor(private readonly hash: string) {
        const data = this.getDataFromUrl(hash);
        this.pageNumber = data.pageNumber;
        this.impacts = data.impacts;
        this.languages = data.languages;
    }

    getHash(): string {
        return this.hash;
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

    updateImpacts(impacts: string[]): void {
        this.impacts = impacts;
        this.updateUrl();
    }

    updateLanguages(languages: string[]): void {
        this.languages = languages;
        this.updateUrl();
    }

    updatePageNumber(pageNumber: number): void {
        this.pageNumber = pageNumber;
        this.updateUrl();
    }

    getDataFromUrl(hash: string): { impacts: string[], languages: string[], pageNumber: number } {
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

    getData(): { impacts: string[], languages: string[], pageNumber: number } {
        return { impacts: this.impacts, languages: this.languages, pageNumber: this.pageNumber };
    }

    isEmpty(): boolean {
        return this.hash === "";
    }
}