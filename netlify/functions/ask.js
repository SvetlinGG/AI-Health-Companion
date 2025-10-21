exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { question } = JSON.parse(event.body);
    
    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // Debug: Check if API key exists
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

    let response;
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      try {
        console.log('Attempting to call Gemini API...');
        
        // Use fetch to call Gemini API directly
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful health assistant. Answer this health question: "${question}". Provide accurate, helpful information but always remind users to consult healthcare professionals for serious concerns.`
              }]
            }]
          })
        });

        console.log('API Response status:', apiResponse.status);
        
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        console.log('API Response received');
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response';
        
        response = {
          answer: text,
          sources: []
        };
      } catch (aiError) {
        console.error('AI Error:', aiError);
        response = {
          answer: `I'm having trouble accessing the AI service right now. For the question "${question}", I recommend consulting with a healthcare professional for accurate medical advice. Error: ${aiError.message}`,
          sources: []
        };
      }
    } else {
      console.log('No valid API key found, using mock response');
      response = {
        answer: `Mock AI Response: Based on your question "${question}", here's a health-related answer. This is a demo response - in production, this would use Google's Gemini AI.`,
        sources: []
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};