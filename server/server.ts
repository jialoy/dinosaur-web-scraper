import express from "express";
import cors from "cors";
import { scrapePage, addCladeDataToEntries, extractValsToArray } from "./scraper";
import { DinosaurEntry } from "../src/app/shared/types";

const app = express();
const port = 3000; // Running scraper server on this port

// Pages to scrape
const urls = [
  "https://www.thoughtco.com/armored-dinosaur-pictures-and-profiles-4043317",
  "https://www.thoughtco.com/duck-billed-dinosaur-4043319",
  "https://www.thoughtco.com/ornithopod-dinosaur-pictures-and-profiles-4043320",
  "https://www.thoughtco.com/horned-frilled-dinosaur-4043321",
  "https://www.thoughtco.com/raptor-dinosaur-pictures-and-profiles-4047613",
  "https://www.thoughtco.com/feathered-dinosaur-pictures-and-profile-4049097",
  "https://www.thoughtco.com/sauropod-in-pictures-4047610",
  "https://www.thoughtco.com/therizinosaur-pictures-and-profiles-4043315",
  "https://www.thoughtco.com/prosauropod-dinosaur-pictures-and-profiles-4043316",
];

app.use(cors());

app.get("/api/scraper", async (req, res) => {
  try {
    console.log("Starting scrape...");

    console.time("Scrape time");
    const scrapePromises = urls.map(async (url) => {
      const pageData = await scrapePage(url);
      console.log(`Scraped page: ${url}`);
      return pageData;
    });
    const allDinosaursData = await Promise.all(scrapePromises);
    console.timeEnd("Scrape time");

    let dinosaursData: DinosaurEntry[] = allDinosaursData
      .filter((data): data is DinosaurEntry[] => data !== undefined)
      .flat();

    console.log(
      `Scraped ${dinosaursData.length} entries, now fetching clade data from Wikipedia...`
    );
    console.time("Add clades time");

    dinosaursData = await addCladeDataToEntries(dinosaursData);
    console.timeEnd("Add clades time");

    dinosaursData.sort((a, b) => a.name.localeCompare(b.name));

    console.log("Success!");

    res.json(dinosaursData);
  } catch (error) {
    console.error("Error in scraper route:", error);
    res.status(500).json({
      error: "Error scraping data",
    });
  }
});

app.listen(port, () => {
  console.log(`Scraping server is up and running on http://localhost:${port}`);
});
