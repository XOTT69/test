-- TDS tracking was removed on user request. Preserve all other items.
DELETE FROM sessions WHERE kind='tds';
DELETE FROM history WHERE item_id IN (SELECT id FROM items WHERE kind='tds');
DELETE FROM sent WHERE item_id IN (SELECT id FROM items WHERE kind='tds');
DELETE FROM items WHERE kind='tds';
