-- Seed data for Sauce n' Cheese menu items

-- Sample tables (inserted only if table is empty)
INSERT INTO tables (table_number, qr_token, capacity)
SELECT * FROM (VALUES
  (1, 'table-' || gen_random_uuid()::text, 2),
  (2, 'table-' || gen_random_uuid()::text, 4),
  (3, 'table-' || gen_random_uuid()::text, 4),
  (4, 'table-' || gen_random_uuid()::text, 6),
  (5, 'table-' || gen_random_uuid()::text, 2),
  (6, 'table-' || gen_random_uuid()::text, 4),
  (7, 'table-' || gen_random_uuid()::text, 8),
  (8, 'table-' || gen_random_uuid()::text, 4)
) AS v(table_number, qr_token, capacity)
WHERE NOT EXISTS (SELECT 1 FROM tables LIMIT 1);

-- Default add-ons (inserted only if table is empty)
INSERT INTO addons (type, name, price, sort_order)
SELECT * FROM (VALUES
  ('sauce', 'Ketchup', 0, 1),
  ('sauce', 'Mayo', 0, 2),
  ('sauce', 'BBQ Sauce', 0, 3),
  ('sauce', 'Ranch', 0, 4),
  ('sauce', 'Garlic Mayo', 0, 5),
  ('drink', 'Pepsi', 70, 1),
  ('drink', '7 Up', 70, 2),
  ('drink', 'Mirinda', 70, 3),
  ('drink', 'Pakola', 80, 4),
  ('drink', 'Water', 50, 5),
  ('extra', 'Extra Cheese', 50, 1)
) AS v(type, name, price, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM addons LIMIT 1);
