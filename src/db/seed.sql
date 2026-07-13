-- Seed data for Sauce n' Cheese menu items

INSERT INTO menu_items (name, category, price, price_small, price_regular, price_large, description, image, base_cheese, base_sauce)
VALUES
  -- Classic items (with pizza sizes)
  (
    'The OG Cheese Melt',
    'classic',
    NULL, 650, 1200, 1800,
    'Our signature hand-tossed pizza smothered in triple-churned mozzarella, aged cheddar, and our house Liquid Gold drizzle on a crispy Karachi-style crust.',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),
  (
    'Smashed Wagyu Classic',
    'classic',
    890, NULL, NULL, NULL,
    '100% freshly smashed Wagyu patty, American cheddar, pickles, onions, and our signature sauce on a toasted brioche bun.',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),
  (
    'Crispy Chicken Supreme',
    'classic',
    750, NULL, NULL, NULL,
    'Double-breaded crispy chicken breast, lettuce, tomato, mayo, and a drizzle of Liquid Gold on a sesame seed bun.',
    'https://images.unsplash.com/photo-1562967914-6c82738201de?q=80&w=600&auto=format&fit=crop',
    3, 'Liquid Gold'
  ),
  (
    'Loaded Cheese Fries',
    'classic',
    490, NULL, NULL, NULL,
    'Hand-cut skin-on fries loaded with our signature cheddar blend, crispy bacon bits, spring onions, and a side of Liquid Gold for dipping.',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop',
    5, 'Liquid Gold'
  ),
  (
    'Classic Pepperoni Pie',
    'classic',
    NULL, 720, 1350, 1950,
    'Old-school pepperoni with melted mozzarella and tangy tomato sauce on a thin, hand-stretched crust.',
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),

  -- Special items
  (
    'Ghost Pepper Inferno',
    'special',
    NULL, 890, 1600, 2400,
    'For the brave. Fiery ghost pepper glaze, jalapeños, spicy beef pepperoni, and a cooling ranch drizzle to tame the heat.',
    'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=600&auto=format&fit=crop',
    3, 'Ghost Pepper Glaze'
  ),
  (
    'Truffle Mushroom Melt',
    'special',
    NULL, 990, 1750, 2600,
    'Earthy portobello mushrooms caramelized with garlic butter, white truffle cheese sauce, fresh thyme, and a drizzle of truffle oil.',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop',
    4, 'White Truffle Melt'
  ),
  (
    'Volcanic Lava Burger',
    'special',
    1090, NULL, NULL, NULL,
    'Double Wagyu patties, pepper jack cheese, Sriracha caramelized onions, Secret Lava sauce, and crispy onion rings. A molten masterpiece.',
    'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=600&auto=format&fit=crop',
    5, 'Secret Lava'
  ),
  (
    'Karachi BBQ Blast',
    'special',
    NULL, 850, 1550, 2250,
    'Smoky BBQ chicken, caramelized onions, roasted bell peppers, and a sweet-and-spicy Kansas City glaze over our signature cheese blend.',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),
  (
    'Mac n Cheese Double Down',
    'special',
    1190, NULL, NULL, NULL,
    'Two crispy chicken patties sandwiching a heap of our signature mac n cheese, drizzled with Liquid Gold and served with fries.',
    'https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=600&auto=format&fit=crop',
    5, 'White Truffle Melt'
  ),

  -- Combo deals
  (
    'The Gooey Duo',
    'deal',
    1499, NULL, NULL, NULL,
    'Any Large Classic Pizza + Smashed Wagyu Classic Burger + 2 drinks. The ultimate late-night feast for two.',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),
  (
    'Family Feast Box',
    'deal',
    3499, NULL, NULL, NULL,
    '2 Large Pizzas (any classic), 4 Smashed Wagyu Burgers, Large Loaded Fries, 4 drinks, and a bonus Liquid Gold dipping bottle.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop',
    4, 'Liquid Gold'
  ),
  (
    'Midnight Cravings Combo',
    'deal',
    890, NULL, NULL, NULL,
    '1 Regular Pizza (any classic) + Crispy Chicken Supreme + Large Fries + 1 drink. Fuel for the late-night grind.',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=600&auto=format&fit=crop',
    4, 'Secret Lava'
  )
ON CONFLICT DO NOTHING;
