<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the EventHub Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** (new): Initialises PostHog client-side using the Next.js 15.3+ `instrumentation-client` approach. Configured with EU host, session replay, error tracking (`capture_exceptions: true`), and reverse-proxy ingestion via `/ingest`.
- **`next.config.ts`** (updated): Added reverse-proxy rewrites for `/ingest` → `https://eu.i.posthog.com` and `/ingest/static` → `https://eu-assets.i.posthog.com`, plus `skipTrailingSlashRedirect: true`.
- **`components/ExploreBtn.tsx`** (updated): Added `posthog.capture('explore_events_clicked')` in the existing click handler.
- **`components/EventCard.tsx`** (updated): Converted to a client component and added `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` on link click.
- **`.env.local`** (created): Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables.

| Event name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" CTA button on the homepage | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view event details (with title, slug, location, date properties) | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/145369/dashboard/580869
- **Daily User Engagement** (trends): https://eu.posthog.com/project/145369/insights/lIeL6Fc6
- **Explore to Event Click Funnel** (funnel): https://eu.posthog.com/project/145369/insights/0c6Lym15
- **Top Clicked Events** (bar, breakdown by title): https://eu.posthog.com/project/145369/insights/pItoncoi
- **Daily Active Users** (trends, DAU): https://eu.posthog.com/project/145369/insights/RqDHre5w
- **Event Clicks by Location** (pie, breakdown by location): https://eu.posthog.com/project/145369/insights/R6LwKCne

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
