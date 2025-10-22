exports.handler = async (event, context) => {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'No API key found',
          hasKey: false
        })
      };
    }

    const testPrompt = 'You are a doctor. A patient asks: "I have a headache". Respond naturally as if talking to them in person.';
    
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }]
      })
    });

    const responseText = await apiResponse.text();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: apiResponse.status,
        ok: apiResponse.ok,
        response: responseText.substring(0, 500) // First 500 chars
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};