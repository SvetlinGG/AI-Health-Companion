import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data.js';

export const askRouter = Router();

// POST /api/ask { question: string }
askRouter.post('/', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }

    // Practical health responses with specific causes and solutions
    const healthTopics = {
      headache: {
        answer: "Common headache causes:\n\n• Tension/Stress - tight neck/shoulder muscles\n• Dehydration - drink 8+ glasses water daily\n• Eye strain - take screen breaks, check vision\n• Poor sleep - aim for 7-9 hours nightly\n• Hunger - eat regular meals\n• Caffeine withdrawal - gradual reduction\n• Sinus congestion - steam inhalation helps\n\nRed flags: Sudden severe headache, fever, vision changes, neck stiffness - seek immediate care.",
        sources: [
          { title: "Immediate Relief Tips", url: "#relief" },
          { title: "When to See a Doctor", url: "#emergency" }
        ]
      },
      fever: {
        answer: "Fever causes and management:\n\n• Viral infections (most common) - rest, fluids\n• Bacterial infections - may need antibiotics\n• Dehydration - increase fluid intake\n• Overheating - cool environment, light clothing\n\nTreatment:\n• Rest and sleep\n• Drink plenty of fluids\n• Cool compress on forehead\n• Acetaminophen/ibuprofen for comfort\n\nSeek care if: Fever >103°F, difficulty breathing, severe headache, persistent vomiting.",
        sources: [
          { title: "Home Remedies", url: "#home-care" },
          { title: "Emergency Signs", url: "#emergency" }
        ]
      },
      cough: {
        answer: "Cough causes and solutions:\n\n• Viral infection - honey, warm liquids, rest\n• Allergies - avoid triggers, antihistamines\n• Dry air - use humidifier\n• Acid reflux - avoid spicy foods, elevate head\n• Post-nasal drip - saline rinse\n\nHome remedies:\n• Honey (1 tsp) for throat coating\n• Warm salt water gargle\n• Stay hydrated\n• Throat lozenges\n\nSee doctor if: Cough >3 weeks, blood in sputum, fever, difficulty breathing.",
        sources: [
          { title: "Natural Remedies", url: "#natural" },
          { title: "Warning Signs", url: "#warning" }
        ]
      },
      stomach: {
        answer: "Stomach pain causes:\n\n• Indigestion - eat smaller meals, avoid spicy foods\n• Gas - avoid carbonated drinks, eat slowly\n• Food poisoning - rest, clear fluids, BRAT diet\n• Stress - relaxation techniques, regular meals\n• Constipation - increase fiber, water, exercise\n\nImmediate relief:\n• Sip warm water or herbal tea\n• Apply heat pad to abdomen\n• Try gentle walking\n• Avoid solid foods temporarily\n\nSeek help if: Severe pain, vomiting blood, high fever, signs of dehydration.",
        sources: [
          { title: "Quick Relief Methods", url: "#relief" },
          { title: "BRAT Diet Guide", url: "#diet" }
        ]
      },
      diabetes: {
        answer: "Diabetes management essentials:\n\n• Monitor blood sugar regularly\n• Follow prescribed medication schedule\n• Eat balanced meals, limit refined sugars\n• Exercise 30+ minutes daily\n• Stay hydrated\n• Check feet daily for cuts/sores\n• Regular eye and kidney checkups\n\nEmergency signs: Extreme thirst, frequent urination, blurred vision, fruity breath odor.",
        sources: [
          { title: "Daily Management Tips", url: "#management" },
          { title: "Emergency Warning Signs", url: "#emergency" }
        ]
      }
    };

    // Find matching health topic with symptom keywords
    const questionLower = question.toLowerCase();
    let matchedTopic = null;
    
    const symptomKeywords = {
      headache: ['headache', 'head pain', 'migraine', 'head hurt'],
      fever: ['fever', 'temperature', 'hot', 'chills', 'feverish'],
      cough: ['cough', 'coughing', 'throat', 'phlegm'],
      stomach: ['stomach', 'belly', 'abdominal', 'nausea', 'stomach pain', 'stomach ache'],
      diabetes: ['diabetes', 'blood sugar', 'insulin']
    };
    
    for (const [topic, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        matchedTopic = healthTopics[topic];
        break;
      }
    }

    // Default response if no specific topic matched
    const text = matchedTopic ? matchedTopic.answer : `I understand you're asking about "${question}". This is a general health response. Please consult with healthcare professionals for personalized medical advice.`;
    const sources = matchedTopic ? matchedTopic.sources : [
      { title: "WebMD Health Information", url: "https://webmd.com" },
      { title: "Healthline Medical Resources", url: "https://healthline.com" }
    ];

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
      domain: 'example.com', rank: i+1, created_at
    }));

    res.json({ answer: text, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});