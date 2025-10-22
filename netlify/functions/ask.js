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
    
    // Try Gemini AI with better prompting
    let geminiWorked = false;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const healthPrompt = isBulgarian ? 
          `Ти си опитен лекар с дълги години практика. Пациент те пита: "${question}". 

Дай професионален, но разбираем отговор който включва:
- Какво представлява състоянието/симптомът
- Възможни причини и рискови фактори  
- Препоръки за справяне или лечение
- Кога да се търси медицинска помощ

Говори като истински лекар - професионално, но с топлота и разбиране.` :
          `You are an experienced doctor with years of practice. A patient asks: "${question}"

Provide a professional yet understandable response that includes:
- What the condition/symptom represents
- Possible causes and risk factors  
- Recommendations for management or treatment
- When to seek medical help

Speak like a real doctor - professionally but with warmth and understanding.`;

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
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_MEDICAL',
                threshold: 'BLOCK_NONE'
              }
            ]
          })
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text && text.length > 30) {
            console.log('Gemini AI response successful');
            const getRelevantSources = (question) => {
              const lowerQ = question.toLowerCase();
              
              if (lowerQ.includes('cancer') || lowerQ.includes('tumor') || lowerQ.includes('oncology')) {
                return ['https://www.cancer.org/', 'https://www.cancer.gov/'];
              }
              if (lowerQ.includes('heart') || lowerQ.includes('cardiac') || lowerQ.includes('cardiovascular')) {
                return ['https://www.heart.org/', 'https://www.nhlbi.nih.gov/'];
              }
              if (lowerQ.includes('diabetes') || lowerQ.includes('blood sugar')) {
                return ['https://www.diabetes.org/', 'https://www.cdc.gov/diabetes/'];
              }
              if (lowerQ.includes('mental') || lowerQ.includes('anxiety') || lowerQ.includes('depression')) {
                return ['https://www.nimh.nih.gov/', 'https://www.mentalhealth.gov/'];
              }
              if (lowerQ.includes('skin') || lowerQ.includes('dermatology') || lowerQ.includes('acne')) {
                return ['https://www.aad.org/', 'https://www.niams.nih.gov/'];
              }
              return ['https://www.mayoclinic.org/', 'https://medlineplus.gov/', 'https://www.webmd.com/'];
            };
            
            response = {
              answer: text.trim(),
              sources: getRelevantSources(question)
            };
            geminiWorked = true;
          }
        } else {
          const errorData = await apiResponse.text();
          console.log('Gemini API error:', apiResponse.status, errorData);
        }
      } catch (error) {
        console.log('Gemini request error:', error.message);
      }
    }
    
    // If Gemini didn't work, provide intelligent fallback
    if (!geminiWorked) {
      console.log('Gemini AI unavailable, using intelligent fallback');
      
      // Intelligent health response generator
      const generateHealthResponse = (question) => {
        const lowerQ = question.toLowerCase();
        
        // Common health topics with intelligent responses
        const healthTopics = {
          // Symptoms
          'fever|temperature': isBulgarian ? 
            'Треската е естествена защитна реакция на организма срещу инфекции. Причини: вирусни/бактериални инфекции, възпаление, стрес. При температура над 38.5°C или продължителна треска се препоръчва лекарска консултация.' :
            'Fever is a natural protective response against infections. Causes: viral/bacterial infections, inflammation, stress. Medical consultation recommended for temperature above 38.5°C or persistent fever.',
          
          'cough|coughing': isBulgarian ?
            'Кашлицата е защитен рефлекс за почистване на дихателните пътища. Причини: простуда, алергии, астма, ГЕРБ, инфекции. Хронична кашлица (над 8 седмици) изисква медицинска оценка.' :
            'Cough is a protective reflex to clear airways. Causes: cold, allergies, asthma, GERD, infections. Chronic cough (over 8 weeks) requires medical evaluation.',
          
          'fatigue|tired|exhausted': isBulgarian ?
            'Умората може да се дължи на недостиг на сън, стрес, анемия, хормонални нарушения, депресия, хронични заболявания. Важно е да се установи основната причина чрез медицинска консултация.' :
            'Fatigue can be due to sleep deprivation, stress, anemia, hormonal disorders, depression, chronic diseases. Important to identify underlying cause through medical consultation.',
          
          // Body systems
          'stomach|gastric|digestive': isBulgarian ?
            'Стомашните проблеми могат да включват гастрит, язви, ГЕРБ, синдром на раздразненото черво. Причини: стрес, неправилно хранене, H. pylori, медикаменти. При постоянни симптоми се препоръчва гастроентеролог.' :
            'Stomach problems can include gastritis, ulcers, GERD, irritable bowel syndrome. Causes: stress, poor diet, H. pylori, medications. Persistent symptoms warrant gastroenterologist consultation.',
          
          'skin|dermatology': isBulgarian ?
            'Кожните проблеми могат да бъдат алергични, инфекциозни, автоимунни или генетични. Честите състояния включват екзема, псориазис, дерматит. Препоръчва се консултация с дерматолог за точна диагноза.' :
            'Skin problems can be allergic, infectious, autoimmune or genetic. Common conditions include eczema, psoriasis, dermatitis. Dermatologist consultation recommended for accurate diagnosis.',
          
          'joint|arthritis|bone': isBulgarian ?
            'Ставните болки могат да се дължат на артрит, артроза, травми, автоимунни заболявания. Рискови фактори: възраст, наднормено тегло, генетика, предишни травми. При постоянна болка се препоръчва ревматолог.' :
            'Joint pain can be due to arthritis, osteoarthritis, injuries, autoimmune diseases. Risk factors: age, excess weight, genetics, previous injuries. Persistent pain warrants rheumatologist consultation.',

          'cancer|tumor': isBulgarian ?
            'Ракът е група заболявания при които клетките растат неконтролируемо. Основни причини: генетика, възраст, начин на живот, околна среда. Над 200 различни типа рак съществуват. Ранното откриване значително подобрява прогнозата.' :
            'Cancer is a group of diseases where cells grow uncontrollably. Main causes: genetics, age, lifestyle, environment. Over 200 different types of cancer exist. Early detection significantly improves prognosis.',

          'blood pressure|hypertension': isBulgarian ?
            'Високото кръвно налягане (хипертония) е състояние при което кръвта упражнява прекомерна сила върху артериите. Засяга 1.3 милиарда души глобално. Основни рискови фактори: възраст, генетика, начин на живот.' :
            'High blood pressure (hypertension) is a condition where blood exerts excessive force on arteries. Affects 1.3 billion people globally. Main risk factors: age, genetics, lifestyle.',

          'diabetes|blood sugar': isBulgarian ?
            'Диабетът е заболяване при което организмът не може да регулира кръвната захар. Тип 1 (5-10%) - автоимунен; Тип 2 (90-95%) - инсулинова резистентност. Засяга 537 милиона души глобално.' :
            'Diabetes is a disease where the body cannot regulate blood sugar. Type 1 (5-10%) - autoimmune; Type 2 (90-95%) - insulin resistance. Affects 537 million people globally.',

          'heart|cardiac': isBulgarian ?
            'Сърдечните заболявания са водеща причина за смърт глобално. Включват коронарна болест, сърдечна недостатъчност, аритмии. Основни рискови фактори: възраст, пол, генетика, начин на живот.' :
            'Heart disease is the leading cause of death globally. Includes coronary disease, heart failure, arrhythmias. Main risk factors: age, gender, genetics, lifestyle.',

          'acne|pimple': isBulgarian ?
            'Акнето е възпалително кожно заболяване с пъпки и черни точки. Основни причини: хормони, бактерии, запушени пори, генетика. Засяга 85% от тийнейджърите и може да продължи в зряла възраст.' :
            'Acne is an inflammatory skin condition with pimples and blackheads. Main causes: hormones, bacteria, clogged pores, genetics. Affects 85% of teenagers and can continue into adulthood.',

          'headache|migraine': isBulgarian ?
            'Главоболието може да бъде тензионно (най-често), мигрена, или вторично от други причини. Възможни фактори: стрес, умора, дехидратация, лоша стойка, хормони, или медицински състояния.' :
            'Headaches can be tension-type (most common), migraine, or secondary to other causes. Possible factors: stress, fatigue, dehydration, poor posture, hormones, or medical conditions.',

          'back pain': isBulgarian ?
            'Болката в гърба засяга 80% от хората. Най-чести причини: мускулно напрежение, лоша стойка, дискови проблеми. Може да бъде остра (под 6 седмици) или хронична (над 3 месеца).' :
            'Back pain affects 80% of people. Most common causes: muscle strain, poor posture, disc problems. Can be acute (under 6 weeks) or chronic (over 3 months).'
        };
        
        // Find matching topic
        for (const [keywords, response] of Object.entries(healthTopics)) {
          const keywordList = keywords.split('|');
          if (keywordList.some(keyword => lowerQ.includes(keyword))) {
            return response;
          }
        }
        
        // General health response
        return isBulgarian ?
          `За въпроса "${question}" - това е здравна тема която може да има различни причини и проявления. Препоръчвам консултация с подходящ медицински специалист за професионална оценка и персонализиран съвет според вашата конкретна ситуация.` :
          `Regarding "${question}" - this is a health topic that can have various causes and manifestations. I recommend consultation with an appropriate medical specialist for professional evaluation and personalized advice for your specific situation.`;
      };
      
      const getRelevantSources = (question) => {
        const lowerQ = question.toLowerCase();
        
        if (lowerQ.includes('cancer') || lowerQ.includes('tumor') || lowerQ.includes('oncology')) {
          return ['https://www.cancer.org/', 'https://www.cancer.gov/'];
        }
        if (lowerQ.includes('heart') || lowerQ.includes('cardiac') || lowerQ.includes('cardiovascular')) {
          return ['https://www.heart.org/', 'https://www.nhlbi.nih.gov/'];
        }
        if (lowerQ.includes('diabetes') || lowerQ.includes('blood sugar')) {
          return ['https://www.diabetes.org/', 'https://www.cdc.gov/diabetes/'];
        }
        if (lowerQ.includes('mental') || lowerQ.includes('anxiety') || lowerQ.includes('depression')) {
          return ['https://www.nimh.nih.gov/', 'https://www.mentalhealth.gov/'];
        }
        if (lowerQ.includes('skin') || lowerQ.includes('dermatology') || lowerQ.includes('acne')) {
          return ['https://www.aad.org/', 'https://www.niams.nih.gov/'];
        }
        return ['https://www.mayoclinic.org/', 'https://medlineplus.gov/', 'https://www.webmd.com/'];
      };
      
      response = {
        answer: generateHealthResponse(question),
        sources: getRelevantSources(question)
      };
    }
    
    // Add references and disclaimer
    if (response.sources && response.sources.length > 0) {
      const referencesText = isBulgarian ? 
        '\n\n📚 За най-актуална информация посетете:' :
        '\n\n📚 For the most up-to-date information, visit:';
      response.answer += referencesText + '\n' + response.sources.map(source => `• ${source}`).join('\n');
    }
    
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