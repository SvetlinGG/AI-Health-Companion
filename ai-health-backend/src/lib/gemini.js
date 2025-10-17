import { VertexAI } from '@google-cloud/vertexai';

const LOCATION = process.env.GCP_REGION || 'europe-west1';
const PROJECT = process.env.GCP_PROJECT_ID;

const vertexAI = new VertexAI({ project: PROJECT, location: LOCATION });
const model = vertexAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

    // Optional: system_instruction for safety style
    systemInstruction: {
        role: 'system',
        parts: [{ text: 'You are a careful health explainer. Use only provided context. Cite sources'}]
    }
});

/**  Calls Gemini with question + context passage; returns { text, citations[] } */

export async function geminiAnswerWithCitations(question, contextPassages = []){
    const contextText = contextPassages.map((p, i) => 
    `[#${i + 1}] TITLE: ${p.title}\nURL: ${p.url}\nTEXT: ${p.text}`
).join('\n---\n');

    const contents = [{ role: 'user', parts: [{ text: `QUESTION:\n${question}\n\nCONTEXT:\n${contextText}\n\nINSTRUCTIONS:\n- Answer concisely.\n- Include a "Sources" list of [#n] with titles + URLs.\n- If context is insufficient, say so.` }] }];

    const res = await model.generateContent({ contents, generationConfig: { maxOutputTokens: 512 }});

    const candidate = res.response?.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text || '').join('') || '';

    // Try to collect citation hints ( if present); otherwise rely on our context order
    const citations = candidate?.citationMetadata?.citations?.map( c => ({
        // Gemini often returns citedText only; we can map later to passages if needed
        citedText: c?.citationSources?.map( s => s?.uri).filter(Boolean)[0] || c?.citationSources?.[0]?.startIndex
    })) || [];

    return {text, citations};
}