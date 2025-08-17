import axios from "axios";
import * as cheerio from "cheerio";
import { wordsToNumbers } from "words-to-numbers";

export interface DinosaurEntry {
  name: string;
  historicalPeriod: string;
  length: string;
  weight: string;
  diet: string;
}

/**
 * Scrape a single page and extract data for every dinosaur entry found on the page.
 * @param url - URL of the page to scrape
 * @returns An array containing all dinosaur entries, with each entry containing the dinosaur's:
 *  - name
 *  - historical period
 *  - length
 *  - weight
 *  - diet
 */
export async function scrapePage(url: string): Promise<DinosaurEntry[] | undefined> {
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    // Elements to target on the page
    const dinoEntryDivId: string = "div[id^='list-sc-item_']"; // Main container for each entry
    const dinoNameSpanClass: string = "span.mntl-sc-block-heading__text"; // Title
    const dinoEntryPElement = "p.mntl-sc-block.mntl-sc-block-html"; // Field info

    const dinosaursData: DinosaurEntry[] = [];

    $(dinoEntryDivId).each((_, element) => {
      // Extract the name of the dinosaur
      const name = $(element).find(dinoNameSpanClass).text().trim();

      // Initialise variables to store each entry's information
      let historicalPeriod = "";
      let sizeAndWeight = "";
      let diet = "";

      // Look for the relevant elements inside the current div
      $(element)
        .find(dinoEntryPElement)
        .each((_, pElement) => {
          const text = $(pElement).text().trim();

          const fieldInfo = [
            { key: "Historical Period", value: historicalPeriod },
            { key: "Size and Weight", value: sizeAndWeight },
            { key: "Diet", value: diet },
          ];

          fieldInfo.forEach((field) => {
            const headerTextPossibilities = [field.key, `${field.key}:`];

            headerTextPossibilities.forEach((headerText) => {
              // Case 1: If the key plus value are found in the same <p> tag
              if (text.startsWith(headerText)) {
                field.value = text.replace(headerText, "").trim();
              }

              // Case 2: If the key is in one <p> tag and the value is in the next <p> tag
              if (text === headerText && $(pElement).next(dinoEntryPElement).length) {
                const nextText = $(pElement).next(dinoEntryPElement).text().trim();
                if (nextText) {
                  field.value = nextText;
                }
              }
            });
          });

          // Update the actual values after processing
          historicalPeriod = fieldInfo[0].value;
          sizeAndWeight = fieldInfo[1].value;
          diet = fieldInfo[2].value;
        });

      // If all information of interest is present, process add the entry to the data
      if (historicalPeriod && sizeAndWeight && diet && isValidMeasurementsString(sizeAndWeight)) {
        historicalPeriod = cleanHistoricalPeriodText(historicalPeriod);

        let { length, weight } = handleSizeAndWeight(sizeAndWeight);
        length = formatLengthText(length);
        weight = formatWeightText(weight);

        dinosaursData.push({
          name,
          historicalPeriod,
          length,
          weight,
          diet,
        });
      }
    });

    if (!dinosaursData || !dinosaursData.length) {
      console.warn("Unable to scrape data from page.");
    }

    return dinosaursData;
  } catch (error) {
    console.error("Error scraping page:", error);
  }
}

/**
 * Add dinosaur classification (clade data) to each dinosaur's entry in dinosaurData.
 * @param dinosaurData - All dinosaurs data returned from the scrape.
 * @returns A promise that resolves to the updated dinosaursData with clade data.
 */
export async function addCladeDataToEntries(
  dinosaursData: DinosaurEntry[]
): Promise<DinosaurEntry[]> {
  const updatedData: DinosaurEntry[] = [];

  // Process in batches of 50 with a tiny delay to throttle calls to Wiki APIs
  const batchSize = 50;
  const delay = 5;

  for (let i = 0; i < dinosaursData.length; i += batchSize) {
    const batch = dinosaursData.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (entry) => {
        const classification = await getCladeFromWikipedia(entry.name);
        return { ...entry, classification }; // Add classification (clade) to this entry
      })
    );

    updatedData.push(...batchResults);

    // Add delay between batches except for the last batch
    if (i + batchSize < dinosaursData.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return updatedData;
}

/**
 * Make a URL call to Wikipeida's API to fetch clade data for a given dinosaur.
 * @param entryTitle - Title of the wiki entry to fetch from (Dinosaur's name).
 * @returns A promise that resolves to the dinosaur's clade.
 */
async function getCladeFromWikipedia(entryTitle: string): Promise<string> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query` +
    `&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(entryTitle)}` +
    `&rvsection=0&rvparse&origin=*`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Dino clades (we are going for a Weishempel classification here)
    const targetClades = ["Sauropodomorpha", "Theropoda", "Ornithischia"];
    let cladeValue = "Unknown";

    const revisions = data.query.pages[Object.keys(data.query.pages)[0]].revisions;
    const htmlString = revisions[0]["*"];
    const $ = cheerio.load(htmlString);

    // Iterate through the rows: clade values live in <td> cells within <tr.taxonrow> rows
    $("tr.taxonrow").each((_, row) => {
      const cells = $(row).find("td");
      const firstCellText = $(cells[0]).text().trim();
      if (firstCellText.startsWith("Clade")) {
        const secondCellText = $(cells[1])
          .text()
          .trim()
          .replace(/^[†\s]+/, "");
        if (targetClades.includes(secondCellText)) {
          cladeValue = secondCellText;
          return false;
        }
      }
    });

    console.log(`Parsed clade for ${entryTitle}: ${cladeValue}`);
    return cladeValue;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error fetching wiki data for ${entryTitle}:`, errorMessage);
    throw error; // Re-throw to be caught by the caller
  }
}

function cleanHistoricalPeriodText(text: string): string {
  return text.replace(/\s*\(.*?\)\s*/g, "").trim();
}

/**
 * Format dinosaur length text string into 'Number + unit'
 */
function formatLengthText(text: string): string {
  // Clean up input text string
  text = text
    .replace(/\s+long$/i, "") // Remove trailing "long"
    .trim()
    .replace(/^(About|Up to)\s+/i, "") // Remove preceding "About/Up to"
    .trim();

  // Possible units: foot, feet, inches
  const unitRegex = /\b(foot|feet|inches)\b/i;

  // Extract units text
  const unitMatch = text.match(unitRegex);
  const unit = unitMatch ? unitMatch[0] : "";

  // Extract the value part for further processing
  const value = text.replace(unitRegex, "").trim();

  // If already numeric, return as-is with unit (assumes containing number means it is numeric)
  if (/\d/.test(value)) {
    return `${value} ${unit}`;
  }

  // Otherwise convert word to numeric
  const numericValue = wordsToNumbers(value, { fuzzy: true }) as string;
  return `${numericValue} ${unit}`;
}

function formatWeightText(text: string): string {
  // Possible units: pounds, tons, ounces
  const unitRegex = /\b(pounds|tons|ounces)\b/i;
  // Acceptable numeric words
  const numericWordsRegex = /half|few|less/i;

  // Extract units text
  const unitMatch = text.match(unitRegex);
  const unit = unitMatch ? unitMatch[0] : "";

  // Extract the value part for further processing
  const value = text.replace(unitRegex, "").trim();

  // If already numeric, return as-is with unit (assumes containing number means it is numeric)
  if (/\d/.test(value)) {
    return `${value} ${unit}`;
  }

  // If containing acceptable numeric words (a few, half), return as-is with unit
  if (numericWordsRegex.test(value)) {
    return `${value} ${unit}`.trim();
  }

  // Otherwise convert word to numeric
  const numericValue = wordsToNumbers(value) as string;
  return `${numericValue} ${unit}`;
}

/**
 * Split size and weight data and return as separate.
 */
function handleSizeAndWeight(sizeAndWeight: string): { length: string; weight: string } {
  const [length, weight] = sizeAndWeight.split("and").map((part) => part.trim());

  return { length, weight };
}

/**
 * Check if the sizeAndWeight string is in a valid format for further processing.
 */
function isValidMeasurementsString(sizeAndWeight: string): boolean {
  return !sizeAndWeight.includes("Unknown") && sizeAndWeight.includes("and");
}

/**
 * Extract all values of a key in the dinosaur data.
 * Helper for debugging, remove before prod
 */
export function extractValsToArray<T extends keyof DinosaurEntry>(
  key: T,
  dinosaursData: DinosaurEntry[]
): DinosaurEntry[T][] {
  return dinosaursData.map((dinosaurEntry) => dinosaurEntry[key]);
}
