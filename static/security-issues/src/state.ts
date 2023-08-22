export class GlobalState {
    constructor(private impacts: string[], private languages: string[], private pageNumber: number) { }

    getImpacts(): string[] {
        return this.impacts;
    }

    getLanguages(): string[] {
        return this.languages;
    }

    getPageNumber(): number {
        return this.pageNumber;
    }

    setImpacts(impacts: string[]): void {
        const uniqueImpacts = [...new Set(impacts)];
        this.impacts = uniqueImpacts;
    }

    setLanguages(languages: string[]): void {
        const uniqueLanguages = [...new Set(languages)];
        this.languages = uniqueLanguages;
    }

    setPageNumber(pageNumber: number): void {
        this.pageNumber = pageNumber;
    }
}