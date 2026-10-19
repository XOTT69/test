-- Medicine cabinet tracks inventory and expiry per batch. No prescription or dose recommendations.
CREATE TABLE IF NOT EXISTS medicine_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 uid INTEGER NOT NULL,
 name TEXT NOT NULL,
 form TEXT NOT NULL DEFAULT '',
 quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity>=0),
 unit TEXT NOT NULL DEFAULT 'шт',
 expires_at TEXT,
 low_at INTEGER NOT NULL DEFAULT 0 CHECK(low_at>=0),
 location TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '',
 archived INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS medicine_owner_expiry ON medicine_items(uid,archived,expires_at);
CREATE TABLE IF NOT EXISTS medicine_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 uid INTEGER NOT NULL,
 medicine_id INTEGER NOT NULL,
 delta INTEGER NOT NULL,
 kind TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS medicine_events_by_item ON medicine_events(uid,medicine_id,id);
CREATE TABLE IF NOT EXISTS medicine_alerts (
 uid INTEGER NOT NULL,
 medicine_id INTEGER NOT NULL,
 kind TEXT NOT NULL,
 reference TEXT NOT NULL,
 PRIMARY KEY(uid,medicine_id,kind,reference)
);
