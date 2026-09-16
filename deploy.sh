#!/bin/bash
set -e

echo "=== 1. Git Add & Commit ==="
cd /home/murai-tech/tech-bro/website/ai-calender
git add -A
git commit -m "UI overhaul: Bauhaus Neo-Brutalist design system matching design.html

- Overhaul index.html: lang=id, proper title, Google Fonts preconnect
- Overhaul index.css: refined design tokens, utility classes, scrollbar styling
- Overhaul App.jsx: exact 2-column grid layout matching design.html
- Overhaul WeekView.jsx: Bauhaus header tag, category pills, view toggle, time grid
- Overhaul EventCard.jsx: category-specific colors (sekolah/blue, futsal/mint, belajar/purple, main/peach)
- Overhaul EventModal.jsx: floating dialog with yellow header, brutalist form inputs
- Overhaul MonthMiniCalendar.jsx: circular heatmap days, density legend, nav arrows
- Overhaul ChatPanel.jsx: AI agent header with PRO badge, brutalist chat input
- Overhaul ChatBubble.jsx: refined bubble styles, tool result cards with borders
- Overhaul QuickActionChips.jsx: emoji-prefixed action buttons

All components follow design.md: 3px borders on panels, 2px on cards, offset shadows,
Space Grotesk/Inter/Space Mono fonts, Bauhaus color palette, no gradients, no rounded corners."

echo ""
echo "=== 2. Push to GitHub ==="
git push origin main

echo ""
echo "=== 3. Build Project ==="
npm run build

echo ""
echo "=== 4. Open in Browser ==="
# Try to open in default browser (works on macOS, Linux with xdg-open, Windows with start)
if command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
  open http://localhost:5173
else
  echo "Buka manual: http://localhost:5173"
fi

echo ""
echo "=== DONE! ==="
echo "Dev server: npm run dev"
echo "Production build: dist/"
