-- Additive migration: preserve all existing filters and replacement history.
CREATE TABLE IF NOT EXISTS osmosis_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER NOT NULL,
  title TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  installed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS osmosis_owner ON osmosis_systems(uid, id);
ALTER TABLE items ADD COLUMN osmosis_id INTEGER;
ALTER TABLE items ADD COLUMN interval_unit TEXT NOT NULL DEFAULT 'days';
ALTER TABLE items ADD COLUMN interval_value INTEGER NOT NULL DEFAULT 0;
UPDATE items SET interval_value = days, interval_unit = 'days' WHERE kind = 'filters';
CREATE INDEX IF NOT EXISTS item_osmosis_owner ON items(uid, osmosis_id, kind, due);
