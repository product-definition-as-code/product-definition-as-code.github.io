---
title: The layer above Spec Kit
description: Spec Kit users asked four times for a product level above feature specs. This is that layer, installable in two commands, without asking Spec Kit to change.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: '{"@context": "https://schema.org", "@type": "TechArticle", "headline": "The layer above Spec Kit", "author": {"@type": "Person", "name": "Juan G. Carmona", "url": "https://jgcarmona.com"}, "datePublished": "2026-08-31", "dateModified": "2026-08-31", "publisher": {"@id": "https://pdac.dev/#org"}, "mainEntityOfPage": "https://pdac.dev/articles/the-layer-above-spec-kit/"}'
---

*By Juan G. Carmona, 2026-08-31*

[GitHub Spec Kit](https://github.com/github/spec-kit) turns a feature description into a specification, a plan and tasks. It is disciplined about the question it owns: how do we specify this increment of work?

Its users kept asking the question upstream of that one.

## Four requests, closed unanswered

Between 2025 and 2026, at least four Spec Kit issues asked for a product level above feature specs: [importing an existing PRD and keeping it in sync](https://github.com/github/spec-kit/issues/1527), [splitting a large PRD into multiple specs](https://github.com/github/spec-kit/issues/1116), [project-level PRD generation and status tracking](https://github.com/github/spec-kit/issues/1047) and [reversing a repository back into artefacts](https://github.com/github/spec-kit/issues/404). All four were closed as not planned.

To be precise, because precision matters here: nobody rejected the idea with a scope statement. The requests went unanswered until a bot closed them. That is weaker evidence of a deliberate boundary than a rejection would be, and stronger evidence of an unserved need: four independent users asked, and nobody built it.

I think the requests were pointing at something real. I also think building what they literally asked for would have been a mistake.

## Why the literal ask is a trap

Take the most popular request: import a PRD, decompose it into feature specs, keep everything in sync.

Importing copies the PRD. Decomposing decides how work is cut, which belongs to the team and its delivery tool, not to the tool that holds product intent. And a synced copy is exactly the thing no verifier can help with: once the rule is restated in three specs, a change to the original leaves three grammatical, plausible, silently wrong paraphrases. Prose does not have a compiler.

The [previous article](./your-software-specification-is-not-your-product-definition/) makes that argument in general. Spec Kit made it concrete: the missing layer is not a PRD importer. It is an accepted product definition that feature specs can cite instead of restating, with a deterministic way to find every citation whose meaning has moved.

## The fill, in three layers

[ProductShape](https://github.com/juangcarmona/productshape), the reference implementation of Product Definition as Code. It now ships that layer for Spec Kit. It asks nothing of Spec Kit itself: no fork, no patched commands, no change requests upstream. Three layers, from steering to enforcement.

**Citations bind.** A feature document that depends on canonical product text carries a citation: the artifact ID plus a SHA-256 digest of its accepted content. `prodshape citations verify --provider speckit` enumerates the `spec.md`, `plan.md` and `tasks.md` of every feature directory and requires each to be bound by citations or exempted by a human. Zero citations over enumerated documents is a set of failures, never a pass.

**Templates steer.** Spec Kit copies the workspace's own templates into every document it generates. The integration merges a managed Product Grounding section into those templates, so the instruction to cite instead of restate reaches the generating agent at authoring time, in the very skeleton it is filling in. `prodshape context <ID>` hands it the canonical text with the citations already attached, making the grounded path the cheapest path.

**The gate enforces.** Steering can be ignored; the gate cannot. An agent that deletes the grounding section without citing produces an unclassified document, and verification fails naming it. A citation whose target changed reports stale, with the file and line.

## Two commands

The same layer is packaged as a Spec Kit extension, installed through Spec Kit's own tooling:

```bash
specify extension catalog add https://raw.githubusercontent.com/juangcarmona/productshape/main/extensions/catalog.json --name pdac --install-allowed
specify extension add pdac
```

The extension provides `/speckit.pdac.context` and `/speckit.pdac.verify`, plus optional hooks that run verification after the specify, plan and tasks phases, so a stale or missing citation surfaces inside the session that produced it rather than later in a pipeline. Every catalog entry pins the release archive and its SHA-256 digest, which the specify CLI checks before installing. The [adoption guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-speckit-repository.md) covers the full setup, including `prodshape integration add speckit` for the template blocks and a CI example.

## The stale-citation moment

Suppose the accepted refund window changes from 30 days to 14, through an explicit, human-approved Product Change.

Every Spec Kit feature spec that cited the rule now reports a stale citation:

```text
stale   BR-REFUND-001   specs/003-checkout/spec.md:41
warning PRODUCT061 specs/003-checkout/spec.md [BR-REFUND-001]:
Citation of 'BR-REFUND-001' is stale: canonical content changed since the citation was recorded
```

That is a review list, not a verdict. The team may update the spec, or discover it never truly depended on the rule. What no longer happens is the silent version: three features shipping against three different memories of one decision.

## What this deliberately is not

There is no PRD importer. There is no feature generator. The extension and the integration have no write authority over the product model: the accepted definition changes only through a Product Change a human approves, and the verifier is read-only. Which features to cut, and how to specify them, stays with the team and Spec Kit.

That restraint is the design. The moment the product layer starts generating delivery work, it becomes another delivery tool, and the copy problem returns wearing a new badge.

## Try it against one rule

Everything above is public and runnable: the [extension](https://github.com/juangcarmona/productshape/tree/main/extensions/speckit-pdac), the [integration](https://github.com/juangcarmona/productshape), the [specification](https://github.com/product-definition-as-code/spec) and the test suite that drives a real `specify` workspace through the whole lifecycle on every commit.

If you run Spec Kit, the experiment costs an afternoon: define one real business rule, cite it from one feature spec, then change the rule and watch the citation go stale by name. If that visibility is not worth the ceremony for your product, the model is not for you, and that is a legitimate outcome. Four closed issues suggest that for some teams, it is.
