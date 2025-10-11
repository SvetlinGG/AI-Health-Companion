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
// utility to append derived message/sources for the simple events

export function seedDerived(){
    if ( db.messages.length || db.sources.length ) return;
    for ( const ev of db.events ){
        db.messages.push({
            message_id: uuid(),
            event_id: ev.event_id,
            role: 'user',
            text: ev.question,
            tokens: ev.question.length,
            created_at: ev.created_at
        });
        db.messages.push({
            message_id: uuid(),
            event_id: ev.event_id,
            role: 'assistant',
            text: '(mocked) concise medical answer with citations',
            tokens: 120,
            created_at: now()
          });
          db.sources.push({
            source_id: uuid(),
            event_id: ev.event_id,
            title: 'WHO – Diabetes Overview',
            url: 'https://www.who.int/health-topics/diabetes',
            domain: 'who.int',
            rank: 1,
            created_at: now()
          });
          db.sources.push({
            source_id: uuid(),
            event_id: ev.event_id,
            title: 'NHS – Chest Pain',
            url: 'https://www.nhs.uk/conditions/chest-pain/',
            domain: 'nhs.uk',
            rank: 1,
            created_at: now()
          });
}
}
seedDerived()