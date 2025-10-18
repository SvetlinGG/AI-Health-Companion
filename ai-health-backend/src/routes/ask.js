import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data.js';

export const askRouter = Router();

// Comprehensive health knowledge base
function generateHealthResponse(question) {
  const q = question.toLowerCase();
  
  // Extract symptoms, conditions, and context
  const symptoms = extractSymptoms(q);
  const bodyParts = extractBodyParts(q);
  const urgencyLevel = assessUrgency(q);
  
  // Generate comprehensive response
  let response = "";
  let sources = [];
  
  if (symptoms.length > 0 || bodyParts.length > 0) {
    response = generateSymptomResponse(question, symptoms, bodyParts, urgencyLevel);
    sources = generateRelevantSources(symptoms, bodyParts);
  } else if (q.includes('prevent') || q.includes('avoid') || q.includes('how can i') || q.includes('how to')) {
    response = generatePreventionAdvice(question);
    sources = [
      { title: "Prevention Guidelines", url: "#prevention" },
      { title: "Healthy Lifestyle Tips", url: "#lifestyle" }
    ];
  } else if (q.includes('treatment') || q.includes('cure') || q.includes('medicine')) {
    response = generateTreatmentAdvice(question);
    sources = [
      { title: "Treatment Options", url: "#treatment" },
      { title: "Medication Guidelines", url: "#medication" }
    ];
  } else {
    response = generateGeneralHealthAdvice(question);
    sources = [
      { title: "Health Information", url: "#general" },
      { title: "Medical Guidelines", url: "#guidelines" }
    ];
  }
  
  return { answer: response, sources };
}

function extractSymptoms(question) {
  const symptomKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'burning', 'sharp', 'dull', 'throbbing',
    'fever', 'temperature', 'hot', 'chills', 'sweating',
    'cough', 'coughing', 'phlegm', 'mucus', 'wheeze',
    'nausea', 'vomit', 'throw up', 'sick', 'queasy',
    'dizzy', 'lightheaded', 'faint', 'vertigo',
    'tired', 'fatigue', 'exhausted', 'weak', 'energy',
    'rash', 'itchy', 'red', 'swollen', 'bump',
    'bleeding', 'blood', 'bruise', 'cut', 'wound',
    'difficulty breathing', 'shortness of breath', 'breathe',
    'headache', 'migraine', 'pressure'
  ];
  
  return symptomKeywords.filter(symptom => question.includes(symptom));
}

function extractBodyParts(question) {
  const bodyParts = [
    'head', 'brain', 'eye', 'ear', 'nose', 'mouth', 'throat', 'neck',
    'chest', 'heart', 'lung', 'breast', 'shoulder', 'arm', 'hand', 'finger',
    'back', 'spine', 'stomach', 'abdomen', 'liver', 'kidney',
    'leg', 'knee', 'foot', 'toe', 'ankle', 'hip',
    'skin', 'muscle', 'bone', 'joint'
  ];
  
  return bodyParts.filter(part => question.includes(part));
}

function assessUrgency(question) {
  const emergencyKeywords = ['emergency', 'urgent', 'severe', 'can\'t breathe', 'chest pain', 'unconscious', 'bleeding heavily'];
  const highUrgency = ['sudden', 'sharp pain', 'difficulty breathing', 'high fever'];
  
  if (emergencyKeywords.some(keyword => question.includes(keyword))) return 'emergency';
  if (highUrgency.some(keyword => question.includes(keyword))) return 'high';
  return 'normal';
}

function generateSymptomResponse(question, symptoms, bodyParts, urgency) {
  let response = `Based on your symptoms, here's what you should know:\n\n`;
  
  // Add urgency warning if needed
  if (urgency === 'emergency') {
    response += "🚨 EMERGENCY: Seek immediate medical attention or call emergency services!\n\n";
  } else if (urgency === 'high') {
    response += "⚠️ HIGH PRIORITY: Consider seeing a healthcare provider soon.\n\n";
  }
  
  // Possible causes
  response += "POSSIBLE CAUSES:\n";
  response += generateCauses(symptoms, bodyParts);
  
  // Immediate actions
  response += "\n\nIMMEDIATE ACTIONS:\n";
  response += generateImmediateActions(symptoms, bodyParts);
  
  // When to seek help
  response += "\n\nSEEK MEDICAL HELP IF:\n";
  response += generateWarningSigns(symptoms, bodyParts);
  
  // Home remedies
  response += "\n\nHOME CARE:\n";
  response += generateHomeRemedies(symptoms, bodyParts);
  
  response += "\n\n⚠️ This is general information. Consult healthcare professionals for personalized advice.";
  
  return response;
}

function generateCauses(symptoms, bodyParts) {
  let causes = [];
  
  if (symptoms.includes('pain') || symptoms.includes('ache')) {
    causes.push("• Muscle tension or strain");
    causes.push("• Inflammation or injury");
    causes.push("• Poor posture or overuse");
  }
  
  if (symptoms.includes('fever')) {
    causes.push("• Viral or bacterial infection");
    causes.push("• Body's immune response");
    causes.push("• Dehydration or overheating");
  }
  
  if (symptoms.includes('cough')) {
    causes.push("• Respiratory infection (viral/bacterial)");
    causes.push("• Allergies or irritants");
    causes.push("• Acid reflux or post-nasal drip");
  }
  
  if (symptoms.includes('nausea')) {
    causes.push("• Digestive issues or food poisoning");
    causes.push("• Motion sickness or anxiety");
    causes.push("• Medication side effects");
  }
  
  if (causes.length === 0) {
    causes.push("• Multiple factors could be involved");
    causes.push("• Individual health conditions vary");
    causes.push("• Professional evaluation recommended");
  }
  
  return causes.join('\n');
}

function generateImmediateActions(symptoms, bodyParts) {
  let actions = [];
  
  if (symptoms.includes('pain')) {
    actions.push("• Rest the affected area");
    actions.push("• Apply ice for acute injuries (15-20 min)");
    actions.push("• Take over-the-counter pain relievers if appropriate");
  }
  
  if (symptoms.includes('fever')) {
    actions.push("• Increase fluid intake");
    actions.push("• Rest in a cool environment");
    actions.push("• Monitor temperature regularly");
  }
  
  if (symptoms.includes('cough')) {
    actions.push("• Stay hydrated with warm liquids");
    actions.push("• Use honey for throat soothing");
    actions.push("• Avoid irritants like smoke");
  }
  
  if (actions.length === 0) {
    actions.push("• Monitor symptoms closely");
    actions.push("• Stay hydrated and rest");
    actions.push("• Avoid known triggers");
  }
  
  return actions.join('\n');
}

function generateWarningSigns(symptoms, bodyParts) {
  let warnings = [
    "• Symptoms worsen rapidly",
    "• High fever (>103°F/39.4°C)",
    "• Difficulty breathing or swallowing",
    "• Severe or persistent pain",
    "• Signs of infection (pus, red streaks)",
    "• Symptoms don't improve in 2-3 days"
  ];
  
  return warnings.join('\n');
}

function generateHomeRemedies(symptoms, bodyParts) {
  let remedies = [];
  
  if (symptoms.includes('pain')) {
    remedies.push("• Gentle stretching or movement");
    remedies.push("• Heat therapy for muscle tension");
    remedies.push("• Relaxation techniques");
  }
  
  if (symptoms.includes('fever')) {
    remedies.push("• Cool compresses on forehead");
    remedies.push("• Light, breathable clothing");
    remedies.push("• Electrolyte replacement drinks");
  }
  
  if (remedies.length === 0) {
    remedies.push("• Adequate rest and sleep");
    remedies.push("• Balanced nutrition");
    remedies.push("• Stress management");
  }
  
  return remedies.join('\n');
}

function generatePreventionAdvice(question) {
  return `Prevention Guidelines:\n\n• Maintain a healthy lifestyle with regular exercise\n• Eat a balanced diet rich in fruits and vegetables\n• Stay hydrated (8+ glasses of water daily)\n• Get adequate sleep (7-9 hours nightly)\n• Manage stress through relaxation techniques\n• Practice good hygiene (handwashing, etc.)\n• Avoid smoking and limit alcohol\n• Regular health checkups and screenings\n• Stay up-to-date with vaccinations\n• Maintain a healthy weight\n\n⚠️ Prevention strategies vary by individual health conditions.`;
}

function generateTreatmentAdvice(question) {
  return `Treatment Approach:\n\n• Consult healthcare professionals for proper diagnosis\n• Follow prescribed medication schedules\n• Complete full course of antibiotics if prescribed\n• Monitor symptoms and side effects\n• Maintain follow-up appointments\n• Combine medical treatment with lifestyle changes\n• Consider complementary therapies (with doctor approval)\n• Keep detailed symptom diary\n• Communicate openly with healthcare team\n• Seek second opinions for complex conditions\n\n⚠️ Never stop prescribed medications without consulting your doctor.`;
}

function generateGeneralHealthAdvice(question) {
  return `General Health Guidance:\n\n• Listen to your body's signals\n• Maintain regular healthcare relationships\n• Keep emergency contact information accessible\n• Stay informed about your health conditions\n• Practice preventive care measures\n• Build a support network\n• Manage chronic conditions proactively\n• Stay physically and mentally active\n• Prioritize mental health and well-being\n• Make informed healthcare decisions\n\n⚠️ Individual health needs vary - personalized medical advice is essential.`;
}

function generateRelevantSources(symptoms, bodyParts) {
  return [
    { title: "Symptom Assessment Guide", url: "#assessment" },
    { title: "Emergency Warning Signs", url: "#emergency" },
    { title: "Home Care Instructions", url: "#homecare" },
    { title: "When to See a Doctor", url: "#medical-help" }
  ];
}

// POST /api/ask { question: string }
askRouter.post('/', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }

    // Generate comprehensive health response
    const { answer: text, sources } = generateHealthResponse(question);

    // Telemetry
    const event_id = uuid();
    const created_at = new Date().toISOString();
    const user_hash = 'u_' + Math.random().toString(36).slice(2, 10);

    db.events.push({
      event_id, user_hash, question,
      answer_len: text.length, latency_ms: 0,
      sources_count: sources.length, thumbs_up: null, created_at
    });

    db.messages.push({ message_id: uuid(), event_id, role: 'user', text: question, tokens: question.length, created_at });
    db.messages.push({ message_id: uuid(), event_id, role: 'assistant', text, tokens: Math.floor(text.length/4), created_at });

    sources.forEach((s, i) => db.sources.push({
      source_id: uuid(), event_id, title: s.title, url: s.url,
      domain: 'health-assistant', rank: i+1, created_at
    }));

    res.json({ answer: text, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});