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
    
    // Always try to use Gemini AI first
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Attempting Gemini AI call...');
        console.log('API Key length:', process.env.GEMINI_API_KEY.length);
        
        // Create specific, detailed health prompt for Gemini
        const healthPrompt = isBulgarian ? 
          `Ти си професионален лекар. Пациент те пита: "${question}"

Обясни подробно:
1. Какво представлява това състояние
2. Възможните причини
3. Как може да се лекува или облекчи
4. Кога да се търси медицинска помощ

Говори като истински лекар - топло, професионално и с конкретни съвети. Всеки отговор трябва да е уникален за този въпрос.` :
          
          `You are a professional doctor. A patient asks you: "${question}"

Explain in detail:
1. What this condition is
2. Possible causes
3. How it can be treated or relieved
4. When to seek medical help

Speak like a real doctor - warmly, professionally, and with specific advice. Each answer should be unique to this question.`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: healthPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });

        console.log('Gemini API Response status:', apiResponse.status);
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text && text.length > 50) {
            console.log('Gemini response received successfully');
            response = {
              answer: text,
              sources: []
            };
          } else {
            throw new Error('Empty or invalid Gemini response');
          }
        } else {
          const errorText = await apiResponse.text();
          console.error('Gemini API Error:', apiResponse.status, errorText);
          throw new Error(`Gemini API error: ${apiResponse.status}`);
        }
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError.message);
        
        // Create a more specific fallback based on the question
        const specificResponse = isBulgarian ? 
          `Разбирам, че се интересувате от "${question}". Това е важен здравен въпрос, който изисква внимание. Препоръчвам ви да се консултирате с медицински специалист, който може да ви даде подробна информация и персонализиран съвет за вашата конкретна ситуация. Всеки случай е уникален и заслужава професионална оценка.` :
          `I understand you're asking about "${question}". This is an important health topic that deserves attention. I recommend consulting with a medical professional who can provide you with detailed information and personalized advice for your specific situation. Every case is unique and deserves professional evaluation.`;
        
        response = {
          answer: specificResponse,
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