# CodeHills

React Native + Expo (SDK 58) + TypeScript app promoting Rwanda's heritage, tourism, traditional products and local entrepreneurs.

> **Honest status:** this is a runnable **demo build**. Stories, products, places and events are sample data; sign-in and checkout are simulated; no real backend, payment or verified content is connected. See "What is not connected" below.

## Run it (Linux, Android)

Requirements: Node.js 20+ (tested with 22), npm, and either the **Expo Go** app on an Android phone or an Android emulator.

```bash
unzip codehills.zip && cd codehills
npm install --legacy-peer-deps
npx expo start
```

- **Phone:** install Expo Go, make sure the phone and computer share a Wi-Fi network, scan the QR code shown in the terminal. If the QR does not connect, run `npx expo start --tunnel`.
- **Emulator:** start an Android emulator (Android Studio), then press `a` in the terminal, or run `npm run android`.
- **Type-check:** `npx tsc --noEmit`

Expo Go bundles the SDK 58 native modules, including `react-native-maps`. If your Expo Go version does not match SDK 58, update Expo Go from the Play Store.

## Screens (all 18 are separate components in `src/screens`)

| # | Screen | File |
|---|--------|------|
| 1 | Landing | `LandingScreen.tsx` |
| 2 | Login | `LoginScreen.tsx` |
| 3 | Signup | `SignupScreen.tsx` |
| 4 | Home | `HomeScreen.tsx` |
| 5 | Stories | `StoriesScreen.tsx` |
| 6 | Story Details | `StoryDetailsScreen.tsx` |
| 7 | Shop | `ShopScreen.tsx` |
| 8 | Product Details | `ProductDetailsScreen.tsx` |
| 9 | Cart & Checkout | `CartScreen.tsx` |
| 10 | Story Rewards | `RewardScreen.tsx` |
| 11 | Explore Rwanda Map | `MapScreen.tsx` (+ `DestinationDetailsScreen.tsx`) |
| 12 | Events | `EventsScreen.tsx` (+ `EventDetailsScreen.tsx`) |
| 13 | Start Your Business | `StartBusinessScreen.tsx` |
| 14 | Create Business | `CreateBusinessScreen.tsx` |
| 15 | Business Dashboard | `BusinessDashboardScreen.tsx` (+ `LearningResourceScreen.tsx`) |
| 16 | Order Confirmation | `OrderConfirmationScreen.tsx` |
| 17 | Profile | `ProfileScreen.tsx` (+ My Orders, My Stories, Saved Places, Language, Help, About) |
| 18 | Final Onboarding | `OnboardingScreen.tsx` |

Landing, Login, Signup and Onboarding have no bottom bar. Home, Shop, Map, Stories and Profile share the bottom bar (`src/components/BottomTabBar.tsx`). Events is opened from the Home shortcut.

## Main journeys

- Landing → Login or Signup → Home (Signup passes through Onboarding). "Skip" enters as a guest.
- Home → Stories → Story Details → Read next.
- Home → Shop → Product Details → Cart → Checkout (demo) → Reward → Story Details.
- Home/Profile → Map → Destination Details; Home → Events → Event Details.
- Profile → My Business → Create Business → Business Dashboard.

Working locally and persisted with AsyncStorage (`src/services/storage.ts`): login session (respects "Remember me"), cart, favorites, bookmarks, saved places, orders, unlocked stories, language preference and the demo business. Help → "Reset demo data" clears everything.

## Project structure

```
src/
  components/   reusable UI (Button, TextField, StoryCard, ProductCard, DestinationCard, EventCard, BottomTabBar, state views, map)
  navigation/   root stack + bottom tabs + route types
  screens/      the 18 screens (and their detail/settings sub-screens)
  data/         mock stories, products, destinations, events, business data, image registry
  hooks/        app state (context + persistence), data loading hooks, toast
  services/     config, API interfaces, mock/placeholder implementations, auth, orders, payments, storage
  theme/        colours, Manrope typography, spacing, radii, shadow
  types/        TypeScript interfaces
  utils/        formatting and validation
assets/images/  bundled artwork (see below)
```

## Replacing the mock data with the real backend

All content flows through `src/services/api.ts` (`contentService`), used by hooks in `src/hooks/useResource.ts`.

1. Fill in `apiBaseUrl` in `src/services/config.ts` and set `useMockData: false`.
2. Implement the `httpContentService` methods in `src/services/api.ts` and map responses onto the types in `src/types/index.ts`.
3. Implement `AuthService`, `OrderService` and `PaymentService` (`src/services/interfaces.ts`) against your real services, replacing `auth.ts`, `orders.ts`, `payments.ts`.

No endpoint URLs, keys or environment variables were invented; the HTTP services deliberately throw "not connected yet" (shown through the error state with a retry button). No `.env` file is needed. Content from https://umucocore.rw/ was **not** imported: no API details were provided, and the sample texts are placeholders, not heritage facts.

## What is not connected (be aware before sharing the app)

- **Images are placeholders.** Everything in `assets/images/` is generated artwork, **not photographs**, and the logo is a **stand-in I drew**, not your official logo. Replace `assets/images/logo.png` with your logo file (keep square, same name) and the other files with licensed photography using the same file names: `hero_landing, hero_onboarding, hills, lake_kivu, volcanoes, tea, kigali, imigongo, basket, coffee, honey, dance, festival, coffee_harvest, artisan` (`.jpg`). Also replace `assets/icon.png`, `android-icon-foreground.png` and `splash-icon.png` with your logo. The design reference image could not be reproduced with real photography.
- **Authentication is a demo**: any well-formed email/phone and 6+ character password signs in; nothing is verified. Google sign-in and password reset are placeholders.
- **Checkout is a demo**: no payment is taken and no real order is created. Orders, rewards and the order-confirmation delivery progress are clearly labelled as demo/illustrative.
- **Map:** uses `react-native-maps`. In Expo Go on Android it should work, but a standalone Android build needs a Google Maps API key (add it under `android.config.googleMaps.apiKey` in `app.json`). If the native map fails, or you tap the toggle button on the map, a simple built-in fallback map is shown. Marker positions are approximate and no distances are displayed.
- **Events** are samples with no real dates or venues.
- **Language** preference is saved, but the UI is English only.
- **Fonts:** Manrope is loaded through `@expo-google-fonts/manrope`.
- The bundle identifier (`com.example.codehills`) is a placeholder; change it before publishing.
- I verified TypeScript (`tsc --noEmit`) and that the Android bundle builds with `expo export`. I could not run the app on a device or emulator in my environment, so please report any runtime issues you see.
# codehills-app
