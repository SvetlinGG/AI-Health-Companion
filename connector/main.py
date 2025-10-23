"""
Official Fivetran Connector SDK Implementation
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime
from util.client import EtlClient
from util.paging import paginate

app = FastAPI(title="AI Health Companion Fivetran Connector")

# Configuration model
class ConnectorConfig(BaseModel):
    base_url: str
    api_key: str
    page_size: Optional[int] = 200
    since: Optional[str] = None
    resources: Optional[List[str]] = ["events", "messages", "sources", "content"]

# Global config storage
connector_config: Optional[ConnectorConfig] = None

@app.post("/config")
async def config_endpoint(config: Dict[str, Any]):
    """
    Fivetran calls this to validate and store connector configuration
    """
    try:
        global connector_config
        connector_config = ConnectorConfig(**config)
        
        # Validate connection
        client = EtlClient(
            base_url=connector_config.base_url,
            api_key=connector_config.api_key,
            page_size=connector_config.page_size
        )
        
        # Test connection
        test_response = client.test_connection()
        if not test_response.get("success"):
            raise HTTPException(status_code=400, detail="Connection test failed")
        
        return {
            "status": "success",
            "message": "Configuration validated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Configuration error: {str(e)}")

@app.get("/discover")
async def discover_schema():
    """
    Fivetran calls this to discover the schema structure
    """
    if not connector_config:
        raise HTTPException(status_code=400, detail="Connector not configured")
    
    schema = {
        "tables": {
            "events": {
                "primary_key": ["event_id"],
                "columns": {
                    "event_id": {"type": "STRING", "nullable": False},
                    "user_hash": {"type": "STRING", "nullable": True},
                    "question": {"type": "STRING", "nullable": True},
                    "answer_len": {"type": "INTEGER", "nullable": True},
                    "latency_ms": {"type": "INTEGER", "nullable": True},
                    "sources_count": {"type": "INTEGER", "nullable": True},
                    "thumbs_up": {"type": "BOOLEAN", "nullable": True},
                    "created_at": {"type": "TIMESTAMP", "nullable": False}
                }
            },
            "messages": {
                "primary_key": ["message_id"],
                "columns": {
                    "message_id": {"type": "STRING", "nullable": False},
                    "event_id": {"type": "STRING", "nullable": True},
                    "role": {"type": "STRING", "nullable": True},
                    "text": {"type": "STRING", "nullable": True},
                    "tokens": {"type": "INTEGER", "nullable": True},
                    "created_at": {"type": "TIMESTAMP", "nullable": False}
                }
            },
            "sources": {
                "primary_key": ["source_id"],
                "columns": {
                    "source_id": {"type": "STRING", "nullable": False},
                    "event_id": {"type": "STRING", "nullable": True},
                    "title": {"type": "STRING", "nullable": True},
                    "url": {"type": "STRING", "nullable": True},
                    "domain": {"type": "STRING", "nullable": True},
                    "rank": {"type": "INTEGER", "nullable": True},
                    "created_at": {"type": "TIMESTAMP", "nullable": False}
                }
            },
            "content": {
                "primary_key": ["content_id"],
                "columns": {
                    "content_id": {"type": "STRING", "nullable": False},
                    "title": {"type": "STRING", "nullable": True},
                    "url": {"type": "STRING", "nullable": True},
                    "tags": {"type": "STRING", "mode": "REPEATED", "nullable": True},
                    "published_at": {"type": "TIMESTAMP", "nullable": True},
                    "ingested_at": {"type": "TIMESTAMP", "nullable": False}
                }
            }
        }
    }
    
    return schema

@app.post("/read")
async def read_records(request: Dict[str, Any]):
    """
    Fivetran calls this to read data records
    """
    if not connector_config:
        raise HTTPException(status_code=400, detail="Connector not configured")
    
    state = request.get("state", {})
    since = state.get("last_ts") or connector_config.since
    
    client = EtlClient(
        base_url=connector_config.base_url,
        api_key=connector_config.api_key,
        page_size=connector_config.page_size
    )
    
    records = []
    max_ts = since
    
    try:
        for resource in connector_config.resources:
            for row in paginate(client, resource, since):
                records.append({
                    "table": resource,
                    "data": row
                })
                
                # Track max timestamp for incremental sync
                ts = row.get("created_at") or row.get("ingested_at")
                if ts and (max_ts is None or ts > max_ts):
                    max_ts = ts
        
        return {
            "records": records,
            "state": {"last_ts": max_ts},
            "hasMore": len(records) >= connector_config.page_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Read error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))