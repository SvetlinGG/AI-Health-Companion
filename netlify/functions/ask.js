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

    let response;
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      try {
        console.log('Attempting to call Gemini API...');
        
        // Correct Gemini API endpoint format
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const apiResponse = await fetch(apiUrl, {
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
          const errorText = await apiResponse.text();
          console.error('API Error response:', errorText);
          throw new Error(`API responded with status: ${apiResponse.status} - ${errorText}`);
        }

        const data = await apiResponse.json();
        console.log('API Response received successfully');
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response';
        
        response = {
          answer: text,
          sources: []
        };
      } catch (aiError) {
        console.error('AI Error:', aiError);
        response = {
          answer: `I'm having trouble accessing the AI service right now. For the question "${question}", I recommend consulting with a healthcare professional for accurate medical advice.`,
          sources: []
        };
      }
    } else {
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