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

    // Simple health knowledge base
    const healthResponses = {
      'cancer': 'Cancer is a group of diseases involving abnormal cell growth with the potential to invade or spread to other parts of the body. Common types include breast, lung, prostate, and colorectal cancer. Early detection through regular screenings is crucial. Please consult with an oncologist for proper diagnosis and treatment.',
      
      'diabetes': 'Diabetes is a group of metabolic disorders characterized by high blood sugar levels. Type 1 diabetes is usually diagnosed in childhood, while Type 2 diabetes typically develops in adults. Management includes proper diet, exercise, medication, and regular blood sugar monitoring. Consult with an endocrinologist for personalized treatment.',
      
      'heart disease': 'Heart disease refers to several types of heart conditions, including coronary artery disease, heart attacks, and heart failure. Risk factors include high blood pressure, high cholesterol, smoking, and diabetes. Prevention involves a healthy diet, regular exercise, and avoiding smoking. See a cardiologist for heart health concerns.',
      
      'hypertension': 'Hypertension (high blood pressure) is when blood pressure readings are consistently above 140/90 mmHg. It often has no symptoms but increases risk of heart disease and stroke. Management includes lifestyle changes like reducing salt intake, exercising, and medication if needed. Regular monitoring is important.',
      
      'depression': 'Depression is a mental health disorder characterized by persistent sadness, loss of interest, and other symptoms that interfere with daily life. Treatment may include therapy, medication, or both. If you\'re experiencing symptoms of depression, please reach out to a mental health professional or your primary care doctor.',
      
      'anxiety': 'Anxiety disorders involve excessive worry, fear, or nervousness that interferes with daily activities. Common types include generalized anxiety disorder, panic disorder, and social anxiety. Treatment options include therapy, medication, and stress management techniques. Consult with a mental health professional for proper evaluation.'
    };

    // Find relevant response
    const lowerQuestion = question.toLowerCase();
    let response = '';
    
    for (const [condition, info] of Object.entries(healthResponses)) {
      if (lowerQuestion.includes(condition)) {
        response = info;
        break;
      }
    }
    
    // Default response if no match found
    if (!response) {
      response = `Thank you for your health question about "${question}". While I can provide general health information, I recommend consulting with a healthcare professional for personalized medical advice. They can properly evaluate your specific situation and provide appropriate guidance.`;
    }
    
    // Add disclaimer
    response += '\n\n⚠️ Important: This information is for educational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for medical concerns.';

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