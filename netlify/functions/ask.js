const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    // Use Gemini API if available, otherwise mock
    let response;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `You are a helpful health assistant. Answer this health question: "${question}". 
        Provide accurate, helpful information but always remind users to consult healthcare professionals for serious concerns.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        response = {
          answer: text,
          sources: []
        };
      } catch (aiError) {
        console.error('AI Error:', aiError);
        // Fallback to mock if AI fails
        response = {
          answer: `I'm having trouble accessing the AI service right now. For the question "${question}", I recommend consulting with a healthcare professional for accurate medical advice.`,
          sources: []
        };
      }
    } else {
      // Mock response when no API key
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