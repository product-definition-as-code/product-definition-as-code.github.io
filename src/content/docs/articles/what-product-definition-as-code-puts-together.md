---
title: Where Product Definition as Code comes from
description: The engineering disciplines, standards, products and tools behind Product Definition as Code.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: '{"@context": "https://schema.org", "@type": "TechArticle", "headline": "Where Product Definition as Code comes from", "author": {"@type": "Person", "name": "Juan G. Carmona", "url": "https://jgcarmona.com"}, "datePublished": "2026-08-29", "dateModified": "2026-08-29", "publisher": {"@id": "https://pdac.dev/#org"}, "mainEntityOfPage": "https://pdac.dev/articles/what-product-definition-as-code-puts-together/"}'
---

*By Juan G. Carmona, 2026-08-29*

LLMs are industrialising specification drift.

One product decision is copied into a PRD, a delivery specification, a ticket, an ADR, an agent prompt, a test and a support guide. Agentic delivery produces and revises those copies in parallel. Implementation is faster, but so are paraphrasing, context loss and silent divergence.

Product Definition as Code (PDaC) applies established engineering disciplines to that problem. Most of its mechanics already exist in version control, requirements engineering, configuration management, product and domain modelling, traceability, architecture, verification and AI context engineering.

This article is an attribution map: where those mechanics come from, how PDaC uses them and which products already demonstrate the prior art.

![Product thinking feeds an accepted product definition through human acceptance. Delivery cites that definition and returns evidence and proposed Product Changes for human decision.](/article-assets/pdac-authority-and-learning.png)

*PDaC keeps authority moving from accepted intent to delivery while evidence and proposed changes move back for human decision.*

## The lineage at a glance

| PDaC mechanism | Main source |
| --- | --- |
| Versioned, readable product files | Git, Markdown, Docs as Code and Requirements as Code |
| Structured metadata and validation | YAML front matter, JSON Schema and CI quality gates |
| Stable identities and typed links | Requirements engineering, configuration identification and model-based traceability |
| Product vocabulary | Use-case modelling, journey mapping, the Business Rules Approach and Domain-Driven Design |
| Accepted baselines and explicit Product Changes | Configuration management, change control and pull-request review |
| Content citations and stale-reference detection | Requirements traceability, suspect-link analysis and content fingerprinting |
| Derived graphs and impact reports | Directed graphs, generated projections and change-impact analysis |
| Bounded context for agents | Context engineering, repository harnesses and human-in-the-loop workflows |

PDaC assembles these sources around an accepted product definition. Delivery still owns delivery specifications, architecture, implementation and verification. When delivery finds a false assumption or a missing decision, it proposes a Product Change. The [PDaC manifesto](/manifesto/) calls this **one-way authority, two-way learning**.

## Versioned, structured product knowledge

[Git](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control.html), Markdown and Docs as Code provide history, diffs, review and CI. [YAML front matter](https://yaml.org/spec/1.2.2/) adds machine-readable metadata without turning the document into a proprietary format. [JSON Schema](https://json-schema.org/) makes that metadata checkable.

Each product artefact has a [stable, immutable ID](/spec/identifiers/). Titles and file paths can change without breaking identity. A business rule such as `BR-REFUND-001` remains addressable from other artefacts, delivery specifications and agent instructions.

The Markdown is authoritative. Graphs, indexes, diagrams and reports are generated projections. They can be deleted and rebuilt without losing product knowledge.

## Product and domain modelling

The reference profile takes its vocabulary from use-case modelling, customer journey mapping, the Business Rules Approach and [Domain-Driven Design](https://www.domainlanguage.com/ddd/reference/), including Ubiquitous Language and Bounded Contexts.

[EventStorming](https://www.eventstorming.com/), [Context Mapping](https://contextmapper.org/), [Shape Up](https://basecamp.com/shapeup/0.3-chapter-01) and [Impact Mapping](https://www.impactmapping.org/) can inform proposed product knowledge. PDaC does not replace those discovery and shaping methods. It governs the accepted result.

![The PDaC reference profile connects actors, journeys, use cases, rules, domain knowledge, requirements and structured behaviour inside the canonical product definition.](/diagrams/pdac-2-product-definition-model.png)

*PDaC-2 shows the current reference profile and its place between Product Changes, derived views and delivery consumers. The [artefact chapter](/spec/artifacts/) is authoritative.*

The profile is a default, not the kernel. Another product vocabulary can still preserve PDaC's core contracts for identity, relationships, citations and validation.

## Change control and traceability

The Product Change workflow comes from configuration management: baselines, identified change sets, impact analysis, approval gates and immutable accepted history.

A [Product Change](/spec/product-changes/) records why the product should change, the intended outcome, affected areas, open questions and the complete proposed future state. Overlay validation applies the established practice of checking a proposed configuration before modifying the baseline. Git and pull-request review provide the acceptance boundary. The generated diff records what effectively changed.

These are different authorities:

| Authority | What it records |
| --- | --- |
| Product Change | The meaning and rationale of the proposal |
| Pull request | Review and human acceptance |
| Product diff | The effective change to the definition |

Requirements traceability provides the link from intent to downstream work. Pre-requirements traceability adds origin and rationale. Suspect-link analysis provides the rule that an upstream change puts dependent links under review. Change-impact analysis provides the affected set.

PDaC packages those techniques as a [citation contract](/spec/citation-contract/). A citation binds a consumer to an artefact ID and a SHA-256 digest of the accepted content it used.

If the refund rule changes from 30 days to 14, citations in delivery specifications, prompts or tests become stale. PDaC reports them for review. It does not propagate the new number into documents whose meaning it cannot judge.

The digest detects drift, not an attacker. It is not a signature and does not establish authenticity. Repository review, access control and signing remain responsible for that.

## Relationships, graphs and deterministic checks

[Typed relationships](/spec/relationships/) come from requirements models, domain models and graph-based traceability. They compile the Markdown into a directed product graph. The relationship type also defines impact direction. A rule governing a use case and a requirement derived from that use case do not carry the same change semantics.

The graph supports impact reports, navigation, diffs and bounded context for agents. None of those views becomes a second source of truth.

[Deterministic validation](/spec/validation/) follows the same contract-testing approach used by schemas, compilers and standards conformance suites. It checks identities, relationship targets, change overlays and citations. Stable `PRODUCT###` diagnostics and conformance cases allow independent implementations to return reproducible results.

A valid model can still describe the wrong product. Structural validation proves structure, not customer value, regulatory interpretation, implementation or outcomes.

## Delivery remains delivery

The separation between intent, design, implementation and evidence comes from requirements engineering, the V-model, [shift-left verification](https://www.sei.cmu.edu/blog/four-types-of-shift-left-testing/) and architecture practice. PDaC uses that separation rather than treating every specification as the same kind of authority.

- Architecture Decision Records, [C4](https://c4model.com/), [Structurizr](https://docs.structurizr.com/dsl) and [arc42](https://arc42.org/overview/) own technical decisions and architecture views. They can cite product drivers.
- [OpenSpec](https://github.com/Fission-AI/OpenSpec), [GitHub Spec Kit](https://github.com/github/spec-kit), [Kiro](https://kiro.dev/docs/specs/) and other Spec-Driven Development workflows own an implementation increment. They consume accepted product intent.
- [Gherkin and Cucumber](https://cucumber.io/docs/gherkin/reference/) express executable examples. Tests and delivery evidence show correspondence with a target; they do not approve the target.
- Backlogs, plans and prompts are projections or consumers. They are not the product definition.

These disciplines remain independently authoritative for their own work. PDaC provides the product references they consume.

## Agentic delivery

The agent-facing parts come from context engineering, repository harnesses, instruction files such as `AGENTS.md`, human-in-the-loop review and agent-assisted brownfield recovery.

The authority rule remains the same. Agent memory and generated briefings are derived. Brownfield recovery from code, tests, documents and interviews produces evidence-backed proposals with provenance, confidence and visible contradictions. An agent can draft or challenge a decision. It cannot accept one.

The operating split is deliberate: deterministic tools validate, AI interprets and humans decide.

## Prior art, neighbours and integration targets

The landscape is broad. These products and projects are prior art, competitors, complements or integration targets. They are not necessarily ProductShape dependencies.

| Area | Examples | Prior art used in PDaC |
| --- | --- | --- |
| Git-native requirements and linked documents | [Doorstop](https://github.com/doorstop-dev/doorstop), [StrictDoc](https://github.com/strictdoc-project/strictdoc), [Sphinx-Needs](https://sphinx-needs.readthedocs.io/) | Plain-text requirements, stable references, validation and generated views |
| Baselines, reviews and lifecycle governance | [IBM DOORS Next](https://www.ibm.com/docs/en/engineering-lifecycle-management-suite/doors-next/), [Jama Connect](https://help.jamasoftware.com/), [Polarion ALM](https://polarion.plm.automation.siemens.com/) | Baselines, controlled changes, reviews, suspect links and audit history |
| Cross-tool requirements and traceability | [OpenFastTrace](https://github.com/itsallcode/openfasttrace), [Eclipse Capra](https://projects.eclipse.org/projects/modeling.capra), [TRLC](https://github.com/bmw-software-engineering/trlc) | Typed links across heterogeneous artefacts and deterministic trace validation |
| Evidence and compliance traces | [LOBSTER](https://github.com/bmw-software-engineering/lobster), [Duvet](https://github.com/awslabs/duvet), [ReqToCode](https://arxiv.org/abs/2603.13999) | Requirement-to-code and requirement-to-test evidence kept separate from intent |
| Agentic SDD and delivery orchestration | [OpenSpec](https://github.com/Fission-AI/OpenSpec), [GitHub Spec Kit](https://github.com/github/spec-kit), [Kiro](https://kiro.dev/docs/specs/), [Tessl](https://tessl.io/), [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) | Explicit delivery specifications, structured agent context and change workflows |
| Product context and brownfield recovery | [PAELLADOC](https://paelladoc.com/), [PRD-Led Context Engineering](https://github.com/mattgierhart/PRD-driven-context-engineering), [Reversa](https://github.com/sandeco/reversa) | Persistent product context and evidence-backed recovery from existing systems |

None of these projects is reduced to one feature in practice. The table identifies the part most relevant to PDaC and makes the lineage explicit.

## Standards and interoperability

The technical contracts also build on public standards:

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) for normative language;
- [YAML 1.2](https://yaml.org/spec/1.2.2/) and [JSON Schema](https://json-schema.org/) for structured metadata and validation;
- [SHA-256](https://csrc.nist.gov/pubs/fips/180-4/upd1/final) for content fingerprints;
- [Semantic Versioning](https://semver.org/) for specification, schema and tool releases.

PDaC uses requirements-engineering vocabulary but makes no [ISO/IEC/IEEE 29148](https://www.iso.org/standard/72089.html) conformance claim. [ReqIF](https://www.omg.org/reqif/) and [OSLC](https://docs.oasis-open.org/oslc-core/oslc-core/v3.0/oslc-core-v3.0.html) are future paths for exchange and cross-tool links. [SysML v2](https://www.omg.org/sysml/SysML-2.htm) and [DMN](https://www.omg.org/dmn/) are adjacent formal models, not canonical PDaC formats.

In v0.2.0, citations resolve within one repository. Cross-repository citation resolution is still out of scope.

## How the sources are assembled

The [v0.2.0 specification](/spec/) groups the sources into three layers. The kernel combines stable identity, typed relationships, traceability, content fingerprints and deterministic validation. The reference profile combines product, domain and requirements modelling. The reference workflow combines configuration management, semantic change records, Git review and human acceptance.

![The PDaC reference workflow starts from an accepted baseline, records semantic intent in a Product Change, validates an overlay, requires human approval, applies the candidate on a working branch, sends it through pull-request review and accepts the new baseline only when a human merges it.](/article-assets/pdac-reference-workflow.png)

*Apply materialises an approved candidate on a working branch. Only the human-reviewed merge creates a new accepted baseline.*

Its main design choice is the authority boundary. Accepted product intent is upstream. Delivery cites it. Evidence returns as a proposal rather than rewriting it. That is a composition of prior art, not a claim to have invented the underlying practices.

PDaC does not discover the right product, prove implementation correctness or guarantee outcomes. It adds maintenance work, so it should earn that cost.

To assess the combination, take one real rule used by several documents or agents, give it a stable identity, cite it from delivery and change it through a Product Change. Check whether the resulting impact list finds work the team would otherwise miss.

The specification is a [public request for comments](https://github.com/product-definition-as-code/spec). Corrections to this lineage, missing prior art and concrete counterexamples are welcome.
