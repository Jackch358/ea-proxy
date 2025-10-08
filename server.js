const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/proclubs", async (req, res) => {
  const url = "https://proclubs.ea.com/api/fc/clubs/matches?matchtype=friendlymatch&platform=common-gen5&clubids=13488";

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Set realistic browser headers
    await page.setExtraHTTPHeaders({
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117 Safari/537.36"
    });

    const response = await page.goto(url, { waitUntil: "networkidle2" });

    const contentType = response.headers()["content-type"];
    if (!contentType.includes("application/json")) {
      throw new Error("EA API did not return JSON");
    }

    const body = await page.evaluate(() => document.body.innerText);
    await browser.close();

    res.json(JSON.parse(body));
  } catch (error) {
    res.status(500).json({
      error: "EA API did not return JSON",
      contentType: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
