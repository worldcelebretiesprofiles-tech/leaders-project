import { chromium } from "playwright";
import fs from "node:fs";

async function run() {
  console.log("Launching Chromium with CDP enabled...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Connecting to Chrome DevTools Protocol...");
  const client = await page.context().newCDPSession(page);

  // Enable Profiler domain
  await client.send("Profiler.enable");

  console.log("Navigating to http://localhost:5173/admin...");
  await page.goto("http://localhost:5173/admin", { waitUntil: "networkidle" });
  await page.waitForSelector("button:has-text('Create New Profile')");
  console.log("Page loaded. Starting CPU profiling...");

  // Start profiling
  await client.send("Profiler.start");

  console.log("Clicking 'Create New Profile' to trigger freeze...");
  await page.click("button:has-text('Create New Profile')").catch(e => {
    console.log("Click triggered page unresponsiveness as expected:", e.message);
  });

  console.log("Recording CPU execution for 3 seconds...");
  // Sleep 3 seconds synchronously/asynchronously to collect stack traces of the infinite loop
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Stopping CPU profiling...");
  const { profile } = await client.send("Profiler.stop");

  // Disable Profiler
  await client.send("Profiler.disable");

  const outputPath = "profile.cpuprofile.json";
  console.log(`Writing CPU profile to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(profile, null, 2));
  console.log("Profile written successfully!");

  await browser.close();
  
  // Quick analysis of the profile
  console.log("\n--- CPU Profile Analysis ---");
  const nodes = profile.nodes || [];
  const samples = profile.samples || [];
  
  // Count node occurrences in samples
  const hitCounts: Record<number, number> = {};
  samples.forEach((nodeId: number) => {
    hitCounts[nodeId] = (hitCounts[nodeId] || 0) + 1;
  });

  const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));
  
  // Sort nodes by hit count
  const sortedNodes = Object.entries(hitCounts)
    .map(([nodeIdStr, hits]) => {
      const nodeId = parseInt(nodeIdStr, 10);
      const node = nodeMap.get(nodeId) as any;
      return {
        hits,
        functionName: node?.callFrame?.functionName || "anonymous",
        url: node?.callFrame?.url || "unknown",
        lineNumber: node?.callFrame?.lineNumber || 0,
      };
    })
    .sort((a, b) => b.hits - a.hits);

  console.log("Top hot-spots in the JavaScript execution thread:");
  sortedNodes.slice(0, 15).forEach((n, idx) => {
    console.log(`${idx + 1}. Function: "${n.functionName}", Hits: ${n.hits}, File: ${n.url}:${n.lineNumber}`);
  });
  
  process.exit(0);
}

run();
