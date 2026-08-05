---
title: Known limits
description: What Product Definition as Code cannot claim yet, named before anyone has to discover it.
---

This page names what Product Definition as Code cannot claim yet. It exists because a
methodology about explicit, inspectable intent should apply the same standard to itself.

## Maturity

There is one implementation, ProductShape, and the specification was extracted from it. Until
an independent implementation passes a versioned conformance corpus, conformance is
self-conformance: useful regression evidence, not independent validation. There is one listed
adopter. Governance is founder-led while the work is experimental. The full picture is in the
[maturity matrix](https://github.com/product-definition-as-code/spec/blob/main/MATURITY.md).

## What the tooling cannot enforce

The rule that the definition changes only through an explicit Product Change, approved by a human and accepted through review, is enforced by branch protection and a CI validation gate. Those are repository configuration, not spec-enforceable invariants: in a repository without branch protection, a direct edit to the canonical branch followed by validation succeeds. Protecting the canonical branch is on the adopter.

Nor can the specification compel a modification to go through a Product Change in the first place. Structural validation runs against the resulting graph and has no way to ask whether a change record ever existed, so canonical model files edited directly still validate clean. Overlay validation constrains a change that exists; it cannot require one to exist. What you get is a place for the meaning of a change to live and a review boundary where a human accepts it, not a mechanism that makes bypassing it impossible.

## What the model cannot see

Structural validation proves the model is well-formed, not that it is true. The model records
accepted intent; whether that intent is implemented, deployed or verified in a named
environment is delivery evidence, which the methodology gives a place to land (citation
statuses, coverage of cited scenarios) without claiming it. A green model and a divergent
reality can coexist, and detecting that divergence is on you.

## Topology

The specification assumes the product model lives beside the code it describes. Organizations
with a dedicated model repository and many delivery repositories are not covered yet; this is
[RFC #2](https://github.com/product-definition-as-code/spec/issues/2).

## Ontology

The artifact vocabulary is a closed reference profile. Domain-specific artifact kinds and
relationships (regulated obligations, safety cases, data contracts) do not fit yet. A
namespaced profile mechanism is planned; the kernel is deliberately small and will stay small.

## AI consumption

Canonical Markdown that agents consume is also an attack surface. Digests prove content is
unchanged, not that it is safe. A threat model covering prompt injection, provenance tiers and
agent permissions is planned and does not exist today.

## Cost and applicability

Explicit models cost time to author and maintain, and semantic approval remains a human
bottleneck by design. This methodology is most likely to pay off where product behaviour spans
teams or repositories, knowledge has a long half-life, misinterpretation is expensive, agents
or rotating teams repeatedly reconstruct context, or audit evidence matters. It is least likely
to pay off for disposable prototypes, very small co-located teams, or products whose main
uncertainty is market discovery rather than delivery interpretation. If that is you, do not
adopt this; a good README and a short feedback loop will beat it.

## ROI

Unknown in general. The testable hypothesis is that reduced re-derivation, ambiguity and
untracked divergence exceed the authoring and maintenance cost for products with substantial
change, risk or coordination complexity. External pilots must establish where that threshold
lies, and their results will be published including failures.
