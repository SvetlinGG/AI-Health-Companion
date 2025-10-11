import { v4 as uuid} from 'uuid';

// seed helpers
const now = () => new Date().toISOString();
const agoMin = m => new Date(Date.now() - m * 60 * 1000).toISOString();

export const db = {
    events: [
        {
            event_id: uuid(),
            user_hash: 'u_anon_1',
            question: 'What are common symptoms of type 2 diabetes?',
            answer_len: 180,
            latency_ms: 820,
            sources_count: 3,
            thumbs_up: true,
            created_at: agoMin(120)
        },
        {
            event_id: uuid(),
            user_hash: 'u_anon_2',
            question: 'When should I see a doctor for chest pain?',
            answer_len: 210,
            latency_ms: 930,
            sources_count: 2,
            thumbs_up: false,
            created_at: agoMin(30)
          },
    ],
    messages: [],
    sources: [],
    content: [
        {
            content_id: uuid(),
            title: 'Diabetes: Symptoms & Diagnosis',
            url: 'https://example.org/diabetes',
            tags: ['diabetes','symptoms'],
            published_at: '2024-09-01T00:00:00Z',
            ingested_at: now()
          }
    ]
};
