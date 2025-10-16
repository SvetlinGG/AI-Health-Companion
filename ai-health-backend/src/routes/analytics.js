import { Router } from 'express';
import { BigQuery } from '@google-cloud/bigquery';

export const analyticsRouter = Router();
const bq = new BigQuery({
    projectId: process.env.GCP_PROJECT_ID
});

const DATASET = process.env.BQ_DATASET || 'ai_health';

analyticsRouter.get('/snapshot', async (req, res) => {
    try {
        const [dailyUsageRows] = await bq.query(`
            SELECT d, events, avg_latency
            FROM \`${bq.projectId}.${DATASET}.daily_usage\`
            ORDER BY d DESC LIMIT 14
            `);

        const [topDomainsRows] = await bq.query(`
            SELECT domain, c
            FROM \`${bq.projectId}.${DATASET}.top_domains\`
            ORDER BY c DESC LIMIT 10
            `);
            const totalEvents = dailyUsageRows.reduce((s, r) => s + Number(r.events || 0), 0);
            const avgLatency = (() => {
                const arr = dailyUsageRows.map(r => Number(r.avg_latency || 0));
                return arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
            })();
        
            res.json({
              kpis: { totalEvents, avgLatency },
              dailyUsage: dailyUsageRows, // [{ d, events, avg_latency }]
              topDomains: topDomainsRows  // [{ domain, c }]
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'BigQuery query failed', details: String(error) });
    }
});