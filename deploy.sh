#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIG ======
PROJECT_ID="${PROJECT_ID:-your-project-id}"
REGION="${REGION:-europe-west1}"

# Required once (or when rotating)
ETL_BEARER_VALUE="${ETL_BEARER_VALUE:-change-me}"
GEMINI_API_KEY_VALUE="${GEMINI_API_KEY_VALUE:-unused-for-vertex}"

# ====== Enable APIs ======
gcloud config set project "${PROJECT_ID}"
gcloud services enable run.googleapis.com bigquery.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com cloudscheduler.googleapis.com

# ====== Secrets ======
if ! gcloud secrets describe ETL_BEARER >/dev/null 2>&1; then
  echo -n "${ETL_BEARER_VALUE}" | gcloud secrets create ETL_BEARER --data-file=-
else
  echo -n "${ETL_BEARER_VALUE}" | gcloud secrets versions add ETL_BEARER --data-file=-
fi
if ! gcloud secrets describe GEMINI_API_KEY >/dev/null 2>&1; then
  echo -n "${GEMINI_API_KEY_VALUE}" | gcloud secrets create GEMINI_API_KEY --data-file=-
else
  echo -n "${GEMINI_API_KEY_VALUE}" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
fi

# ====== Service Account (backend) ======
if ! gcloud iam service-accounts describe "ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com" >/dev/null 2>&1; then
  gcloud iam service-accounts create ai-health-backend --display-name="AI Health Backend"
fi
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.user"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# ====== BigQuery dataset (idempotent) ======
bq --location=EU mk -d --description "AI Health dataset" "${PROJECT_ID}:ai_health" || true

# ====== Build & Deploy Backend ======
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/ai-health-backend" ./backend

gcloud run deploy ai-health-backend \
  --image "gcr.io/${PROJECT_ID}/ai-health-backend" \
  --platform managed --region "${REGION}" --allow-unauthenticated \
  --service-account "ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --set-env-vars "API_BASE=/api,GCP_PROJECT_ID=${PROJECT_ID},BQ_DATASET=ai_health,GCP_REGION=${REGION}" \
  --set-secrets "ETL_BEARER=ETL_BEARER:latest" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

BACKEND_URL="$(gcloud run services describe ai-health-backend --region ${REGION} --format='value(status.url)')"
echo "Backend URL: ${BACKEND_URL}"

# ====== Build & Deploy Connector ======
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/ai-health-connector" ./connector

gcloud run deploy ai-health-connector \
  --image "gcr.io/${PROJECT_ID}/ai-health-connector" \
  --platform managed --region "${REGION}" --allow-unauthenticated \
  --set-env-vars "PORT=8080"

CONNECTOR_URL="$(gcloud run services describe ai-health-connector --region ${REGION} --format='value(status.url)')"
echo "Connector URL: ${CONNECTOR_URL}"

# ====== Cloud Scheduler (daily ingest) ======
if ! gcloud scheduler jobs describe daily-ingest --location="${REGION}" >/dev/null 2>&1; then
  gcloud scheduler jobs create http daily-ingest \
    --location="${REGION}" \
    --schedule="0 6 * * *" --time-zone="Europe/Tirane" \
    --uri="${BACKEND_URL}/api/ingest/daily" \
    --http-method=POST \
    --oidc-service-account-email="ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com"
else
  gcloud scheduler jobs update http daily-ingest \
    --location="${REGION}" \
    --schedule="0 6 * * *" --time-zone="Europe/Tirane" \
    --uri="${BACKEND_URL}/api/ingest/daily"
fi

echo "All deployed. Now configure your Fivetran Custom Connector with:"
echo "POST ${CONNECTOR_URL}/config  { base_url: '${BACKEND_URL}/api/etl', api_key: '<ETL_BEARER_VALUE>' }"
