---
title: Adopt PDaC in your SDLC
description: Start with one product decision, then connect PDaC to OpenSpec, Spec Kit, or a coding agent working without an SDD framework.
---

Start with one product decision that is currently repeated across specifications, tickets or prompts. Give it one canonical home, cite it from delivery work, and let the citation check tell you when that decision moves.

PDaC does not require a particular Spec-Driven Development framework. Choose the path that matches the way your team already works.

## The adoption loop

The delivery tool changes. The product loop does not:

1. **Define one product decision.** Start with a business rule, requirement or use case that delivery work currently copies.
2. **Accept it through a Product Change.** A human reviews what should become true and accepts the resulting definition through merge.
3. **Cite it from delivery work.** Specifications, plans, tasks and agent prompts point to the accepted text by stable ID and content digest.
4. **Verify citations in CI.** When accepted text changes, the check names every recorded citation that needs review.
5. **Return what delivery learns.** New evidence becomes a proposed Product Change. Delivery does not silently rewrite accepted product intent.

Install the reference implementation in the repository where the Product Definition will live:

```bash
npm install --save-dev --save-exact @prodshape/cli@latest
npx prodshape init --dry-run
npx prodshape init --gitignore
```

The dry run shows every path before anything is written. The second command creates `docs/product/` and `.product/`. Your source code and existing delivery documents stay where they are.

If the product already exists, begin with [brownfield recovery](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/brownfield.md). For a new product, use the [greenfield guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/greenfield.md).

## Choose your delivery path

### OpenSpec

Keep OpenSpec's proposal, design, tasks, spec deltas and archive lifecycle. PDaC adds the accepted product definition above that workflow and verifiable citations inside its documents.

```bash
npx prodshape integration add openspec
npx prodshape citations verify --provider openspec
```

The integration adds PDaC guidance to `openspec/config.yaml` and records which OpenSpec documents must be cited or explicitly exempt. OpenSpec still owns implementation changes and their lifecycle. PDaC owns accepted product intent and the Product Changes that evolve it.

[Follow the complete OpenSpec adoption guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-openspec-repository.md).

### Spec Kit

Keep Spec Kit's constitution, templates and specify, plan and tasks lifecycle. PDaC supplies cited product context for each feature and checks that current feature documents are grounded or explicitly exempt.

```bash
npx prodshape integration add speckit
npx prodshape context BR-EXAMPLE-001 FR-EXAMPLE-001
npx prodshape citations verify --provider speckit
```

The context command renders the accepted product text with ready citations before a specify run. The integration adds grounding instructions to Spec Kit's templates and verifies each current `spec.md`, `plan.md` and `tasks.md`. Spec Kit still decides how a feature becomes a specification, plan and task set.

[Follow the complete Spec Kit adoption guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-speckit-repository.md).

### Direct agent delivery

A coding agent can consume PDaC without OpenSpec or Spec Kit. People may call this vibe coding. The useful version still starts from accepted product intent and keeps product decisions separate from implementation decisions.

Install the integration for the agent your team uses:

```bash
npx prodshape integration add codex
# or: claude
# or: copilot
```

Then use the model directly:

1. Inspect or search the relevant product artifacts.
2. Run `prodshape context <ID> [<ID>...]` to create a cited briefing.
3. Give that briefing to the coding agent with the delivery request.
4. Keep durable prompts, plans or tasks in the repository and cite the product text they depend on.
5. Run `prodshape citations verify` in CI.

The agent may draft product artifacts or Product Changes, but a person decides what becomes accepted product intent. A clean citation check proves that recorded references still match. It does not prove that the implementation is correct or that the model is complete.

[Addy Osmani's Agent Skills](https://github.com/addyosmani/agent-skills) is one optional way to add planning, testing, debugging and review workflows around direct agent delivery. PDaC and an engineering skill pack solve different problems: PDaC supplies accepted product context; the skills guide how the agent plans, builds and checks software.

## What stays human

PDaC validates structure, relationships and citation freshness. It cannot decide whether a product claim is true, choose which feature to build, approve a Product Change or prove that delivery matches the definition. Keep those decisions visible and assign them to people.

Whichever path you choose, begin with one real rule. A small, cited definition that catches one real drift is a better adoption test than a large model nobody uses.
