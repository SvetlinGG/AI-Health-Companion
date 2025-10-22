exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const query = event.queryStringParameters?.q || '';
    
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query parameter required' })
      };
    }

    // Health-related search results
    const healthResults = [
      {
        title: "Mayo Clinic - " + query,
        snippet: "Comprehensive medical information about " + query + " from Mayo Clinic experts.",
        url: "https://www.mayoclinic.org/search/search-results?q=" + encodeURIComponent(query)
      },
      {
        title: "WebMD - " + query,
        snippet: "Symptoms, causes, and treatment information for " + query + ".",
        url: "https://www.webmd.com/search/search_results/default.aspx?query=" + encodeURIComponent(query)
      },
      {
        title: "MedlinePlus - " + query,
        snippet: "Trusted health information about " + query + " from the National Library of Medicine.",
        url: "https://medlineplus.gov/search/?query=" + encodeURIComponent(query)
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(healthResults)
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};