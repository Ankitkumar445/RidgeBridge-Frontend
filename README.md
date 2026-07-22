# RideBridge — Expo Frontend

A cross-platform (iOS, Android, Web) client for your RideBridge backend, built with
Expo Router + TypeScript. One codebase, one `expo start`.

## Stack

- **Expo SDK 51** + **expo-router** (file-based navigation, works identically on native & web)
- Custom design system (`src/theme/theme.ts`) — deliberately not default Expo/RN styling:
  midnight-navy base, coral "road" accent, teal "verified" accent, violet for the admin console
- `axios` client with an auth interceptor (`src/api/client.ts`)
- `expo-secure-store` for the auth token on iOS/Android, `AsyncStorage` fallback on web
- Cross-platform Razorpay Standard Checkout (`src/components/RazorpayCheckout.tsx`) — browser
  script injection on web, a sandboxed WebView on native. No native linking, works in Expo Go.
- `expo-web-browser` for the DigiLocker/Setu consent redirect (native auth session on
  iOS/Android, new tab on web)
- `expo-location` for live driver-location sharing during an active ride

## Getting started

```bash
npm ci                  # installs the exact, verified dependency versions from package-lock.json
cp .env.example .env
# edit .env and point EXPO_PUBLIC_API_URL at your deployed backend, e.g.
# EXPO_PUBLIC_API_URL=https://ridebridge-backend.onrender.com/api/v1

npx expo start          # then press "w" for web, "i" for iOS, "a" for Android
# or directly:
npm run web
npm run ios
npm run android
```

This project's `package.json` and `package-lock.json` are pinned to the exact dependency
versions Expo SDK 51 bundles (verified by actually installing them and running a full
`expo export --platform web` build in a clean environment — not guessed). Use `npm ci`
rather than `npm install` so you get that exact, tested tree; `npm install` is still fine,
it just gives npm's resolver more freedom to drift a patch version here or there.

If you ever add or upgrade an `expo-*` package yourself later, run
`npx expo install <package>` (not plain `npm install`) so it stays aligned with this SDK,
and periodically run `npx expo install --check` to catch drift.

Running `a` for Android or `i` for iOS from the terminal requires a local Android
SDK / Xcode + simulator. If you don't have those set up, just scan the QR code with
Expo Go on your phone instead — no SDK install needed.


## App structure

```
app/
  index.tsx                 splash + auth redirect
  (auth)/                   login, register, OTP verification, password reset
  (app)/                    tab navigator, gated behind login
    home.tsx                search/browse listings (filters: city, price, vehicle)
    listing/[id].tsx         listing detail, seat picker, Razorpay checkout
    post-ride.tsx            create a listing (driver, requires KYC)
    my-listings.tsx          driver's own listings + cancel
    bookings/index.tsx        booking list (see note below)
    bookings/[id].tsx        contact reveal, OTP start, live location, arrival, dispute, rating
    kyc.tsx                  DOB + DigiLocker verification, live status
    profile.tsx              account info, role, reviews, logout
    admin.tsx                admin-only: all bookings + dispute resolution
    user/[id].tsx            public ratings view for a driver/rider
src/
  api/                       one file per backend module, typed request/response shapes
  components/                Button, Input, Card, StatusPill, RazorpayCheckout, etc.
  context/AuthContext.tsx    session state, token persistence, profile refresh
  theme/theme.ts             colors, gradients, spacing, type scale, status-color map
  utils/storage.ts           SecureStore/AsyncStorage abstraction
  utils/bookingsStore.ts     local booking index (see note below)
```

## Two things worth knowing about the backend contract

I built this strictly against the routes/controllers/schema in your zip, and everything
maps 1:1 — except two gaps where the backend simply doesn't expose an endpoint the UI
needs. I worked around both on the client so the app is fully usable today, but you'll
get a much better experience by adding these server-side when you have time:

1. **No "my bookings" endpoint.** The API has `GET /bookings/:id/contact` (single booking)
   and `GET /admin/bookings` (admin-only, all bookings), but nothing scoped to
   "bookings I'm the rider or driver on." The app works around this by keeping a local
   index of every booking this device has initiated or opened (`src/utils/bookingsStore.ts`),
   and refreshing each one's live status from the server. It's a good UX today, but a
   booking made or received on a different device won't show up until opened there too.
   A driver can still pull up a specific ride by pasting its booking ID under "Track a
   booking by ID" on the Bookings tab. Recommend adding something like
   `GET /bookings/mine?role=rider|driver`.

2. **No "my listings" endpoint.** `GET /listings` (search) only returns `ACTIVE` listings
   and has no `driverId` filter. "My trips" works around this by searching with no
   filters and matching `driver.id` client-side, which means cancelled/completed listings
   won't appear there. Recommend `GET /listings/mine`.

Everything else — auth, OTP, password reset, DOB/DigiLocker KYC, listing search/create/cancel,
the full booking lifecycle (initiate → pay → contact → OTP start → live location → confirm
arrival → cancel), ratings, and the admin disputes console — talks directly to your existing
routes with no workarounds.

## Razorpay / Setu note

Since you mentioned Setu is being blocked by Render in production: that's a backend-side
network/allowlisting issue between Render and Setu's API, not something the frontend can
route around. Once that's resolved (e.g. Render's static outbound IP + Setu allowlist, or
moving the DigiLocker calls to a provider that doesn't IP-block Render), the KYC flow in
`app/(app)/kyc.tsx` will work exactly as built — no frontend changes needed.

## Admin access

There's no self-serve "become admin" flow (correctly — that's a backend/DB decision).
Set a user's `role` to `ADMIN` directly in your database, and the Admin tab will appear
automatically the next time they log in.
