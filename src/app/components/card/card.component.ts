import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DinosaurEntry } from "../../shared/types";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent {
  @Input() dinosaur: DinosaurEntry | null = null;

  private readonly validClassifications = ["Theropoda", "Sauropodomorpha", "Ornithischia"];

  get imagePath(): string {
    const classification = (this.dinosaur as any)?.classification;
    if (!this.hasValidImage) {
      return "";
    }
    const classificationLower = classification.toLowerCase();
    const path = `assets/images/${classificationLower}.svg`;
    return path;
  }

  get hasValidImage(): boolean {
    const classification = (this.dinosaur as any)?.classification;
    // Check if classification exists AND is in our valid array (case-insensitive)
    return !!(
      classification &&
      this.validClassifications.some(
        (valid) => valid.toLowerCase() === classification.toLowerCase()
      )
    );
  }

  get classification(): string | null {
    return (this.dinosaur as any)?.classification || null;
  }

  /**
   * Convert dinosaur length to units of kayaks
   */
  convertLength(lengthString: string | undefined): string {
    if (!lengthString) return "";

    // Extract number(s) and unit from the string
    const match = lengthString.match(
      /^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?\s+(foot|feet|inch|inches)$/i
    );
    if (!match) return lengthString; // Return original if format doesn't match

    const firstValue = parseFloat(match[1]);
    const secondValue = match[2] ? parseFloat(match[2]) : null;
    const unit = match[3].toLowerCase();

    // If input is a range, calculate the middle value to use
    const value = secondValue ? (firstValue + secondValue) / 2 : firstValue;

    let lengthInFeet: number;

    // Make sure all units are handled in feet
    switch (unit) {
      case "inch":
      case "inches":
        lengthInFeet = value / 12;
        break;
      case "foot":
      case "feet":
        lengthInFeet = value;
        break;
      default:
        return lengthString;
    }

    // Convert feet to kayaks
    const comparisonItem = "kayaks";
    const comparisonItemLength = 9;
    const lengthInBuses = lengthInFeet / comparisonItemLength;

    const convertedLengthString =
      lengthInBuses < 0.1
        ? `0.1 ${comparisonItem}`
        : `${lengthInBuses.toFixed(1)} ${comparisonItem}`;

    return convertedLengthString;
  }
}
