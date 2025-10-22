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
        
        // Create natural, conversational health prompt for Gemini
        const healthPrompt = isBulgarian ? 
          `Ти си опитен лекар, който разговаря с пациент. Пациентът те пита: "${question}"

Отговори естествено и лично, като че ли седиш срещу пациента в кабинета си. Използвай прости думи и обясни нещата така, както би обяснил на приятел или член от семейството. Бъди топъл, разбиращ и практичен в съветите си.

Не използвай шаблони или списъци с точки - просто говори естествено като лекар, който се грижи за пациента си.` :
          
          `You are an experienced doctor having a conversation with a patient. The patient asks you: "${question}"

Respond naturally and personally, as if you're sitting across from the patient in your office. Use simple words and explain things the way you would to a friend or family member. Be warm, understanding, and practical in your advice.

Don't use templates or bullet point lists - just speak naturally as a caring doctor would to their patient.`;

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