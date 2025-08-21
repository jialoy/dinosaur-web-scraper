import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DinosaurEntry } from "../../shared/types";

interface KayakVisualisationData {
  widthPercentage: number; // Width of each kayak's image in %
  cropPercentage: number; // How much of each kayak to show in %
  imageCropPosition: string; // How to position the cropped image
}

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

  get kayakImagePath(): string {
    return `assets/images/kayak.svg`;
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
   * Calculate CSS properties for visualising length in kayaks for a given dinosaur
   */
  getKayakVisualisationData(): KayakVisualisationData[] {
    if (!this.dinosaur?.length) {
      return [];
    }

    const kayakValue = parseFloat(this.convertLength(this.dinosaur.length)); // Length in kayaks
    const totalImages = Math.ceil(kayakValue); // No. of images to show
    const images: KayakVisualisationData[] = []; // To store kayak image data

    // Calculate the proportional width for each image based on how much it contributes
    let totalProportion = 0;
    const proportions: number[] = [];

    for (let i = 0; i < totalImages; i++) {
      const remainingLength = kayakValue - i;
      // How much of a kayak this image needs to show
      const proportion = remainingLength >= 1 ? 1 : remainingLength;
      proportions.push(proportion);
      totalProportion += proportion;
    }

    for (let i = 0; i < totalImages; i++) {
      const remainingLength = kayakValue - i;
      const proportion = proportions[i];

      // The entire set of images should span 50% of the parent container (image-section)'s width,
      // so calculate the percentage of that 50% total based on this image's proportion
      const widthPercentage = (proportion / totalProportion) * 50;

      let cropPercentage: number;
      let imageCropPosition: string;

      if (remainingLength >= 1) {
        cropPercentage = 100; // For full images show 100% of the kayak
        imageCropPosition = "left center";
      } else {
        cropPercentage = remainingLength * 100; // For partial images, crop based on its fraction
        imageCropPosition = "left center";
      }

      images.push({
        widthPercentage: widthPercentage,
        cropPercentage: cropPercentage,
        imageCropPosition: imageCropPosition,
      });
    }

    return images;
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
