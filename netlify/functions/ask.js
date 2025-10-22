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
      
      // Generate dynamic responses based on specific questions
      const generateResponse = (question) => {
        const lowerQ = question.toLowerCase();
        
        // Acne-related questions
        if (lowerQ.includes('acne') || lowerQ.includes('pimple')) {
          if (lowerQ.includes('cause') || lowerQ.includes('why')) {
            return isBulgarian ? 
              'Акнето се причинява от: запушени пори от излишно себум, бактерии (P. acnes), хормонални промени (пубертет, менструация), генетика, стрес, неподходящи козметични продукти, и диета богата на млечни продукти или захар.' :
              'Acne is caused by: clogged pores from excess sebum, bacteria (P. acnes), hormonal changes (puberty, menstruation), genetics, stress, unsuitable cosmetic products, and diet high in dairy or sugar.';
          }
          if (lowerQ.includes('treat') || lowerQ.includes('cure') || lowerQ.includes('get rid')) {
            return isBulgarian ?
              'Лечение на акне: ежедневно почистване с нежен продукт, салицилова киселина или бензоил пероксид, ретиноиди, при тежки случаи - антибиотици или изотретиноин. Избягвайте пипане на лицето.' :
              'Acne treatment: daily cleansing with gentle products, salicylic acid or benzoyl peroxide, retinoids, for severe cases - antibiotics or isotretinoin. Avoid touching your face.';
          }
          return isBulgarian ?
            'Акнето е възпалително кожно заболяване с пъпки и черни точки. Основни причини: хормони, бактерии, запушени пори, генетика. Засяга 85% от тийнейджърите и може да продължи в зряла възраст.' :
            'Acne is an inflammatory skin condition with pimples and blackheads. Main causes: hormones, bacteria, clogged pores, genetics. Affects 85% of teenagers and can continue into adulthood.';
        }
        
        // Headache questions
        if (lowerQ.includes('headache') || lowerQ.includes('head pain')) {
          if (lowerQ.includes('cause') || lowerQ.includes('why')) {
            return isBulgarian ?
              'Причини за главоболие: тензионно напрежение (най-честo), мигрена, дехидратация, недостиг на сън, стрес, кофеин, хормонални промени, синузит, проблеми със зрението, или сериозни състояния като хипертония.' :
              'Headache causes: tension stress (most common), migraine, dehydration, sleep deprivation, stress, caffeine, hormonal changes, sinusitis, vision problems, or serious conditions like hypertension.';
          }
          if (lowerQ.includes('migraine')) {
            return isBulgarian ?
              'Мигрената е неврологично заболяване с пулсираща болка, често едностранна. Причини: генетика, хормони, стрес, определени храни (шоколад, сирене), светлина, звуци. Може да се придружава от гадене и светлочувствителност.' :
              'Migraine is a neurological condition with throbbing pain, often one-sided. Causes: genetics, hormones, stress, certain foods (chocolate, cheese), light, sounds. May be accompanied by nausea and light sensitivity.';
          }
          return isBulgarian ?
            'Главоболието може да бъде тензионно (най-често), мигрена, или вторично от други причини. Възможни фактори: стрес, умора, дехидратация, лоша стойка, хормони, или медицински състояния.' :
            'Headaches can be tension-type (most common), migraine, or secondary to other causes. Possible factors: stress, fatigue, dehydration, poor posture, hormones, or medical conditions.';
        }
        
        // Back pain questions
        if (lowerQ.includes('back pain') || lowerQ.includes('back ache')) {
          if (lowerQ.includes('lower') || lowerQ.includes('low')) {
            return isBulgarian ?
              'Болка в долната част на гърба: мускулно напрежение (80% от случаите), дискова херния, артрит, остеопороза, лоша стойка, седящ начин на живот, внезапни движения, или повдигане на тежести.' :
              'Lower back pain: muscle strain (80% of cases), disc herniation, arthritis, osteoporosis, poor posture, sedentary lifestyle, sudden movements, or lifting heavy objects.';
          }
          if (lowerQ.includes('cause') || lowerQ.includes('why')) {
            return isBulgarian ?
              'Причини за болка в гърба: мускулно напрежение, лоша стойка, дегенеративни промени в прешлените, дискова херния, артрит, остеопороза, стрес, наднормено тегло, или недостатъчна физическа активност.' :
              'Back pain causes: muscle strain, poor posture, degenerative spinal changes, disc herniation, arthritis, osteoporosis, stress, excess weight, or insufficient physical activity.';
          }
          return isBulgarian ?
            'Болката в гърба засяга 80% от хората. Най-чести причини: мускулно напрежение, лоша стойка, дискови проблеми. Може да бъде остра (под 6 седмици) или хронична (над 3 месеца).' :
            'Back pain affects 80% of people. Most common causes: muscle strain, poor posture, disc problems. Can be acute (under 6 weeks) or chronic (over 3 months).';
        }
        
        // Default response for unmatched questions
        return isBulgarian ?
          `Относно "${question}" - това здравословно състояние може да има множество причини включително генетични фактори, начин на живот, стрес, хормонални промени, или основни медицински състояния. Препоръчвам консултация със специалист за точна диагноза.` :
          `Regarding "${question}" - this health condition can have multiple causes including genetic factors, lifestyle, stress, hormonal changes, or underlying medical conditions. I recommend consulting a specialist for accurate diagnosis.`;
      };
      
      // Find matching response
      const lowerQuestion = question.toLowerCase();
      let matchedResponse = '';
      
      matchedResponse = generateResponse(question);
      
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