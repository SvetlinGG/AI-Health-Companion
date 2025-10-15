from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional, Iterator
from util.client import EtlClient
from util.paging import paginate

app = FastAPI(title="Fivetran Connector – AI Health")

# Fivetran make configuration
CFG: Dict[str, Any] = {}

# ======== MODELS ========
class ConfigIn(BaseModel):
    base_url: str
    api_key: str
    page_size: Optional[int] = 200
    since: Optional[str] = None
    resources: Optional[List[str]] = ["events", "messages", "sources", "content"]

class ConfigOut(BaseModel):
    status: str
    configuration: Dict[str, Any]

class State(BaseModel):
    last_ts: Optional[str] = None

class ReadRequest(BaseModel):
    state: Optional[State] = None

# ======== ENDPOINTS expected by SDK ========

@app.post("/config", response_model=ConfigOut)
def read_config(cfg: ConfigIn):
    if not cfg.base_url or not cfg.api_key:
        raise HTTPException(400, "base_url and api_key are required")
    global CFG
    CFG = cfg.model_dump()
    return {"status": "ok", "configuration": CFG}

@app.get("/discover")
def discover_schema():
    
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

@app.post("/read")
def read_records(req: ReadRequest):
    if not CFG:
        raise HTTPException(400, "Config not set. Call /config first.")
    client = EtlClient(CFG["base_url"], CFG["api_key"], CFG.get("page_size", 200))
    since = (req.state or State()).last_ts or CFG.get("since")
    max_ts = since
    output: List[Dict[str, Any]] = []

    for res in CFG.get("resources", ["events","messages","sources","content"]):
        stream = f"ai_health.{res}"
        for row in paginate(client, res, since):
            output.append({"stream": stream, "data": row})
            ts = row.get("created_at") or row.get("ingested_at")
            if ts and (max_ts is None or ts > max_ts):
                max_ts = ts

    # return new state to requirement in sync's
    return {"records": output, "state": {"last_ts": max_ts}}
