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

    // Health knowledge base in English and Bulgarian
    const healthResponses = {
      // English keywords
      'cancer': 'Cancer is a group of diseases involving abnormal cell growth with the potential to invade or spread to other parts of the body. Common types include breast, lung, prostate, and colorectal cancer. Early detection through regular screenings is crucial. Please consult with an oncologist for proper diagnosis and treatment.',
      
      'diabetes': 'Diabetes is a group of metabolic disorders characterized by high blood sugar levels. Type 1 diabetes is usually diagnosed in childhood, while Type 2 diabetes typically develops in adults. Management includes proper diet, exercise, medication, and regular blood sugar monitoring. Consult with an endocrinologist for personalized treatment.',
      
      'heart disease': 'Heart disease refers to several types of heart conditions, including coronary artery disease, heart attacks, and heart failure. Risk factors include high blood pressure, high cholesterol, smoking, and diabetes. Prevention involves a healthy diet, regular exercise, and avoiding smoking. See a cardiologist for heart health concerns.',
      
      'hypertension': 'Hypertension (high blood pressure) is when blood pressure readings are consistently above 140/90 mmHg. It often has no symptoms but increases risk of heart disease and stroke. Management includes lifestyle changes like reducing salt intake, exercising, and medication if needed. Regular monitoring is important.',
      
      'depression': 'Depression is a mental health disorder characterized by persistent sadness, loss of interest, and other symptoms that interfere with daily life. Treatment may include therapy, medication, or both. If you\'re experiencing symptoms of depression, please reach out to a mental health professional or your primary care doctor.',
      
      'anxiety': 'Anxiety disorders involve excessive worry, fear, or nervousness that interferes with daily activities. Common types include generalized anxiety disorder, panic disorder, and social anxiety. Treatment options include therapy, medication, and stress management techniques. Consult with a mental health professional for proper evaluation.',
      
      // Bulgarian keywords
      'рак': 'Ракът е група заболявания, включващи ненормален растеж на клетки с потенциал да нахлуят или да се разпространят в други части на тялото. Често срещаните типове включват рак на гърдата, белите дробове, простатата и дебелото черво. Ранното откриване чрез редовни прегледи е от решаващо значение. Моля, консултирайте се с онколог за правилна диагноза и лечение.',
      
      'диабет': 'Диабетът е група метаболитни разстройства, характеризиращи се с високи нива на кръвна захар. Диабет тип 1 обикновено се диагностицира в детството, докато диабет тип 2 обикновено се развива при възрастни. Управлението включва правилна диета, упражнения, лекарства и редовно наблюдение на кръвната захар. Консултирайте се с эндокринолог за персонализирано лечение.',
      
      'сърдечно заболяване': 'Сърдечното заболяване се отнася до няколко типа сърдечни състояния, включително коронарна артериална болест, инфаркт и сърдечна недостатъчност. Рисковите фактори включват високо кръвно налягане, висок холестерол, тютюнопушене и диабет. Профилактиката включва здравословна диета, редовни упражнения и избягване на тютюнопушенето. Вижте кардиолог за проблеми със сърдечното здраве.',
      
      'хипертония': 'Хипертонията (високо кръвно налягане) е когато показанията на кръвното налягане са постоянно над 140/90 mmHg. Често няма симптоми, но увеличава риска от сърдечни заболявания и инсулт. Управлението включва промени в начина на живот като намаляване на приема на сол, упражнения и лекарства при необходимост. Редовното наблюдение е важно.',
      
      'депресия': 'Депресията е психично разстройство, характеризиращо се с постоянна тъга, загуба на интерес и други симптоми, които пречат на ежедневния живот. Лечението може да включва терапия, лекарства или и двете. Ако изпитвате симптоми на депресия, моля, обърнете се към специалист по психично здраве или вашия личен лекар.',
      
      'тревожност': 'Тревожните разстройства включват прекомерно безпокойство, страх или нервност, които пречат на ежедневните дейности. Често срещаните типове включват генерализирано тревожно разстройство, паническо разстройство и социална тревожност. Възможностите за лечение включват терапия, лекарства и техники за управление на стреса. Консултирайте се със специалист по психично здраве за правилна оценка.'
    };

    // Find relevant response
    const lowerQuestion = question.toLowerCase();
    let response = '';
    let isBulgarian = /[а-я]/.test(question); // Check if question contains Cyrillic characters
    
    for (const [condition, info] of Object.entries(healthResponses)) {
      if (lowerQuestion.includes(condition)) {
        response = info;
        break;
      }
    }
    
    // Default response based on language
    if (!response) {
      if (isBulgarian) {
        response = `Благодаря за вашия здравен въпрос относно "${question}". Въпреки че мога да предоставя обща здравна информация, препоръчвам да се консултирате с медицински специалист за персонализиран медицински съвет. Те могат правилно да оценят вашата конкретна ситуация и да предоставят подходящи насоки.`;
      } else {
        response = `Thank you for your health question about "${question}". While I can provide general health information, I recommend consulting with a healthcare professional for personalized medical advice. They can properly evaluate your specific situation and provide appropriate guidance.`;
      }
    }
    
    // Add disclaimer based on language
    if (isBulgarian) {
      response += '\n\n⚠️ Важно: Тази информация е само с образователна цел и не трябва да замества професионален медицински съвет. Винаги се консултирайте с квалифицирани здравни специалисти при медицински проблеми.';
    } else {
      response += '\n\n⚠️ Important: This information is for educational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for medical concerns.';
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        answer: response,
        sources: []
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};