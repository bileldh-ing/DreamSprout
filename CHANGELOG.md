# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-22

### Added
- Expo (SDK 58) mobile app: onboarding with nickname + age-band child profiles, Home (Story Worlds, Tonight's Pick, search, grid, continue reading), Library with age filters, Favorites, Story Details, and the narrated Reader.
- Reader: per-page illustration cross-fade + Ken Burns motion (off with reduced motion), recorded narration with live word highlighting from real TTS word timings, tap a word to seek, replay sentence, seekable progress bar, auto page-turn, speed 0.75×/1×/1.25×, subtitle modes (word / sentence / off), Read-myself mode, swipe between pages, sleep timer (end of page, 5–20 min) with a volume fade into a Goodnight screen, The End screen with the moral and a next pick.
- Parents area behind a parental gate: child profiles, reading defaults, bedtime dim mode, language (English/French), downloads manager, daily screen-time limit, privacy & safety (delete local data), content rights list.
- 20 rights-cleared stories × 3 pages with unique illustrations, narration and word timings, bundled for offline use.
- `@dreamsprout/content`: shared types, zod schemas, discovery helpers and a validator that fails on missing sources, licences, assets or timings.
- Supabase: schema, RLS, storage buckets, publish rights-gate trigger, audit log, generated seed, TTS edge-function stub, SQL integration tests.
- Next.js content studio with a draft → review → published workflow and a mandatory rights checklist.
- CI (lint, Prettier, typecheck, tests with coverage, content validation, Expo web export, expo-doctor, studio build), EAS build/submit, release, Supabase and manual Maestro workflows.
