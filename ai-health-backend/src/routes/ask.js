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

    // Dynamic health-specific response
    const healthTopics = {
      diabetes: {
        answer: "Diabetes is a chronic condition where your body cannot properly process blood sugar (glucose). There are two main types: Type 1 (autoimmune) and Type 2 (insulin resistance). Management includes diet, exercise, medication, and regular monitoring.",
        sources: [
          { title: "American Diabetes Association", url: "https://diabetes.org/about-diabetes" },
          { title: "CDC Diabetes Basics", url: "https://cdc.gov/diabetes/basics/diabetes.html" }
        ]
      },
      hypertension: {
        answer: "High blood pressure (hypertension) occurs when blood pushes against artery walls with too much force. It's often called the 'silent killer' because it usually has no symptoms. Management includes lifestyle changes and medication.",
        sources: [
          { title: "American Heart Association", url: "https://heart.org/en/health-topics/high-blood-pressure" },
          { title: "Mayo Clinic - High Blood Pressure", url: "https://mayoclinic.org/diseases-conditions/high-blood-pressure" }
        ]
      },
      heart: {
        answer: "Heart disease encompasses various conditions affecting the heart and blood vessels. Common types include coronary artery disease, heart failure, and arrhythmias. Prevention focuses on healthy lifestyle choices.",
        sources: [
          { title: "American Heart Association", url: "https://heart.org/en/health-topics/heart-disease" },
          { title: "NIH Heart Disease Information", url: "https://nhlbi.nih.gov/health/heart-disease" }
        ]
      },
      cancer: {
        answer: "Cancer occurs when cells grow uncontrollably and spread to other parts of the body. There are many types, each requiring specific treatment approaches. Early detection and treatment improve outcomes significantly.",
        sources: [
          { title: "National Cancer Institute", url: "https://cancer.gov/about-cancer/understanding/what-is-cancer" },
          { title: "American Cancer Society", url: "https://cancer.org/cancer/cancer-basics/what-is-cancer.html" }
        ]
      }
    };

    // Find matching health topic
    const questionLower = question.toLowerCase();
    let matchedTopic = null;
    
    for (const [topic, data] of Object.entries(healthTopics)) {
      if (questionLower.includes(topic) || questionLower.includes(topic.slice(0, -1))) {
        matchedTopic = data;
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