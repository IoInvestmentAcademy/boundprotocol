# Prompt — Rewrite the BND Token Economic Audit in the Whitepaper's Register

## Context for whoever runs this

The BND Token Economic Audit (`scripts/build-audit-report.mjs` → `public/bound-tokenomics-audit.html`)
is written as an inspection checklist. The Whitepaper (`public/bound-whitepaper.html`) is written as
an argument. Both describe the same protocol to the same audience. Only one of them reads like a
document an institution would circulate.

Measured difference between the two, same protocol, same reader:

| | Whitepaper | Audit |
|---|---|---|
| Prose paragraphs | 76 | **12** |
| List items | 34 | **78** |
| Share of all text sitting in bullets | 17% | **71%** |
| Words of connected prose | 5,782 | **643** |
| Avg. sentence length | 22.3 w | 23.0 w |

The sentence lengths are nearly identical. **The problem is not the sentences — it is that there
are almost none.** The audit's bullets are individually well written; they are simply 78 disconnected
assertions with no argument running through them. The reader is handed findings and left to
synthesise the analysis themselves. That is what makes it read as unfinished rather than unclear.

---

## THE PROMPT

> Rewrite the BND Token Economic Audit so that it reads in the same register as the BOUND
> Whitepaper: a continuous, argued document that an institutional allocator could read end to end.
>
> Read `public/bound-whitepaper.html` first and internalise its voice. Then rewrite the prose in
> `scripts/build-audit-report.mjs`. Do not touch the layout, the CSS, or the data pipeline.
>
> ### The register you are writing in
>
> The Whitepaper states its own standard: *"It is written to be verified, not believed."* Every
> rule below serves that sentence.
>
> 1. **Open every section with a claim, not a label.** The first sentence must assert something
>    that could be disagreed with. *"Four architectures currently compete to solve RWA liquidity,
>    and each imposes a structural cost"* — not *"This section reviews architectures."*
>
> 2. **Enumerate inside prose, not beneath it.** Where the current draft has three to six related
>    bullets, write one paragraph: a topic sentence that names the pattern, then parallel clauses
>    for each member, then a sentence saying what the set means. Semicolons carry the parallelism.
>
> 3. **Every number arrives with its interpretation attached.** Never state a figure and move on.
>    *"up to $40 million initially — roughly 2% coverage"* is the pattern: datum, then the em-dash,
>    then what the datum implies. A number the reader has to interpret alone is a number you have
>    not finished writing.
>
> 4. **Make causation explicit.** Bullets permit adjacency to stand in for logic. Prose does not.
>    Use *because*, *which means*, *so*, *at the cost of*, *the effect is*. If two findings are
>    connected, say how; if they are not, do not put them side by side.
>
> 5. **Name your abstractions.** The Whitepaper labels its concepts — *the recycling model*,
>    *coverage discipline*, *the core economic moat* — and then reuses the label. Give the audit's
>    recurring ideas the same treatment so the reader accumulates vocabulary instead of re-reading.
>
> 6. **Concede in full sentences, never in a caveat clause.** The Whitepaper's honesty is
>    structural: *"The growth is real. The liquidity is not."* State the strength completely, then
>    give the limitation its own sentence with equal weight. Never bury a weakness mid-clause.
>
> 7. **Vary the cadence deliberately.** Long analytical sentences resolve into short declarative
>    ones. The short sentence is where the judgement lands — use it for the conclusion of an
>    argument, not for a fact.
>
> 8. **No fragments.** The current draft contains sentence fragments used as descriptions
>    (*"The RWA liquid dollar."*). Every sentence gets a subject and a verb.
>
> 9. **No hedging adverbs.** Not *arguably*, *fairly*, *relatively*, *quite*. Assert, then qualify
>    in the next sentence if qualification is warranted. Hedging inside the claim reads as
>    uncertainty about the analysis; a stated limit reads as rigour.
>
> ### What bullets are still for
>
> Keep a list only when the items are genuinely non-sequential and of equal rank — a parameter
> set, a risk register, a checklist of what was tested. Target roughly the Whitepaper's ratio:
> **under 20% of the text in lists.** Everything currently bulleted that carries an argument
> becomes prose.
>
> ### Hard constraints — violating any of these fails the task
>
> - **Every figure must remain a live template expression.** The file interpolates simulator output
>   (`${sPct(ret36,0)}`, `${fUsd(usdc0)}`, `${grade}`, …). Rewrite the sentences *around* these;
>   never hard-code a number you saw in the rendered page. If a rewritten sentence needs a value
>   that has no variable, do not invent one — flag it instead.
> - **Invent no findings.** Every claim must already be supported by the existing text or by a
>   value the engine computes. This is an audit; fluency is not a licence to add analysis.
> - **Preserve all section IDs, the sidebar nav array, `.sec-head` markup, tables, and CSS classes.**
>   Prose only. The page must still build with `node scripts/build-audit-report.mjs` and render
>   identically in structure.
> - **Keep every existing caveat.** The document's credibility rests on its concessions. They may
>   be rewritten; they may not be softened or dropped.
>
> ### Worked example — the transformation expected
>
> **Before** (four bullets from the Vesting section):
>
> > • TGE circulation is 40.8M (4.08% of supply) — Public 15%, Community 5%, Treasury 5%, Marketing 5%.
> > • Community & Ecosystem is the largest bucket at 30% (300.0M), of which 45.0M is carved for staking rewards on a separate emission schedule.
> > • Team (12%) and Treasury (9%) sit behind 12-month cliffs; private rounds behind 6–12-month cliffs.
> > • Low TGE float and cliffed insiders keep early sellable supply small — the market punishes high day-one float, and this design avoids it.
>
> **After** (one paragraph, same facts, argument added):
>
> > Only 40.8M BND — 4.08% of supply — is liquid at generation, drawn from partial unlocks of the
> > Public, Community, Treasury, and Marketing allocations. Everything else is time-locked: Team and
> > Treasury sit behind twelve-month cliffs, the private rounds behind six to twelve, and Community &
> > Ecosystem, the largest bucket at 30%, releases across twenty-four months with its 45.0M staking
> > carve-out on a separate schedule. The effect is a deliberately thin day-one float. Markets punish
> > high initial circulation and this cap table is built to avoid it — at the cost of concentrating
> > the pressure at each cliff edge, where the released supply arrives all at once.
>
> Note what changed: the four findings became one argument; the cliff structure now *explains* the
> thin float rather than sitting beside it; and the final clause states the cost the bullets left
> for the reader to notice. No fact was added, removed, or altered.
>
> ### Definition of done
>
> - `node scripts/build-audit-report.mjs` runs clean and the page renders with unchanged structure.
> - Under 20% of body text sits in lists.
> - Every section opens with an assertion.
> - No fragments, no hedging adverbs, no uninterpreted figures.
> - Every number still traces to a simulator variable.
> - Read the whole thing aloud end to end. If any passage sounds like notes rather than a document,
>   it is not finished.

---

## Note on scope

The rewrite touches `scripts/build-audit-report.mjs` only — the audit's prose lives inside that
generator, not in the HTML. The HTML is a build artifact and must be regenerated, never edited
directly.
