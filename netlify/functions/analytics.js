exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const path = event.path || '';
    
    if (path.includes('analytics') || event.queryStringParameters?.endpoint === 'snapshot') {
      // Mock analytics data - in real app this would come from database
      const analyticsData = [
        { label: 'Health Questions', value: 45 },
        { label: 'Symptom Searches', value: 32 },
        { label: 'Treatment Info', value: 28 },
        { label: 'Prevention Tips', value: 15 }
      ];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify(analyticsData)
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};