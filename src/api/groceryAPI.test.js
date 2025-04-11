import { fetchGroceryItems } from "./groceryAPI.js";

async function testGroceryProducts() {
  console.log("🧪 Testing Grocery Products API...\n");

  try {
    // Test: Fetch all grocery items
    console.log("Fetching grocery products...");
    const items = await fetchGroceryItems();

    // Log results
    console.log("\n✅ Successfully fetched", items.length, "items");
    console.log("\nSample items:");
    items.slice(0, 3).forEach((item) => {
      console.log(`- ${item.name} ($${item.price}) - ${item.category}`);
    });

    // Basic validation
    if (!Array.isArray(items)) {
      throw new Error("Expected items to be an array");
    }

    if (items.length === 0) {
      throw new Error("No items returned from API");
    }

    // Validate item structure
    const firstItem = items[0];
    const requiredFields = ["id", "name", "price", "category", "inStock"];
    requiredFields.forEach((field) => {
      if (!(field in firstItem)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

// Run the test
testGroceryProducts();
