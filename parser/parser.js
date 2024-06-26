const puppeteer = require("puppeteer");
const { MongoClient, ServerApiVersion } = require("mongodb");

async function scrapePage(url) {
  const browser = await puppeteer.launch({
    headless: "new", // Opt into the new headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: ["--disable-web-security"],
    ignoreDefaultArgs: ["--disable-extensions"],
    timeout: 30000,
    args: [
      `--user-agent=${"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}`,
    ],
  });
  const page = await browser.newPage();

  const targetLocale = "en-US";

  await page.evaluate((locale) => {
    Object.defineProperty(navigator, "language", {
      value: locale,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }, targetLocale);

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const declineButton = await page.$(
    'div[aria-label*="Decline optional cookies"], div[aria-label*="Neka valfria cookies"], div[aria-label*="Optionele cookies afwijzen"]'
  );
  if (declineButton) {
    await declineButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const closeButton = await page.$(
    'div[aria-label*="Close"], div[aria-label*="Stäng"], div[aria-label*="Sluiten"]'
  );
  if (closeButton) {
    await closeButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const uniqueLinks = new Set();
  let uniqueLinksCount = 0;

  async function autoScroll() {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  await autoScroll(page);

  const links = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll('a[href^="https://www.facebook.com/events"]')
    );
    return elements.map((element) => element.href);
  });

  links.forEach((link) => {
    if (!uniqueLinks.has(link)) {
      uniqueLinks.add(link);
      uniqueLinksCount++;
    }
  });

  await browser.close();

  console.log(`Number of unique links: ${uniqueLinksCount}`);

  return Array.from(uniqueLinks);
}

async function scrapeEventPage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: ["--disable-web-security"],
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      `--user-agent=${"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}`,
    ],
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const targetLocale = "en-US";

  await page.evaluate((locale) => {
    Object.defineProperty(navigator, "language", {
      value: locale,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }, targetLocale);

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const declineButton = await page.$(
    'div[aria-label*="Decline optional cookies"], div[aria-label*="Neka valfria cookies"], div[aria-label*="Optionele cookies afwijzen"]'
  );
  if (declineButton) {
    await declineButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const nestedSpanElement = await page.$("h1 span span span");
  const nestedImgElement = await page.$(
    'img[data-imgperflogname="profileCoverPhoto"]'
  );

  if (nestedSpanElement && nestedImgElement) {
    const match = url.match(/\/events\/(\d+)\//);
    const eventNumber = match ? match[1] : null;

    const ogTitleContent = await page.evaluate(() => {
      const metaElement = document.querySelector(
        'meta[property="og:description"]'
      );
      return metaElement ? metaElement.content : null;
    });

    const eventName = await page.evaluate(
      (span) => span.innerText,
      nestedSpanElement
    );

    const eventImageSrc = await page.evaluate(
      (img) => (img ? img.getAttribute("src") : null),
      nestedImgElement
    );

    const spanWithYear = await page.evaluate(() => {
      const spanElements = document.querySelectorAll("span");
      for (const span of spanElements) {
        const textContent = span.innerText.trim();
        const match = textContent.match(/\b202\d{1}\b/);
        if (match) {
          return textContent;
        }
      }
      return null;
    });

    await browser.close();

    return {
      eventNumber: eventNumber,
      eventDescription: ogTitleContent,
      eventName: eventName,
      eventImageSrc: eventImageSrc,
      eventTiming: spanWithYear,
    };
  } else {
    console.log("Nested span not found.");
    await browser.close();
    return null;
  }
}

async function main() {
  const urls = [
    "https://www.facebook.com/klubbfredagsmangel/upcoming_hosted_events",
    "https://www.facebook.com/gamlaenskedebryggeri/upcoming_hosted_events",
    "https://www.facebook.com/spelalive/upcoming_hosted_events",
    "https://www.facebook.com/KLUBBDODSWE/upcoming_hosted_events",
    "https://www.facebook.com/RevivalBooking/upcoming_hosted_events",
    "https://www.facebook.com/kollektivetlivetbar/upcoming_hosted_events",
    "https://www.facebook.com/MetalFestSweden/upcoming_hosted_events",
    "https://www.facebook.com/sofiehofunderjord/upcoming_hosted_events",
    "https://www.facebook.com/Debasersthlm/upcoming_hosted_events",
    "https://www.facebook.com/NalenStockholm/upcoming_hosted_events",
    "https://www.facebook.com/ClubUnityJkpg/upcoming_hosted_events",
    "https://www.facebook.com/klubbdissonans/upcoming_hosted_events",
    "https://www.facebook.com/TheHushHushClub/upcoming_hosted_events",
    "https://www.facebook.com/CloseUpMagazine/upcoming_hosted_events",
    "https://www.facebook.com/FKPscorpiosweden/upcoming_hosted_events",
    "https://www.facebook.com/OLearysVasteras/upcoming_hosted_events",
    "https://www.facebook.com/crypticconcerts/upcoming_hosted_events",
    "https://www.facebook.com/theabyssgbg/upcoming_hosted_events",
    "https://www.facebook.com/Thecryptlkpg/upcoming_hosted_events",
    "https://www.facebook.com/skrikhult/upcoming_hosted_events",
    "https://www.facebook.com/orionteatern/upcoming_hosted_events",
    "https://www.facebook.com/slaktkyrkan/upcoming_hosted_events",
    "https://www.facebook.com/lugersweden/upcoming_hosted_events",
    "https://www.facebook.com/aeternumconcerts/upcoming_hosted_events",
    "https://www.facebook.com/kulturhusetstadsteatern/upcoming_hosted_events",
    "https://www.facebook.com/profile.php?id=100086991661271&sk=upcoming_hosted_events",
    "https://www.facebook.com/profile.php?id=100057644011832&sk=upcoming_hosted_events",
    "https://www.facebook.com/aftersunsetproduction/upcoming_hosted_events",
    "https://www.facebook.com/Stadsgardsterminalen/upcoming_hosted_events",
    "https://www.facebook.com/katalin.uppsala/upcoming_hosted_events",
    "https://www.facebook.com/svkvastermalm/upcoming_hosted_events",
    "https://www.facebook.com/geronimosfgt/upcoming_hosted_events",
    "https://www.facebook.com/raptorbooking/upcoming_hosted_events",
    "https://www.facebook.com/NTC666/upcoming_hosted_events",
    "https://www.facebook.com/amplifiedstockholm/upcoming_hosted_events",
    "https://www.facebook.com/williamsUppsala/upcoming_hosted_events",
    "https://www.facebook.com/stickyfingersgbg/upcoming_hosted_events",
    "https://www.facebook.com/SodraTeatern/upcoming_hosted_events",
    "https://www.facebook.com/events/search?q=club%20probaton",
    "https://www.facebook.com/bomberbarmotala/upcoming_hosted_events",
    "https://www.facebook.com/kulturhusetfemman/upcoming_hosted_events",
    "https://www.facebook.com/gotalejonproduktion/upcoming_hosted_events",
    "https://www.facebook.com/cirkusarenor/upcoming_hosted_events",
    "https://www.facebook.com/livenationswe/upcoming_hosted_events",
    "https://www.facebook.com/ParksnackanUppsala/upcoming_hosted_events",
    "https://www.facebook.com/HellYeahRockClub/upcoming_hosted_events",
    "https://www.facebook.com/WillamsUppsala/upcoming_hosted_events",
    "https://www.facebook.com/Bulgasalmetal/upcoming_hosted_events",
    "https://www.facebook.com/dodsmassa/upcoming_hosted_events",
  ];

  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    const database = client.db("events_db");
    const collection = database.collection("events");

    let allEventLinks = [];
    for (const url of urls) {
      console.log("Navigating to:", url);
      const eventLinks = await scrapePage(url);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      allEventLinks = [...allEventLinks, ...eventLinks];
    }

    const uniqueEventLinks = Array.from(new Set(allEventLinks));

    for (const eventLink of uniqueEventLinks) {
      try {
        const eventData = await scrapeEventPage(eventLink);
        if (eventData) {
          const existingEvent = await collection.findOne({
            eventNumber: eventData.eventNumber,
          });
          if (!existingEvent) {
            await collection.insertOne(eventData);
            console.log(`Event data inserted: ${eventData.eventNumber}`);
          } else {
            console.log(
              `Event data with eventNumber ${eventData.eventNumber} already exists. Skipping.`
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log(`Event data is undefined for ${eventLink}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(
          `Error scraping event data for ${eventLink}:`,
          error.message
        );
      }
    }
  } finally {
    await client.close();
  }
}

main();
