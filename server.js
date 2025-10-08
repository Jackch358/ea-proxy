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
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    const response = await page.goto(url, { waitUntil: "networkidle2" });
    const body = await page.evaluate(() => document.body.innerText);

    await browser.close();
    res.json(JSON.parse(body));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data via Puppeteer" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
