# Mock Fivetran UI Screenshots for Presentation

## Screenshot 1: Custom Connector Setup

```
┌─────────────────────────────────────────────────────────────────┐
│ Fivetran Dashboard > Add Connector > Custom Connector          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔌 Custom Connector Setup                                      │
│                                                                 │
│ Connector Name: [AI Health Companion                        ]  │
│                                                                 │
│ Connector URL:  [https://ai-health-connector-xyz.run.app    ]  │
│                                                                 │
│ Configuration:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ {                                                           │ │
│ │   "base_url": "https://ai-health-companion.netlify.app/etl"│ │
│ │   "api_key": "demo-key-12345",                             │ │
│ │   "resources": ["events", "messages", "sources", "content"]│ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Test Connection] [Save & Continue]                             │
│                                                                 │
│ ✅ Connection successful                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Screenshot 2: Schema Discovery

```
┌─────────────────────────────────────────────────────────────────┐
│ Schema Discovery - AI Health Companion                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 Discovered Tables (4)                                       │
│                                                                 │
│ ✅ ai_health.events                                            │
│    ├─ event_id (STRING, PRIMARY KEY)                           │
│    ├─ user_hash (STRING)                                       │
│    ├─ question (STRING)                                        │
│    ├─ answer_len (INTEGER)                                     │
│    └─ created_at (TIMESTAMP)                                   │
│                                                                 │
│ ✅ ai_health.messages                                          │
│    ├─ message_id (STRING, PRIMARY KEY)                         │
│    ├─ event_id (STRING)                                        │
│    ├─ role (STRING)                                            │
│    └─ text (STRING)                                            │
│                                                                 │
│ ✅ ai_health.sources                                           │
│    ├─ source_id (STRING, PRIMARY KEY)                          │
│    ├─ title (STRING)                                           │
│    └─ url (STRING)                                             │
│                                                                 │
│ ✅ ai_health.content                                           │
│    ├─ content_id (STRING, PRIMARY KEY)                         │
│    ├─ title (STRING)                                           │
│    └─ tags (STRING ARRAY)                                      │
│                                                                 │
│ [Configure Destination]                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Screenshot 3: BigQuery Destination Setup

```
┌─────────────────────────────────────────────────────────────────┐
│ Destination Setup - BigQuery                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🏗️ BigQuery Configuration                                      │
│                                                                 │
│ Project ID:     [ai-health-analytics                        ]  │
│ Dataset:        [ai_health                                  ]  │
│ Location:       [US (multiple regions)                     ▼] │
│                                                                 │
│ 📅 Sync Settings                                               │
│ Frequency:      [Every 15 minutes                          ▼] │
│ Sync Mode:      [Incremental (timestamp)                   ▼] │
│                                                                 │
│ 🔐 Authentication                                              │
│ Service Account: [fivetran-bigquery-sa@project.iam.gservi...] │
│ Status:         ✅ Authenticated                               │
│                                                                 │
│ [Test Destination] [Save & Start Sync]                         │
│                                                                 │
│ ✅ Destination configured successfully                          │
└─────────────────────────────────────────────────────────────────┘
```

## Screenshot 4: Sync Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ AI Health Companion - Sync Status                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🟢 Connected                    Last Sync: 2 minutes ago       │
│                                                                 │
│ 📈 Sync History (Last 24 hours)                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Time        │ Status    │ Records │ Tables                  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 14:30 UTC   │ ✅ Success │   45    │ events, messages       │ │
│ │ 14:15 UTC   │ ✅ Success │   32    │ events, sources        │ │
│ │ 14:00 UTC   │ ✅ Success │   28    │ events, content        │ │
│ │ 13:45 UTC   │ ✅ Success │   51    │ events, messages       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 📊 Total Records Synced: 1,247                                │
│                                                                 │
│ 🎯 Performance                                                 │
│ • Average Sync Time: 45 seconds                               │
│ • Success Rate: 100%                                          │
│ • Data Freshness: < 5 minutes                                 │
│                                                                 │
│ [View in BigQuery] [Sync Settings] [Pause Sync]               │
└─────────────────────────────────────────────────────────────────┘
```

## Screenshot 5: BigQuery Data Validation

```
┌─────────────────────────────────────────────────────────────────┐
│ BigQuery Console - ai_health Dataset                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📁 ai_health                                                   │
│   ├─ 📊 events (45 rows)                                       │
│   ├─ 📊 messages (128 rows)                                    │
│   ├─ 📊 sources (89 rows)                                      │
│   └─ 📊 content (234 rows)                                     │
│                                                                 │
│ Query: SELECT * FROM ai_health.events LIMIT 5                  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ event_id │ question              │ answer_len │ created_at  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ evt_001  │ What is diabetes?     │ 450        │ 2024-01-15  │ │
│ │ evt_002  │ How to treat headache │ 380        │ 2024-01-15  │ │
│ │ evt_003  │ Blood pressure causes │ 520        │ 2024-01-15  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ✅ Data loaded by Fivetran automatically                       │
│ 🕐 Last updated: 2 minutes ago                                 │
└─────────────────────────────────────────────────────────────────┘
```

Use these mockups in your presentation to show the complete Fivetran integration flow!