import requests
from typing import Dict, Any, List, Optional

class EtlClient:
    def __init__(self, base_url: str, api_key: str, page_size: int = 200, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.page_size = page_size
        self.timeout = timeout

    def test_connection(self) -> Dict[str, Any]:
        """Test connection to the API"""
        try:
            url = f"{self.base_url}/health"
            r = requests.get(url, headers=self.headers, timeout=self.timeout)
            r.raise_for_status()
            return {"success": True, "message": "Connection successful"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def fetch(self, resource: str, since: Optional[str], page: int) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/{resource}"
        params = {"page": page, "limit": self.page_size}
        if since:
            params["since"] = since
        r = requests.get(url, headers=self.headers, params=params, timeout=self.timeout)
        r.raise_for_status()
        data = r.json()
        if not isinstance(data, list):
            raise ValueError(f"Expected list from {url}, got: {type(data)}")
        return data
