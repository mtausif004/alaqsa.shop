AL AQSA BURMESE SHOP — MASTER INCREMENTAL UPGRADE

Baseline:
- Built on the supplied working alaqsa.shop-main backup.
- Existing product catalog, IDs, product images and settings were preserved.

Preserved catalog verification:
- Products: 11
- Product IDs unchanged
- Product images: 29

New frontend capabilities:
- Home / Offers / Combo / Category / Sub-category routing
- Product deep links preserved
- SEO metadata for home, product and key category pages
- Open Graph / Twitter metadata
- JSON-LD structured data
- Mobile-first navigation chips
- Burmese-inspired color system:
  #6B352A #FFF1A6 #2F4858 #DDFBEF
- Offers and Combo storefront pages
- Configurable delivery modes

Delivery modes:
1. পণ্যের ওজনের উপর
2. Inside Cox's Bazar
3. Outside Cox's Bazar
Only modes marked active in admin settings are shown to customers.
Product weight can be entered per product in kg.

Backend configuration in settings.json:
Web App:
https://script.google.com/macros/s/AKfycbzTu536zNamjE99oit02MBE3yBhDyev18WCzHVgYliZIRFq7u1tx_LShdfceQ0T_w/exec

Spreadsheet:
1uad5vYrv7UlXZQGVFIt0PbilD4tblBfxL-5C9Qy1mA8

Important:
- Telegram bot token is not stored in the frontend.
- Existing Apps Script must remain deployed with the same Web App URL.
- This package does not replace the Apps Script source because the new backend was created separately.

GitHub Pages:
- Upload the contents of this package to the same repository.
- Keep product-images/ and products.json intact.
- 404.html supports deep links for product, category, offers and combo routes.

Admin:
- Existing admin URL remains /secure-panel-7k9x4m/
- New Offers & Combo section added.
- Backend panel now defaults to the new Web App URL and displays the new Spreadsheet ID.
- Delivery settings now control the three delivery modes.


V25 AUTH HOTFIX (2026-10-01)
- Admin login now matches the current Apps Script contract: username/password -> token.
- Admin API requests now send `token` (not `sessionToken`) and accept the backend `success` response.
- Login stores the authenticated Admin User ID for credential changes.
- Existing product/catalog files are preserved.
- Existing order/Telegram flow is not changed.

CURRENT APPS SCRIPT CONTRACT VERIFIED
- login expects username/password and returns {success:true, token}.
- protected calls expect token.
- This hotfix specifically fixes the V25 frontend/backend authentication mismatch.

V25.2 DEFAULT APPS SCRIPT URL (2026-10-01)
- Apps Script Web App URL is embedded as the default in the Admin panel.
- Existing settings.json URL is preserved and used automatically.
- If settings/local storage is empty, the built-in default URL is restored automatically.
- No manual URL paste is required for normal use.

V25.4 — ADMIN LOGIN VISIBILITY FIX (2026-10-01)
- Added framework-independent hard CSS visibility rules for #login and #app.
- Prevents the full Admin app (including Offers & Combo forms) from appearing behind the login screen when Tailwind CDN is delayed/blocked.
- Locks page scrolling while unauthenticated.
- Authenticated state explicitly switches to #app.admin-visible.
- Login success now switches to Dashboard without duplicate showApp calls.
