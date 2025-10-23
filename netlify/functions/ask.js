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
    let isBulgarian = false;
    
    // Try Gemini AI with better prompting
    let geminiWorked = false;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const healthPrompt = `You are an experienced doctor with years of practice. A patient asks: "${question}"

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
          'dehydration|dehydrated': 'Early signs of dehydration can appear subtly at first but worsen quickly if fluids aren\'t replaced. Here are the most common ones:\n\n🧠 General symptoms:\n• Thirst – often the first and most obvious sign\n• Dry mouth or sticky saliva\n• Fatigue or low energy\n• Headache or lightheadedness\n• Difficulty concentrating\n\n💧 Physical signs:\n• Dark yellow or concentrated urine (healthy urine should be pale yellow)\n• Less frequent urination or smaller amounts\n• Dry skin or lips\n• Sunken eyes\n• Slight dizziness when standing up\n\n❤️ In more active or hot conditions:\n• Muscle cramps\n• Rapid heartbeat\n• Flushed or overheated skin\n• Reduced sweating despite exertion\n\n⚠️ For children and older adults:\n• Fewer wet diapers or trips to the bathroom\n• Lethargy or irritability\n• Dry tongue or inside of the mouth\n\nIn severe cases: confusion, rapid breathing, or fainting (→ medical emergency)',

          'fever|temperature': 'Fever is a natural protective response against infections. Causes: viral/bacterial infections, inflammation, stress. Medical consultation recommended for temperature above 38.5°C or persistent fever.',

          'headache|migraine': 'Headaches can be tension-type (most common), migraine, or secondary to other causes. Possible factors: stress, fatigue, dehydration, poor posture, hormones, or medical conditions.',

          'back pain': 'Back pain affects 80% of people. Most common causes: muscle strain, poor posture, disc problems. Can be acute (under 6 weeks) or chronic (over 3 months).',

          'cancer|tumor': 'Cancer is a group of diseases where cells grow uncontrollably. Main causes: genetics, age, lifestyle, environment. Over 200 different types of cancer exist. Early detection significantly improves prognosis.',

          'diabetes|blood sugar': 'Diabetes is a disease where the body cannot regulate blood sugar. Type 1 (5-10%) - autoimmune; Type 2 (90-95%) - insulin resistance. Affects 537 million people globally.',

          'heart|cardiac': 'Heart disease is the leading cause of death globally. Includes coronary disease, heart failure, arrhythmias. Main risk factors: age, gender, genetics, lifestyle.'
        };
        
        // Find matching topic
        for (const [keywords, response] of Object.entries(healthTopics)) {
          const keywordList = keywords.split('|');
          if (keywordList.some(keyword => lowerQ.includes(keyword))) {
            return response;
          }
        }
        
        // General health response
        return `Regarding "${question}" - this is a health topic that can have various causes and manifestations. I recommend consultation with an appropriate medical specialist for professional evaluation and personalized advice for your specific situation.`;
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
      const referencesText = '\n\n📚 For the most up-to-date information, visit:';
      response.answer += referencesText + '\n' + response.sources.map(source => `• ${source}`).join('\n');
    }
    
    response.answer += '\n\n⚠️ Medical Disclaimer: This information is provided for educational purposes and does not replace professional medical consultation, diagnosis, or treatment. Always consult with your physician or other qualified healthcare provider regarding medical questions or concerns.';

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