
export function parsePaging(req){
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit || '100', 10)));
    const since = req.query.since ? new Date(req.query.since) : null;
    return {page, limit, since};
}

export function filterSince(rows, since){
    if (!since || isNaN(+since)) return rows;
    return rows.filter( r => new Date(r.created_at || r.ingested_at || 0) >= since);
}

export function page(rows, page, limit){
    const start = (page -1) * limit;
    const slice = rows.slice(start, start + limit);
    return { rows: slice, next_page: slice.length === limit ? page + 1 : null};
}