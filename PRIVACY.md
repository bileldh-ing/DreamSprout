# DreamSprout Stories — Privacy Policy

_Last updated: 22 October 2026. This document describes how the app is built; it is not legal advice. Have it reviewed by counsel for each launch market before release._

DreamSprout is a bedtime-story app for children aged roughly 3–8, used with a parent or caregiver.

## What we collect

**By default, nothing leaves the device.**

- **Child profiles**: a nickname (max 20 characters), an age band (3–5, 4–6, 6–8) and an emoji avatar, stored only on the device. We never ask for a child's full name, birth date, photo, voice, contact details or location.
- **Reading data**: favourites, last-read page and daily minutes used (for the parent's screen-time limit), stored only on the device.
- **Settings**: narration speed, subtitles, sleep timer, language, motion and dim preferences, stored only on the device.

## What we do not do

- No advertising, no advertising identifiers (the Android `AD_ID` permission is blocked), no third-party analytics or tracking SDKs.
- No in-app purchases, social features, chat, user uploads or external links in the child experience.
- No microphone, camera, contacts, photo-library or location permissions.

## Optional cloud sync

If a parent or operator configures a Supabase project (`EXPO_PUBLIC_SUPABASE_URL`), the app downloads **published story content only**. The database schema also supports parent accounts that own child profiles (nickname + age band), favourites and reading progress, protected by row-level security so a parent can only reach their own children's records. Account features must not be enabled in production without verifiable parental consent where the law requires it (for example COPPA in the US, GDPR Art. 8 / the UK Age Appropriate Design Code).

## Parental controls

Adult-only areas sit behind a parental gate (a multiplication question with a lockout). This is a friction step, not legally verifiable parental consent. Parents can delete all on-device data at any time from **Parents → Privacy & safety → Delete all data on this device**; uninstalling the app also removes it.

## Contact

Questions or deletion requests: dhahribilel1807@gmail.com
