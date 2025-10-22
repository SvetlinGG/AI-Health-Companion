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

    // Medical professional responses in English and Bulgarian
    const medicalResponses = {
      // English keywords
      'cancer': 'Cancer happens when cells in your body start growing out of control. Here are the key things you should know:\n\n**What causes cancer:**\n• Damaged cells that multiply too quickly\n• Can spread to other parts of your body\n• Common types: breast, lung, colon, and prostate cancer\n\n**Why early detection matters:**\n• Catching cancer early makes treatment much more successful\n• Regular check-ups and screenings can save your life\n• Different ages need different types of screenings\n\n**Treatment options:**\n• Surgery to remove cancer cells\n• Chemotherapy (special medicines)\n• Radiation therapy (targeted energy beams)\n• Each treatment plan is personalized for you\n\n**Next steps:**\nIf you\'re worried about cancer symptoms, see a cancer specialist (oncologist) who can properly evaluate your situation and recommend the right tests.',
      
      'diabetes': 'Regarding your question about diabetes, this is a serious metabolic condition that requires careful management. We distinguish between Type 1 diabetes, typically diagnosed in younger patients due to autoimmune destruction of insulin-producing cells, and Type 2 diabetes, more common in adults and often associated with lifestyle factors.\n\nEffective management involves a comprehensive approach: maintaining optimal blood glucose levels through proper nutrition, regular physical activity, and when necessary, medication or insulin therapy. Regular monitoring of HbA1c levels, blood pressure, and lipid profiles is essential to prevent complications.\n\nI recommend working closely with an endocrinologist and diabetes educator to develop a personalized management plan. Early intervention and consistent care can significantly reduce the risk of complications such as cardiovascular disease, neuropathy, and retinopathy.',
      
      'heart disease': 'Concerning cardiovascular disease, this remains one of the leading health concerns globally. The spectrum includes coronary artery disease, myocardial infarction, heart failure, and various arrhythmias.\n\nKey risk factors include hypertension, dyslipidemia, diabetes, smoking, sedentary lifestyle, and family history. The good news is that many of these are modifiable through lifestyle interventions and appropriate medical management.\n\nI recommend implementing a heart-healthy lifestyle: regular aerobic exercise, a Mediterranean-style diet rich in omega-3 fatty acids, smoking cessation if applicable, and stress management. Regular cardiovascular screening, including blood pressure monitoring and lipid panels, is crucial for early detection and prevention.\n\nIf you have symptoms such as chest pain, shortness of breath, or palpitations, please seek immediate medical evaluation.',
      
      'hypertension': 'Hypertension, or elevated blood pressure, is often called the "silent killer" because it frequently presents without symptoms while causing significant cardiovascular damage over time.\n\nWe define hypertension as consistently elevated readings above 130/80 mmHg. The condition significantly increases your risk for stroke, heart attack, kidney disease, and other serious complications.\n\nManagement typically begins with lifestyle modifications: reducing sodium intake to less than 2,300mg daily, maintaining a healthy weight, regular physical activity, limiting alcohol consumption, and stress reduction techniques. When lifestyle changes are insufficient, antihypertensive medications may be necessary.\n\nI strongly recommend regular blood pressure monitoring and working with your healthcare provider to establish target goals based on your individual risk profile.',
      
      'depression': 'Depression is a serious medical condition that affects millions of people worldwide. It\'s important to understand that depression is not a sign of weakness or something you can simply "snap out of."\n\nClinical depression involves persistent changes in mood, cognition, and physical functioning that significantly impact daily life. Symptoms may include persistent sadness, loss of interest in activities, changes in appetite or sleep patterns, fatigue, and difficulty concentrating.\n\nTreatment approaches are highly effective and may include psychotherapy, particularly cognitive-behavioral therapy, and when appropriate, antidepressant medications. The combination of both treatments often yields the best outcomes.\n\nIf you\'re experiencing symptoms of depression, I strongly encourage you to reach out to a mental health professional or your primary care physician. Early intervention leads to better outcomes, and there are many effective treatment options available.',
      
      'anxiety': 'Anxiety disorders are among the most common mental health conditions, and they are highly treatable with proper care. These conditions involve excessive worry or fear that interferes with daily functioning.\n\nCommon presentations include generalized anxiety disorder, panic disorder, social anxiety disorder, and specific phobias. Physical symptoms may include rapid heartbeat, sweating, trembling, and shortness of breath.\n\nEvidence-based treatments include cognitive-behavioral therapy, which helps identify and modify thought patterns and behaviors that contribute to anxiety. In some cases, anti-anxiety medications or antidepressants may be beneficial as part of a comprehensive treatment plan.\n\nI recommend stress management techniques such as deep breathing exercises, progressive muscle relaxation, and mindfulness meditation. However, if anxiety is significantly impacting your quality of life, please consider consulting with a mental health professional for proper evaluation and treatment.',
      
      // Bulgarian keywords
      'рак': 'Относно вашия въпрос за рака, мога да ви предоставя важна медицинска информация. Ракът представлява сложна група заболявания, характеризиращи се с неконтролиран клетъчен растеж и потенциал за метастази. Най-честите форми включват рак на гърдата, белите дробове, дебелото черво и простатата.\n\nРанното откриване значително подобрява резултатите от лечението, затова силно препоръчвам спазването на насоките за скрининг, подходящи за вашата възраст и рискови фактори. Подходите за лечение варират значително в зависимост от типа, стадия и индивидуалните пациентски фактори.\n\nПрепоръчвам ви да насрочите консултация с онколог, ако имате специфични притеснения или симптоми. Те могат да предоставят персонализирана оценка на риска и подходящи препоръки за скрининг.',
      
      'диабет': 'Относно вашия въпрос за диабета, това е сериозно метаболитно състояние, което изисква внимателно управление. Разграничаваме диабет тип 1, обикновено диагностициран при по-млади пациенти поради автоимунно разрушаване на инсулин-продуциращите клетки, и диабет тип 2, по-често срещан при възрастни.\n\nЕфективното управление включва цялостен подход: поддържане на оптимални нива на кръвната глукоза чрез правилно хранене, редовна физическа активност и при необходимост медикаментозна терапия или инсулин.\n\nПрепоръчвам тясно сътрудничество с ендокринолог и диабетен educator за разработване на персонализиран план за управление. Ранната интервенция може значително да намали риска от усложнения.',
      
      'сърдечно заболяване': 'Относно сърдечно-съдовите заболявания, те остават една от водещите здравни грижи в световен мащаб. Спектърът включва коронарна артериална болест, миокарден инфаркт, сърдечна недостатъчност и различни аритмии.\n\nКлючовите рискови фактори включват хипертония, дислипидемия, диабет, тютюнопушене, заседнал начин на живот и семейна анамнеза. Добрата новина е, че много от тях могат да бъдат модифицирани чрез промени в начина на живот.\n\nПрепоръчвам прилагане на сърдечно-здравословен начин на живот: редовни аеробни упражнения, средиземноморска диета, богата на омега-3 мастни киселини, и редовен кардиоваскуларен скрининг.\n\nАко имате симптоми като болка в гърдите, задух или сърцебиене, моля, потърсете незабавна медицинска оценка.',
      
      'хипертония': 'Хипертонията, или повишеното кръвно налягане, често се нарича "тихия убиец", защото често се проявява без симптоми, докато причинява значителни сърдечно-съдови увреждания с времето.\n\nДефинираме хипертонията като постоянно повишени стойности над 130/80 mmHg. Състоянието значително увеличава риска от инсулт, инфаркт, бъбречно заболяване и други сериозни усложнения.\n\nУправлението обикновено започва с промени в начина на живот: намаляване на приема на натрий, поддържане на здравословно тегло, редовна физическа активност и техники за намаляване на стреса.\n\nСилно препоръчвам редовно наблюдение на кръвното налягане и работа с вашия лекар за установяване на целеви стойности.',
      
      'депресия': 'Депресията е сериозно медицинско състояние, което засяга милиони хора по света. Важно е да разберете, че депресията не е признак на слабост или нещо, от което можете просто да "излезете".\n\nКлиничната депресия включва постоянни промени в настроението, познанието и физическото функциониране, които значително въздействат на ежедневния живот.\n\nПодходите за лечение са високо ефективни и могат да включват психотерапия, особено когнитивно-поведенческа терапия, и когато е подходящо, антидепресивни медикаменти.\n\nАко изпитвате симптоми на депресия, силно ви насърчавам да се обърнете към специалист по психично здраве. Ранната интервенция води до по-добри резултати.',
      
      'тревожност': 'Тревожните разстройства са сред най-честите психични състояния и са високо лечими при правилна грижа. Тези състояния включват прекомерно безпокойство или страх, който пречи на ежедневното функциониране.\n\nЧесто срещаните прояви включват генерализирано тревожно разстройство, паническо разстройство и социално тревожно разстройство. Физическите симптоми могат да включват учестен сърдечен ритъм, изпотяване и задух.\n\nОснованите на доказателства лечения включват когнитивно-поведенческа терапия. В някои случаи антитревожни медикаменти могат да бъдат полезни като част от цялостен план за лечение.\n\nПрепоръчвам техники за управление на стреса като дълбоко дишане и медитация. Ако тревожността значително въздейства на качеството ви на живот, моля, помислете за консултация със специалист.'
    };

    // Find relevant response
    const lowerQuestion = question.toLowerCase();
    let response = '';
    let isBulgarian = /[а-я]/.test(question);
    
    for (const [condition, info] of Object.entries(medicalResponses)) {
      if (lowerQuestion.includes(condition)) {
        response = info;
        break;
      }
    }
    
    // Default professional response based on language
    if (!response) {
      if (isBulgarian) {
        response = `Благодаря за вашия въпрос относно "${question}". Като медицински специалист, бих искал да подчертая важността на персонализираната оценка за всяко здравно състояние. Въпреки че мога да предоставя обща медицинска информация, всеки случай е уникален и изисква индивидуален подход.\n\nПрепоръчвам ви да се консултирате с квалифициран здравен специалист, който може да направи подробна оценка на вашето състояние, да прегледа медицинската ви история и да предостави най-подходящите препоръки за вашата конкретна ситуация.`;
      } else {
        response = `Thank you for your inquiry about "${question}". As a medical professional, I want to emphasize the importance of personalized assessment for any health condition. While I can provide general medical information, each case is unique and requires an individualized approach.\n\nI recommend consulting with a qualified healthcare provider who can conduct a thorough evaluation of your condition, review your medical history, and provide the most appropriate recommendations for your specific situation.`;
      }
    }
    
    // Add professional disclaimer
    if (isBulgarian) {
      response += '\n\n⚠️ Медицинска бележка: Тази информация е предоставена с образователна цел и не заменя професионалната медицинска консултация, диагноза или лечение. Винаги се консултирайте с вашия лекар или друг квалифициран здравен специалист при медицински въпроси или притеснения.';
    } else {
      response += '\n\n⚠️ Medical Disclaimer: This information is provided for educational purposes and does not replace professional medical consultation, diagnosis, or treatment. Always consult with your physician or other qualified healthcare provider regarding medical questions or concerns.';
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