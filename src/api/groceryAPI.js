const SPOONACULAR_API_KEY = 'd46177aae0fb4dcd86559493cc3054d7';

/**
 * Generate a random integer between min and max (inclusive)
 */
const getRandomPrice = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export async function searchSpoonacularProducts(query, number = 10) {
  try {
    console.log('Fetching products with query:', query);

    const url = new URL('https://api.spoonacular.com/food/products/search');
    url.searchParams.append('apiKey', SPOONACULAR_API_KEY);
    url.searchParams.append('query', query);
    url.searchParams.append('number', number.toString());

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (!data.products || !Array.isArray(data.products)) {
      console.warn('No products found in response');
      return [];
    }

    // Map the products to our application's format
    return data.products.map(item => {
      const rawPrice = getRandomPrice(10, 100);
      return {
        id: item.id.toString(),
        name: item.title,
        image: `https://img.spoonacular.com/products/${item.id}-312x231.${item.imageType}`,
        price: `SEK ${rawPrice}`,
        rawPrice: rawPrice
      };
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
