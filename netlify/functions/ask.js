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
    let isBulgarian = /[а-я]/.test(question);
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      try {
        console.log('Using Gemini AI for health question...');
        
        // Create health-focused prompt for Gemini
        const healthPrompt = isBulgarian ? 
          `Ти си професионален лекар и здравен консултант. Отговори на този здравен въпрос на български език: "${question}"

Моля, структурирай отговора си така:
- Използвай прости думи, които всеки може да разбере
- Организирай информацията с точки и секции
- Включи възможни причини
- Дай практични съвети за облекчение
- Посочи кога да се търси медицинска помощ
- Винаги напомни, че това е обща информация и не заменя консултация с лекар

Отговори професионално, но достъпно за обикновените хора.` :
          
          `You are a professional doctor and health consultant. Answer this health question: "${question}"

Please structure your response like this:
- Use simple language that everyone can understand
- Organize information with bullet points and sections
- Include possible causes
- Give practical relief advice
- Mention when to seek medical help
- Always remind that this is general information and doesn't replace doctor consultation

Respond professionally but accessible to regular people.`;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: healthPrompt
              }]
            }]
          })
        });

        console.log('Gemini API Response status:', apiResponse.status);
        
        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('Gemini API Error:', errorText);
          throw new Error(`Gemini API responded with status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        console.log('Gemini response received successfully');
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response';
        
        response = {
          answer: text,
          sources: []
        };
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError);
        // Fallback response
        response = {
          answer: isBulgarian ? 
            `За въпроса "${question}" препоръчвам да се консултирате с медицински специалист за точна диагноза и лечение. Всеки здравен проблем изисква индивидуален подход и професионална оценка.` :
            `For your question about "${question}", I recommend consulting with a medical professional for accurate diagnosis and treatment. Every health issue requires individual assessment and professional evaluation.`,
          sources: []
        };
      }
    } else {
      console.log('No Gemini API key found, using fallback response');
      response = {
        answer: isBulgarian ? 
          `За въпроса "${question}" препоръчвам да се консултирате с медицински специалист за точна диагноза и лечение.` :
          `For your question about "${question}", I recommend consulting with a medical professional for accurate diagnosis and treatment.`,
        sources: []
      };
    }
    
    // Add professional disclaimer
    if (isBulgarian) {
      response.answer += '\n\n⚠️ Медицинска бележка: Тази информация е предоставена с образователна цел и не заменя професионалната медицинска консултация, диагноза или лечение. Винаги се консултирайте с вашия лекар или друг квалифициран здравен специалист при медицински въпроси или притеснения.';
    } else {
      response.answer += '\n\n⚠️ Medical Disclaimer: This information is provided for educational purposes and does not replace professional medical consultation, diagnosis, or treatment. Always consult with your physician or other qualified healthcare provider regarding medical questions or concerns.';
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