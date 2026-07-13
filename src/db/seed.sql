-- Seed data for Sauce n' Cheese menu items

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
