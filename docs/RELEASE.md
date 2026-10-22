# Release checklist — App Store & Google Play

> Engineering guidance, not legal advice. Children's apps need a privacy/legal review for every launch market before submission.

## 1. Accounts & secrets

| What | Used by |
|---|---|
| Expo account + `EXPO_TOKEN` (GitHub secret) | `eas-build.yml`, `eas-submit.yml`, `release.yml` (EAS Update) |
| `EAS_PROJECT_ID` (GitHub variable): run `cd apps/mobile && eas init` once | `app.config.ts` (`extra.eas.projectId`, updates URL) |
| Apple Developer Program (an organisation account is recommended for Kids apps) | iOS builds, TestFlight |
| App Store Connect app (bundle id `com.dreamsprout.stories`); fill `appleId`, `ascAppId`, `appleTeamId` in `apps/mobile/eas.json` | `eas submit -p ios` |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD`, or an App Store Connect API key stored in EAS credentials | iOS submit |
| Google Play Console app (package `com.dreamsprout.stories`) + service-account JSON → secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | `eas submit -p android` (internal track) |
| Supabase project: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` (secrets), `SUPABASE_PROJECT_REF` (variable) | `supabase.yml` deploy job |
| Optional `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (variables) | build-time sync config |

The first Android upload has to be made by hand in Play Console; after that CI can push to the internal track.

## 2. Build & ship

1. Bump `version` in `apps/mobile/app.config.ts` (build numbers auto-increment remotely) and update `CHANGELOG.md`.
2. `git tag v1.0.0 && git push --tags`: `release.yml` creates the GitHub release and `eas-build.yml` builds production for Android and iOS.
3. Run **EAS Submit** (Actions → EAS Submit) for the Play internal track / TestFlight.
4. Smoke-test on devices (Maestro flows in `.maestro/`), then promote in the stores.
5. Rollback: promote the previous build in the stores; for JS-only regressions, publish an EAS Update to `production` from the previous tag.

## 3. Kids Category / Designed for Families

**Apple, Kids Category (App Store Review Guidelines 1.3 and 5.1.4)**
- Choose the Kids Category and the age band that matches the primary audience (**5 and under** or **6–8**).
- No third-party analytics or advertising; no links out, purchases or account prompts without a parental gate (implemented in `parent-gate.tsx`).
- No data collection beyond what is disclosed; no behavioural tracking.

**Google Play, Families policy**
- Target audience ages 5 and under / 6–8, so the Families policy applies.
- Only Families-certified SDKs (the app ships no ad or analytics SDKs). The `AD_ID` permission is blocked in `app.config.ts`.
- Complete the **Data safety** form: no data collected or shared (on-device only) unless Supabase accounts are enabled.

## 4. Privacy labels / Data safety (current build)

| Data type | Collected? | Notes |
|---|---|---|
| Contact info, location, identifiers, usage/diagnostics, photos, audio | **No** | |
| Child nickname, age band, favourites, progress | **On device only** | Not transmitted; deletable in Parents → Privacy |
| Content requests to Supabase (if configured) | Published story content only | No user identifiers |

The Apple privacy manifest is set in `app.config.ts` (`NSPrivacyTracking: false`, no collected data types, required-reason APIs: UserDefaults `CA92.1`, file timestamps `C617.1`).

## 5. COPPA / GDPR-K notes

- The default build collects no personal information from children, so the MVP needs no verifiable-parental-consent flow.
- If parent accounts or cloud sync are enabled: implement verifiable parental consent (COPPA), a lawful basis and parental consent under GDPR Art. 8 for under-16s (13–16 depending on the country), data export/deletion, a retention policy and a DPA with Supabase. Follow the UK Age Appropriate Design Code (high-privacy defaults, no nudges).
- The parental gate is friction only, not consent.
- Publish `PRIVACY.md` at a public URL and link it in both stores.

## 6. Age rating

Apple **4+**. Google Play (IARC questionnaire): **Everyone / PEGI 3** (mild fable peril only, no ads, no user interaction, no purchases).

## 7. Store assets

| Asset | Size |
|---|---|
| iPhone 6.9" screenshots | 1320 × 2868 (or 1290 × 2796) |
| iPhone 6.5" screenshots | 1284 × 2778 / 1242 × 2688 |
| iPad 13" screenshots | 2064 × 2752 (or 2048 × 2732) |
| App Store icon | 1024 × 1024 PNG, no alpha (`apps/mobile/assets/images/icon.png`) |
| Google Play phone screenshots | 1080 × 1920 recommended (16:9 or 9:16, 320–3840 px), 2–8 images |
| Google Play 7" / 10" tablet | 1200 × 1920 / 1600 × 2560 recommended |
| Play feature graphic | 1024 × 500 |
| Play icon | 512 × 512 PNG |

Record screenshots and a preview video from the web export (`npm run mobile:web`, then serve `apps/mobile/dist`) or from simulators.

## 8. Content rights before release

- [ ] Every story in `docs/CONTENT_RIGHTS.md` re-checked (public domain in all launch markets, or original).
- [ ] The image-generation provider's terms permit commercial use; prompts kept as provenance.
- [ ] The TTS provider's terms permit commercial distribution of the narration, or the narration is replaced with licensed audio.
- [ ] Studio rights checklist complete for every published story.
