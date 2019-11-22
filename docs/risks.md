## Things to de-risk / think about

- Automation: how to have triggers and automated systems run on the data, for integrations ?
  - CLI/Docker container, must run on-prem to keep E2EE => complex setup for non-tech people
  - Passwordless unlocking (tokens) of:
    - a single set of keys (for one project)
    - multiple sets of keys (multiple projects)
- Scaling issues, get a sense of how much data has to be churned by the dashboard

## Implementation details

Tech Stack Ideas

- Next.js
- TimeScaleDB for DataPoints ingestion
- PostgreSQL for other database operations
- Crypto for the Visitor ?
- Crypto for the Dashboard ?
- Crypto for the Automator ?

sendBeacon size limit
because sendBeacon is limited in size, events should be chunked and sent as the queue reaches a certain size, in order for the last push on unload to be able to fit.
If any chunk was not able to send, keep them stored and try to send them later

Entities:

- Sources: entities who generate DataPoints
- DataPoints Queue: queue of encrypted DataPoints
- Workers: entities who decrypt a stream of DataPoints, run some algorithms on the cleartext data & send the digested data back in encrypted form to an Analytics Queue.
- Analytics Queue: queue of encrypted AnalyticsPoints
- Dashboards
