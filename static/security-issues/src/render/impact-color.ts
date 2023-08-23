import { Impact } from "../types";

export function getImpactColor(impact: Impact): string {
  let color = "";
  if (impact === Impact.HIGH) {
    color = "#ff4500";
  } else if (impact === Impact.MEDIUM) {
    color = "#ff6600";
  } else {
    color = "#008a45";
  }
  return color;
}
