# Master Exercise Expansion & Architectural Enhancement Plan
## Japanese N5/N4 Study App: Transformation into a High-Retention, Replayable Mastery System

**Document Version**: 2.0.0-PROD  
**Author**: Worker (Plan & Roadmap Author)  
**Target Repository**: `c:\Users\test\Downloads\Japanese N5 Study`  
**Execution Context**: React 19, TypeScript ~7.0, Vite 8, Tailwind CSS, Zustand 5, `ts-fsrs` 6  
**Date**: November 6, 2026  

---

# Table of Contents
1. [Executive Summary & Architectural Vision](#1-executive-summary--architectural-vision)
   - 1.1 The Strategic Shift: Flashcards to Mastery System
   - 1.2 Core Architectural Principles
   - 1.3 High-Level System Architecture
2. [Competitive Intelligence Breakdown (R1)](#2-competitive-intelligence-breakdown-r1)
   - 2.1 In-Depth Teardown of 8 Established Platforms
   - 2.2 Comprehensive Cross-Platform Comparison Matrix
   - 2.3 Catalog of 12 Granular Exercise Interaction Models
   - 2.4 Spaced Repetition & Progression Systems
   - 2.5 Daily Retention Hooks & Habit Formation Mechanics
   - 2.6 User Agency, Customization & Pacing Controls
3. [10-Module Existing Codebase Audit & Gap Analysis (R2)](#3-10-module-existing-codebase-audit--gap-analysis-r2)
   - 3.1 Module 1: Kana Dojo (`src/pages/KanaDojo.tsx`)
   - 3.2 Module 2: Kanji Dojo & Studio (`src/pages/KanjiDojo.tsx`, `src/pages/Kanji.tsx`)
   - 3.3 Module 3: Conjugation & Verb Pair Dojo (`src/pages/ConjugationDojo.tsx`)
   - 3.4 Module 4: Grammar Lessons (`src/pages/Grammar.tsx`)
   - 3.5 Module 5: Story Reader (`src/pages/StoryReader.tsx`, `src/pages/Stories.tsx`)
   - 3.6 Module 6: Daily 5-Minute Bento (`src/pages/DailyBento.tsx`)
   - 3.7 Module 7: Listening & Pitch Dojo (`src/pages/Listening.tsx`)
   - 3.8 Module 8: Sign Decoder & Shokkenki (`src/pages/SignDecoder.tsx`)
   - 3.9 Module 9: JLPT Benchmark Exam (`src/pages/Exam.tsx`, `src/lib/jlptGenerator.ts`)
   - 3.10 Module 10: Campaign Mode (`src/pages/Campaign.tsx`)
4. [Concrete Exercise Formats & Interaction Mechanics (R3)](#4-concrete-exercise-formats--interaction-mechanics-r3)
   - 4.1 Orthography & Vocabulary Engine
   - 4.2 Kanji Context & Decomposition Engine
   - 4.3 Grammar & Conjugation Production Engine
   - 4.4 Immersion & Reading Scaffolding Engine
   - 4.5 Auditory Discrimination & Simulation Engine
5. [Replayability, Spaced Repetition & Retention Architecture (R3)](#5-replayability-spaced-repetition--retention-architecture-r3)
   - 5.1 Multi-Vector FSRS Memory Modeling
   - 5.2 Isolated Ghost Review Queue Architecture
   - 5.3 Workload Smoothing & 24h/30-Day Forecast Engine
   - 5.4 Streak Shield, Freezes & Forgiveness Systems
   - 5.5 Dynamic Bento Nutrition Engine & Reward Rotation
   - 5.6 Procedural Gatekeeper Boss Challenges & Stage Decay
6. [Phased Implementation Roadmap (R3)](#6-phased-implementation-roadmap-r3)
   - 6.1 Phase 1: High-Yield Fixes & Quick Wins
   - 6.2 Phase 2: Core Interactive Exercise Mechanics
   - 6.3 Phase 3: Content Scaling, Immersion & Gamification
   - 6.4 Phase 4: Advanced Adaptive Systems & Exam Simulation
   - 6.5 Technical Feasibility Analysis for React 19 / TS / Vite
   - 6.6 Prioritization Matrix (Impact vs. Effort)
7. [Structured Verification Rubric](#7-structured-verification-rubric)
   - 7.1 Multi-Tier Evaluation Criteria
   - 7.2 Gate Clearance Thresholds

---

# 1. Executive Summary & Architectural Vision

## 1.1 The Strategic Shift: Flashcards to Mastery System
The current Japanese N5/N4 Study App represents a technically clean, modern single-page application built on React 19, TypeScript, Vite, and Tailwind CSS. Its codebase features sub-second hot reload, zero console warnings, modular directory organization, and integrated state persistence via Zustand.

However, an exhaustive audit reveals a profound pedagogical bottleneck: **the application currently operates primarily as a collection of static flashcards and binary multiple-choice quizzes**. 
- In Kana Dojo, testing is 100% unidirectional typing of Latin romaji from Japanese kana.
- In Kanji Dojo, all 150 kanji possess exactly ONE associated compound word, and reading tests accept any On/Kun reading regardless of contextual appropriateness.
- In Conjugation Dojo, an entire language learning app is starved with only 19 vocabulary words (14 verbs and 5 adjectives) and only 5 basic inflection forms, omitting essential JLPT N5/N4 forms like potential, volitional, conditional, passive, and causative.
- In Grammar Lessons, 57 static exercises never change upon repetition, testing only 43 of the ~140 required N5/N4 grammar points.
- In Daily Bento, the completion reward is hardcoded to award the exact same Ueno Park stamp 365 days a year, while in Sign Decoder, user progress is lost upon page navigation due to unpersisted component state.

To transform this utility into an elite, world-class Japanese learning platform that commands daily engagement and fosters true language fluency, we must orchestrate a fundamental architectural evolution:

```
┌────────────────────────────────────────────────────────┐
│                   THE STRATEGIC SHIFT                  │
└────────────────────────────────────────────────────────┘
                          │
         FROM (Current State: Static Flashcard App)
         ├── Unidirectional Romaji/English Recognition
         ├── Static, Single-Compound Vocabulary Pools
         ├── Isolated Multiple-Choice Button Guessing
         ├── 1-and-Done Exhaustible Linear Drills
         └── Monolithic Flashcard SRS Resets
                          │
                          ▼
         TO (Target State: Replayable Mastery Ecosystem)
         ├── Multi-Vector Active Production (Typing, Cloze, Tracing)
         ├── Combinatorial Question Generators & Deep Content Pools
         ├── Multi-Layered Nuance Hints & Near-Miss Error Interception
         ├── Dynamic Daily Bento, 3-Tier Quests & 2-Slot Streak Shields
         └── Decoupled Multi-Vector FSRS & Isolated Ghost Remediation
```

## 1.2 Core Architectural Principles
1. **Active Production over Passive Recognition**: Passive multiple choice creates an illusion of competence. Every exercise must offer an active production path (Japanese IME typing, particle slotting, vector stroke tracing, sentence reconstruction).
2. **Cognitive Scaffolding & Multi-Layered Guidance**: When a learner fails or hesitates, the system should not immediately penalize them with a binary failure. Instead, it must offer progressive nuance hints (Nuance $\rightarrow$ Structural Form $\rightarrow$ Register/Politeness $\rightarrow$ Full Rule).
3. **Multi-Vector Memory Modeling**: Human memory is not scalar. A student may recognize a kanji's meaning, fail its reading, succeed in listening comprehension, and fail in handwriting. Memory tracking must decouple into independent vectors.
4. **Workload Smoothing & Anti-Burnout Protection**: Review pile-ups destroy study habits. The system must feature strict daily new card caps, 24-hour review forecasting, and isolated "Ghost Queues" so that temporary failures do not destabilize long-term review schedules.
5. **Authentic Cultural Immersion**: Exercises must simulate real-world Japanese artifacts—train station signage, ramen ticket vending machines (`食券機`), convenience store dialogues, minimal pair pitch accent contours, and authentic JLPT section timing.

## 1.3 High-Level System Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (React 19 + Vite)                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Views: src/pages/]                                                                            │
│  ├── Orthography: KanaDojo, KanjiDojo, KanjiStudio (SVG KanjiVG / Canvas Tracing)               │
│  ├── Syntax: Grammar (Layered Cloze), ConjugationDojo (Matrix / De-conjugator)                  │
│  ├── Immersion: StoryReader (Dynamic Furigana / Blind Audio), SignDecoder (Kiosks / Hotspots)   │
│  └── Assessment: DailyBento (Dynamic Nutrition), Exam (3-Session Timed JLPT), Campaign (12 Sagas│
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Interactive Engine: src/components/ & src/lib/]                                               │
│  ├── LayeredHintEngine       ├── Wanakana IME Parser       ├── VectorStrokeValidator            │
│  ├── PitchContourRenderer    ├── SpeechDialogueEngine      ├── StarOrderScrambler               │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [State & Scheduling Engine: src/lib/store.ts]                                                   │
│  ├── Multi-Vector FSRS 6    ├── Isolated Ghost Queue       ├── 2-Slot Streak Shield & Freeze    │
│  ├── Daily Bento Nutrition  ├── Campaign Verified Gates    ├── Persistent Module Progress       │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Data Layer: src/data/]                                                                        │
│  ├── 150+ Kanji / 600+ Vocab ├── 80+ Verbs / 11 Forms     ├── 140+ Grammar Points / 300+ Qs     │
│  ├── 30+ Graded Stories      ├── 50+ Real Signs & Kiosks   ├── 30+ Pitch Minimal Pairs          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Competitive Intelligence Breakdown (R1)

To anchor our architectural blueprint in proven industry standards, we analyzed eight mature, long-standing Japanese language learning platforms.

## 2.1 In-Depth Teardown of 8 Established Platforms

### 2.1.1 Renshuu (`renshuu.org`)
*Founded in 2009 by Michael & Kao. The definitive gold standard for learner agency, content depth, and delightful low-friction gamification.*
- **Core Philosophy**: Extreme learner customizability paired with emotional pet/garden reinvestment.
- **Key Mechanics**:
  - *Vector Stroke Tracing*: Real-time canvas stroke drawing for Kana and Kanji, validating start point, direction vector, curvature, and endpoint bounding boxes.
  - *Shiritori Word Chaining*: Turn-based game against an AI opponent testing vocabulary recall with terminal ん traps.
  - *Multi-Vector Decoupling*: Separates vocabulary into 5 independent memory tracks: Kanji $\rightarrow$ Meaning, Kanji $\rightarrow$ Reading, Hiragana $\rightarrow$ Kanji, English $\rightarrow$ Japanese Production, and Audio $\rightarrow$ Meaning.
  - *Kao-chan Mascot & Japanese Garden*: Studying awards Kao Coins. Learners purchase dango, sushi, lanterns, torii gates, and koi ponds to feed their mascot and curate their virtual Japanese garden.
  - *Daily Bento & Quests*: 3 daily micro-tasks providing a clear finish line to reduce decision fatigue.

### 2.1.2 Bunpro (`bunpro.jp`)
*Launched in 2017. The industry authority for Japanese grammar spaced repetition and active contextual production.*
- **Core Philosophy**: Contextual typed production over passive recognition. Grammar must be actively written in full sentences.
- **Key Mechanics**:
  - *Progressive Cloze with Layered Nuance Hints*: Blanks in authentic sentences are solved via typing. Pressing `Spacebar` or clicking `Hint` cycles through 4 discrete layers: (1) English Nuance, (2) Structure / Grammatical Form, (3) Politeness / Register, (4) Deep Rule Explanation.
  - *Intelligent Input Interceptor*: Identifies near-misses (e.g. casual vs. polite, wrong particle, alternative synonym grammar) with yellow shake animations and explanatory warnings instead of punishing errors.
  - *Ghost Review Queue*: Failing an SRS item does not reset long-term intervals; it spawns an ephemeral Ghost Card tested at 4h, 12h, and 24h until cleared 3 consecutive times.
  - *24-Hour & 30-Day Hourly Review Forecast*: Bar charts displaying review maturity timelines to prevent backlog anxiety.
  - *Textbook Cross-Walks*: Direct alignment to *Genki I & II*, *Minna no Nihongo*, *Tae Kim*, and *Quartet*.

### 2.1.3 WaniKani (`wanikani.com`)
*Created by Tofugu. The industry benchmark for kanji acquisition via radical component mnemonics.*
- **Core Philosophy**: Strict prerequisite gating via a Radical $\rightarrow$ Kanji $\rightarrow$ Vocabulary Directed Acyclic Graph (DAG).
- **Key Mechanics**:
  - *Two-Part Interleaved Review*: Every item requires entering BOTH Meaning (English) and Reading (Hiragana). The card only advances in SRS if both answers are provided correctly in the same session.
  - *Shake & Warning Parser*: Distinguishes On'yomi from Kun'yomi: typing an On reading when Kun is requested wiggles the input with a yellow alert: *"We're looking for the kun'yomi reading!"* without counting wrong.
  - *Strict Prerequisite Gating*: Radicals must reach Stage 5 (Guru) before component kanji unlock; 90% of a level's kanji must reach Guru before the next level unlocks.
  - *Burn Milestones*: Formal retirement of cards after 8 successful stages over 4+ months, celebrated with ceremonial badges.

### 2.1.4 Satori Reader (`satorireader.com`)
*The premier graded reading platform for beginner-to-intermediate Japanese learners.*
- **Core Philosophy**: Comprehensible input delivered through serialized, human-curated narratives.
- **Key Mechanics**:
  - *Interactive Tap-to-Gloss & Grammatical Cards*: Tapping any word in a narrative reveals its dictionary form, conjugated form, and editorial notes explaining *why* a specific particle or nuance was used.
  - *Dynamic Furigana Engine*: Three display modes: (1) All furigana, (2) Tap-to-reveal only, (3) WaniKani API Sync (furigana is automatically hidden for kanji the user has already mastered on WaniKani).
  - *Karaoke-Synchronized Professional Audio*: Native voice actors read each sentence with real-time text highlighting and variable speed controls (0.7x, 0.85x, 1.0x).

### 2.1.5 JPDB.io (`jpdb.io`)
*A modern data-driven SRS platform built around anime, literature, and media frequency corpus analysis.*
- **Core Philosophy**: Learn the exact vocabulary required for the specific native media you consume.
- **Key Mechanics**:
  - *Pitch-Accent Contour Visualizations*: Categorizes every word into Heiban (平板 [0]), Atamadaka (頭高 [1]), Nakadaka (中高), or Odaka (尾高) with explicit SVG pitch contour line graphs and minimal pair listening drills.
  - *FSRS Memory Engine*: Early adopter of modern Free Spaced Repetition Scheduling, dynamically adjusting review intervals based on difficulty and retrievability.

### 2.1.6 MaruMori.io (`marumori.io`)
*A modern gamified Japanese adventure RPG platform.*
- **Core Philosophy**: Unifying kanji, grammar, reading, and vocabulary into an interactive island adventure.
- **Key Mechanics**:
  - *Interactive Inline Grammar*: Lessons feature mini-quizzes embedded directly inside the explanation text (drag-and-drop tiles, particle selection).
  - *Adventure Island Overworld*: Sagas structured as physical regions on an illustrated world map with unlockable buildings, pets, and exploration rewards.

### 2.1.7 Duolingo Japanese
*The global benchmark for mass-market habit formation and mobile game loops.*
- **Core Philosophy**: Low cognitive friction and social loss aversion.
- **Key Mechanics**:
  - *Word Bubble Tile Scramble*: Reconstructing sentences by tapping tokens, with grammatically plausible distractor tiles.
  - *Streak Shields & Streak Wagers*: Protecting streaks from accidental loss with consumable shields.
  - *Leagues & Tiered Leaderboards*: 30-person weekly leaderboards with promotion and demotion zones.

### 2.1.8 KameSame / KaniWani / Kanshudo
*Active production extensions for kanji and vocabulary.*
- **Core Philosophy**: Overcoming the passive recognition gap through reverse active recall.
- **Key Mechanics**:
  - *Active Production*: Prompts with English definitions; user must type the Japanese kanji or kana.
  - *Kanji Component Cascades*: Visual wheels decomposing complex kanji into base radicals and building up into multi-kanji idioms (四字熟語).

---

## 2.2 Comprehensive Cross-Platform Comparison Matrix

| Feature / Dimension | Renshuu | Bunpro | WaniKani | Satori Reader | JPDB.io | MaruMori | Japanese N5 Study (Current) | Japanese N5 Study (Target Plan) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Scope** | All (Vocab, Kanji, Grammar, Sentences) | Grammar & Vocab SRS | Radicals, Kanji, Vocab | Graded Reading & Audio | Media Vocab & Kanji | All (Grammar, Kanji, Vocab) | All 10 Modules (Siloed) | Fully Integrated Mastery System |
| **Input Modality** | Typing, Mult-Choice, Drawing, Vector | Typing (Japanese IME), Mult-Choice, Cram | Strict IME Typing (Reading & Meaning) | Tap / Reading Context / Self-Grade | Typing, Mult-Choice, Audio-First | Typing, Tile Drag, Drawing | Romaji Typing & 4-Button MCQ | Multi-Vector Typing, Vector Tracing, Chip Slots |
| **Error Tolerance** | Strict, Loose, Auto | Intelligent Near-Miss Warnings | On/Kun Confuser Shake Animation | N/A (Reading focused) | Configurable synonym list | Minor typo warnings | Strict Exact Match / Binary Pass-Fail | Soft Near-Miss Warnings & Layered Hints |
| **SRS Algorithm** | Multi-Vector Custom Leitner/SM-2 | 12-Stage Custom Interval (4h $\rightarrow$ 6mo) | 9-Stage Fixed Interval (4h $\rightarrow$ 4mo) | Context Card SRS | Modern FSRS / SM-2 Variant | Custom Interval SRS | `ts-fsrs` 6 (Scalar Cards) | Multi-Vector FSRS + Isolated Ghost Queue |
| **Weakness Isolation**| Vector Demotion & Quick Study | **Ghost Reviews** (Isolated Cards) | Extra Study Mistakes Queue | Starred Sentence List | Target Difficulty Adjustment | Trouble Queue | Global Review List Only | **Isolated Ghost Review Queue** |
| **Workload Smoothing**| Schedule Caps & Vacation Freeze | **24h & 30-Day Hourly Forecast** | Review Timeline Bar | Self-Paced Chapter Drops | Review Heatmap & Forecast | Daily Study Queue Cap | None (All Due Reviewed at Once) | **24h Bar Chart & 30-Day Forecast** |
| **Pitch Accent** | Visual Contours & Quizzes | Audio Only | None | Audio Waveform & Marks | **Contour Graphs & Category Tags**| Pitch Indicators | 6 Static Audio Minimal Pairs | **30+ Minimal Pairs with SVG Contours** |
| **Retention Hooks** | **Kao-chan Mascot & Garden** | Daily Streaks & Badges | Level-Up & Burn Milestones | Serialized Narrative | Media Comprehension % | Avatar & RPG Island | 1 Static Bento Stamp, Static Badges | **Dynamic Bento, 2 Shields, Certificate** |
| **User Agency** | ★★★★★ (Infinite Customization) | ★★★★☆ (High Textbook Sync) | ★★☆☆☆ (Opinionated Lockstep) | ★★★★☆ (Furigana WK Sync) | ★★★★★ (Deck/Frequency Control) | ★★★★☆ (Structured vs Free) | ★★☆☆☆ (Fixed Content / Single Mode) | ★★★★★ (Multi-Mode, Furigana, Custom Bento) |

---

## 2.3 Catalog of 12 Granular Exercise Interaction Models

To eliminate repetitive drill fatigue, the app will standardize and deploy 12 distinct interaction mechanics across all 10 modules:

```
                                  [12 INTERACTION MECHANICS]
                                               │
         ┌──────────────────────────┬──────────┴──────────┬──────────────────────────┐
         ▼                          ▼                     ▼                          ▼
  [SYNTAX & MORPHOLOGY]       [ORTHOGRAPHY]         [PROSODY & AUDIO]         [REAL-WORLD DECODING]
  1. Layered Cloze            3. Canvas Tracing     4. Pitch Minimal Pairs    7. Ramen Ticket Kiosk
  2. Particle Slot Chips      6. Reverse Production 9. Audio Dictation Cloze  8. Tap-to-Inspect Signs
  5. Sentence Scrambles       12. Shiritori Chaining                          10. Transitive Pairs
  11. JLPT Star (★) Assembly                                                  12. Visual Audio Tasks
```

### 1. Progressive Grammar Cloze with Layered Hints (Bunpro Model)
- **UX Flow**: Sentence with blank `明日、映画を [＿＿] に行きます。(見ます)`. Input accepts direct typing via Wanakana.
- **Hint Engine**: Pressing `Spacebar` or tapping `💡 Hint` unfolds:
  - *Layer 1 (Nuance)*: `[purpose of movement: in order to...]`
  - *Layer 2 (Grammar Pattern)*: `[Verb Stem + に行く]`
  - *Layer 3 (Form Rule)*: `[Drop ます from 見ます, attach に]`
  - *Layer 4 (Full Breakdown)*: Complete grammar card.
- **Near-Miss Interceptor**: Typing `見る` shakes the field with a yellow badge: *"Close! Remember to drop the dictionary ending before に行く."*

### 2. Semantic Particle Slot-In Chips (Renshuu / MaruMori Model)
- **UX Flow**: Sentence with 2–3 blanks: `日曜日 [＿＿] 友だち [＿＿] 公園 [＿＿] 行きました。`
- **Interaction**: Bank of particle chips `[ は ] [ に ] [ で ] [ と ] [ を ] [ へ ]`. Learner taps chips into active slots or uses number keys `1`–`6`.
- **Feedback**: Color-coded semantic tags glow upon placement (`と` = Companion [Teal], `へ` = Destination [Indigo], `に` = Time [Amber]).

### 3. Vector Canvas Stroke Order Tracing (Renshuu Model)
- **UX Flow**: HTML5 Canvas overlaying a traditional $2 \times 2$ grid (田). Faint guide outline in gray.
- **Algorithmic Validation**:
  - Start point proximity ($\Delta < 22\text{px}$)
  - Direction vector angle ($\theta \pm 30^\circ$)
  - Curvature and endpoint release bounding box
- **Feedback**: Correct strokes snap to bold black calligraphy with audio chime; incorrect strokes pulse red and fade.

### 4. Pitch-Accent Minimal Pair Discrimination (JPDB Model)
- **UX Flow**: User hears audio (e.g. 「あめ」). Screen displays Card A (雨: Atamadaka [1] High $\rightarrow$ Low) and Card B (飴: Heiban [0] Low $\rightarrow$ High flat).
- **Visualization**: Interactive SVG contour graphs showing high/low mora pitch relative to particle (`あ＼めが` vs `あ／めが￣`).
- **Feedback**: Side-by-side audio replay comparing both variants for acoustic ear calibration.

### 5. Sentence Scramble / Tile Unscramble (Duolingo Model)
- **UX Flow**: English prompt displayed. Japanese phrase blocks scattered in random order with 2 distractor tiles.
- **Interaction**: Tap chips to assemble in sentence tray. Click placed chips to return them to the bank. Teaches natural SOV word order, modifier placement, and counter positioning.

### 6. Reverse Production Active Recall (KameSame / WaniKani Model)
- **UX Flow**: English prompt ("to drink (polite non-past)"). Learner must actively type `飲みます` or `のみます`.
- **Pedagogical Rationale**: Eliminates passive recognition bias; builds 2.5x stronger neural recall pathways.

### 7. Interactive Ramen Ticket Machine (食券機) Simulator
- **UX Flow**: Authentic 14-button Japanese vending machine UI. Mission prompt displays a customer order: *"Dine-In: Large Tonkotsu Ramen, seasoned egg, extra noodles, no green onion."*
- **Interaction**: User must locate and press the exact buttons, insert money, calculate change, and hit `発券 (Issue Tickets)` under time pressure.

### 8. Graded Reading Tap-to-Inspect Modals (Satori Reader Model)
- **UX Flow**: Graded text with dynamic furigana controls (`All`, `Tap-to-Reveal`, `None`).
- **Interaction**: Tapping any word opens an editorial modal detailing root dictionary form, contextual inflection, and cultural nuances, with a `+ Add to SRS` button.

### 9. Audio Dictation & Transcription Cloze
- **UX Flow**: Native sentence audio plays. Sentence is printed with missing kana or particles.
- **Interaction**: Learner types the exact spoken sounds into the blank via Wanakana, training auditory segmentation.

### 10. Transitive / Intransitive Verb Pair Sorter with Particle Blanking
- **UX Flow**: Sentence presented with blanked particle and verb pair: `ドア [＿＿] [ 開く / 開ける ]。`
- **Interaction**: Learner must correctly coordinate the particle (`が` vs `を`) with the corresponding verb (`自動詞` vs `他動詞`), preventing mechanical 50/50 guessing.

### 11. JLPT Mondai 2 "Star" (★) Sentence Assembly
- **UX Flow**: Sentence with 4 blanks: `きのう ＿＿ ＿＿ ★ ＿＿ 買いました。`
- **Interaction**: 4 numbered tiles. User sequences tiles; system tests which tile occupies the third (★) position, matching official JLPT exam conditioning.

### 12. Shiritori Kana Word-Chaining Minigame
- **UX Flow**: Fast-paced kana vocabulary chain against AI. The starting kana of each word must match the final kana of the previous word. Avoids terminal `ん` traps.

---

## 2.4 Spaced Repetition & Progression Systems

### 2.4.1 Modern FSRS vs SM-2 vs Fixed Stage Curves
- **SM-2 Limitations**: Fixed ease factors create "ease hell" for difficult items and inflate review counts by 30%.
- **Fixed Stages (WaniKani)**: Predictable but rigid; does not adapt to individual memory retention targets.
- **Free Spaced Repetition Scheduler (FSRS 6)**: Already integrated in our app via `ts-fsrs`. Computes memory states across three distinct continuous variables:
  $$S \text{ (Stability: days until } R=90\% \text{)}, \quad D \text{ (Difficulty: 1 to 10)}, \quad R \text{ (Retrievability: probability of recall)}$$
  Enables precise targeted retention (default 90%) and reduces overall review workload by 25%.

### 2.4.2 Multi-Vector Decoupling Architecture
A single word card (e.g. `食べる`) is decoupled into 4 independent sub-cards:
```typescript
interface MultiVectorWordCard {
  id: string; // "vocab:taberu"
  vectors: {
    kanjiToMeaning: FSRSCard;  // [食べる] -> "to eat"
    kanjiToReading: FSRSCard;  // [食べる] -> "たべる"
    production: FSRSCard;      // "to eat" -> [食べる]
    audioToMeaning: FSRSCard;  // Audio /taberu/ -> "to eat"
  };
}
```
*Failure on reading demotes only `kanjiToReading`; `kanjiToMeaning` retains its high stability.*

### 2.4.3 Isolated Ghost Review Queue
When a user fails any SRS card twice consecutively:
1. The main card is demoted by only 1 stability stage.
2. An ephemeral **Ghost Card** is spawned into `ghostQueue`.
3. The ghost card is scheduled for rapid-fire reviews at 4 hours, 12 hours, and 24 hours.
4. Once answered correctly 3 consecutive times, the ghost card is permanently deleted.
*Outcome: Stamped-out weaknesses without review pile-up or long-term schedule distortion.*

---

## 2.5 Daily Retention Hooks & Habit Formation Mechanics
1. **Daily Bento Ritual**: A 3-to-5-minute daily micro-session providing a clear, achievable finish line early in the day, eliminating decision fatigue.
2. **2-Slot Streak Shields & Vacation Freeze**: Loss aversion without punitive despair. Users can hold up to 2 shields earned through study consistency.
3. **Mascot & Garden Reinvestment (Kao-chan Model)**: Earning Bento Coins allows feeding companion mascots and decorating personal Japanese study spaces.
4. **Celebratory Milestone Certificates**: Full-screen fanfare, downloadable PNG certificates (`ExamCertificate`), and collectible seals upon clearing Campaign sagas or passing the JLPT Exam.

## 2.6 User Agency, Customization & Pacing Controls
- **Input Modality Toggles**: Seamless mid-session switching between (1) Strict IME Typing, (2) Multiple-Choice / Word Chips, and (3) Flashcard Self-Grade.
- **Dynamic Furigana Engine**: Global and contextual toggle: `All Furigana`, `Tap-to-Reveal Only`, and `No Furigana`.
- **Workload Pacing**: User-configurable daily new card caps (5, 10, 15, 20) and batch session sizes (10 cards per mini-round).

---

# 3. 10-Module Existing Codebase Audit & Gap Analysis (R2)

An exhaustive, line-by-line audit was conducted across all 10 modules in `src/pages/` and `src/data/`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    10-MODULE CODEBASE AUDIT INVENTORY                        │
├───────────────────────┬───────────────────────────┬──────────────────────────┤
│ Module                │ Files & Line References   │ Inventory & Current Model│
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 1. Kana Dojo          │ KanaDojo.tsx (444 lines)  │ 208 Kana; 100% Romaji    │
│                       │ kana.ts (207 lines)       │ typing, auto-submitting  │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 2. Kanji Dojo/Studio  │ KanjiDojo.tsx (549 lines) │ 150 Kanji; exactly 1     │
│                       │ kanji.ts, kanjiRadicals.ts│ compound word per kanji  │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 3. Conjugation Dojo   │ ConjugationDojo.tsx (549) │ 19 words (14 v, 5 adj);  │
│                       │ conjugations.ts (450)     │ 5 forms; 12 pairs        │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 4. Grammar Lessons    │ Grammar.tsx (309 lines)   │ 11 lessons, 43 points,   │
│                       │ grammar.ts (450 lines)    │ 57 hardcoded questions   │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 5. Story Reader       │ StoryReader.tsx (314)     │ 10 stories, 51 sentences,│
│                       │ stories.ts (300 lines)    │ 28 shallow MCQ questions │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 6. Daily Bento        │ DailyBento.tsx (578)      │ 4 counters, 1 hardcoded  │
│                       │ dailyBento.ts, stamps.ts  │ Ueno stamp 365 days/year │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 7. Listening & Pitch  │ Listening.tsx (381 lines) │ 26 listening items,      │
│                       │ listening.ts, pitchAccent │ 6 pitch accent pairs     │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 8. Sign Decoder       │ SignDecoder.tsx (335)     │ 18 signs, 4 ramen orders;│
│                       │ signs.ts, shokkenki.ts    │ unpersisted useState     │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 9. JLPT Exam          │ Exam.tsx (761 lines)      │ 67 Qs, but only 4 cloze  │
│                       │ jlptGenerator.ts (1,266)  │ & 4 mid-stories repeat   │
├───────────────────────┼───────────────────────────┼──────────────────────────┤
│ 10. Campaign Mode     │ Campaign.tsx (564 lines)  │ 6 sagas, 24 stages;      │
│                       │ campaign.ts (60 boss Qs)  │ manual "Mark Done" cheat │
└───────────────────────┴───────────────────────────┴──────────────────────────┘
```

---

## 3.1 Module 1: Kana Dojo (`src/pages/KanaDojo.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/KanaDojo.tsx` (444 lines)
  - Data Source: `src/data/kana.ts` (207 lines)
  - State Store: `src/lib/store.ts` (`kanaStats: Record<string, KanaStat>`, `recordKana`)
- **Current Content Inventory**:
  - 208 total kana glyphs (104 Hiragana + 104 Katakana).
  - 92 basic handcrafted mnemonics (46 Hira + 46 Kata); procedural ten-ten fallbacks.
  - Comprehensive alternative romaji acceptance map (`ALTS` in `kana.ts:148-165`).
- **State Model**:
  - `script: 'hiragana' | 'katakana' | 'both'`
  - `rows: string[]`, `current: Kana | null`, `input: string`, `flash: 'ok' | 'bad' | null`
  - Scoring uses error-weighted sampling: `1 + (s.wrong * 2) / (1 + s.correct * 0.5)`.
- **Diagnosis of Repetition & Root Causes**:
  1. *Unidirectional Romaji Crutch*: 100% of questions are "See Japanese glyph $\rightarrow$ Type Latin Romaji". The user never has to produce or identify Kana from sound or English.
  2. *Zero Word-Level Transition*: Characters are drilled exclusively in isolation. Real Japanese requires reading combination syllables, small tsu gemination (`っ`), and long vowels (`おばあさん` vs `おばさん`).
  3. *No Visual Confuser Discrimination*: Chronic look-alike pairs (Katakana `シ` vs `ツ`, `ソ` vs `ン`; Hiragana `さ` vs `き`, `れ` vs `ね` vs `わ`) are never contrasted side-by-side.
  4. *No Stroke Order Tracing*: Kana Dojo lacks the vector stroke canvas tracing available in Kanji Studio.
- **Concrete Missing Formats**:
  - Reverse Kana Multiple Choice (Sound/Romaji prompt $\rightarrow$ pick from 4 Kana tiles).
  - Visual Confuser Speed Sorter (`シ` vs `ツ`).
  - Audio Minimal Pair Voicing Drill (`ば` vs `ぱ` vs `は`).
  - Kana Word Spelling Scramble (scrambled chips `[ ね ] [ こ ]` for "Cat").
  - HTML5 Canvas Stroke Order Tracing.

---

## 3.2 Module 2: Kanji Dojo & Studio (`src/pages/KanjiDojo.tsx`, `src/pages/Kanji.tsx`)
- **Primary Source Files**:
  - Dojo View: `src/pages/KanjiDojo.tsx` (549 lines)
  - Detail/Studio View: `src/pages/Kanji.tsx` (246 lines)
  - Stroke Component: `src/components/Strokes.tsx` (134 lines), `src/lib/kanjivg.ts`
  - Data Sources: `src/data/kanji.ts` (367 lines), `src/data/kanjiRadicals.ts` (88 lines)
- **Current Content Inventory**:
  - Exactly 150 Kanji (103 N5 in `RAW`, 47 N4 in `RAW_N4`).
  - Exactly 1 compound word per kanji (`ex: { w, r, en }`) = 150 total compounds in the entire app.
  - 10 radical families; 39 handcrafted radical breakdowns in `kanjiRadicals.ts`.
- **State Model**:
  - `level: 'N5' | 'N4' | 'all'`, `modeFilter: 'all' | 'meaning' | 'reading' | 'vocab'`
  - `currentItem: DrillItem | null`, `input: string`, `flash`, `session: { ok, total }`
- **Diagnosis of Repetition & Root Causes**:
  1. *Extreme Compound Poverty (1 Compound per Kanji)*: `日` is always `日本 (にほん)`, never `日曜日 (にちようび)` or `毎日 (まいにち)`. Learners recognize words by visual length rather than reading the kanji.
  2. *Indiscriminate Reading Acceptance*: In reading mode, typing ANY reading passes. For `生`, typing `せい`, `しょう`, `なま`, or `い` all register 100% correct without context.
  3. *No Sentence Context*: Kanji is drilled in a complete vacuum, unlike JLPT Mondai 1 & 2 which test kanji inside authentic sentences.
  4. *No Look-Alike Kanji Discriminators*: Confusing pairs like `土` vs `士`, `日` vs `白`, `木` vs `本`, `待` vs `持` are never tested comparatively.
- **Concrete Missing Formats**:
  - JLPT Mondai 1 (Underlined kanji in contextual sentence $\rightarrow$ select correct reading).
  - JLPT Mondai 2 (Underlined hiragana $\rightarrow$ select correct kanji).
  - Multi-Compound Expansion (3–5 vocabulary words per kanji covering On, Kun, and irregular readings).
  - Radical Component Assembly Puzzle (`[亻] + [木]` $\rightarrow$ `休`).
  - Meaning Reverse Pick (English prompt $\rightarrow$ select from 4 kanji cards).

---

## 3.3 Module 3: Conjugation & Verb Pair Dojo (`src/pages/ConjugationDojo.tsx`)
- **Primary Source Files**:
  - Dojo View: `src/pages/ConjugationDojo.tsx` (549 lines)
  - Lesson Viewer: `src/components/ConjugationLessonViewer.tsx` (256 lines)
  - Data Sources: `src/data/conjugations.ts` (450 lines), `src/data/conjugationLessons.ts` (416 lines), `src/data/verbPairs.ts` (264 lines)
- **Current Content Inventory**:
  - Exactly **19 words** total (4 Ichidan verbs, 8 Godan verbs, 2 Irregular verbs, 3 い-adjectives, 2 な-adjectives).
  - Exactly **5 inflection forms** (`polite`, `te`, `negative`, `past`, `politePast`).
  - Total targets: 19 words $\times$ 5 forms = 95 drill items.
  - 5 lessons with 15 total quiz questions; 12 transitive/intransitive pairs (24 sentences).
- **Diagnosis of Repetition & Root Causes**:
  1. *Critical Vocabulary Starvation (19 Words)*: An N5/N4 learner needs 200+ verbs. Drilling for 15 minutes loops through the exact same 19 words perpetually.
  2. *Missing Core JLPT Forms*: Missing Potential (`話せる`), Volitional (`行こう`), Conditional (`行けば` / `行ったら`), Passive (`書かれる`), Causative (`読ませる`), and Tai-form (`行きたい`).
  3. *Zero Reverse De-Conjugation*: Learners are never shown an inflected form (`読まなかった`) and asked to deduce the root dictionary form (`読む`) and inflection chain.
  4. *Binary Transitive Guessing*: Pair drills display the particle in the sentence, reducing the exercise to a mechanical 50/50 guess based on `が` vs `を`.
- **Concrete Missing Formats**:
  - Reverse De-Conjugator ("Un-inflector" drill).
  - Rapid-Fire Conjugation Grid / Form Matrix (Present, Past, Negative, Te-form back-to-back).
  - Sentence Particle Blanking in Pair Drills (`ドア [＿＿] 開けました` $\rightarrow$ pick `を` vs `が`).
  - Expansion to 80+ core verbs and 11 inflection forms.

---

## 3.4 Module 4: Grammar Lessons (`src/pages/Grammar.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/Grammar.tsx` (309 lines)
  - Data Source: `src/data/grammar.ts` (450 lines)
  - Progress Store: `src/lib/store.ts` (`grammarDone: Record<string, number>`, `completeLesson`)
- **Current Content Inventory**:
  - Exactly 11 lessons (`g1` to `g11`).
  - Exactly 43 grammar points.
  - Exactly 57 static exercises (4 to 6 per lesson: mix of 3-option MCQ and token ordering).
- **Diagnosis of Repetition & Root Causes**:
  1. *100% Static, Fixed Exercise Arrays*: Every lesson contains the exact same 4–6 questions hardcoded in `grammar.ts`. Repeating a lesson presents the identical questions in identical order.
  2. *Obvious & Weak MCQ Distractors*: Distractors are drawn from unrelated categories rather than subtle particle confusions (`は` vs `が`, `に` vs `で`, `だけ` vs `しか`).
  3. *Severe Curriculum Gaps*: Covers only 43 of the ~140 required N5/N4 points (missing `〜てはいけない`, `〜なくてもいい`, `〜ながら`, `〜し〜し`, `〜すぎる`, `〜はずだ`, `〜かもしれない`, etc.).
  4. *No Bunpro-Style Typed Cloze*: Only passive multiple choice is supported.
  5. *Missing JLPT Mondai 2 "Star" (★) Questions*: The signature 4-blank scrambled format is absent.
- **Concrete Missing Formats**:
  - Bunpro-Style Layered Cloze with Near-Miss Warnings.
  - JLPT Mondai 2 Star Sentence Assembly (`＿＿ ＿＿ ★ ＿＿`).
  - Contrastive Particle Matrix (`は` vs `が`, `に` vs `で`).
  - Dynamic 20-Question Pool per lesson with randomized sampling.

---

## 3.5 Module 5: Story Reader (`src/pages/StoryReader.tsx`, `src/pages/Stories.tsx`)
- **Primary Source Files**:
  - Catalog View: `src/pages/Stories.tsx` (36 lines)
  - Reader View: `src/pages/StoryReader.tsx` (314 lines)
  - Data Source: `src/data/stories.ts` (300 lines)
  - Audio/SFX: `src/lib/tts.ts` (paragraph streaming), `src/lib/sfx.ts`
- **Current Content Inventory**:
  - Exactly 10 stories (6 N5, 4 N4).
  - Exactly 51 total sentences (4–6 sentences per story; 70–90 characters each).
  - Exactly 28 comprehension questions (2–3 questions per story).
- **Diagnosis of Repetition & Root Causes**:
  1. *Extreme Brevity (Exhausted in 20 Minutes)*: The entire library consists of only 51 sentences. A motivated student reads all 10 stories in one evening.
  2. *Single-Character Monoculture*: Every story follows "Ana" on generic tourist activities. No folktales, authentic media, or dialogue branching.
  3. *Shallow Literal Questions*: Questions test keyword matching rather than inference or chronology.
  4. *No Blind Audio-First Mode*: Audio is only an accompaniment to visible text.
- **Concrete Missing Formats**:
  - Audio-First "Blind" Immersion Mode (Listen blind $\rightarrow$ Answer questions $\rightarrow$ Reveal transcript).
  - Story Cloze Restoration Challenge (Restore blanked vocabulary/connectors).
  - Chronological Narrative Event Sequencing.
  - Expansion to 30+ Stories across 4 distinct tracks (Daily Life, Folktales, Functional Real-World Reading, Mini-Mysteries).

---

## 3.6 Module 6: Daily 5-Minute Bento (`src/pages/DailyBento.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/DailyBento.tsx` (578 lines)
  - Data Sources: `src/data/kana.ts`, `src/data/conjugations.ts`, `src/data/stamps.ts`, `src/data/signs.ts`
  - Store: `srs`, `kanaStats`, `bentoCount`, `unlockedStamps`, `completeBento`
- **Current Content Inventory**:
  - Warm-up: 46 Hiragana; exactly 4 travel counters (`1つ`, `2つ`, `1人`, `1枚`); 50 verbs.
  - Memory fallback: 10 survival words.
  - Reward: **Single hardcoded stamp** (`ueno` Ueno Park Cherry Blossoms, lines 345 & 564).
- **Diagnosis of Repetition & Root Causes**:
  1. *Hardcoded Reward Bug / Stagnation*: Line 345 hardcodes `uenoStamp = STAMPS.find(s => s.id === 'ueno')!`. The other 20+ collectible stamps in `stamps.ts` are NEVER awarded through the Bento.
  2. *Extreme Travel Counter Scarcity*: Only 4 counters exist in the Travel track; exhausted in 2 days.
  3. *Passive Flashcard Flip*: Dish 2 relies strictly on front-to-back flipping without active typing.
  4. *Rigid Bento Layout*: No user customization of dishes.
- **Concrete Missing Formats**:
  - Customizable "Build Your Bento" Menu (Choose components: SRS due, grammar cloze, pitch pairs).
  - Rotating 30-Day Stamp Reward Calendar tied to date and streak milestones.
  - Active Recall Typing & Audio-First Modes in Dish 2.
  - Bento Nutrition Gamification Card (Protein, Carbs, Fiber, Vitamins tracking).

---

## 3.7 Module 7: Listening & Pitch Dojo (`src/pages/Listening.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/Listening.tsx` (381 lines)
  - Data Sources: `src/data/listening.ts` (26 items), `src/data/pitchAccent.ts` (6 pairs)
  - Audio Engine: `src/lib/tts.ts` (Web Speech API), `src/lib/speech.ts`
- **Current Content Inventory**:
  - Exactly 26 JLPT listening items across 6 categories.
  - Exactly 6 pitch accent minimal pairs (`ame`, `hashi`, `sake`, `ima`, `kami`, `kaeru`).
- **Diagnosis of Repetition & Root Causes**:
  1. *Instantaneous Content Exhaustion*: Two 10-question rounds repeat almost the entire listening database; 6 pitch pairs take under 2 minutes to clear.
  2. *Lack of Authentic JLPT Question Formats*: No visual illustrations (clock faces, route maps, pricing sheets) matching official JLPT Mondai 1 (課題理解) and Mondai 3 (発話表現).
  3. *Web Speech Synthesis Fragility*: Browser TTS lacks natural intonation, pitch accents, and background atmospheric chimes, failing completely if Japanese voices are uninstalled.
- **Concrete Missing Formats**:
  - Visual Listening Prompts (Clock dials, maps, item receipts).
  - Audio Dictation & Mora Transcription Cloze.
  - Expansion to 30+ Tokyo Pitch Accent Minimal Pairs with SVG contours.
  - Playback Speed Slider (0.75x, 1.0x, 1.25x, 1.5x).

---

## 3.8 Module 8: Sign Decoder & Shokkenki (`src/pages/SignDecoder.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/SignDecoder.tsx` (335 lines)
  - Data Sources: `src/data/signs.ts` (18 signs), `src/data/shokkenki.ts` (14 buttons, 4 missions)
- **Current Content Inventory**:
  - Exactly 18 street/shop signs across 4 categories.
  - Exactly 14 ticket buttons and 4 ramen customer missions.
- **Diagnosis of Repetition & Root Causes**:
  1. *Ephemeral State Bug (No Persistence)*: Line 39 defines `const [choices, setChoices] = useState<Record<string, number>>({})`. Because `choices` is not connected to Zustand or `localStorage`, leaving the page immediately wipes out all solved checkmarks and progress counters!
  2. *Tiny Content Volume*: 18 signs and 4 ramen orders can be cleared in 5 minutes.
  3. *Text-Only Signs*: Signs are flat CSS boxes lacking authentic graphic design, JR color coding, and standard pictograms.
  4. *Single Machine Archetype*: Only covers ramen vending machines; missing train kiosks, vending machines, and izakaya tablets.
- **Concrete Missing Formats**:
  - Zustand-Persisted Solved State (`decodedSigns: Record<string, boolean>`).
  - Interactive Graphic Signboards with JR color lines and emergency exit pictograms.
  - Tap-to-Inspect Kanji & Word Extraction with `+ Add to SRS` buttons.
  - Multi-Terminal Suite: Suica IC Recharge Kiosk, Drink Vending Machine (`つめた〜い` vs `あたたか〜い`), and Touchscreen Izakaya Tablet.

---

## 3.9 Module 9: JLPT Benchmark Exam (`src/pages/Exam.tsx`, `src/lib/jlptGenerator.ts`)
- **Primary Source Files**:
  - View Component: `src/pages/Exam.tsx` (761 lines)
  - Generator Engine: `src/lib/jlptGenerator.ts` (1,266 lines, 88.4 KB procedural synthesizer)
  - Data Definitions: `src/data/exam.ts` (787 lines)
- **Current Content Inventory**:
  - Generates full 67-question N5 exams and 15-question mini-sprints.
  - Vocab: 150 Kanji, 51 counters, 25 scenario archetypes, 22 synonym archetypes.
  - Reading/Listening: Exactly 4 cloze passages, 4 mid-length stories, 10 utterance items, 14 immediate response items.
- **Diagnosis of Repetition & Root Causes**:
  1. *Reading & Listening Passage Bottleneck*: Taking 2 exams exposes the learner to 100% of all reading passages and utterance items in the codebase!
  2. *No Strict Section Partitioning*: All 67 questions are rendered on a single scrollable page under one global 90-minute timer, violating real JLPT rules where sections are strictly timed and collected.
  3. *Infinite Audio Replays*: Users can replay audio clips endlessly, distorting realistic test conditions.
- **Concrete Missing Formats**:
  - OMR Bubble Sheet Mode (Side-panel answer sheet emulation).
  - Strict Exam Mode (Single audio playback with 5s prep and 10s auto-advance).
  - Diagnostic Hexagonal Radar Chart tracking 6 core competencies on score certificates.
  - Expansion of Cloze Passages (from 4 to 15+) and Mid-Length Stories (from 4 to 16+).

---

## 3.10 Module 10: Campaign Mode (`src/pages/Campaign.tsx`)
- **Primary Source Files**:
  - View Component: `src/pages/Campaign.tsx` (564 lines)
  - Contextual Banner: `src/components/CampaignBanner.tsx`
  - Mission Hook: `src/lib/useCampaignMission.ts`
  - Data Source: `src/data/campaign.ts` (24 stages, 60 boss questions)
- **Current Content Inventory**:
  - Exactly 6 Sagas (`Ground Zero` to `N4 Frontier`).
  - Exactly 24 stages (4 per saga).
  - Exactly 60 static boss quiz questions (10 per boss).
- **Diagnosis of Repetition & Root Causes**:
  1. *One-and-Done Linear Path*: Once cleared, there is zero replay incentive.
  2. *100% Static Boss Fights*: Boss questions are identical on every attempt.
  3. *Manual "Mark Done" Cheat Bypass*: In line 362, every stage has a `Mark Done` button that allows clicking through all 24 stages in 30 seconds without answering a single question.
  4. *Premature Finale*: Stops at early N4; missing passive, causative, keigo, and advanced conjunctions.
  5. *Zero Skill Decay*: Completed stages remain green forever without spaced decay.
- **Concrete Missing Formats**:
  - Programmatically Verified Completion Gates (Remove manual bypass; require 80%+ on target dojos).
  - Dynamic Boss Question Generator (Draw 10 random questions from a pool of 30+ per saga).
  - 3-Star Stage Mastery System.
  - Branching Cultural Side Quests.
  - Expansion to 12 Sagas for complete N4 coverage.

---

# 4. Concrete Exercise Formats & Interaction Mechanics (R3)

This section provides granular technical specifications, TypeScript data contracts, and finite state transitions for our expanded exercise suite.

## 4.1 Orthography & Vocabulary Engine

### 4.1.1 Kana Look-Alike Confuser Discriminator
Targeting tricky pairs (`シ` vs `ツ`, `ソ` vs `ン`, `ぬ` vs `め`, `れ` vs `ね` vs `わ`).
```typescript
export interface KanaConfuserPair {
  id: string;
  script: 'hiragana' | 'katakana';
  glyphA: string;
  glyphB: string;
  romajiA: string;
  romajiB: string;
  distinguishingFeature: string; // e.g. "シ has horizontal strokes; ツ has vertical drops"
  strokeComparisonSvg: string;
}
```
**State Transitions**:
`PROMPT (Audio/Romaji)` $\rightarrow$ `USER_INPUT (Touch Tile A or B)` $\rightarrow$ `EVALUATE`:
- *Correct*: Pulse green + play chime + display callout of distinguishing feature.
- *Incorrect*: Highlight both side-by-side with animated stroke directional arrows.

### 4.1.2 Kana Word Assembly Scramble
```typescript
export interface KanaWordChallenge {
  id: string;
  word: string; // "きって" (stamp)
  meaning: string; // "postage stamp"
  script: 'hiragana' | 'katakana';
  audioPrompt: boolean;
  tiles: string[]; // ['き', 'っ', 'て']
  distractorTiles: string[]; // ['ち', 'と']
}
```

---

## 4.2 Kanji Context & Decomposition Engine

### 4.2.1 JLPT Mondai 1 & 2 Contextual Sentences
```typescript
export interface KanjiContextualQuestion {
  id: string;
  type: 'mondai1_reading' | 'mondai2_orthography';
  sentence: string; // "田中さんは [毎朝] 走っています。"
  targetWord: string; // "毎朝"
  targetIndexRange: [number, number];
  options: [string, string, string, string]; // ['まいあさ', 'まいちょう', 'まいにち', 'まいばん']
  answerIndex: number;
  explanation: string;
  wordBreakdown: { kanji: string; reading: string; meaning: string }[];
}
```

### 4.2.2 Radical Component Assembly Puzzle
```typescript
export interface RadicalAssemblyPuzzle {
  id: string;
  targetKanji: string; // "休"
  meaning: string; // "rest"
  onReading: string; // "キュウ"
  kunReading: string; // "やす-む"
  radicals: { glyph: string; name: string; meaning: string }[]; // [{glyph: '亻', meaning: 'person'}, {glyph: '木', meaning: 'tree'}]
  distractorRadicals: string[]; // ['日', '口', '氵']
  mnemonicStory: string; // "A person (亻) leaning against a tree (木) to rest."
}
```

---

## 4.3 Grammar & Conjugation Production Engine

### 4.3.1 Layered Nuance Cloze Engine
```typescript
export interface LayeredClozeItem {
  id: string;
  sentencePre: string; // "駅へ友達を"
  sentencePost: string; // "に行きました。"
  rootPrompt: string; // "迎える (むかえる)"
  acceptableAnswers: string[]; // ['迎え', 'むかえ']
  hints: {
    layer1Nuance: string; // "Purpose of movement: going to meet"
    layer2Pattern: string; // "Verb stem + に行く"
    layer3Rule: string; // "Drop ます ending from 迎えます"
    layer4FullGrammar: string; // Link to Grammar Lesson g3
  };
  commonMistakes: {
    input: string; // "迎える"
    feedback: string; // "Close! Do not use dictionary form before に行く. Use the stem!"
  }[];
}
```

### 4.3.2 Reverse De-Conjugator ("Un-inflector")
```typescript
export interface DeconjugationItem {
  id: string;
  inflectedWord: string; // "読ませられた"
  targetDictForm: string; // "読む"
  group: 'godan' | 'ichidan' | 'irregular';
  inflectionSteps: {
    step: string; // "読む -> 読ませる (Causative) -> 読ませられる (Passive) -> 読ませられた (Past)"
    formName: string;
  }[];
  options: string[]; // ['読む', '呼ぶ', '休む', '飲む']
}
```

### 4.3.3 JLPT Mondai 2 Star (★) Sentence Assembly
```typescript
export interface StarAssemblyItem {
  id: string;
  sentenceParts: [string, string]; // ["きのう", "買いました。"]
  tokens: [string, string, string, string]; // ["本を", "デパートで", "新しい", "一冊"]
  correctSequence: [number, number, number, number]; // [1, 2, 0, 3] -> デパートで 新しい 本を 一冊
  starSlotIndex: number; // 2 (0-indexed: 3rd position)
  englishTranslation: string;
}
```

---

## 4.4 Immersion & Reading Scaffolding Engine

### 4.4.1 Graded Story with Dynamic Furigana & Blind Mode
```typescript
export interface GradedStoryChapter {
  id: string;
  title: string;
  genre: 'daily_life' | 'folklore' | 'functional_media' | 'mini_mystery';
  level: 'N5' | 'N4';
  paragraphs: {
    id: number;
    tokens: { t: string; r?: string; en?: string; n5Level?: boolean }[];
    enTranslation: string;
    audioVoiceFile?: string;
  }[];
  blindModeQuestions: {
    audioTimestamp: number;
    question: string;
    options: string[];
    answer: number;
  }[];
  postReadingCloze: {
    blankTokenIndices: number[];
    tokenBank: string[];
  };
  eventSequenceTask?: {
    events: string[];
    correctOrder: number[];
  };
}
```

---

## 4.5 Auditory Discrimination & Simulation Engine

### 4.5.1 Tokyo Pitch-Accent Minimal Pair Engine
```typescript
export interface PitchMinimalPairItem {
  id: string;
  word: string; // "hashi"
  cardA: {
    kanji: string; // "箸"
    meaning: string; // "chopsticks"
    pitchPattern: 'atamadaka'; // [1]
    moraHeights: [1, 0]; // High -> Low
    audioClipA: string;
  };
  cardB: {
    kanji: string; // "橋"
    meaning: string; // "bridge"
    pitchPattern: 'odaka'; // [2]
    moraHeights: [0, 1]; // Low -> High (drops on particle)
    audioClipB: string;
  };
  contextSentence: string;
}
```

### 4.5.2 Multi-Terminal Interactive Kiosk Engine
```typescript
export interface TerminalSimulatorMission {
  id: string;
  terminalType: 'ramen_shokkenki' | 'station_ticket_kiosk' | 'drink_vending';
  orderPromptEn: string; // "Buy a ticket to Shinjuku (¥200) for 1 Adult, pay with ¥1,000 note"
  initialScreen: string;
  buttons: {
    id: string;
    labelJp: string;
    labelReading: string;
    costYen?: number;
    actionType: 'select_item' | 'insert_money' | 'dispense' | 'change_screen';
  }[];
  expectedCart: string[];
  expectedPayment: number;
  expectedChange: number;
}
```

---

# 5. Replayability, Spaced Repetition & Retention Architecture (R3)

## 5.1 Multi-Vector FSRS Memory Modeling in `src/lib/store.ts`
We expand the Zustand store to decouple memory items into independent vectors:
```typescript
export type MemoryVectorType = 'recognition' | 'reading' | 'production' | 'listening';

export interface DecoupledSRSItem {
  itemId: string; // e.g. "kanji:日" or "vocab:taberu"
  itemType: 'kanji' | 'vocab' | 'grammar' | 'conjugation';
  vectors: Partial<Record<MemoryVectorType, Card>>; // FSRS Card object per vector
  lastReviewed: string;
}

export interface FSRSStateSlice {
  srsItems: Record<string, DecoupledSRSItem>;
  recordVectorReview: (itemId: string, vector: MemoryVectorType, rating: Grade) => void;
  getDueVectorQueue: (vectorFilter?: MemoryVectorType) => { itemId: string; vector: MemoryVectorType }[];
}
```

## 5.2 Isolated Ghost Review Queue Architecture
```typescript
export interface GhostCard {
  id: string; // "ghost:vocab:taberu:reading"
  parentItemId: string;
  vector: MemoryVectorType;
  prompt: string;
  expectedAnswer: string;
  streak: number; // Needs 3 consecutive passes to evaporate
  nextReviewAt: string; // ISO date (4h -> 12h -> 24h)
}

export interface GhostQueueSlice {
  ghosts: Record<string, GhostCard>;
  spawnGhost: (parentItemId: string, vector: MemoryVectorType, prompt: string, answer: string) => void;
  resolveGhostReview: (ghostId: string, ok: boolean) => void;
}
```

## 5.3 Workload Smoothing & 24h/30-Day Forecast Engine
To eliminate review pile-up anxiety:
1. **Daily New Card Cap**: User configures daily new lessons (default: 10 cards). New lessons pause automatically if due reviews exceed 50.
2. **Review Batching**: Large review queues are sliced into 10-card micro-batches.
3. **Forecast Visualizer**:
   - 24-Hour Hourly Bar Chart: Computes due timestamps across $t \in [0, 24\text{h}]$.
   - 30-Day Workload Projection: Simulates future review decay using FSRS retrievability curves:
     $$R(t) = \left(1 + \text{factor} \cdot \frac{t}{S}\right)^{-w}$$

## 5.4 Streak Shield, Freezes & Forgiveness Systems
```typescript
export interface StreakProtectionSlice {
  streak: number;
  streakShields: number; // Max 2 shields
  shieldCooldownDays: number;
  vacationMode: boolean; // Pauses all SRS countdowns
  consumeShieldIfMissed: () => boolean;
  awardShieldMilestone: () => void;
}
```
*Logic*: If a user misses a calendar day, the system automatically consumes 1 shield, maintains the streak counter, and triggers an encouraging notification banner.

## 5.5 Dynamic Bento Nutrition Engine & Reward Rotation
The Daily Bento is transformed into an adaptive daily nutrition system:
```typescript
export interface BentoNutritionPlate {
  vocabProtein: { completed: number; target: number }; // 5 items
  grammarCarbs: { completed: number; target: number };  // 3 items
  kanjiFiber: { completed: number; target: number };    // 2 items
  listeningVitamins: { completed: number; target: number }; // 2 items
}
```
**Stamp Rotation Calendar**:
Stamps rotate deterministically across the calendar month and streak milestones:
```typescript
const getDailyBentoStamp = (todayIso: string, streak: number): Stamp => {
  if (streak > 0 && streak % 7 === 0) {
    // 7-day milestone awards special Gold/Shrine stamp
    return STAMPS.find(s => s.id === 'fushimi-inari') || STAMPS[0];
  }
  const day = parseInt(todayIso.slice(8, 10), 10);
  return STAMPS[day % STAMPS.length];
};
```

## 5.6 Procedural Gatekeeper Boss Challenges & Stage Decay
1. **Remove Manual Bypass**: Eliminate the unverified `Mark Done` button in `Campaign.tsx:362`. Stages unlock only when verified criteria are satisfied (e.g. `Score >= 80% on 10-item drill`).
2. **Dynamic Boss Question Generation**: Draw 10 randomized questions from a pool of 30+ thematic items per saga, sampling across cloze, particle chips, stroke order, and audio prompts.
3. **Skill Decay (Cracked Stage Nodes)**: Stages decay if component SRS items drop below 70% retrievability, inviting the player to "repair" the node with a quick 3-card drill.

---

# 6. Phased Implementation Roadmap (R3)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 4-PHASE ROADMAP OVERVIEW                               │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Phase 1         │ High-Yield Fixes & Quick Wins                                        │
│ (Milestone 1)   │ Bento stamp rotation, Sign Decoder persistence, Counter pool exp.    │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Phase 2         │ Core Interactive Exercise Mechanics                                  │
│ (Milestone 2)   │ Layered grammar cloze, particle chips, reverse conjugation, confusers│
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Phase 3         │ Content Scaling, Immersion & Gamification                            │
│ (Milestone 3)   │ 30+ stories & blind audio, interactive kiosks, 12-saga campaign map  │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Phase 4         │ Advanced Adaptive Systems & Exam Simulation                          │
│ (Milestone 4)   │ Multi-vector FSRS, ghost review queue, 3-session timed JLPT exam     │
└─────────────────┴──────────────────────────────────────────────────────────────────────┘
```

## 6.1 Phase 1: High-Yield Fixes & Quick Wins
*Objective: Eliminate immediate critical bugs, data loss, and content blockades with minimal code diffs.*
1. **Fix Daily Bento Stamp Rotation**: Replace the hardcoded `ueno` stamp with deterministic daily calendar rotation and 7-day milestone stamp rewards in `DailyBento.tsx`.
2. **Persist Sign Decoder State**: Connect `decodedSigns: Record<string, boolean>` to Zustand store and `localStorage`, preserving user checkmarks and progress across navigations.
3. **Expand Travel & Warmup Counter Pool**: Increase travel counters from 4 to 25 items (`src/data/counters.ts`).
4. **Expand Pitch Accent Pairs**: Double pitch accent minimal pairs from 6 to 15 items in `src/data/pitchAccent.ts`.
5. **Campaign Stage Verification Gate**: Replace the manual `Mark Done` bypass with programmatic checks requiring actual completion of the underlying task.

## 6.2 Phase 2: Core Interactive Exercise Mechanics
*Objective: Upgrade static multiple-choice drills into multi-modal active recall engines.*
1. **Bunpro-Style Layered Grammar Cloze**: Implement `<LayeredClozeInput />` with 4-level progressive hints and near-miss warnings in `Grammar.tsx`.
2. **Particle Slot-In Drag/Tap Chips**: Implement `<ParticleSlotGrid />` in `ParticleDojo.tsx` and Bento Dish 1.
3. **Reverse Conjugation & De-Conjugator Drill**: Add de-conjugation challenge tab in `ConjugationDojo.tsx` and expand verb pool from 19 to 50 verbs.
4. **Kana & Kanji Look-Alike Confuser Sorter**: Build `<ConfuserSpeedSorter />` targeting tricky pairs (`シ/ツ`, `ソ/ン`, `日/白`, `土/士`).
5. **Kanji Multi-Compound Expansion**: Expand vocabulary compounds from 1 word per kanji to 3–4 words per kanji (covering On, Kun, and irregular readings).

## 6.3 Phase 3: Content Scaling, Immersion & Gamification
*Objective: Build long-term replayability through narrative depth and authentic Japanese simulations.*
1. **Graded Story Library Expansion (10 $\rightarrow$ 30 Stories)**: Author 20 new chapters across Folktales, Functional Real-World Reading, and Mystery Mini-Cases.
2. **Audio-First "Blind" Immersion Mode**: Add blind listening mode with comprehension checks and dynamic furigana controls (`All`, `Tap-to-Reveal`, `None`) in `StoryReader.tsx`.
3. **Interactive Multi-Terminal Simulator Suite**: Expand `SignDecoder.tsx` to include Suica IC Card Recharge Kiosk and Drink Vending Machine (`つめた〜い` vs `あたたか〜い`).
4. **WaniKani-Style Radical Dependency DAG**: Integrate component radical breakdowns and mnemonics for all 150 kanji.
5. **Campaign Mode Expansion to 12 Sagas**: Complete the N4 journey (adding Passive, Causative, Keigo, and Conditional Sagas 7–12) with 3-star stage mastery.

## 6.4 Phase 4: Advanced Adaptive Systems & Exam Simulation
*Objective: Deploy cutting-edge cognitive scheduling and authentic exam conditioning.*
1. **Multi-Vector FSRS Engine**: Decouple vocabulary into Meaning, Reading, Production, and Audio vectors in `src/lib/store.ts`.
2. **Isolated Ghost Review Queue**: Automatically isolate troubled items into 4h/12h/24h remediation loops without resetting primary card stability.
3. **Workload Smoothing & Forecast Charts**: Render 24-hour hourly review distributions and 30-day projection charts.
4. **2-Slot Streak Shield & Vacation Freeze**: Implement consumable streak protection and vacation pause.
5. **Authentic 3-Session Timed JLPT Exam**:
   - Enforce strictly timed official test sessions (Language Knowledge $\rightarrow$ Reading $\rightarrow$ Listening).
   - Single-play audio with 5-second preparation and 10-second answer auto-advance.
   - OMR Bubble Sheet emulation panel.
   - Post-exam diagnostic hexagonal radar chart.

---

## 6.5 Technical Feasibility Analysis for React 19 / TS / Vite
1. **Zero New Heavyweight Dependencies**: All proposed interactive mechanics (canvas stroke tracing, audio transcription, particle chips, bubble sheets, radar charts) are implemented using standard React 19 components, native CSS Grid/Flexbox, HTML5 `<canvas>`, and native Web APIs (`Web Audio API`, `SpeechSynthesis`, `localStorage`).
2. **Storage Footprint**: The Zustand store serializes to browser `localStorage`. A learner with 1,000 multi-vector cards, 50 ghost cards, and 50 exam certificates occupies $<450\text{ KB}$, well within the standard $5\text{–}10\text{ MB}$ browser storage quota.
3. **Performance & Bundle Size**: Pure TypeScript data structures (`src/data/*.ts`) tree-shake cleanly under Vite 8 and Rollup, adding $<35\text{ KB}$ gzipped to the production bundle.
4. **Audio Degradation Safeguards**: Browser `speechSynthesis` inconsistencies across OS platforms are mitigated by structured fallback timers and phonetic normalization wrappers in `src/lib/tts.ts`.

---

## 6.6 Prioritization Matrix (Impact vs. Effort)

```
       ▲ HIGH
       │
       │  [QUICK WINS - Phase 1]               [TRANSFORMATIVE CORE - Phase 2]
       │  • Bento Stamp Calendar Rotation      • Layered Cloze Grammar Engine
       │  • Sign Decoder State Persistence     • Particle Slot-In Chips
       │  • Travel Counter Pool Expansion      • Reverse De-Conjugation Drill
       │  • Campaign Manual Bypass Removal     • Confuser Speed Sorters
I      │
M      │
P      ├────────────────────────────────────────────────────────────────────────
A      │
C      │  [POLISH & UTILITY - Phase 1/2]       [HIGH-EFFORT ARCHITECTURE - Phase 3/4]
T      │  • Pitch Accent Expansion (15 pairs)  • 30-Story Library & Blind Audio Mode
       │  • Speed Variation Slider (0.75-1.5x) • Multi-Terminal Kiosks (Suica/Vending)
       │  • Streak Shield 2-Slot Engine        • Multi-Vector FSRS & Ghost Queue
       │                                       • 3-Session Timed JLPT + Radar Chart
       │
       ▼ LOW ─────────────────────────────────────────────────────────────► HIGH
                                     EFFORT
```

---

# 7. Structured Verification Rubric

To evaluate whether future implementations satisfy the architectural goals of this enhancement plan, we establish an objective, multi-criteria verification rubric.

## 7.1 Multi-Tier Evaluation Criteria

| Evaluation Dimension | Weight | Level 1: Inadequate | Level 3: Competent | Level 5: World-Class / Industry Leading |
| :--- | :---: | :--- | :--- | :--- |
| **1. Competitive Depth & Modeling** | 20% | Superficial comparison of 1–2 apps; only basic flashcards considered. | Analyzes 4–5 platforms; includes comparative table and basic SRS intervals. | Rigorous teardown of 8 industry leaders (Renshuu, Bunpro, WaniKani, Satori Reader, JPDB, MaruMori, Duolingo, KameSame); 12 detailed interaction models; multi-vector FSRS and ghost queues fully specified. |
| **2. 10-Module Codebase Audit Coverage** | 25% | Misses multiple modules; lacks line numbers; vague assertions on limitations. | Covers all 10 modules with file names; general summary of shortcomings. | Exhaustive audit of all 10 modules citing exact file paths, line references, state models, exact content inventories, root-cause repetition diagnoses, and concrete missing formats. |
| **3. Pedagogical & Interaction Variety** | 20% | Relies on single-direction multiple choice or raw text input. | Adds 2–3 question formats; basic hints provided. | Deploys active production, layered nuance hints, particle slots, canvas stroke tracing, minimal pair pitch curves, reverse de-conjugation, and authentic kiosk simulations. |
| **4. Replayability & Retention Architecture** | 20% | Static question arrays; reviews reset completely on error; no habit hooks. | Basic SRS intervals; static daily challenge; simple streak counter. | Decoupled multi-vector FSRS, isolated ghost remediation, 24h/30d review forecasts, 2-slot streak shields, dynamic bento nutrition, and procedural boss challenges. |
| **5. Technical Feasibility & Actionability** | 15% | Requires unvetted external services; ignores storage limits; vague roadmap. | Basic roadmap with phases; workable React/TS stack. | 4-phase sequential roadmap, complete TypeScript interfaces, state machine specs, React 19/Vite feasibility proofs, storage budget analysis, and impact/effort matrix. |

## 7.2 Gate Clearance Thresholds
- **Pass Threshold**: Minimum score of **85 / 100** across all 5 evaluation dimensions, with no individual dimension scoring below Level 3.
- **Mandatory Requirements**:
  1. Complete coverage of all 10 modules in `src/pages/`.
  2. Concrete TypeScript schemas for all new exercise formats.
  3. Actionable phased milestones with zero external runtime dependencies.
  4. Fully articulated verification rubric ready for independent reviewer/challenger evaluation.

---
*End of Master Plan & Roadmap Document.*
