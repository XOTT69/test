-- Shared household access is opt-in. Existing owner data is unchanged.
CREATE TABLE IF NOT EXISTS family_members (
 uid INTEGER PRIMARY KEY,
 owner_uid INTEGER NOT NULL,
 joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS family_members_owner ON family_members(owner_uid);
CREATE TABLE IF NOT EXISTS family_invites (
 token_hash TEXT PRIMARY KEY,
 owner_uid INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 used_by INTEGER,
 used_at INTEGER
);
CREATE INDEX IF NOT EXISTS family_invites_owner ON family_invites(owner_uid,expires_at);
CREATE TABLE IF NOT EXISTS notification_settings (
 uid INTEGER PRIMARY KEY,
 enabled INTEGER NOT NULL DEFAULT 1,
 warnings INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS snoozes (
 uid INTEGER NOT NULL,
 item_id INTEGER NOT NULL,
 until_date TEXT NOT NULL,
 PRIMARY KEY(uid,item_id)
);
CREATE INDEX IF NOT EXISTS snoozes_by_due ON snoozes(until_date);
