"""
Fivetran Connector SDK Skeleton.
Adapt the decorators/imports to the actual SDK per the official docs.
"""

import os, json
from typing import Dict, Any, Iterator
from util.client import EtlClient
from util.paging import paginate

CFG: Dict[str, Any] = {}

# ---- Replace these with actual SDK imports/decorators ----
def sdk_read_config(func): return func
def sdk_discover_schema(func): return func
def sdk_read_records(func): return func
# ----------------------------------------------------------

@sdk_read_config
def read_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate incoming config from Fivetran UI and return normalized config.
    Expected keys:
      - base_url (str)
      - api_key (str)
      - page_size (int, optional)
      - since (ISO string, optional)
      - resources (list[str], optional)
    """
    required = ["base_url", "api_key"]
    missing = [k for k in required if k not in config]
    if missing:
        raise ValueError(f"Missing config keys: {missing}")

    normalized = {
        "base_url": config["base_url"].rstrip('/'),
        "api_key":  config["api_key"],
        "page_size": int(config.get("page_size", 200)),
        "since": config.get("since"),
        "resources": config.get("resources", ["events", "messages", "sources", "content"]),
    }
    global CFG; CFG = normalized
    return {"status": "ok", "configuration": normalized}

@sdk_discover_schema
def discover_schema() -> Dict[str, Any]:
    """
    Describe destination tables & columns for BigQuery.
    """
    return {
        "ai_health.events": {
            "primary_key": ["event_id"],
            "columns": {
                "event_id":"string","user_hash":"string","question":"string",
                "answer_len":"int","latency_ms":"int","sources_count":"int",
                "thumbs_up":"boolean","created_at":"timestamp"
            }
        },
        "ai_health.messages": {
            "primary_key": ["message_id"],
            "columns": {
                "message_id":"string","event_id":"string","role":"string",
                "text":"string","tokens":"int","created_at":"timestamp"
            }
        },
        "ai_health.sources": {
            "primary_key": ["source_id"],
            "columns": {
                "source_id":"string","event_id":"string","title":"string",
                "url":"string","domain":"string","rank":"int","created_at":"timestamp"
            }
        },
        "ai_health.content": {
            "primary_key": ["content_id"],
            "columns": {
                "content_id":"string","title":"string","url":"string",
                "tags":"string[]","published_at":"timestamp","ingested_at":"timestamp"
            }
        }
    }

@sdk_read_records
def read_records(state: Dict[str, Any]) -> Iterator[Dict[str, Any]]:
    """
    Stream records for each resource.
    State example: { "last_ts": "2025-10-01T00:00:00Z" }
    """
    client = EtlClient(
        base_url=CFG["base_url"],
        api_key=CFG["api_key"],
        page_size=CFG["page_size"]
    )
    since = state.get("last_ts") or CFG.get("since")
    max_ts = since

    for res in CFG["resources"]:
        stream = f"ai_health.{res}"
        for row in paginate(client, res, since):
            # Emit to Fivetran
            yield {"stream": stream, "data": row}
            # Track max timestamp for bookmarking
            ts = row.get("created_at") or row.get("ingested_at")
            if ts and (max_ts is None or ts > max_ts):
                max_ts = ts

    # Return updated state for incremental syncs
    yield {"state": {"last_ts": max_ts}}
