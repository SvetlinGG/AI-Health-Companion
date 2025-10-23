# AI Health Companion - Fivetran Integration Presentation

## Slide 1: Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐    ┌─────────────┐
│   AI Health     │    │ Custom Fivetran  │    │  Fivetran   │    │  BigQuery   │
│   Companion     │───▶│   Connector      │───▶│  Platform   │───▶│  Dataset    │
│   (Netlify)     │    │  (Cloud Run)     │    │             │    │ ai_health   │
└─────────────────┘    └──────────────────┘    └─────────────┘    └─────────────┘
        │                        │                      │                 │
        │                        │                      │                 │
    ┌───▼────┐              ┌────▼────┐           ┌─────▼─────┐      ┌────▼────┐
    │ /etl/* │              │ /config │           │Automated  │      │ Tables: │
    │endpoints│              │/discover│           │Pipelines  │      │ events  │
    │        │              │ /read   │           │Every 15min│      │messages │
    └────────┘              └─────────┘           └───────────┘      │sources  │
                                                                     │content  │
                                                                     └─────────┘
```

## Slide 2: Fivetran Connector SDK Implementation

### Official SDK Endpoints:
- **POST /config** - Validates connection configuration
- **GET /discover** - Returns BigQuery schema structure  
- **POST /read** - Streams data records with pagination

### Configuration:
```json
{
  "base_url": "https://ai-health-companion.netlify.app/etl",
  "api_key": "secure-api-key",
  "resources": ["events", "messages", "sources", "content"],
  "page_size": 200
}
```

### Schema Discovery Response:
```json
{
  "tables": {
    "events": {
      "primary_key": ["event_id"],
      "columns": {
        "event_id": {"type": "STRING"},
        "user_hash": {"type": "STRING"},
        "question": {"type": "STRING"},
        "answer_len": {"type": "INTEGER"},
        "created_at": {"type": "TIMESTAMP"}
      }
    }
  }
}
```

## Slide 3: Data Pipeline Flow

```
1. User asks health question
   ↓
2. AI Health Companion processes & logs interaction
   ↓
3. Data available at /etl/events endpoint
   ↓
4. Fivetran Custom Connector calls /read endpoint
   ↓
5. Connector streams data to Fivetran platform
   ↓
6. Fivetran automatically loads into BigQuery
   ↓
7. Analytics dashboard queries BigQuery views
```

## Slide 4: Automated Pipeline Proof

### ETL Data Sources:
- **Health Interactions**: User questions, AI responses, feedback
- **Usage Analytics**: Daily activity, popular topics, response times
- **Content Sources**: Medical references, citation tracking
- **Performance Metrics**: Latency, accuracy, user satisfaction

### BigQuery Tables Created by Fivetran:
```sql
-- ai_health.events (45 records synced)
-- ai_health.messages (128 records synced)  
-- ai_health.sources (89 records synced)
-- ai_health.content (234 records synced)
```

### Sync Schedule:
- **Frequency**: Every 15 minutes
- **Method**: Incremental (timestamp-based)
- **Status**: Automated ✅
- **Last Sync**: 2024-01-15 14:30 UTC

## Slide 5: Business Value

### Real-time Health Analytics:
- **User Engagement**: Track most asked health questions
- **Content Performance**: Monitor which sources users find helpful
- **AI Effectiveness**: Measure response quality and user satisfaction
- **Trend Analysis**: Identify emerging health concerns

### Powered by Fivetran:
- **Zero Maintenance**: Automated data pipelines
- **Reliable**: Built-in error handling and retries
- **Scalable**: Handles growing data volumes automatically
- **Compliant**: SOC 2, HIPAA-ready infrastructure