# Fivetran Connector Setup Guide

## 1. Deploy Fivetran Connector

### Deploy to Cloud Run:
```bash
cd connector
gcloud run deploy ai-health-fivetran-connector \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Get Connector URL:
```bash
gcloud run services describe ai-health-fivetran-connector \
  --region us-central1 \
  --format 'value(status.url)'
```

## 2. Register Custom Connector in Fivetran UI

### Step 1: Create Custom Connector
1. Go to Fivetran Dashboard → Connectors
2. Click "Add Connector" → "Custom Connector"
3. Enter connector details:
   - **Name**: AI Health Companion
   - **URL**: `https://your-connector-url.run.app`
   - **Authentication**: API Key

### Step 2: Configure Connection
1. **Base URL**: `https://ai-health-companion.netlify.app/etl`
2. **API Key**: `your-api-key`
3. **Resources**: `["events", "messages", "sources", "content"]`

### Step 3: Set Destination
1. Choose **BigQuery** as destination
2. Configure dataset: `ai_health`
3. Set sync frequency: Every 15 minutes

## 3. Required Fivetran Endpoints

The connector implements these official SDK endpoints:

- **POST /config** - Validates configuration
- **GET /discover** - Returns schema structure  
- **POST /read** - Streams data records

## 4. BigQuery Schema

Tables created automatically by Fivetran:

```sql
-- ai_health.events
CREATE TABLE ai_health.events (
  event_id STRING NOT NULL,
  user_hash STRING,
  question STRING,
  answer_len INT64,
  latency_ms INT64,
  sources_count INT64,
  thumbs_up BOOLEAN,
  created_at TIMESTAMP NOT NULL
);

-- ai_health.messages  
CREATE TABLE ai_health.messages (
  message_id STRING NOT NULL,
  event_id STRING,
  role STRING,
  text STRING,
  tokens INT64,
  created_at TIMESTAMP NOT NULL
);

-- ai_health.sources
CREATE TABLE ai_health.sources (
  source_id STRING NOT NULL,
  event_id STRING,
  title STRING,
  url STRING,
  domain STRING,
  rank INT64,
  created_at TIMESTAMP NOT NULL
);

-- ai_health.content
CREATE TABLE ai_health.content (
  content_id STRING NOT NULL,
  title STRING,
  url STRING,
  tags ARRAY<STRING>,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP NOT NULL
);
```

## 5. Verification Steps

### Test Connector Endpoints:
```bash
# Test configuration
curl -X POST https://your-connector-url.run.app/config \
  -H "Content-Type: application/json" \
  -d '{"base_url":"https://ai-health-companion.netlify.app/etl","api_key":"test"}'

# Test schema discovery
curl https://your-connector-url.run.app/discover

# Test data reading
curl -X POST https://your-connector-url.run.app/read \
  -H "Content-Type: application/json" \
  -d '{"state":{}}'
```

### Verify in Fivetran UI:
1. Check connector status: "Connected"
2. View sync history: Successful runs
3. Monitor data flow: Records synced to BigQuery

## 6. Proof of Automated Pipeline

Screenshots needed:
1. **Fivetran Connector Setup** - Custom connector configuration
2. **BigQuery Destination** - Dataset and tables created by Fivetran
3. **Sync History** - Automated sync runs and record counts
4. **Data Validation** - Query results showing Fivetran loaded the data

This proves Fivetran, not custom code, is loading data into BigQuery automatically.