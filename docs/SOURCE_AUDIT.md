# P0 #4 — `source` audit for vocab attempt writes

Every code path that writes to `gaokao_user_mastery` (vocab) MUST declare an
`AttemptSource`. The RPC `record_cohort_attempt` uses it to decide whether
to clear the `hypercorrection` flag (only on `fsrs_due AND correct`).

Also: when `source === 'fsrs_due'` AND the word is in the active cohort, the
RPC remaps the `cohort_events.kind` to `'fsrs_review'` so step ⑤ progress
matches `VocabMasteryPath`'s query (`kind='fsrs_review' AND correct=true`).

## Path → source map

| File / location                                    | Mode / kind                    | source           | Notes |
| -------------------------------------------------- | ------------------------------ | ---------------- | ----- |
| `VocabMasteryPath` step ① browse                   | (no answer recorded)           | n/a              | Just sets `vocab:browsed:*` flag |
| `VocabMasteryPath` step ② form (dict)              | listen / spell                 | `cohort`         | Routed through `recordCohortAttempt` |
| `VocabMasteryPath` step ③ meaning (classic)        | en2cn / cn2en                  | `cohort`         | ↑ |
| `VocabMasteryPath` step ④ use (quest)              | cloze / pos                    | `cohort`         | ↑ |
| `VocabMasteryPath` step ⑤ master (srs)             | any kind                       | `fsrs_due`       | RPC remaps event kind → `fsrs_review` |
| `GaokaoVocab` main handleResult (`learn` modes)    | en2cn / cn2en / spell / cloze… | `cohort`         | Falls back to `free_practice` when word not in active cohort |
| `GaokaoVocab` srs handleResult (`mode: 'srs'`)     | any kind                       | `fsrs_due`       | Pulled from FSRS due queue (`due_at <= now()`) |
| `GuidedSession` mode="learn"                       | en2cn / cn2en / spell / cloze  | `cohort`         | Falls back when no cohort |
| `GuidedSession` mode="review"                      | en2cn / cn2en / spell / cloze  | `fsrs_due`       | Pulled from FSRS due pool |
| `PrimaryVocab` (all paths)                         | listen / cn2en                 | `free_practice`  | No cohort system at primary stage |
| `JuniorVocab` (all paths)                          | en2cn / spell                  | `free_practice`  | No cohort system at junior stage |
| Bento / Quest / Duel / Rush (cohort-external)      | various                        | `free_practice`  | Even if word is in cohort, NOT scheduled by FSRS |
| `ReviewToday` (mistakes book)                      | (writes `user_mistakes` only)  | n/a              | Does NOT touch `gaokao_user_mastery` — separate FSRS-lite on its own table |

## Compile-time enforcement

- `AttemptSource` is a non-optional union in `CohortAttemptOpts`.
- `CohortEventKind` is a TS union; the only legal `kind` values written to
  `gaokao_cohort_events`. `recordCohortAttempt` accepts a `QuizKind` and the
  RPC remaps to `fsrs_review` when `source='fsrs_due'`. Callers never write
  `'fsrs_review'` directly — they pass `source` and let the RPC pick.
- Direct `bumpVocabMastery(...)` calls outside `cohortProgress.ts` are
  forbidden going forward; everything routes through `recordCohortAttempt`.
  ESLint guard could be added later — for now reviewer enforces.

## Hypercorrection rule (recap)

- Cleared **only** when `source='fsrs_due' AND correct=true`.
- `cohort` answers never clear (those are step ①-④ practice).
- `free_practice` answers never clear (Bento/Quest/Duel/Rush — would
  otherwise burn the boost on a casual play).
- `ReviewToday` doesn't touch the flag because it writes to a different table.