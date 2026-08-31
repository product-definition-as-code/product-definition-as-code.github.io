---
title: Adopt PDaC
description: PDaC is a method you can fit to the way you already work. Start with one product decision, then add checks only when you need them.
---

Product Definition as Code (PDaC) is a method, not a tool. It fits whatever you already use: a backlog, an SDD framework such as OpenSpec or Spec Kit, or a coding agent on its own.

The idea is small. Write down what the product means, once, in small Markdown files that people and agents can both read. Then let tickets, specs and prompts point at those files instead of restating them in their own words. Everyone then works from the same wording, agents included.

You do not have to describe the whole product, and you do not have to install anything to try it. Every kind of file has a [copy-paste template](/templates/). [ProductShape](https://github.com/juangcarmona/productshape) is the reference implementation, and it is optional. Add it when you want a tool to check the files for you.

## Start with one decision

Pick a decision people keep repeating, or keep getting slightly wrong. A business rule is usually the easiest one. Write it in a single file with an ID, in the place it will live for good, for example `docs/product/model/business-rules/br-refund-001.md`:

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

Those four frontmatter fields and four sections are all a business rule needs. Links to other files are optional and can come later. The other ten kinds have the same ready shape on the [templates page](/templates/).

Then:

1. Ask whoever owns the product to read the rule and agree that it is right.
2. Point one real ticket, spec or agent prompt at the ID and the file. Before the work starts, have the agent read the rule and the code it touches, and say where the two disagree or where a decision is missing.
3. Let your normal process build and test the item. If the work turns up a new product decision, bring it back as a proposed change to the rule instead of quietly editing it.
4. Stop there. Ask whether the clearer context was worth keeping the file, before you write any more of them.

That much is already useful. It is not yet a full PDaC repository, and it does not need to be. The ID, the plain Markdown and the file shape are what let the same knowledge move into the full method later without anyone typing it again.

## Where to start, depending on what you have

- **A new product.** Write one rule, use case or requirement from what you intend to build, starting from its [template](/templates/), then make it official through `CHG-INITIAL`. Add other kinds of file only when the product needs them. See the [greenfield guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/greenfield.md).
- **A product that already exists.** Recover one decision from what you are allowed to use: current documents, tests, code and conversations. Record where it came from and how sure you are, and let a person confirm it before it becomes official. See the [brownfield guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/brownfield.md).
- **You already use OpenSpec.** Treat your current specs as evidence, agree a product definition above them, then wire up one current document: cite the rule it depends on and let `citations verify` watch it. The integration adds guidance and citation checks without taking OpenSpec over. See the [OpenSpec guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-openspec-repository.md).
- **You already use Spec Kit.** Keep the constitution and the specify, plan and tasks lifecycle. Give one feature its product context, then check that feature's documents with the integration. See the [Spec Kit guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-speckit-repository.md).
- **You just use a coding agent.** No integration needed. Give the agent the agreed files, or a `prodshape context <ID> [<ID>...]` briefing, keep anything long-lived in the repository and cite the product text it depends on.

For the exact files an install adds, who owns them and how to update them safely, see the [existing repository guide](https://github.com/juangcarmona/productshape/blob/main/docs/adoption/existing-repository.md).

## PDaC next to Spec Kit and OpenSpec

Complements, not competitors: an SDD framework owns one implementation increment, PDaC owns the product meaning every increment reads from.

| Question | Spec Kit, OpenSpec | PDaC |
| --- | --- | --- |
| What does it own? | One implementation increment: spec, plan, tasks | The accepted product definition that outlives every increment |
| Where does shared product meaning live? | In each spec's own words, or a constitution read whole | In one file per decision, cited by stable ID and content digest |
| What happens when meaning changes? | Each document is updated by hand, or quietly drifts | One command flags every recorded citation for a person to review |

The full argument is in [The layer above Spec Kit](/articles/the-layer-above-spec-kit/); the OpenSpec and Spec Kit guides above wire the checks into an existing repository.

## Three doors, not three floors

These are not levels, and there is nothing to configure. Enter through the door that matches the failure in front of you: **write it down** (structured Markdown with stable IDs), **agree how it changes** (the PDaC rules), or **make it checkable** (ProductShape's checks). They combine in any order.

| What goes wrong | What to add | What it still does not tell you |
| --- | --- | --- |
| Every agent session rebuilds the same product decisions, or gets them slightly wrong | **Write it down**: Markdown files with stable IDs, in one agreed place | Whether what you wrote is right or complete |
| Meaning drifts because anyone can edit anything, and related decisions stop agreeing | **Agree how it changes**: the PDaC rules: typed links, an agreed definition, and changes proposed explicitly | Whether an agreed change was built, tested, released or deployed |
| A link or a citation breaks and nobody notices | **Make it checkable**: ProductShape's checks, navigation, impact analysis and citation verification | Whether the delivery work agrees with the definition |
| A ticket contradicts the product or the code before anyone starts building | An agent reading the ticket, the definition and the code together: a practice, not a door, and an experiment today | Whether the work is ready, which stays a person's call |

Full PDaC is a set of rules to meet, not a level to reach. The [specification](/spec/) says what they are, and ProductShape is one tool that implements them.

## Follow the PDaC rules when the definition has to be trusted

Same Markdown, stronger promises:

- The agreed definition lives under `docs/product/model` on your main branch. Graphs, indexes and reports are generated from it, never the other way round.
- IDs and typed links, where each link says what kind of link it is, let a tool find and check what depends on what.
- The first agreed version arrives as a change called `CHG-INITIAL`. After that, every change of meaning is proposed as a Product Change, checked against the current version, and agreed by a person in review.
- A Product Change says what the product should now mean. It does not say the work was built, tested, released or deployed.
- The definition and the delivery can move at different speeds. They can share a pull request or run apart, without either one taking over the other.

You can follow these rules with plain files and any tool that implements them. If you want ProductShape to do the checking, install it once you know you want that:

```bash
npm install --save-dev --save-exact @prodshape/cli@latest
npx --no-install prodshape init --dry-run
npx --no-install prodshape init --gitignore
npx --no-install prodshape change create CHG-INITIAL
```

`init` creates four files, not a whole folder structure. Move your first file under the new change's `proposed/` directory, list its ID under `operations.add`, then check it against what is already agreed:

```bash
npx --no-install prodshape change validate CHG-INITIAL
```

A person approves the meaning. Once the change says `approved`, `prodshape change apply CHG-INITIAL` moves the file into `docs/product/model`, and merging that reviewed result is what makes it official. Apply never commits and never agrees to anything by itself. The [governed citation-first walkthrough](https://github.com/juangcarmona/productshape/blob/main/packages/cli/README.md#the-governed-citation-first-walkthrough) runs the whole loop end to end.

With a first version in place, the tool can check and explore what the files say:

```bash
npx --no-install prodshape validate
npx --no-install prodshape inspect BR-REFUND-001
npx --no-install prodshape impact BR-REFUND-001
```

`validate` checks the file shapes, the IDs, the links you declared, the lifecycle rules, any change in flight and the state of every citation. `inspect` and `impact` show you what is connected to what. None of it reads meaning the way a person or an agent does.

## Add citations when a document has to survive the rule changing

An ID says which rule a document depends on. A citation adds a fingerprint, a content digest, of the exact words it relied on. That pays off when a spec, task, prompt or design will outlive today's conversation, and somebody later needs to know that the rule underneath it moved.

For example, produce the citation for the refund rule, then paste the result next to the sentence in `specs/refunds.md` that depends on it:

```bash
npx --no-install prodshape cite --id BR-REFUND-001 --file docs/product/model/business-rules/br-refund-001.md
npx --no-install prodshape citations verify specs
```

Change the refund rule later and the check reports that citation as `stale`, naming the file and line someone needs to look at. It also spots a citation pointing at something that is no longer there, and a copied-in quote that no longer matches the original.

A clean citation only proves that the target still exists and still says the same thing. It does not prove that `specs/refunds.md`, the ticket or the code agrees with the rule. An agent can judge that; a person decides what to do about it.

## Let agents read meaning, and tools check structure

Before work starts, an agent can:

1. Read the incoming item as written.
2. Read the product files and the code it touches.
3. Run `validate`, `inspect`, `impact` and `context` for evidence anyone can reproduce, when ProductShape is installed.
4. Keep four things apart: what the product says, what the code does, what the tool reported, and what the agent is guessing.
5. Point out contradictions and missing decisions, ask a few sharp questions, and recommend something.

The person decides whether the work is ready and whether the product should change. Ready work goes into your usual backlog, SDD framework or delivery process with the product context attached. Anything new the work reveals about the product comes back as a proposed Product Change.

This review is an experiment today, not a feature. ProductShape has no readiness command, no installed readiness skill and no check that judges meaning. The bundled `refine-product` skill improves the definition itself, not incoming work. Its commands supply the structural evidence; the agent does the reading.

## Who decides what

ProductShape checks structure, links and citations. Agents read the product and the code, spot likely contradictions and ask questions. People decide what the product should be, approve changes, decide whether work is ready, and have the last word.

Start with one repeated decision, one ID and one real ticket. That is a whole first step, and a fine place to stop.
