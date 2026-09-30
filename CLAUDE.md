# Rhapsodist

Rhapsodist is a collection of scripts, modules and widgets for developing expansions that run in the HISE-based Rhapsody Player from Libre Wave.

Rhapsodist provides reusable functionality and a consistent development framework for Rhapsody Player expansions.

## Purpose of This File

You are working with a HISE scripting framework, not a generic JavaScript project.

When analysing, documenting or modifying Rhapsodist, understand the framework as a connected system. Do not treat individual files as isolated pieces of code.

Prioritise explaining how Rhapsodist is used by expansion developers and how its systems interact, rather than simply describing individual functions.

Do not move, copy, replace or delete existing files unless explicitly instructed to do so.

## HISE Context

Rhapsodist is built using HISE and HISEScript.

When HISE-specific behaviour, APIs or conventions need to be understood, consult the official HISE documentation and source code:

* HISE documentation: https://docs.hise.audio/
* HISE source repository: https://github.com/christophhart/HISE/

Do not assume that standard JavaScript behaviour applies to HISEScript where HISE-specific behaviour may differ.

When uncertain about HISE behaviour, consult the HISE documentation or HISE source code rather than guessing.

Be aware that HISE scripts can execute in different contexts, including initialisation, UI callbacks and MIDI/audio processing callbacks. When documenting or modifying code, consider the execution context of the code and any relevant HISE performance constraints.

Do not make assumptions about HISE behaviour based solely on standard JavaScript conventions.

## Rhapsodist Entry Point

The entry point for using Rhapsodist in a HISE project is `Core.js`.

`Core.js` includes the essential Rhapsodist files and establishes the core functionality required by an expansion.

When analysing the framework, start with `Core.js` to understand which systems are included and how the framework is brought into a HISE project.

When analysing the complete framework, consider the order in which files are included and initialised. Identify dependencies between files where they affect how the framework operates.

## Framework Conventions

Rhapsodist uses consistent conventions for exposing functionality to expansion developers.

### Public entry points

Individual Rhapsodist scripts generally expose a single public entry point, usually a function named `create()`.

The entry point is the function that developers are expected to call directly when using the script.

Other functions in the script are normally internal implementation details. They should not be considered part of the public API unless the source code or documentation explicitly indicates otherwise.

When documenting a script:

* Identify its public entry point.
* Document its parameters, return value and behaviour.
* Treat other functions as internal.
* Document significant internal functions where they help explain how the script works.

Do not assume that every globally accessible function is intended to be called directly by an expansion developer.

### Look and Feel overrides

Look and Feel functions are a standard extension mechanism within Rhapsodist.

Some Look and Feel functions check for an externally defined function and use it as an optional override. This pattern is intentional and should be recognised when analysing scripts.

When documenting these functions, distinguish optional external overrides from ordinary internal implementation functions.

Do not require individual files to explicitly declare their Look and Feel overrides. Their role should be determined from the code.

### Module active state

When a Rhapsodist script provides a dedicated Mute button for controlling whether its module is active, the Mute button should be used as the primary mechanism for controlling the module's active state.

Do not favour the MIDI Processor's built-in bypass control when a Rhapsodist Mute button is provided.

When documenting such a script, explain the Mute button's role and how it affects the module's active state.

The MIDI Processor's built-in bypass should only be treated as the primary active-state control when the script doesn't provide its own Mute button.

### Options objects

Functions may accept an `options` object of type `JSON`.

An option being accepted but not currently used does not necessarily indicate dead code or an error. Some options are intentionally provided in advance so that functionality can be expanded in future versions while maintaining backwards compatibility with existing calls.

When analysing or documenting an `options` object:

* Distinguish between options that are currently used and options that are currently unused.
* Do not remove or recommend removing an unused option solely because it isn't currently referenced.
* Do not describe an unused option as having functionality that isn't implemented.
* If the source code or surrounding framework makes the intended future use clear, document it as reserved for future expansion.
* If the intended future use isn't clear, simply note that the option is currently unused rather than speculating about its purpose.

## File Headers

Rhapsodist scripts may contain a short header near the beginning of the file describing their purpose.

The preferred format is:

```js
/*
@name: ScriptName
@purpose: Brief description of what the script provides.
@entry: create()
*/
```

Keep these headers concise.

The header provides architectural context. It is not intended to document every function or implementation detail.

Treat the header as contextual information, but verify its claims against the source code.

Do not invent information to fill gaps in a header or source code.

## Documentation Generation

Always generate documentation in Markdown.

Documentation should be aimed at developers creating Rhapsody Player expansions.

When documenting the complete framework, use this general structure:

1. Overview
2. Architecture
3. Module breakdown
4. File-level documentation
5. Cross-file relationships
6. Usage examples

The exact structure may be adapted when necessary, but documentation should always explain both individual functionality and how the pieces work together.

### Overview

Explain:

* What Rhapsodist provides.
* Its purpose within a Rhapsody Player expansion.
* The role of `Core.js`.
* The major systems and modules within the framework.

### Architecture

Explain how the framework is organised.

Identify relevant categories such as:

* Core
* Includes
* Widgets
* Processors
* Other categories where appropriate

Do not force a file into a category if the source code doesn't support the classification.

Identify dependency relationships and, where relevant, dependency or initialisation order.

### Public API

Document the public entry point of each script in detail.

Include:

* Function signature.
* Parameters.
* Parameter types where known.
* Required and optional parameters.
* Expected values or structures.
* Return value.
* Side effects.
* Important interactions with other Rhapsodist systems.

Do not present internal functions as public API.

### Internal implementation

Document significant internal functions where they help a developer understand how the script works.

For each significant function, explain:

* Its purpose.
* What it receives.
* What it creates or changes.
* How it interacts with other functions.
* Any important implementation details or assumptions.

There is no need to document trivial implementation functions purely for completeness.

The purpose of this section is to help developers understand how the script works internally. It does not imply that these functions should be called directly.

### UI components

For every UI component created by a script, document:

* Component ID.
* Component type.
* Purpose.
* Important behaviour.
* Relevant configuration.
* Whether its state is saved with the preset.
* Important relationships with other components or Rhapsodist systems.

Do not assume that a component's state is saved with the preset. Determine this from the code and relevant HISE behaviour.

When a component is deliberately not saved with the preset, make this clear in the documentation.

When a component controls another part of the system, explain that relationship rather than simply describing the component itself.

### Look and Feel

Identify Look and Feel functions that provide optional external overrides.

For each relevant override, explain:

* What it draws or controls.
* When it is used.
* What an expansion developer can customise through the override.

### Events and communication

Document important communication mechanisms such as:

* Broadcasters.
* Listeners.
* Callbacks.
* Component refresh listeners.
* MIDI callbacks.
* Audio processing callbacks.
* Communication between Rhapsodist scripts.

Explain what triggers them and what they cause to happen.

### State and persistence

Identify important state maintained by the script.

Distinguish between:

* Runtime state.
* Component state.
* State saved with presets.
* State deliberately excluded from presets.
* State stored externally.

Do not infer persistence behaviour without evidence from the source code or HISE behaviour.

### Usage

Where useful, provide examples showing how an expansion developer would actually use the Rhapsodist functionality.

Examples should focus on realistic usage of the public API.

Do not encourage developers to call internal implementation functions.

## Cross-file Analysis

When analysing multiple files, always consider relationships between them.

Identify:

* Which scripts include or depend on other scripts.
* Which functions are called across files.
* Which objects or namespaces are shared.
* How UI components communicate with processing logic.
* How data flows between modules.
* Which scripts initialise or configure other scripts.
* How callbacks and broadcasters connect different systems.

A function's purpose should be understood in the context of the system that uses it, not only from its own implementation.

Names can provide useful signals when analysing the framework. For example:

* Namespaces often represent modules.
* Callback functions often represent behaviour entry points.
* Component references generally indicate UI functionality.
* Processor-related scripts generally contain runtime processing logic.

These are signals, not absolute rules. Confirm their meaning from the source code.

## HISE Execution Context

When analysing code, pay attention to where and when it executes.

Consider whether code runs during:

* Initialisation.
* UI interaction.
* MIDI processing.
* Audio processing.
* Other HISE callbacks or asynchronous operations.

When documenting runtime or processing code, explain any relevant performance or execution constraints.

In particular, recognise that code running in audio or MIDI processing contexts may have stricter performance requirements than code executed during initialisation or UI interaction.

Do not claim that a particular operation is unsafe or safe in a processing context without evidence from HISE behaviour, the source code or established framework conventions.

## Accuracy

Accuracy is more important than completeness.

Never invent an API, behaviour, dependency or architectural rule.

If behaviour cannot be established confidently from the source code, say so.

Distinguish between:

* Behaviour directly demonstrated by the source code.
* Behaviour inferred from the source code.
* Behaviour explicitly documented by the developer.
* Behaviour established by HISE documentation or source code.

Do not present an inference as an established fact.

When HISE-specific behaviour is involved and the Rhapsodist source code doesn't make it clear, consult the HISE documentation or HISE source repository.

If documentation and source code appear to disagree, do not silently resolve the discrepancy. Identify the discrepancy and ask the user when clarification is required.

## Documentation Style

Use clear, concise explanations.

Prefer describing intent and behaviour over simply restating implementation details.

Avoid documenting obvious code details that don't help a developer understand or use the framework.

Use consistent Rhapsodist terminology.

Clearly distinguish public API from internal implementation details.

Focus on how developers use the framework and how its systems interact.

Don't explain basic JavaScript concepts unless they're relevant to understanding Rhapsodist or HISEScript behaviour.

## Making Changes

Before modifying code, understand the existing Rhapsodist conventions and follow them.

Do not introduce new patterns when an established Rhapsodist pattern already exists.

Avoid unnecessary refactoring when making documentation-related changes.

Do not change functional behaviour unless explicitly requested.

When modifying documentation comments, preserve existing copyright and licensing information.

Do not move, copy, replace or delete existing files unless explicitly instructed to do so.

## Git Rules

Never make a commit directly to the `master` branch.

Never make a commit without first asking the user for confirmation.

Before making a commit:

1. Explain what will be committed.
2. Ask the user to confirm.
3. Create or use a separate branch for the changes.
4. Commit the changes to that branch only.

If the current branch is `master`, do not commit to it. Create an appropriate new branch first.

Do not push to `master` directly.

Permission to modify files does not imply permission to commit them.

## Working Principle

When in doubt, inspect the source code and supporting HISE documentation before making assumptions.

The Rhapsodist source code is the primary authority for Rhapsodist's behaviour.

The HISE documentation and HISE source code are the primary authorities for HISE-specific behaviour.

The goal of documentation is not merely to describe the code. It is to give an expansion developer an accurate mental model of how Rhapsodist works, how its modules relate to one another, and how they should use it.
