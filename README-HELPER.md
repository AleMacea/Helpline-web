Setup
- Create `.env.local` with `VITE_API_BASE=http://192.168.1.6:5174`.
- Run: `npm rm react-typical` (if present), `npm i`, `npm run dev`.

API Helper
- Import from `@/services/api`.
- Uses `VITE_API_BASE` for base URL and injects `Authorization: Bearer <token>` from `localStorage` when available.
- Helpers: `http.get/post/patch/put/delete` (with `ensureOk`).
- Domain APIs: `authAPI`, `ticketsAPI`, `articlesAPI`, `usersAPI` with optional `{ origin }` filters.

Admin Skeleton
- Routes: `/admin/users`, `/admin/tickets`, `/admin/reports` (manager only).
- Simple origin filter on Users/Tickets pages.

Palette
- Primary: Purple `#2B0A6B`.
- Accent: Orange `#F59E0B`.

Run Web + Mobile together
- Use PowerShell script `dev-all.ps1`.
- Default mobile path: `C:\Users\Deco\Desktop\helpdesk-mobile` (override with `-MobileDir`).
- Examples:
  - `npm run dev:all` (uses defaults; Expo mobile)
  - `npm run dev:all -- -MobileDir "C:\\Users\\Deco\\Desktop\\helpdesk-mobile" -MobileType expo`
  - `npm run dev:all -- -MobileDir "C:\\Users\\Deco\\Desktop\\helpdesk-mobile" -MobileType rn -RunAndroid`
