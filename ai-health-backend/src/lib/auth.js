
export function requireBearer(req, res, next){
    const configured = process.env.ETL_BEARER;
    if ( !configured) return res.status(500).json({error: 'Server missing ETL_BEARER'});

    const auth = req.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (token !== configured) return res.status(401).json({error: 'Unauthorized'});
    next();
}