# Maestro end-to-end flows

| Flow | Covers |
|---|---|
| `home-story-read-end.yaml` | onboarding → Home → Story details → Reader (3 pages) → The End → Home |
| `onboarding.yaml` | reusable sub-flow: create the first child profile |
| `parent-gate.yaml` | the parental gate guards the parents area |

Run locally with a development or preview build installed:

```bash
curl -fsSL https://get.maestro.mobile.dev | bash
cd apps/mobile && npx expo run:android   # or install an EAS preview build
maestro test .maestro/
```

In CI the flows run only from the manual **E2E (Maestro, manual)** workflow.
