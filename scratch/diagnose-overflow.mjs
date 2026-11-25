import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/login?callbackUrl=/account/addresses", {
    waitUntil: "networkidle0",
  });
  await page.type("input[name='email']", "arjun.verma@robohatch.com");
  await page.type("input[name='password']", "SecureAccount!2026");
  await page.click("button[type='submit']");
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.setViewport({ width: 320, height: 600 });
  await page.goto("http://localhost:3000/account/addresses", {
    waitUntil: "networkidle0",
  });

  const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const winWidth = await page.evaluate(() => window.innerWidth);
  console.log("scrollWidth:", docScrollWidth, "innerWidth:", winWidth);

  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("*"))
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 10)
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        right: el.getBoundingClientRect().right,
        text: el.textContent?.slice(0, 40),
      }));
  });
  console.log("Overflowing elements:", JSON.stringify(elements, null, 2));
} finally {
  await browser.close();
}
