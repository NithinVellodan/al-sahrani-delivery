/**
 * Al Zahrani Food Delivery — Client Access Details
 * Share this with the client along with the APK/TestFlight build.
 */

export const APP_INFO = {
  appName: 'Al Zahrani Food Delivery',
  version: '1.0.0 (UI Prototype)',
  platform: 'Android & iOS',
  builtBy: 'GL Development Team',
};

// ─── Login Credentials ────────────────────────────────────────────────────────

export const TEST_ACCOUNT = {
  phone: '9999999999',
  password: '123456',
  note: 'Use these on the Login screen. These are static demo credentials.',
};

// ─── App Entry Flow ───────────────────────────────────────────────────────────

export const FLOW = [
  '1. Splash Screen  →  loads automatically',
  '2. Language Select  →  choose English or Arabic',
  '3. Onboarding  →  swipe through 3 intro slides, tap Get Started',
  '4. Login  →  enter phone: 9999999999  |  password: 123456',
  '5. Location Select  →  pick your delivery area',
  '6. Home Screen  →  browse menu, banners, categories',
];

// ─── Static Data Note ─────────────────────────────────────────────────────────

export const STATIC_NOTE =
  'All product listings, orders, cart items, and user data shown in the app ' +
  'are sample/placeholder content for UI demonstration. ' +
  'Live backend integration is planned for the next phase.';
