import { Injectable } from "@angular/core";
import { DinosaurEntry } from "../shared/types";

@Injectable({
  providedIn: "root",
})
export class DataHandler {
  /**
   * Extract relevant data (e.g., length/weight) and format it in a form that d3 needs.
   */
  formatDataForBarChart(
    data: DinosaurEntry[],
    key: keyof DinosaurEntry
  ): { name: string; value: number }[] {
    return data.map((dino) => {
      const name = dino.name.toLowerCase();
      let valueStr = dino[key] ?? "";

      if (!valueStr) return { name, value: 0 };

      let value: number;
      if (/inches?/i.test(valueStr)) {
        value = this.inchesToFeet(valueStr);
      } else {
        const match = valueStr.match(/([\d.]+)/);
        value = match ? parseFloat(match[1]) : 0;
      }

      return { name, value };
    });
  }

  /**
   * Helper to convert inches to feet
   */
  private inchesToFeet(value: string): number {
    const match = value.match(/([\d.]+)\s*inches?/i);
    if (!match) return parseFloat(value);
    return parseFloat(match[1]) / 12;
  }
}
