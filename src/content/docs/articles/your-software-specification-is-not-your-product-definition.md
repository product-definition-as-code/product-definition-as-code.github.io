---
title: Your software specification is not your product definition
description: Delivery specifications describe work. Product Definition as Code keeps the accepted product intent that delivery work must remain aligned with.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: '{"@context": "https://schema.org", "@type": "TechArticle", "headline": "Your software specification is not your product definition", "author": {"@type": "Person", "name": "Juan G. Carmona", "url": "https://jgcarmona.com"}, "datePublished": "2026-08-23", "dateModified": "2026-08-28", "publisher": {"@id": "https://pdac.dev/#org"}, "mainEntityOfPage": "https://pdac.dev/articles/your-software-specification-is-not-your-product-definition/"}'
---

*By Juan G. Carmona, 2026-08-23*

Most software teams have plenty of specifications.

That is not the same as having a durable product definition.

A ticket describes work. A design describes a solution. An SDD document describes an implementation increment. A prompt tells an agent what to do. None of those artefacts is automatically the product definition. They are views of work performed in service of the product.

When the product changes, the distinction matters.

## The rule changes first

Take a refund window. The product accepts refunds within 30 days of delivery.

That rule appears in the checkout specification, the billing specification, a support playbook and perhaps a test fixture. At first, the copies agree. The team ships.

Later, the business changes the window to 14 days.

One document is updated. Another is missed. A third uses “one month” because somebody paraphrased the rule months ago. The documents can still look reasonable in isolation. Their prose is grammatical. Their tests may still pass. The product now has three interpretations of one decision.

Nobody necessarily made a foolish decision. The system had no durable place for the decision to live, and no relationship between the decision and the documents that copied it.

## Delivery documents have a shorter life

Delivery work needs specifications. I am not arguing for less of it.

The problem is treating a delivery document as if it were the long-lived definition of the product. Delivery documents are shaped by a particular change, team, architecture, deadline and implementation plan. Those conditions move quickly. Product intent should survive those changes, or at least change through an explicit decision.

If every consumer restates the rule, every consumer becomes another place where the rule can fork.

This is the same failure mode as duplicated code, except the compiler is missing and the copies are written in convincing English.

## The missing layer

Product Definition as Code (PDaC) is my proposal for that missing layer.

PDaC keeps the accepted product definition in versioned Markdown. The definition is made of small, related artefacts such as actors, journeys, use cases, business rules, domain terms and requirements. The relationships matter because a product decision is rarely an isolated sentence.

Delivery work cites the product definition instead of copying it. When the cited text changes, tools can identify the consumers that need a human review.

The basic relationship looks like this:

```text
accepted product intent
        │
        └── cited by → delivery specification, task, prompt or test
```

The arrow is the useful part. It says what the delivery work relied on. It does not say that the delivery work is now correct, implemented or deployed.

## What PDaC owns

PDaC owns the accepted product intent and the relationships that make it inspectable.

It gives a team a place to record what the product means, how that meaning relates to other decisions and what consumers cited when they did their work.

It does not own the backlog, the sprint, the implementation plan, the code, the deployment environment or the final truth of production. Those belong to the people and tools responsible for delivery and operation.

Product Definition as Code is the methodology. [ProductShape](https://github.com/juangcarmona/productshape) is the reference implementation. [`pdac-conformance`](https://github.com/product-definition-as-code/pdac-conformance) is the neutral conformance runner. The [PDaC specification](/spec/) defines the protocol and reference profile.

## A change becomes visible

Suppose the accepted rule changes from 30 days to 14 days.

In a PDaC repository, that change is proposed explicitly. The resulting definition can be checked before it is accepted. A consumer that cited the old text is no longer silently trusted. The citation is stale, and the team has a concrete review list.

That does not decide what the team should do. The team may update the consumer, reject the product change, or discover that the consumer was never meant to depend on that rule. The tool cannot make that decision. It can make the dependency visible before another copy becomes accepted by accident.

That is a modest claim. It is also more useful than claiming that a green validation result proves the product is correct.

## What this does not solve

PDaC does not discover the right product decision for a team.

It does not prove that the accepted definition matches customer needs. It does not prove that the code implements the definition. It does not replace product judgement, delivery specifications or operational evidence. It does not make a team maintain a model if the team has no reason to maintain one.

The model adds work. It is most useful when product behaviour crosses teams or repositories, when misunderstanding is expensive, when agents repeatedly reconstruct context or when decisions need to remain inspectable over time.

For a disposable prototype, a good README and a short feedback loop may be the better answer.

## The proposal

I am not proposing another layer of process for its own sake. I am proposing a durable home for product intent and a checkable relationship between that intent and the delivery work that relies on it.

The idea is open to criticism. The [specification](https://github.com/product-definition-as-code/spec) is public, the [reference implementation](https://github.com/juangcarmona/productshape) is public and the known limits are named on this site.

If the model is wrong, the examples and the failures should make that visible. If it is useful, the next step is not to believe the claim. It is to try one real rule and see whether the relationship survives the next change.
