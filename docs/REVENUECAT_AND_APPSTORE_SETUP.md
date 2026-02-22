# Lifetime purchase setup: RevenueCat + App Store Connect

This app uses **RevenueCat** for the lifetime (one-time) in-app purchase. Follow these steps to configure the product in both **App Store Connect** and the **RevenueCat** dashboard, and to add your API keys to the app.

---

## Part 1: App Store Connect (Apple)

### 1.1 Sign in and select your app

1. Go to [App Store Connect](https://appstoreconnect.apple.com) and sign in.
2. Open **Apps** and select your app (or create it if needed).
3. Ensure the app has a **Bundle ID** that matches your project (e.g. `com.subs` for production, `com.subs.development` for dev).

### 1.2 Create a non-consumable in-app purchase (lifetime)

1. In the left sidebar, go to **Features** → **In-App Purchases** (or **Monetization** → **In-App Purchases** in newer UI).
2. Click the **+** button to add a new in-app purchase.
3. Choose **Non-Consumable** (one-time purchase that never expires).
4. Click **Create**.

### 1.3 Configure the product

1. **Reference Name** (internal only): e.g. `Lifetime – Premium Unlock`.
2. **Product ID**: This must be unique and cannot be changed later. Use something like:
   - `com.subs.lifetime` or `subs_lifetime_premium`
   - Write this down; you’ll use it in RevenueCat.
3. **Price**: Select a price tier (e.g. Tier 30 for $29.99) or add a custom price. This is what users see in the paywall.
4. **Localizations**: Add at least one localization (e.g. English):
   - **Display Name**: e.g. `Lifetime Premium`
   - **Description**: e.g. `Unlock all features forever. One-time purchase.`
5. **Review Information**: Upload a **screenshot** (required for review) showing the in-app purchase in your app (e.g. paywall with the lifetime option).
6. **Review Notes** (optional): Short note for the reviewer if needed.
7. Save the in-app purchase. Its status will be **Ready to Submit** once the app version that uses it is submitted.

### 1.4 App Store Connect – summary checklist

- [ ] In-App Purchase type: **Non-Consumable**
- [ ] **Product ID** written down (e.g. `com.subs.lifetime`)
- [ ] Price and localizations set
- [ ] Screenshot and review info filled (for when you submit the app)

---

## Part 2: RevenueCat dashboard

### 2.1 Create / open project and connect Apple

1. Go to [RevenueCat](https://app.revenuecat.com) and sign in.
2. Create a **Project** (or open the one for this app).
3. Go to **Project** → **Apps** (or **Project settings** → **Apps**).
4. Add an **Apple App** if you haven’t:
   - **App Store Connect API**: Either use **App Store Connect API Key** (recommended) or **Shared Secret** (legacy).
   - For **API Key**: In App Store Connect → **Users and Access** → **Keys** → create a key with **App Manager** role, then in RevenueCat add the Key ID, Issuer ID, and the `.p8` private key file.
   - **Bundle ID**: Must match your app (e.g. `com.subs`).
5. Save. RevenueCat will link to your App Store Connect account.

### 2.2 Create an entitlement

1. In RevenueCat, go to **Product catalog** → **Entitlements** (or **Entitlements** in the left menu).
2. Click **+ New**.
3. **Identifier**: Use exactly **`premium`** (the app code uses `REVENUECAT_ENTITLEMENT_ID = 'premium'`). If you use another id, you must change it in `src/lib/revenuecat.ts`.
4. **Description** (optional): e.g. `Lifetime premium access`.
5. Save.

### 2.3 Add the product and attach to entitlement

1. Go to **Product catalog** → **Products** (or **Products**).
2. Click **+ New**.
3. **Identifier**: Use the **exact same Product ID** as in App Store Connect (e.g. `com.subs.lifetime`).
4. **Type**: **Non-Subscription** (or **Non-Consumable**).
5. **Store**: **App Store**.
6. **App**: Select your Apple app.
7. Save.
8. Open the **Entitlement** you created (`premium`).
9. **Attach the product**: Add the product you just created (e.g. `com.subs.lifetime`) to this entitlement. So: when a user buys this product, they get the `premium` entitlement.

### 2.4 Create an offering and add the lifetime package

1. Go to **Product catalog** → **Offerings** (or **Offerings**).
2. Click **+ New Offering**.
3. **Identifier**: e.g. `default` (or any id; the app uses the **current** offering).
4. **Description** (optional): e.g. `Default paywall`.
5. Save.
6. In that offering, click **Add Package**.
7. **Package type**: Choose **Lifetime** (this makes the package appear as `offering.lifetime` in the SDK).
8. **Product**: Select the product you created (e.g. `com.subs.lifetime`).
9. Save.
10. Set this offering as the **Default** offering (so it is returned as `current`). Usually via a “Make default” or star on the offering.

### 2.5 Get API keys

1. Go to **Project** → **API keys** (or **Project settings** → **API keys**).
2. Under **App-specific keys**, find:
   - **Public app-specific key** for **iOS** (starts with `appl_`).
   - (Optional for Android later) **Public app-specific key** for **Android**.
3. For **development/sandbox** you can use the **Test Store** key so you can test without a real App Store connection; for production builds use the **iOS** key above.

### 2.6 RevenueCat – summary checklist

- [ ] Apple app connected (Bundle ID + API key or Shared Secret).
- [ ] Entitlement **`premium`** created.
- [ ] Product added with same Product ID as App Store Connect (e.g. `com.subs.lifetime`), type Non-Subscription.
- [ ] Product attached to entitlement **`premium`**.
- [ ] Offering created with a **Lifetime** package using that product.
- [ ] Offering set as **Default**.
- [ ] iOS (and optionally Android) **public API key** copied.

---

## Part 3: App (this repo)

### 3.1 Environment variables

1. In the project root, open or create `.env` (and optionally `.env.development` / `.env.production` if you use them).
2. Add your RevenueCat **public** keys (never use secret keys in the app):

```bash
# RevenueCat – use your iOS key from RevenueCat dashboard → API keys
EXPO_PUBLIC_REVENUECAT_IOS=appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: when you add Android later
# EXPO_PUBLIC_REVENUECAT_ANDROID=goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. For **development**, you can use the **Test Store** key from RevenueCat so purchases are simulated without hitting the real App Store.
4. For **production** builds (EAS or release), use the **real iOS** key so real money goes through RevenueCat/App Store.

### 3.2 Rebuild after adding native code

RevenueCat uses native modules. After adding `react-native-purchases` you must **rebuild** the app (Expo Go will not run real IAP):

```bash
pnpm ios
# or
pnpm prebuild && pnpm ios
```

For a **physical device** (required for real/sandbox purchases):

```bash
pnpm ios:device
```

### 3.3 Testing

- **Sandbox**: Create a **Sandbox Tester** in App Store Connect (**Users and Access** → **Sandbox** → **Testers**). Sign in on the device with this Apple ID to test real sandbox purchases.
- **Test Store**: If you used the Test Store API key, you can test the flow without a sandbox account; purchases are simulated.

---

## Flow summary

1. **App Store Connect**: You define the **product** (non-consumable, Product ID, price, name, description).
2. **RevenueCat**: You connect the app, create the **entitlement** `premium`, add the **same product**, attach it to `premium`, and put it in a **Lifetime** package in the **default offering**.
3. **App**: With `EXPO_PUBLIC_REVENUECAT_IOS` set, the app configures RevenueCat, shows the paywall, and when the user taps **Lifetime** it calls `purchasePackage` with the lifetime package. RevenueCat charges via Apple and grants the `premium` entitlement; the app syncs that to local `premium` and unlocks features.
4. **Restore**: “Restore Purchases” calls `restorePurchases()`, then the app syncs `premium` from RevenueCat again.

If you change the entitlement identifier from `premium` to something else, update **`REVENUECAT_ENTITLEMENT_ID`** in `src/lib/revenuecat.ts` to match the identifier you set in RevenueCat.
