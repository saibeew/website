const dotenv = require("dotenv");
const path = require("path");

// Inject local config first
dotenv.config({ path: ".env.local" });

const { createQuantContent } = require("../src/lib/studio/quant/index");

async function main() {
  console.log("=========================================");
  console.log("TESTING TIER 4: QUANT-SIGNAL ENGINE");
  console.log("=========================================");

  try {
    const result = await createQuantContent("XAUUSD");
    console.log("\n[Signal Details]:");
    console.log(`- Symbol: ${result.signal.symbol}`);
    console.log(`- Title: ${result.signal.title}`);
    console.log(`- Bias: ${result.signal.bias}`);
    console.log(`- Description: ${result.signal.description}`);

    console.log("\n[Generated Video Script]:");
    console.log(`- Title: ${result.script.title}`);
    console.log(`- Script Text:\n${result.script.scriptText}`);

    console.log("\n[Compliance Status]:");
    console.log(`- Checked: ${result.script.complianceChecked}`);
    console.log(`- Warnings/Flags:\n  * ${result.script.warnings.join("\n  * ")}`);

    console.log("\n[Generated Chart SVG Path]:");
    console.log(`- Path: ${result.chartUrl}`);
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

main().catch(console.error);
export {};
