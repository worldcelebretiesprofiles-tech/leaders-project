import { chromium } from "playwright";

async function run() {
  console.log("Launching headless Chromium...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs: string[] = [];
  const errors: string[] = [];

  page.on("console", (msg) => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });

  page.on("pageerror", (err) => {
    const text = `[PAGE ERROR] ${err.message}\nStack: ${err.stack}`;
    errors.push(text);
    console.error(text);
  });

  try {
    console.log("Navigating to http://localhost:5173/admin...");
    await page.goto("http://localhost:5173/admin", { waitUntil: "networkidle" });
    console.log("Admin page loaded.");

    // Wait for the profiles list to render and the 'Edit' button to be ready
    await page.waitForSelector("button:has-text('Edit')");
    console.log("Directory view rendered. Clicking 'Edit' for the profile...");

    // Click the edit button
    await page.click("button:has-text('Edit')");
    console.log("Edit button clicked. Waiting 5 seconds to capture logs and trace freezes...");

    // Wait 5 seconds to capture console logs, page errors, or infinite render warnings
    await page.waitForTimeout(5000);

    console.log("Finished waiting.");
  } catch (err: any) {
    console.error("Test execution failed:", err.message);
  } finally {
    console.log("\n--- Summary of Captured Page Errors ---");
    if (errors.length === 0) {
      console.log("No page errors captured.");
    } else {
      errors.forEach((e) => console.log(e));
    }

    console.log("\n--- Closing browser ---");
    await browser.close();
    process.exit(0);
  }
}

run();
