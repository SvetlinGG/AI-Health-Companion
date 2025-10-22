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
    
    // Try multiple Gemini model endpoints
    const models = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    let geminiWorked = false;
    
    if (process.env.GEMINI_API_KEY) {
      for (const model of models) {
        try {
          console.log(`Trying Gemini model: ${model}`);
          
          const healthPrompt = isBulgarian ? 
            `Ти си професионален лекар. Пациент те пита: "${question}". Обясни подробно какво представлява това състояние, възможните причини, как може да се лекува и кога да се търси медицинска помощ. Говори топло и професионално като истински лекар.` :
            `You are a professional doctor. A patient asks: "${question}". Explain in detail what this condition is, possible causes, how it can be treated, and when to seek medical help. Speak warmly and professionally like a real doctor.`;

          const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
                maxOutputTokens: 800
              }
            })
          });

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text && text.length > 50) {
              console.log(`Success with model: ${model}`);
              response = {
                answer: text,
                sources: []
              };
              geminiWorked = true;
              break;
            }
          } else {
            console.log(`Model ${model} failed with status:`, apiResponse.status);
          }
        } catch (error) {
          console.log(`Model ${model} error:`, error.message);
          continue;
        }
      }
    }
    
    // If Gemini didn't work, provide a detailed manual response
    if (!geminiWorked) {
      console.log('All Gemini models failed, using manual response');
      
      // Create specific responses for common questions
      const manualResponses = {
        'acne': isBulgarian ? 
          'Акнето е кожно заболяване, при което се появяват пъпки, черни точки и възпаления по лицето, гърба и гърдите. Причинява се от запушени пори, бактерии и хормонални промени. Може да се лекува с правилна грижа за кожата, специални продукти и при нужда - медикаменти. При тежки случаи се препоръчва консултация с дерматолог.' :
          'Acne is a skin condition where pimples, blackheads, and inflamed bumps appear on the face, back, and chest. It\'s caused by clogged pores, bacteria, and hormonal changes. It can be treated with proper skincare, special products, and when needed - medications. For severe cases, consultation with a dermatologist is recommended.',
        
        'headache': isBulgarian ?
          'Главоболието е болка в главата, която може да бъде причинена от стрес, дехидратация, недостиг на сън, напрежение в мускулите или мигрена. За облекчение помагат почивка, вода, студен или топъл компрес и болкоуспокояващи. При чести или силни главоболия се препоръчва лекарска консултация.' :
          'A headache is pain in the head that can be caused by stress, dehydration, lack of sleep, muscle tension, or migraine. Relief can come from rest, water, cold or warm compress, and pain relievers. For frequent or severe headaches, medical consultation is recommended.',
        
        'back pain': isBulgarian ?
          'Болката в гърба може да се дължи на мускулно напрежение, лоша стойка, повдигане на тежести или проблеми с прешлените. Помагат почивка, топли компреси, леки упражнения и правилна стойка. При силна или продължителна болка е необходима лекарска консултация.' :
          'Back pain can be due to muscle tension, poor posture, lifting heavy objects, or spinal problems. Rest, warm compresses, light exercises, and proper posture help. For severe or persistent pain, medical consultation is necessary.'
      };
      
      // Find matching response
      const lowerQuestion = question.toLowerCase();
      let matchedResponse = '';
      
      for (const [key, value] of Object.entries(manualResponses)) {
        if (lowerQuestion.includes(key)) {
          matchedResponse = value;
          break;
        }
      }
      
      if (!matchedResponse) {
        matchedResponse = isBulgarian ?
          `Относно въпроса ви за "${question}" - това е важна здравна тема. Всяко здравословно състояние има свои специфики и изисква индивидуален подход. Препоръчвам ви да се консултирате с медицински специалист, който може да ви даде точна информация и персонализиран съвет за вашата конкретна ситуация.` :
          `Regarding your question about "${question}" - this is an important health topic. Every health condition has its specifics and requires an individual approach. I recommend consulting with a medical professional who can give you accurate information and personalized advice for your specific situation.`;
      }
      
      response = {
        answer: matchedResponse,
        sources: []
      };
    }
    
    // Add disclaimer
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