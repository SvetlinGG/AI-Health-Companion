// Mock Gemini for testing without Google Cloud setup
export async function geminiAnswerWithCitations(question, contextPassages = []) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        text: `This is a mock response for: "${question}". In a real deployment, this would use Google's Gemini AI to provide health-related answers based on the provided context.`,
        citations: contextPassages.map((p, i) => ({
            citedText: p.title,
            url: p.url
        }))
    };
}