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
          // General Health
          'blood pressure|hypertension': 'Normal blood pressure is less than 120/80 mmHg. High blood pressure (140/90+) increases risk of heart disease and stroke. Causes: genetics, age, diet, stress, obesity. Management: diet, exercise, medication, stress reduction.',
          
          'sleep|insomnia': 'Adults need 7-9 hours of sleep nightly. Poor sleep affects immunity, mood, and cognition. Common causes: stress, caffeine, screens, irregular schedule. Sleep hygiene: consistent bedtime, dark room, no screens 1 hour before bed.',
          
          'diabetes|blood sugar': 'Early signs: excessive thirst, frequent urination, fatigue, blurred vision, slow healing wounds. Type 1: autoimmune. Type 2: insulin resistance from lifestyle factors. Prevention: healthy diet, exercise, weight management.',
          
          'fever|temperature': 'Normal: 98.6°F (37°C). Fever over 100.4°F (38°C) indicates infection or inflammation. Reduce with rest, fluids, acetaminophen/ibuprofen. Seek medical care for fever over 103°F (39.4°C) or lasting >3 days.',
          
          'chest pain': 'Can indicate heart attack, angina, muscle strain, or anxiety. Heart attack signs: crushing pain, shortness of breath, nausea, sweating. Seek immediate medical attention for severe or persistent chest pain.',
          
          'cold|flu': 'Cold: gradual onset, runny nose, mild fever. Flu: sudden onset, high fever, body aches, fatigue. Both viral - antibiotics don\'t help. Treatment: rest, fluids, symptom relief. Flu vaccine recommended annually.',
          
          'pulse|heart rate': 'Normal resting: 60-100 bpm. Check at wrist or neck for 15 seconds, multiply by 4. Athletes may have lower rates. Seek medical attention for consistently high (>100) or low (<60) rates with symptoms.',
          
          'immune system': 'Signs of weakness: frequent infections, slow healing, fatigue. Strengthen with: balanced diet, exercise, adequate sleep, stress management, vaccinations, hand hygiene.',
          
          // Hydration & Nutrition
          'water|hydration': 'Adults need 8 glasses (64oz) daily, more with exercise/heat. Signs of good hydration: pale yellow urine, moist mouth, good energy. Increase intake with illness, exercise, or hot weather.',
          
          'dehydration|dehydrated': 'Early signs of dehydration can appear subtly at first but worsen quickly if fluids aren\'t replaced. Here are the most common ones:\n\n🧠 General symptoms:\n• Thirst – often the first and most obvious sign\n• Dry mouth or sticky saliva\n• Fatigue or low energy\n• Headache or lightheadedness\n• Difficulty concentrating\n\n💧 Physical signs:\n• Dark yellow or concentrated urine (healthy urine should be pale yellow)\n• Less frequent urination or smaller amounts\n• Dry skin or lips\n• Sunken eyes\n• Slight dizziness when standing up\n\n❤️ In more active or hot conditions:\n• Muscle cramps\n• Rapid heartbeat\n• Flushed or overheated skin\n• Reduced sweating despite exertion\n\n⚠️ For children and older adults:\n• Fewer wet diapers or trips to the bathroom\n• Lethargy or irritability\n• Dry tongue or inside of the mouth\n\nIn severe cases: confusion, rapid breathing, or fainting (→ medical emergency)',
          
          'balanced diet|nutrition': 'Include: fruits, vegetables, whole grains, lean proteins, healthy fats. Limit: processed foods, sugar, saturated fats, sodium. Portion control and variety are key. Consider consulting a nutritionist for personalized advice.',
          
          'vitamins|supplements': 'Best for immunity: Vitamin C, D, zinc, B-complex. Most people get adequate nutrients from balanced diet. Supplements may help with deficiencies. Consult healthcare provider before starting supplements.',
          
          'anemia|iron': 'Symptoms: fatigue, weakness, pale skin, shortness of breath. Eat iron-rich foods: red meat, spinach, beans, fortified cereals. Vitamin C enhances iron absorption. Severe cases may need iron supplements.',
          
          'protein|high protein': 'Sources: meat, fish, eggs, dairy, beans, nuts, quinoa. Adults need 0.8g per kg body weight daily. Athletes need more. Complete proteins contain all essential amino acids.',
          
          'cholesterol': 'Lower with: oats, beans, nuts, fatty fish, olive oil. Limit: saturated fats, trans fats, dietary cholesterol. Exercise and weight loss also help. Target: total <200 mg/dL, LDL <100 mg/dL.',
          
          // Mental Health
          'anxiety|panic': 'Symptoms: excessive worry, restlessness, rapid heartbeat, sweating. Panic attacks: sudden intense fear with physical symptoms. Management: therapy, medication, relaxation techniques, exercise, avoiding caffeine.',
          
          'stress|work stress': 'Signs: irritability, fatigue, headaches, sleep problems. Management: time management, exercise, relaxation techniques, social support, setting boundaries. Chronic stress affects physical health.',
          
          'depression': 'Symptoms: persistent sadness, loss of interest, fatigue, sleep changes, appetite changes. Seek help if symptoms last >2 weeks or interfere with daily life. Treatment: therapy, medication, lifestyle changes.',
          
          'concentration|focus': 'Improve with: adequate sleep, regular exercise, healthy diet, minimizing distractions, taking breaks, meditation. Persistent problems may indicate ADHD or other conditions.',
          
          'burnout': 'Work-related exhaustion with cynicism and reduced effectiveness. Prevention: work-life balance, stress management, social support, realistic goals. Recovery requires time and often professional help.',
          
          // Infections & Immunity
          'immune system|immunity': 'Strengthen with: balanced diet, regular exercise, adequate sleep, stress management, hand hygiene, vaccinations. Avoid: smoking, excessive alcohol, chronic stress.',
          
          'vaccines|vaccination': 'Adults need: annual flu shot, Tdap every 10 years, others based on age/risk factors. Vaccines prevent serious diseases and protect community health through herd immunity.',
          
          'antibiotics': 'Only effective against bacterial infections, not viruses. Overuse leads to resistance. Take full course as prescribed. Don\'t share or save leftover antibiotics.',
          
          'sore throat': 'Viral (most common): gradual onset, mild symptoms. Bacterial (strep): sudden onset, severe pain, fever, swollen lymph nodes. Strep needs antibiotic treatment.',
          
          'runny nose|congestion': 'Usually viral. Natural remedies: saline rinses, steam inhalation, staying hydrated. Decongestants provide temporary relief but shouldn\'t be used >3 days.',
          
          // Heart & Circulation
          'heart attack': 'Symptoms: chest pain/pressure, shortness of breath, nausea, sweating, pain in arm/jaw/back. Call 911 immediately. Time is critical - "time is muscle." Chew aspirin if not allergic.',
          
          'cholesterol|ldl|hdl': 'Total <200, LDL <100, HDL >40 (men) or >50 (women). Lower with diet, exercise, medication if needed. HDL is "good" cholesterol that protects arteries.',
          
          'tachycardia|fast heart rate': 'Resting heart rate >100 bpm. Causes: anxiety, caffeine, fever, dehydration, heart conditions. Seek medical attention if persistent or with symptoms like chest pain or dizziness.',
          
          'arrhythmia|irregular heartbeat': 'Abnormal heart rhythm. Can be harmless or serious. Symptoms: palpitations, dizziness, chest pain, shortness of breath. Requires medical evaluation, especially with symptoms.',
          
          // Respiratory
          'shortness of breath|breathing': 'At rest may indicate: heart problems, lung disease, anemia, anxiety. With exertion: poor fitness, asthma, heart disease. Sudden onset requires immediate medical attention.',
          
          'cough|chronic cough': 'Acute: usually viral infection. Chronic (>8 weeks): asthma, GERD, medications, smoking. Persistent cough needs medical evaluation to identify underlying cause.',
          
          'asthma|wheezing': 'Chronic condition causing airway inflammation. Triggers: allergens, exercise, cold air, stress. Management: avoid triggers, use prescribed inhalers, have action plan.',
          
          'stuffy nose|nasal congestion': 'Clear with: saline rinses, steam, staying hydrated. Avoid decongestant sprays >3 days. Persistent congestion may indicate allergies or sinus infection.',
          
          // Metabolism & Hormones
          'hormonal imbalance': 'Signs: irregular periods, weight changes, mood swings, fatigue, hair loss. Causes: stress, diet, medical conditions. Requires blood tests and medical evaluation.',
          
          'insulin resistance': 'Body\'s cells don\'t respond well to insulin. Leads to Type 2 diabetes. Signs: fatigue, cravings, weight gain around waist. Reverse with diet, exercise, weight loss.',
          
          'thyroid': 'Hyperthyroid: weight loss, rapid heartbeat, anxiety. Hypothyroid: weight gain, fatigue, cold intolerance. Requires blood tests (TSH, T3, T4) for diagnosis.',
          
          'metabolism': 'Speed up with: strength training, protein intake, staying hydrated, adequate sleep, avoiding crash diets. Muscle tissue burns more calories than fat.',
          
          'weight gain|unexplained weight': 'Causes: hormonal changes, medications, medical conditions, stress, poor sleep, aging. Sudden unexplained weight gain warrants medical evaluation.',
          
          // Muscles, Joints & Bones
          'back pain|lower back': 'Most common cause: muscle strain. Prevention: good posture, regular exercise, proper lifting technique. Red flags: numbness, weakness, bowel/bladder problems - seek immediate care.',
          
          'herniated disc': 'Disc material presses on nerve. Symptoms: back pain radiating to leg, numbness, weakness. Most heal with conservative treatment: rest, physical therapy, pain management.',
          
          'joint pain|arthritis': 'Osteoarthritis: wear and tear, common with aging. Rheumatoid: autoimmune. Management: exercise, weight control, anti-inflammatory medications, physical therapy.',
          
          'osteoporosis': 'Bone density loss increasing fracture risk. Prevention: calcium, vitamin D, weight-bearing exercise, avoiding smoking/excessive alcohol. Bone density screening recommended.',
          
          'sciatica': 'Pain radiating from lower back down leg due to nerve compression. Treatment: physical therapy, pain management, rarely surgery. Most cases resolve with conservative treatment.',
          
          // Vision & Hearing
          'computer vision|eye strain': 'Symptoms: dry eyes, blurred vision, headaches. Prevention: 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds), proper lighting, regular blinking.',
          
          'vision problems|eyesight': 'Regular eye exams detect problems early. Signs needing attention: sudden vision changes, flashing lights, severe eye pain, persistent headaches.',
          
          'tinnitus|ringing ears': 'Phantom sounds in ears. Causes: hearing loss, medications, ear infections, stress. Management: hearing aids, sound therapy, stress reduction. Avoid loud noises.',
          
          'hearing loss': 'Age-related or noise-induced most common. Prevention: protect from loud noises, clean ears gently. Hearing aids help most cases. Regular hearing tests recommended.',
          
          // Preventive Health
          'preventive care|checkups': 'Annual physical, blood pressure checks, cholesterol screening, cancer screenings based on age/risk. Preventive care catches problems early when most treatable.',
          
          'vitamin deficiency': 'Common: D, B12, iron. Symptoms vary by vitamin. Blood tests can identify deficiencies. Balanced diet usually provides adequate vitamins for most people.',
          
          'bmi|body mass index': 'Weight (kg) ÷ height (m)². Normal: 18.5-24.9. Overweight: 25-29.9. Obese: ≥30. BMI doesn\'t account for muscle mass. Waist circumference also important.',
          
          'cancer prevention': 'Reduce risk: don\'t smoke, limit alcohol, maintain healthy weight, exercise regularly, eat fruits/vegetables, protect from sun, get recommended screenings.',
          
          'headache|migraine': 'Tension headaches most common. Migraines: severe, often one-sided, with nausea/light sensitivity. Triggers: stress, hormones, foods, sleep changes. Track patterns to identify triggers.',
          
          'posture': 'Good posture reduces back/neck pain. Tips: keep ears over shoulders, shoulders over hips, take breaks from sitting, strengthen core muscles, ergonomic workspace setup.',
          
          'chronic fatigue': 'Persistent exhaustion not relieved by rest. Causes: sleep disorders, depression, thyroid problems, anemia, chronic diseases. Requires medical evaluation to identify cause.'
        };
        
        // Find best matching topic with priority for more specific matches
        let bestMatch = null;
        let maxMatches = 0;
        
        for (const [keywords, response] of Object.entries(healthTopics)) {
          const keywordList = keywords.split('|');
          const matches = keywordList.filter(keyword => lowerQ.includes(keyword)).length;
          
          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = response;
          }
        }
        
        if (bestMatch) {
          return bestMatch;
        }
        
        // General health response
        // If no specific match found, provide general health guidance
        return `I understand you're asking about "${question}". While I can provide general health information, every individual situation is unique. For personalized medical advice, diagnosis, or treatment recommendations, please consult with a qualified healthcare professional who can properly evaluate your specific circumstances and medical history.`;
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