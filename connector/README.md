# Fivetran Connector Prototype (AI Health Companion)

## Local Test (no SDK)
1) `cp config.example.json config.json`
2) Set `api_key` to your ETL_BEARER and `base_url` to your backend.
3) `python -m venv .venv && source .venv/bin/activate`
4) `pip install -r requirements.txt`
5) `python run_local.py config.json`

## SDK Mode
- Use `fivetran_connector.py` as a skeleton.
- Replace the dummy decorators with the real SDK decorators/imports per **Connector SDK Docs**.
- Map config fields in the Fivetran UI to the same keys used here.
- Set the Destination to **BigQuery** and verify tables are created (`ai_health.*`).
