import http from "http";

const slugs = [
  "voronoi-kinetic-vessel",
  "tessellated-desk-organizer",
  "gyroid-acoustic-diffuser",
  "modular-magsafe-dock",
  "articulated-cyber-beetle",
  "fibonacci-spiral-planter",
  "parametric-cable-loom",
  "minimalist-caliper-stand",
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, data }));
      })
      .on("error", reject);
  });
}

async function run() {
  console.log("Testing PDP routes on http://localhost:3000 ...");
  let allPassed = true;

  for (const slug of slugs) {
    const url = `http://127.0.0.1:3000/products/${slug}`;
    try {
      const res = await fetchPage(url);
      const ok = res.statusCode === 200;
      const hasSticky =
        res.data.includes("Mobile quick purchase bar") ||
        res.data.includes("Add to Cart (Demo)");
      const hasSpecs = res.data.includes("Technical Specifications");
      const hasDelivery =
        res.data.includes("Fulfillment &amp; Assurance") ||
        res.data.includes("Fulfillment & Assurance");
      const hasEditorial =
        res.data.includes("Design Concept &amp; Narrative") ||
        res.data.includes("Design Concept & Narrative");

      if (!ok || !hasSticky || !hasSpecs || !hasDelivery || !hasEditorial) {
        allPassed = false;
        console.error(
          `FAILED: ${slug} (status: ${res.statusCode}, sticky: ${hasSticky}, specs: ${hasSpecs}, delivery: ${hasDelivery}, editorial: ${hasEditorial})`
        );
      } else {
        console.log(
          `PASS: /products/${slug} (HTTP 200, sticky: OK, specs: OK, delivery: OK, editorial: OK)`
        );
      }
    } catch (e) {
      allPassed = false;
      console.error(`ERROR fetching ${url}:`, e.message);
    }
  }

  if (allPassed) {
    console.log("\nALL 8 PDP ROUTES VERIFIED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("\nSOME CHECKS FAILED");
    process.exit(1);
  }
}

run();
