CREATE SCHEMA IF NOT EXISTS `ai_health`;

CREATE TABLE IF NOT EXISTS `ai_health.events` (
  event_id STRING, user_hash STRING, question STRING,
  answer_len INT64, latency_ms INT64, sources_count INT64,
  thumbs_up BOOL, created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ai_health.messages` (
  message_id STRING, event_id STRING, role STRING,
  text STRING, tokens INT64, created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ai_health.sources` (
  source_id STRING, event_id STRING, title STRING,
  url STRING, domain STRING, rank INT64, created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ai_health.content` (
  content_id STRING, title STRING, url STRING,
  tags ARRAY<STRING>, published_at TIMESTAMP, ingested_at TIMESTAMP
);

CREATE OR REPLACE VIEW `ai_health.daily_usage` AS
SELECT DATE(created_at) d, COUNT(*) events, AVG(latency_ms) avg_latency
FROM `ai_health.events`
GROUP BY d
ORDER BY d DESC;

CREATE OR REPLACE VIEW `ai_health.top_domains` AS
SELECT domain, COUNT(*) c
FROM `ai_health.sources`
GROUP BY domain
ORDER BY c DESC
LIMIT 20;