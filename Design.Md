# Karachi Retro Feast — Design Specification

This document details the visual guidelines, typography, color architecture, interactive systems, and structural layouts of the high-energy late-night food delivery web application.

---

## 1. Visual Philosophy & Identity

The interface is built on a **retro-brutalist culinary aesthetic** crafted to evoke the raw excitement of Karachi’s late-night food culture. Instead of using generic modern flat designs, the UI employs chunky borders, solid offset shadows, high-contrast color pairings, and playful handwritten accents.

- **Architectural Honesty**: Clean cards with generous padding, solid borders (`border-4 border-[#C41E3A]`), and playful rotational offsets (e.g. sticker tags).
- **Aesthetic Vibe**: Bold, nostalgic, energetic, and highly legible under late-night screen-use environments.

---

## 2. Color Architecture

The app enforces a strict three-color premium palette designed to boost appetite and screen rhythm:

| Swatch | Color Name | Hex Code | Role in Interface |
| :--- | :--- | :--- | :--- |
| 🔴 | **Crimson Red** | `#C41E3A` | Primary branding, buttons, borders, headers, and major typography. |
| 🟡 | **Golden Yellow** | `#FFB81C` | Accent color, highlights, cheese-pull indicators, and alert tags. |
| 🍦 | **Alabaster Cream** | `#FDF5E6` | Base page backgrounds and smooth off-white card fills. |

---

## 3. Typography Pairings

To maintain high visual rhythm, the application uses distinct typographic families:

1. **Display Headings**: Retro-futuristic, bold sans-serif with wide tracking (`font-retro` / `Bebas Neue`) used exclusively for major category titles, brand tags, and promotional hero slogans.
2. **Body & Controls**: Clean, highly legible sans-serif (`font-sans` / `Poppins`) optimized for descriptors, pricing selectors, and navigation.
3. **Numeric Indicators & Meta**: Monospaced type (`font-mono`) applied to prices, cheese-pull multipliers, item quantities, and order transaction receipts to give a precise, digital-receipt feeling.
4. **Accents**: Secondary casual script (`font-handwritten` / `Kalam`) for secondary sub-headers and handwritten notes.

---

## 4. Interactive Components & Micro-interactions

Every interactive action provides instant physical feedback to the user:

- **Interactive Cheese Pull Slider**: A custom tactile slider that lets the user visually simulate their ideal cheese pull level, updating the item attributes in real time.
- **Size Selector**: Modular pill-style toggles supporting dynamic price synchronization for pizza sizes (`small`, `regular`, `large`).
- **Sliding Cart Drawer**: A slide-out panel that transitions smoothly from the right edge with a dark translucent background overlay to keep context clear.
- **Live Order Tracker**: Visual timeline cards showing milestone ticks (e.g., *Kitchen preparation*, *Rider out on KAECHS Lane*, etc.) with micro-animations.

---

## 5. Layout Sections

- **Header / Navigation Bar**: Fixed high-visibility navigation bar anchoring responsive anchor links, branding logo, and a floating digital cart button with a dynamic quantity counter.
- **Hero Section**: A high-impact center banner containing a bold Karachi headline, a quick-action call-to-action button, and a dedicated shortcut to the **Hot Deals** section.
- **Menu Section**: A responsive 3-column bento-style card grid. It currently defaults to a polished **"Kitchen Updating!"** layout when menu data is undergoing preparation.
- **Hot Deals Section**: A stylized container detailed with soft golden patterns. It features an elegant **"New Deals Preparing!"** notification card to alert late-night fans of upcoming combos.
- **Brand Marquee**: A continuous, infinite text-scrolling banner that moves horizontally across the screen to create active visual movement.
- **Footer Section**: A spacious footer detailing operating hours, contact numbers, and geographical details for **KAECHS Block 5, Karachi**.
