-- price_snapshots: raw observations
CREATE TABLE IF NOT EXISTS price_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  origin        CHAR(3) NOT NULL,
  destination   CHAR(3) NOT NULL,
  travel_month  CHAR(7) NOT NULL,
  min_price     NUMERIC(10,2) NOT NULL,
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  source        TEXT NOT NULL,
  searched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_snapshot UNIQUE (origin, destination, travel_month, source, (searched_at::date))
);

-- price_summary: materialized cheapest per route/month
CREATE TABLE IF NOT EXISTS price_summary (
  origin         CHAR(3) NOT NULL,
  destination    CHAR(3) NOT NULL,
  travel_month   CHAR(7) NOT NULL,
  historical_low NUMERIC(10,2),
  avg_12m        NUMERIC(10,2),
  last_seen_price NUMERIC(10,2),
  data_points    INT DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (origin, destination, travel_month)
);

-- serpapi_call_log: budget tracking
CREATE TABLE IF NOT EXISTS serpapi_call_log (
  id          BIGSERIAL PRIMARY KEY,
  origin      CHAR(3),
  destination CHAR(3),
  called_at   TIMESTAMPTZ DEFAULT NOW(),
  month_key   CHAR(7)
);
