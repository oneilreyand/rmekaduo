# Feature Evidence Record — TV Antrean Display Enhancement

- **Date:** 2026-09-22
- **Owner / agent:** Antigravity
- **Status:** Validated
- **Scope:** Transform the TV queue display (`QueueDisplayWorkspace`) into a professional hospital/clinic waiting-room TV display (Multi-Poli support across Poli Umum, Poli Gigi, Poli KIA/Anak, Farmasi, and Admisi; massively enlarged queue numbers and patient names for long-distance readability; 16:9 zero-scroll kiosk mode; audio chime & Indonesian TTS; running text ticker; patient privacy masking; and Kaduo UI token consistency).

## Sources and decisions

- **User requirement:**
  1. Support Multi-Poli queues on the TV display.
  2. Substantially enlarge the currently called queue number and patient name so they can be easily read from a distance (5–10+ meters).
- **Governing documents:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/UI_UX_DESIGN_SYSTEM.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/BPJS_ANTROL_MJKN_INTEGRATION.md`.
- **ADRs:** `docs/adr/0001-contextual-rme-navigation.md`. Retain single Next.js route (`/`) and internal navigation state.
- **Assumptions and why they are safe/reversible:**
  - Standard Indonesian hospital display uses 16:9 widescreen layout with high contrast readable typography from 5–10 meters.
  - Queue prefix conventions follow BPJS Antrol standard: `A-` (Poli Umum), `B-` (Poli Gigi), `C-` (Poli KIA / Anak), `F-` (Farmasi), `R-` (Admisi/Registrasi).
  - Calling section renders queue numbers in `text-7xl` to `text-[10.5rem]` and patient names in `text-2xl` to `text-5xl` for clear readability across hospital waiting areas.
  - Kaduo UI color tokens (`--canvas`, `--surface`, `--action`, `--text`) govern both light and dark modes.

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| Multi-Poli queue support | Grid & tabs for Poli Umum, Poli Gigi, Poli KIA, Farmasi, and Admisi with dedicated doctors & queue prefixes | Complete |
| Massively enlarged queue number & patient name | Number sized up to `10.5rem` and patient name sized up to `text-5xl font-black` | Complete |
| Interactive poli switching | Clicking any poli counter card focuses that poli on the hero call card and triggers audio announcement | Complete |
| Zero-scroll 16:9 TV Kiosk mode with native Fullscreen toggle | Layout adapts to viewport height with `overflow-hidden`; zero page or inner scrollbars | Complete |
| Running text ticker | Bottom informational ticker for health education and Mobile JKN instructions | Complete |
| Patient privacy masking | Masked patient name by default with toggle control | Complete |
| Indonesian TTS Pronunciation Fix | Queue numbers such as `R-01` accurately announced as "R, kosong satu" with Indonesian voice selection and no character spelling | Complete |
| TypeScript check & Production build | `npx tsc --noEmit` and `npm run build` pass with zero errors | Complete |
| Live Dev Server | Clean server running on `http://localhost:3001` (HTTP 200 OK) | Complete |

## Change record

- **Files changed:**
  - `src/lib/tv-sound-chime.ts`: Added `formatQueueNumberForSpeech` and `formatIndonesianNumber` to parse prefix and digits into natural Indonesian words (`R-01` -> `"R, kosong satu"`), removing the bugged `.split('').join(' ')` that spelled out "k-o-s-o-n-g", and added Indonesian voice matching (`getIndonesianVoice`).
  - `src/context/patient-journey-context.tsx`: Enriched `initialMockEncounters` across Poli Umum (`A-`), Poli Gigi (`B-`), Poli KIA (`C-`), Farmasi (`F-`), Admisi (`R-`), and updated `registerPatient` prefix logic.
  - `src/components/molecules/tv-hero-call-card.tsx`: Massively enlarged typography for Queue Number (up to `text-[10.5rem]`) and Patient Name (`text-2xl` to `text-5xl font-black`) with clear labels.
  - `src/components/molecules/tv-counter-card.tsx`: Added support for specific poli types (`POLI_GIGI`, `POLI_KIA`, `POLI_UMUM`, `PHARMACY`, `ADMISSION`) with dedicated icons and typography.
  - `src/components/organisms/queue-display-workspace.tsx`: Added Multi-Poli filters, multi-counter grid overview, and interactive poli focus switching.
  - `src/app/globals.css`: Marquee animation keyframes.

- **Data/API/authorization impact:** None. Purely client presentation reflecting existing `PatientJourneyContext`.
- **Synthetic data declaration:** All patient names and medical queue entries are synthetic demonstrations.

## Validation evidence

| Check | Exact command/environment | Result | Notes |
| --- | --- | --- | --- |
| Speech formatting tests | Node test on `formatQueueNumberForSpeech` | Passed | `R-01` -> `"R, kosong satu"`, `A-02` -> `"A, kosong dua"`, `B-12` -> `"B, dua belas"`, etc. |
| Type check | `npx tsc --noEmit` | Passed | 0 errors. |
| Production build | `npm run build` | Passed | Compiled successfully in 1.7s; all static routes generated. |
| Whitespace check | `git diff --check` | Passed | 0 whitespace or formatting errors. |
| Live Server Verification | Dev server running on `http://localhost:3001` | Passed | Hot reload compiled successfully in 988ms. |

## Final report

- **Delivered behavior:** TV Antrean now provides full Multi-Poli queue monitoring (Poli Umum, Poli Gigi, Poli KIA, Farmasi, Admisi), a Hero Calling Card with massively enlarged numbers and patient names that can be read effortlessly from 10 meters away, and accurate Indonesian speech synthesis pronunciation for queue calls (e.g. `R-01` announced clearly as "R, kosong satu").
- **Evidence location:** `docs/evidence/2026-09-22-tv-antrean-enhancement.md`
