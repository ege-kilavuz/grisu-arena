# Grisu Arena 8.0 Project Roadmap

## Vision
Upgrade **Grisu Arena** from its current state (~6.6/10) to a comprehensive, engaging, and educational quiz platform that:
- Attracts and retains a younger audience.
- Provides a learning‑by‑doing experience about the Turkish language, history, geography, science, etc.
- Employs gamification elements (points, leaderboards, badges, timed challenges).
- Is scalable, maintainable, and ready for distribution (Web, Android, iOS, Desktop).

## Milestones

### 1️⃣ Core Feature Pack (≈ 2‑3 weeks)
1. ✅ **Modular Question Engine** – Separate question types (MCQ, fill‑in, matching) into reusable components. *(Completed: QuestionEngine.ts created with types and evaluation logic)*
2. ✅ **Question Components** – MCQ, Fill, Match React Native components. *(Completed: MCQQuestion, FillQuestion, MatchQuestion components created)*
3. ✅ **Demo Screen** – Test screen with sample questions and home button. *(Completed: QuizDemo.tsx created, button added to home screen)*

### 2️⃣ Content Pipeline (≈ 1‑2 weeks)
1. **Open‑API Question Bank** – Load questions from a JSON/SQLite file or API.
2. **Admin UI** – Simplify adding / editing questions, categories, and difficulty levels.
3. **Rich Media Support** – Allow images/videos in questions.

### 3️⃣ UX & UI Polish (≈ 1‑2 weeks)
1. **Responsive Design** – Ensure consistent look on Web, Phone, Tablet, Desktop.
2. **Gamified Interface** – Progress bars, streak counters, sound effects.
3. **Localisation** – Turkish‑English bilingual (future‑proof for other languages).

### 4️⃣ Testing & QA (≈ 1 week)
1. **Unit Tests** – For Question engine, score logic.
2. **End‑to‑End Tests** – Cypress or Playwright to validate flows.
3. **Performance** – Test on different devices.

### 5️⃣ Packaging & Distribution (≈ 1 week)
1. **Bundle for Expo / Capacitor** – Web, iOS, Android builds.
2. **App Store / Play Store** – Prepare icons, splash, privacy policy.
3. **Documentation** – README + “How to Play” guide.

## Resources & Dependencies
- **React Native / Expo** (current stack)
- **Redux / Zustand** for state management
- **React Navigation** (existing)
- **Testing**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions – build & publish to Expo publish / App Store

## Deliverables
| # | Deliverable | Acceptance | Status |
|---|-------------|------------|--------|
| 1 | ✅ Modular question engine | Types + evaluation logic | **Completed** |
| 2 | ✅ Question components | MCQ, Fill, Match RN components | **Completed** |
| 3 | ✅ Demo screen | QuizDemo.tsx + home button | **Completed** |
| 4 | Content editor | CRUD UI, import/export | Pending |
| 5 | Leaderboard & badging | Persistent in DB, UI shows | Pending |
| 6 | Locally‑hosted API (optional) | 50+ sample questions | Pending |
| 7 | Test suites | No critical bugs | Pending |
| 8 | Published builds | App Store & Google Play listing | Pending |

## Next Steps
- **Create the file** `PROGRESS.md` in the repo root with this content.
- Start with milestone **1️⃣** – create a `QuestionEngine` folder, write types, and set up a simple demo.
- Document any blockers or assumptions in the same `PROGRESS.md` as you progress.

> Feel free to **comment** on this plan and suggest changes or add missing steps. Once it looks good, we can start sprint‑planning and commit the file.
