const LOCATION = process.env.GCP_REGION || 'europe-west1';
const PROJECT = process.env.GCP_PROJECT_ID || process.env.PROJECT_ID;

// Mock function for testing
async function mockGeminiResponse(question, contextPassages = []) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        text: `Mock AI Response: Based on your question "${question}", here's a health-related answer. This is a demo response - in production, this would use Google's Gemini AI.`,
        citations: contextPassages.slice(0, 2).map((p, i) => ({
            citedText: p.title || `Source ${i + 1}`,
            url: p.url || '#'
        }))
    };
}

// Real Gemini function
async function realGeminiResponse(question, contextPassages = []) {
    const { VertexAI } = await import('@google-cloud/vertexai');
    const vertexAI = new VertexAI({ project: PROJECT, location: LOCATION });
    const model = vertexAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction: {
            role: 'system',
            parts: [{ text: 'You are a careful health explainer. Use only provided context. Cite sources'}]
        }
    });

    const contextText = contextPassages.map((p, i) => 
        `[#${i + 1}] TITLE: ${p.title}\nURL: ${p.url}\nTEXT: ${p.text}`
    ).join('\n---\n');

    const contents = [{ role: 'user', parts: [{ text: `QUESTION:\n${question}\n\nCONTEXT:\n${contextText}\n\nINSTRUCTIONS:\n- Answer concisely.\n- Include a "Sources" list of [#n] with titles + URLs.\n- If context is insufficient, say so.` }] }];

    const res = await model.generateContent({ contents, generationConfig: { maxOutputTokens: 512 }});
    const candidate = res.response?.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text || '').join('') || '';
    const citations = candidate?.citationMetadata?.citations?.map( c => ({
        citedText: c?.citationSources?.map( s => s?.uri).filter(Boolean)[0] || c?.citationSources?.[0]?.startIndex
    })) || [];

    return {text, citations};
}

export async function geminiAnswerWithCitations(question, contextPassages = []) {
    if (!PROJECT) {
        console.log('Using mock Gemini - no GCP_PROJECT_ID provided');
        return mockGeminiResponse(question, contextPassages);
    } else {
        try {
            return await realGeminiResponse(question, contextPassages);
        } catch (error) {
            console.error('Gemini API error, falling back to mock:', error.message);
            return mockGeminiResponse(question, contextPassages);
        }
    }
}