AL-AKSA BURMESE SHOP — V21 ADMIN REBUILD

WHAT CHANGED
- New admin entry: /secure-panel-7k9x4m/
- Root /admin.html redirects to the secure admin entry.
- Login now asks only User ID + Password; API URL is not shown on login.
- Admin navigation is separated into Dashboard, Products, Orders, Banners, Categories, Shop Settings, Account & Security.
- Shop Settings is organized into Branding, Delivery, Contact, About, FAQ, Backend, Banners and Categories tabs.
- Product management keeps GitHub products.json and product-images workflow.
- Product IDs remain backend-generated and permanent.
- Orders remain on Google Sheets via Apps Script.
- Banner metadata, category ordering/visibility, login branding and existing settings remain in settings.json.
- Customer site now supports banner CTA/link and category order/hide settings.

IMPORTANT DATA-SAFETY RULE
Do NOT delete or replace your existing products.json, settings.json, product-images/ folder, reviews.json or other existing catalog files just because they are not included in this patch package.
This package intentionally does not include products.json or settings.json so existing live data is preserved.

DEPLOYMENT
1. Extract this ZIP.
2. Copy/replace the files into the GitHub repository.
3. Keep your existing products.json, settings.json and product-images/ unchanged.
4. Open: /secure-panel-7k9x4m/
5. Login with your current backend credentials.
6. In Products, enter the GitHub Owner/Repo/Branch and a fine-grained token with Contents Read/Write.
7. Click Load Catalog.
8. Shop Settings -> Backend can test/change the Apps Script URL after login.

BACKEND
Code.gs is the same V20 backend contract and remains compatible with the existing Apps Script deployment.
Telegram bot token must stay in Apps Script Script Properties as TELEGRAM_BOT_TOKEN. Never put it in frontend files.

DEFAULT ADMIN CREDENTIALS
User ID: mtausif004
Password: fkfk004
If you already changed them in Apps Script, use the changed credentials.

NOTES
- Unique admin path is not the security boundary; backend session authentication is.
- GitHub token is held only in the browser session and is not written to settings.json.
- Existing Product IDs are not regenerated during catalog load/edit.
