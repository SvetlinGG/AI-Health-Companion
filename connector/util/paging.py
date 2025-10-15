from typing import Dict, Iterator, List

def paginate(client, resource: str, since: str) -> Iterator[Dict]:
    page = 1
    while True:
        rows: List[Dict] = client.fetch(resource, since, page)
        if not rows:
            break
        for row in rows:
            yield row
        page += 1