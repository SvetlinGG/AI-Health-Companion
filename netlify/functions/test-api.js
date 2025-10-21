exports.handler = async (event, context) => {
  try {
    // Simple test to check if API key works
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say hello"
          }]
        }]
      })
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: response.status,
        success: response.ok,
        data: data
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};