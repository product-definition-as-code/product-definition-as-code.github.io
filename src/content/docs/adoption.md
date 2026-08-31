---
title: Adopt PDaC from one product decision
description: Start with structured product Markdown, then add the PDaC contracts and ProductShape checks that prevent real delivery failures.
---

Adopting Product Definition as Code (PDaC) means keeping accepted product intent in canonical, versioned Markdown above individual delivery work. Backlog items, SDD specifications, ADRs, tests, code and agent instructions consume that definition. They do not replace it.

PDaC is the methodology. [ProductShape](https://github.com/juangcarmona/productshape) is its optional reference implementation. A team can get useful agent context from structured product Markdown before installing any tool or modelling the whole product.

## Start with one decision and one delivery item

Pick a product decision that people currently repeat or interpret differently. A business rule is often the easiest first candidate. Put it in the future canonical location with a stable ID, for example `docs/product/model/business-rules/br-refund-001.md`:

```markdown
---
id: BR-REFUND-001
type: business-rule
title: Refund window
status: active
---

## Rule

Refunds are accepted within 30 days of delivery.

## Rationale

Customers need a predictable window; finance needs a bounded liability.

## Examples

A delivery on March 1 may be refunded through March 31.

## Exceptions

None.
```

Those four frontmatter fields and four body sections are all a business rule requires. Everything else, including relationships to other artefacts, is optional and can be added later.

Then:

1. Ask an accountable person to review the rule as product intent.
2. Give one real ticket, SDD specification or agent prompt the ID and file path. During refinement, have the agent compare the work item with the full rule and the relevant code, then surface contradictions and missing decisions.
3. Let the normal delivery process build and verify the item. If delivery reveals a new product decision, bring it back as a proposed definition change rather than editing the rule silently.
4. Stop after that item. Decide whether the clearer context justified maintaining the file before adding more model.

This is useful structured product Markdown, not yet a conforming PDaC repository. The stable ID, portable Markdown and reference-profile shape are the compatibility bridge: the same knowledge can enter the full contract later without being re-entered. A complete product graph is not a prerequisite for learning whether the approach helps.

## Add the capability that prevents your next failure

The capabilities are not maturity levels and do not require a configured stage. A team may use structured Markdown with an agent, follow the PDaC contract without ProductShape, add deterministic validation without an SDD integration, or add citations only to long-lived consumers.

| Failure to prevent | Capability to add | What it does not prove |
| --- | --- | --- |
| Product decisions are repeated, lost or reconstructed for every agent session | Canonical Markdown with stable IDs | That the content is correct or complete |
| Meaning changes casually and related decisions become inconsistent | The PDaC contract: typed relationships, an accepted definition and explicit Product Changes | That an accepted change was implemented, verified, released or deployed |
| Declared structure, links or citations break unnoticed | ProductShape validation, navigation, impact analysis and citation verification | That delivery work semantically agrees with the definition |
| A work item contradicts the product or code before delivery starts | Agent interpretation over the work item, accepted definition and relevant code | A readiness verdict, which remains human |

Full PDaC conformance is a contract boundary, not a level. The [specification](/spec/) defines it; ProductShape is one implementation of it.

## Follow the PDaC contract when the definition must be dependable

The contract adds stronger guarantees to the same Markdown:

- The accepted Product Definition lives under `docs/product/model` on the canonical branch. Graphs, indexes, reports and visualisations are derived.
- Stable IDs and typed relationships make declared dependencies addressable and checkable.
- `CHG-INITIAL` establishes the first accepted definition. Every later semantic evolution is proposed as a Product Change, validated against the current baseline and accepted by a human through review.
- Product Changes describe what product meaning should change. They do not prove implementation, verification, release or deployment.
- Product definition and software delivery may move at different rhythms. They may share a pull request or proceed separately without collapsing their authority.

You can implement these rules with plain files and another conforming tool. If you choose ProductShape, install it only after deciding that deterministic feedback is useful:

```bash
npm install --save-dev --save-exact @prodshape/cli@latest
npx --no-install prodshape init --dry-run
npx --no-install prodshape init --gitignore
npx --no-install prodshape change create CHG-INITIAL
```

The default `init` creates the four-file kernel, not a complete taxonomy. Put the same first file under the new change's `proposed/` directory, declare its ID in `operations.add`, then check the overlay against the current baseline:

```bash
npx --no-install prodshape change validate CHG-INITIAL
```

A human approves the product meaning. Once the change is marked `approved`, `prodshape change apply CHG-INITIAL` moves the file into `docs/product/model`, and merging that reviewed result accepts the baseline. Apply never commits and never accepts anything on its own. The [governed citation-first walkthrough](https://github.com/juangcarmona/productshape/blob/main/packages/cli/README.md#the-governed-citation-first-walkthrough) runs the whole loop end to end.

With a baseline in place, ProductShape can check and navigate what the files declare:

```bash
npx --no-install prodshape validate
npx --no-install prodshape inspect BR-REFUND-001
npx --no-install prodshape impact BR-REFUND-001
```

Validation covers schemas, IDs, declared relationships, lifecycle rules, Product Change overlays and citation states. `inspect` and `impact` expose declared structure. None of these commands reads intent like a person or an agent does.

## Add citations when a delivery dependency needs to survive change

An ID tells a consumer which rule it depends on. A citation also records the digest of the exact accepted content it used. That becomes useful when a specification, task, prompt or design will outlive the current conversation and someone must know when its product dependency changes.

For example, emit the citation for the refund rule and put the emitted record next to the text in `specs/refunds.md` that depends on it:

```bash
npx --no-install prodshape cite --id BR-REFUND-001 --file docs/product/model/business-rules/br-refund-001.md
npx --no-install prodshape citations verify specs
```

If the accepted refund rule later changes, verification reports the recorded citation as `stale` and points to the consumer that needs review. It can also report an unresolved target or a tampered embedded copy.

A current citation proves only that the declared target exists and still has the recorded content. It does not prove that `specs/refunds.md`, the work item or the implementation agrees with the rule. The agent interprets that meaning; a human decides what should change.

## Use agents for meaning, not deterministic verdicts

During work-item refinement, an agent can:

1. Read the incoming item verbatim.
2. Inspect the relevant accepted product files and implementation code.
3. Use `validate`, `inspect`, `impact` and `context` for reproducible structural evidence when ProductShape is present.
4. Separate product facts, code facts, deterministic findings and its own inferences.
5. Surface contradictions and missing decisions, ask focused questions and make a recommendation.

The human owns the readiness verdict and any decision to change the product. Ready work then enters the team's existing backlog, SDD framework or direct delivery process with the relevant product context. New meaning returns through a proposed Product Change.

This product-grounded readiness review is currently an experiment. ProductShape has no readiness command, installed readiness skill or semantic diagnostic. The bundled `refine-product` skill improves the definition itself, not incoming work. Its shipped commands provide structural evidence for the review; the agent performs the comparison.

## Choose the entry point, not a maturity path

- **Greenfield product.** Define one rule, use case or requirement from intended behaviour, then establish it through `CHG-INITIAL`. Add other artefact kinds only when the product needs them. Follow the [greenfield guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/greenfield.md).
- **Brownfield product.** Recover one decision from authorised evidence such as current documentation, tests, code and interviews. Record provenance and uncertainty, and let a person confirm it before acceptance. Follow the [brownfield guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/brownfield.md).
- **Existing OpenSpec repository.** Use current OpenSpec specifications as brownfield evidence, accept a product definition above them, then bind one current document. The shipped integration adds guidance and population-aware citation checks without taking over OpenSpec. Follow the [OpenSpec guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-openspec-repository.md).
- **Existing Spec Kit repository.** Keep the constitution and specify, plan and tasks lifecycle. Supply cited product context to one feature, then verify its current documents with the shipped integration. Follow the [Spec Kit guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-speckit-repository.md).
- **Direct agent delivery.** No SDD integration is required. Give the agent the accepted files or a `prodshape context <ID> [<ID>...]` projection, keep durable delivery artefacts in the repository and cite the product text they depend on.

For the exact files that installation adds, their ownership and safe update rules, use the [existing repository guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-repository.md).

## Keep the approval boundary visible

ProductShape checks declared structure, relationships and citations. Agents interpret product meaning and code, find suspected contradictions and surface questions. Humans decide what the product should be, approve Product Changes, decide whether work is ready and own the final verdict.

Start now with one repeated decision, one stable ID and one real delivery item. That is a complete first increment and a legitimate stopping point.
