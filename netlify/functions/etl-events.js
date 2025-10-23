exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { page = 1, limit = 200, since } = event.queryStringParameters || {};
    
    // Mock health interaction events data
    const events = [
      {
        event_id: "evt_001",
        user_hash: "user_abc123",
        question: "What is diabetes?",
        answer_len: 450,
        latency_ms: 1200,
        sources_count: 3,
        thumbs_up: true,
        created_at: "2024-01-15T10:30:00Z"
      },
      {
        event_id: "evt_002", 
        user_hash: "user_def456",
        question: "How to treat headaches?",
        answer_len: 380,
        latency_ms: 950,
        sources_count: 2,
        thumbs_up: null,
        created_at: "2024-01-15T11:15:00Z"
      },
      {
        event_id: "evt_003",
        user_hash: "user_ghi789",
        question: "What causes high blood pressure?",
        answer_len: 520,
        latency_ms: 1450,
        sources_count: 4,
        thumbs_up: true,
        created_at: "2024-01-15T12:00:00Z"
      }
    ];

    // Filter by since parameter if provided
    let filteredEvents = events;
    if (since) {
      filteredEvents = events.filter(e => e.created_at > since);
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + parseInt(limit));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(paginatedEvents)
    };
  } catch (error) {
    console.error('ETL Events error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};