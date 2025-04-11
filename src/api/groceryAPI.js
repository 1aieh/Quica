const API_BASE_URL = "https://simple-grocery-store-api.glitch.me"; // or https://simple-grocery-api.store/ if connection issues

/**
 * Fetches all available products from the grocery store API
 * @returns {Promise<Array>} Array of products
 */
export async function fetchGroceryItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const products = await response.json();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      description: product.description || "",
    }));
  } catch (error) {
    console.error("Error fetching grocery items:", error);
    throw error;
  }
}

/**
 * Fetches a single product by ID
 * @param {string} productId - The ID of the product to fetch
 * @returns {Promise<Object>} Product details
 */
export async function fetchProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);

    if (!response.ok) {
      throw new Error(`Product not found: ${productId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
}

/**
 * Fetches products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of products in the category
 */
export async function fetchProductsByCategory(category) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products?category=${category}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products in category: ${category}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
}

// Export the functions so they can be imported and used in other files
// export { getStatus, getProducts, fetchGroceryItems, fetchProductById };

// You could also use a default export if preferred:
// export default { getStatus, getProducts, fetchGroceryItems, fetchProductById, fetchProductsByCategory };
