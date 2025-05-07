// // main.js
// const { launchBrowser } = require("./browser");
// const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
// const { 
//   insertNovel, 
//   insertChapters, 
//   checkNovelExists,
//   getLatestChapterNumber,
//   closeDbConnection
// } = require("./DatabaseOperations");

// // Main execution function
// async function main() {
//     const url = "https://www.mvlempyr.com/novel/reawakening-sss-rank-villains-pov"; // Target URL
//     const browser = await launchBrowser();
//     const page = await browser.newPage();
    
//     try {
//         // Set up the page
//         await page.setUserAgent(
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//         );
//         await page.goto(url, { waitUntil: "networkidle2" });

//         // Scrape novel details
//         const novelData = await scrapeNovelDetails(page);
//         console.log("Novel information:", novelData);

//         if (!novelData.title || !novelData.author) {
//             console.log("Missing essential novel data (title or author). Exiting.");
//             return;
//         }

//         // Store novel in database or get existing ID
//         const novelId = await insertNovel({
//             title: novelData.title,
//             author: novelData.author,
//             description: novelData.synopsis,
//             cover_image_url: novelData.imageLink,
//             tags: novelData.tags,
//             genres: novelData.genres,
//             status: novelData.status,
//         });

//         if (!novelId) {
//             console.log("Failed to process novel data. Exiting.");
//             return;
//         }

//         // Get latest chapter from DB to determine how many chapters to scrape
//         const latestChapterNumber = await getLatestChapterNumber(novelId);
//         console.log(`Current chapters in database: ${latestChapterNumber}`);
//         console.log(`Total chapters on site: ${novelData.numOfCh}`);

//         if (latestChapterNumber >= novelData.numOfCh) {
//             console.log("Novel is already up to date. No new chapters to scrape.");
//             return;
//         }

//         // Calculate how many new chapters to scrape
//         const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
//         console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

//         // Scrape chapters (only the new ones)
//         // If no chapters exist, scrape all. Otherwise, scrape only new chapters
//         const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
//         console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

//         // Store new chapters in database
//         if (scrapedChapters.length > 0) {
//             const newChaptersCount = await insertChapters(novelId, scrapedChapters);
//             console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
//         } else {
//             console.log("No new chapters to store.");
//         }

//     } catch (error) {
//         console.error("Error during scraping:", error);
//     } finally {
//         // Close browser when done
//         await browser.close();
//         // Close database connection
//         await closeDbConnection();
//         console.log("Scraping process completed");
//     }
// }

// // Execute the main function
// main().catch(console.error);

// main.js
const { launchBrowser } = require("./browser");
const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
const { 
  insertNovel, 
  insertChapters, 
  checkNovelExists,
  getLatestChapterNumber,
  closeDbConnection
} = require("./DatabaseOperations");

// Main execution function
async function main() {

    const urls = [
        "https://www.mvlempyr.com/novel/a-mistaken-marriage-match-record-of-washed-grievances",
        "https://www.mvlempyr.com/novel/a-monster-who-levels-up",
        "https://www.mvlempyr.com/novel/a-new-india",
        "https://www.mvlempyr.com/novel/a-new-world-an-immersive-game-experience",
        "https://www.mvlempyr.com/novel/a-novel-concept---a-death-a-day-mc-will-live-anyway",
        "https://www.mvlempyr.com/novel/a-painting-of-the-villainess-as-a-young-lady",
        "https://www.mvlempyr.com/novel/a-peacock-husband-of-five-princesses-by-day-a-noble-assassin-by-night",
        "https://www.mvlempyr.com/novel/a-perverts-world",
        "https://www.mvlempyr.com/novel/a-practical-guide-to-sorcery",
        "https://www.mvlempyr.com/novel/a-rare-magical-miracle-in-the-world",
        "https://www.mvlempyr.com/novel/a-record-of-a-mortals-journey-to-immortality",
        "https://www.mvlempyr.com/novel/a-regressed-villain-heroines-villainesses-and-me",
        "https://www.mvlempyr.com/novel/a-regressors-tale-of-cultivation",
        "https://www.mvlempyr.com/novel/a-saint-who-was-adopted-by-the-grand-duke",
        "https://www.mvlempyr.com/novel/a-slave-to-my-vengeful-lover",
        "https://www.mvlempyr.com/novel/a-slight-smile-is-very-charming",
        "https://www.mvlempyr.com/novel/a-soldiers-life",
        "https://www.mvlempyr.com/novel/a-time-of-tigers---from-peasant-to-emperor",
        "https://www.mvlempyr.com/novel/a-transmigrators-privilege",
        "https://www.mvlempyr.com/novel/a-villainess-for-the-tyrant",
        "https://www.mvlempyr.com/novel/a-villains-way-of-taming-heroines",
        "https://www.mvlempyr.com/novel/a-vip-as-soon-as-you-log-in",
        "https://www.mvlempyr.com/novel/a-wild-last-boss-appeared",
        "https://www.mvlempyr.com/novel/a-will-eternal",
        "https://www.mvlempyr.com/novel/a-wolfs-howl-a-fairys-wing",
        "https://www.mvlempyr.com/novel/absolute-cheater",
        "https://www.mvlempyr.com/novel/absolute-choice",
        "https://www.mvlempyr.com/novel/absolute-death-game",
        "https://www.mvlempyr.com/novel/absolute-depravity-reincarnated-with-a-lustful-system",
        "https://www.mvlempyr.com/novel/absolute-regression",
        "https://www.mvlempyr.com/novel/absolutely-do-not-touch-eldmia-egga",
        "https://www.mvlempyr.com/novel/abyss-draconis",
        "https://www.mvlempyr.com/novel/abyss-of-dual-cultivation-goddesss-lust-system",
        "https://www.mvlempyr.com/novel/abyssal-awakening",
        "https://www.mvlempyr.com/novel/abyssal-chronicles",
        "https://www.mvlempyr.com/novel/abyssal-lord-of-the-magi-world",
        "https://www.mvlempyr.com/novel/abyssal-sovereign-the-demons-dominion",
        "https://www.mvlempyr.com/novel/academys-undercover-professor",
        "https://www.mvlempyr.com/novel/accompanying-the-phoenix",
        "https://www.mvlempyr.com/novel/ace-of-terrans",
        "https://www.mvlempyr.com/novel/adopting-and-raising-the-male-lead-and-the-villain",
        "https://www.mvlempyr.com/novel/adorable-treasured-fox-divine-doctor-mother-overturning-the-heavens",
        "https://www.mvlempyr.com/novel/advent-of-the-archmage",
        "https://www.mvlempyr.com/novel/advent-of-the-three-calamities",
        "https://www.mvlempyr.com/novel/adventurer-of-many-professions",
        "https://www.mvlempyr.com/novel/aether-beasts",
        "https://www.mvlempyr.com/novel/aether-chronicles-birth-of-a-legend",
        "https://www.mvlempyr.com/novel/aetheral-space",
        "https://www.mvlempyr.com/novel/aetheric-chronicles-reborn-as-an-extra",
        "https://www.mvlempyr.com/novel/affinity-chaos",
      ];

    const browser = await launchBrowser();

    try {
        for (let url of urls) {
            console.log(`Scraping novel from URL: ${url}`);
            const page = await browser.newPage();

            try {
                // Set up the page
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                );
                await page.goto(url, { waitUntil: "networkidle2" });

                // // Scrape novel details
                // const novelData = await scrapeNovelDetails(page);
                // console.log("Novel information:", novelData);

                // if (!novelData.title || !novelData.author) {
                //     console.log("Missing essential novel data (title or author). Exiting.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Store novel in database or get existing ID
                // const novelId = await insertNovel({
                //     title: novelData.title,
                //     author: novelData.author,
                //     description: novelData.synopsis,
                //     cover_image_url: novelData.imageLink,
                //     tags: novelData.tags,
                //     genres: novelData.genres,
                //     status: novelData.status,
                // });

                // if (!novelId) {
                //     console.log("Failed to process novel data. Skipping.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Get latest chapter from DB to determine how many chapters to scrape
                // const latestChapterNumber = await getLatestChapterNumber(novelId);
                // console.log(`Current chapters in database: ${latestChapterNumber}`);
                // console.log(`Total chapters on site: ${novelData.numOfCh}`);

                // if (latestChapterNumber >= novelData.numOfCh) {
                //     console.log("Novel is already up to date. No new chapters to scrape.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Calculate how many new chapters to scrape
                // const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
                // console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

                // // Scrape chapters (only the new ones)
                // const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
                // console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Scrape novel details
        const novelData = await scrapeNovelDetails(page);
        console.log("Novel information:", novelData);

        if (!novelData.title || !novelData.author) {
            console.log("Missing essential novel data (title or author). Exiting.");
            continue;  // Skip this novel and move to the next one
        }

        // Store novel in database or get existing ID
        const novelId = await insertNovel({
            title: novelData.title,
            author: novelData.author,
            description: novelData.synopsis,
            cover_image_url: novelData.imageLink,
            tags: novelData.tags,
            genres: novelData.genres,
            status: novelData.status,
        });

        if (!novelId) {
            console.log("Failed to process novel data. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Get latest chapter from DB to determine how many chapters to scrape
        const latestChapterNumber = await getLatestChapterNumber(novelId);
        
        // Use the most reliable chapter count - prefer numOfCh but fall back to chapters
        // if numOfCh is zero
        const totalChapters = novelData.numOfCh || parseInt(novelData.chapters) || 0;
        
        console.log(`Current chapters in database: ${latestChapterNumber}`);
        console.log(`Total chapters on site: ${totalChapters}`);

        if (latestChapterNumber >= totalChapters || totalChapters === 0) {
            console.log("Novel is already up to date or no chapters found. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Calculate how many new chapters to scrape
        const chaptersToScrape = totalChapters - latestChapterNumber;
        console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

        // Scrape chapters (only the new ones)
        const scrapedChapters = await scrapeChapters(page, totalChapters, latestChapterNumber);
        console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Store new chapters in database
                if (scrapedChapters.length > 0) {
                    const newChaptersCount = await insertChapters(novelId, scrapedChapters);
                    console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
                } else {
                    console.log("No new chapters to store.");
                }

            } catch (error) {
                console.error(`Error during scraping URL: ${url}`, error);
            } finally {
                // Close the page after scraping
                await page.close();
            }
        }

    } catch (error) {
        console.error("Error during scraping process:", error);
    } finally {
        // Close browser when done
        await browser.close();
        // Close database connection
        await closeDbConnection();
        console.log("Scraping process completed");
    }
}

// Execute the main function
main().catch(console.error);
