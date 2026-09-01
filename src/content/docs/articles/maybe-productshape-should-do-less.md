---
title: Maybe ProductShape should do less
description: ProductShape grew workflow machinery to make PDaC executable. OpenSpec has since become a capable workflow engine. This is the architecture I am about to test, not one I have shipped.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: '{"@context": "https://schema.org", "@type": "TechArticle", "headline": "Maybe ProductShape should do less", "author": {"@type": "Person", "name": "Juan G. Carmona", "url": "https://jgcarmona.com"}, "datePublished": "2026-09-01", "dateModified": "2026-09-01", "publisher": {"@id": "https://pdac.dev/#org"}, "mainEntityOfPage": "https://pdac.dev/articles/maybe-productshape-should-do-less/"}'
---

*By Juan G. Carmona, 2026-09-01*

It is surprisingly easy to invent a workflow engine while trying not to invent one.

ProductShape exists to make Product Definition as Code (PDaC) executable. PDaC is the method and semantic model: Actors, Journeys, Use Cases, Business Rules, Domain Terms, Bounded Contexts, Functional Requirements, Quality Requirements, Constraints and Structured Behaviours, with typed relationships between them. Those relationships produce a semantic graph. The accepted product definition lives in Markdown under `docs/product/model`. The graph is a projection of that Markdown, compiled on demand, not a stored artefact.

To make PDaC executable, ProductShape grew lifecycle concepts around Product Changes, validation overlays, apply, change lifecycle, handoff, SDD integration, generated AI instructions, citations and drift detection. Some of those remain uniquely PDaC semantics. Others may now overlap heavily with what the ecosystem already does.

This is a hypothesis, not a conclusion. I am going to test whether OpenSpec can own the workflow orchestration ProductShape currently performs, without weakening PDaC.

## What changed in OpenSpec

[OpenSpec](https://github.com/Fission-AI/OpenSpec) has become a configurable workflow engine rather than a fixed SDD sequence. The capabilities that matter for this proposal:

- **Custom schemas** define the artifacts a workflow produces and their dependency graph. Hari Krishnan's [OpenSpec Custom Schemas](https://intent-driven.dev/blog/2026/02/12/openspec-custom-schemas/) shows radically different workflows, from a two-artifact minimalist schema to an event-driven schema with AsyncAPI generation, coexisting through the same mechanism.
- **Per-change schema selection** ([customization docs](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md)) lets one repository hold multiple workflows. A change carries its own schema in `.openspec.yaml` metadata, so Product and Delivery can coexist without switching the repository between modes.
- **Actions, not phases** ([OPSX docs](https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md)). OpenSpec runs on an artifact dependency graph where dependencies are enablers, not gates. State is filesystem existence. The same workflow can be driven artifact-by-artifact (`continue`) or fast-forwarded (`ff`), supporting different levels of autonomy.
- **Schema-aware apply**. The customization docs describe `operations.apply.guidance` as advisory instructions for how an agent should conduct apply. This opens the question of whether Product's apply can mean "validate a PDaC delta, write it, validate the result" while Delivery's apply retains normal implementation semantics.

Two critical sources shaped the boundaries of the proposal. Birgitta Böckeler's [SDD tools critique](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) warns that one workflow does not fit all change sizes, that growing artifacts produce review overload, and that SDD tools hide implicit product analysis inside delivery work. Luis Mori's [Advanced OpenSpec](https://luismori.dev/article/advanced-openspec-expanded-workflows-custom-schemas/) gives a practical rule: use project config for better instructions, custom templates when the artifact shape needs adjusting, and a custom schema only when the process itself is different.

Product requires a custom schema because the process is different: it produces semantic deltas against a product model, not delivery specs against a system. Delivery should stay close to OpenSpec's standard `spec-driven` workflow, changing only what is necessary to consume PDaC product context.

## What ProductShape must still own

OpenSpec is not PDaC. It does not know that `UC-X --governed-by--> BR-Y`, or which product concepts are affected by changing a business rule. It has no notion of a Bounded Context or a Structured Behaviour as product-level observable knowledge.

The PDaC semantic model, and ProductShape's deterministic implementation of it, remain necessary: parsing the Markdown, checking the schema, building the graph, verifying relationships, computing impact. These are not workflow concerns. They are semantic concerns.

The [intent-driven-template](https://github.com/intent-driven-dev/intent-driven-template) repository is useful prior art for the Delivery side: custom schemas, ADR handling with supersession chains, a glossary for domain terms, executable Gherkin through `spec-as-source`. But the intent-driven approach can treat OpenSpec specs as a behavioural source of truth. For PDaC, `docs/product/model` remains the accepted source of truth for product semantics. OpenSpec delivery specs consume product semantics; they do not replace them. A PDaC Structured Behaviour is product-level knowledge. Delivery may derive tests from it, but the generated test is not the canonical Structured Behaviour.

## The architecture I want to test

```text
                 human / agentic wrapper
                           │
                ┌──────────┴──────────┐
                │                     │
          PRODUCT WORKFLOW      DELIVERY WORKFLOW
                │                     │
             OpenSpec              OpenSpec
                │                     │
        PDaC product delta        SDD workflow
                │                     │
        deterministic checks      implementation
                │                     │
                ▼                     ▼
       docs/product/model         code + tests
                │                     ▲
                └── product context ──┘
```

Product and Delivery are separate workflows because they move at different speeds and answer different review questions. A product may be refined repeatedly without implementation. Delivery may implement behaviour that is already fully defined. A change may require Product only, Delivery only, or Product then Delivery. A human, command or higher-level agent decides which to invoke and how to compose them. Forcing both through one unified adaptive workflow is exactly the failure mode Böckeler describes: review overload and implicit product analysis hidden inside SDD.

The key invariant, which PDaC exists to enforce:

> Delivery must consume the accepted product model, not a stale product proposal or whatever remains in the agent's context.

After a Product change is applied, Delivery re-reads `docs/product/model` and compiles a fresh graph from it.

OpenSpec treats `openspec/specs` as the accepted system specification. PDaC treats `docs/product/model` as the accepted product definition. These are not competing truths; they live at different levels. Product semantics flow down into selected delivery context; they are not restated inside delivery specs.

## The experiment and what would prove me wrong

The first spike implements only the Product workflow. OpenSpec owns the workflow; `@prodshape/core` performs deterministic PDaC validation before and after applying a semantic delta. The graph is compiled directly from the Markdown model, with no dependency on generated artefacts. The spike must demonstrate a change that modifies an existing product concept while preserving its stable ID and relationships. If apply just rewrites the whole model, it has not earned the word "delta".

Four questions decide whether the hypothesis holds:

1. Can OpenSpec's schema-aware apply mean "validate PDaC candidate, apply delta, validate accepted model" without forking OpenSpec?
2. Can Product changes remain true semantic deltas rather than copies of the model?
3. Can `@prodshape/core` validate OpenSpec overlays without coupling to OpenSpec internals?
4. Does this make adoption simpler, not more complex, for a normal OpenSpec project?

The proposal fails if any of these are false, or if Delivery cannot obtain focused product context without dumping the whole model into the LLM.

If the hypothesis holds, ProductShape shrinks to its deterministic core and an OpenSpec integration. OpenSpec runs the workflows. A higher-level wrapper composes them. ProductShape stops owning a lifecycle that OpenSpec already provides. If it fails, ProductShape keeps the machinery, and the experiment tells me why.

Hypothesis, not conclusion. The experiment decides.
