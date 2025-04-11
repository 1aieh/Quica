const RAPID_API_KEY = 'df9851bcbcmshc2e1de437baee8ap11833cjsn334280e702d7';
const RAPID_API_HOST = 'api-to-find-grocery-prices.p.rapidapi.com';

export async function fetchWalmartGroceries(query) {
  try {
    console.log('Fetching groceries with query:', query);

    const url = `https://api-to-find-grocery-prices.p.rapidapi.com/walmart?query=${encodeURIComponent(query)}&page=1`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
        'accept': 'application/json'
      }
    };

    const response = await fetch(url, options);
    
    // Check HTTP status
    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return [];
    }

    const result = await response.text();
    console.log('Raw API Response:', result);

    // Parse the text response to JSON
    const data = JSON.parse(result);
    console.log('Parsed API Response:', data);

    // Handle API error response gracefully
    if (data.success === false) {
      console.warn('API returned error:', data.message);
      return []; // Return empty array instead of throwing error
    }

    // Format the response data if it's an array
    if (Array.isArray(data)) {
      return data.map(item => ({
        id: item.position?.toString() || Math.random().toString(),
        name: item.title,
        image: item.image,
        price: item.price?.currentPrice,
        rawPrice: parseFloat(item.price?.rawPrice),
      }));
    }

    console.error('Unexpected API response format:', data);
    return []; // Return empty array for unexpected format too
  } catch (error) {
    console.error('Error fetching Walmart groceries:', error);
    return []; // Return empty array for any errors
  }
}
