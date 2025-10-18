#!/bin/bash

# Manual deployment script
export PROJECT_ID="fir-1-84947"
export REGION="europe-west1"

# Build and deploy backend
echo "Building and deploying backend..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/ai-health-backend ./ai-health-backend

gcloud run deploy ai-health-backend \
  --image gcr.io/${PROJECT_ID}/ai-health-backend \
  --platform managed --region $REGION --allow-unauthenticated \
  --service-account ai-health-backend@${PROJECT_ID}.iam.gserviceaccount.com \
  --set-env-vars "API_BASE=/api,GCP_PROJECT_ID=${PROJECT_ID},BQ_DATASET=ai_health" \
  --set-secrets "ETL_BEARER=ETL_BEARER:latest" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

echo "Backend deployed successfully!"