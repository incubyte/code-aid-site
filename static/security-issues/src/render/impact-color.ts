import { Impact } from "../types";

export function getImpactColor(impact: Impact): string {
    let color = "";
    if (impact === Impact.HIGH) {
        color = "red";
    } else if (impact === Impact.MEDIUM) {
        color = "yellow";
    } else {
        color = "green";
    }
    return color;
}
