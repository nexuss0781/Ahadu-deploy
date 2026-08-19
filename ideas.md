# Ahadu Deploy — Design Direction

## Three initial approaches

### Theme Name: Terminal Orchard
Very Brief Intro: A warm, editorial developer tool that pairs quiet cream surfaces with dark ink panels and a vivid deployment green. It should feel like a confident workshop for shipping software, not a generic cloud dashboard.
Probability: 0.07

### Theme Name: Atlas Control Room
Very Brief Intro: A dense, dark operations console with electric blue telemetry and technical grid cues. It communicates infrastructure control and observability.
Probability: 0.03

### Theme Name: Paper Pipeline
Very Brief Intro: A light, paper-like interface using red annotations, stamped states, and tactile cards. It makes complex deployment decisions feel inspectable and human.
Probability: 0.08

## Chosen approach: Terminal Orchard

### Design Movement
Contemporary editorial software design with Swiss information hierarchy, workshop-tool tactility, and restrained terminal references.

### Core Principles
1. Make every deployment decision inspectable: framework, confidence, entry point, and next action should be visible.
2. Use asymmetry and editorial whitespace instead of a centered SaaS template.
3. Pair warm paper surfaces with near-black terminal panels and one ownable deployment green.
4. Favor clear operational language over cloud-platform jargon.

### Color Philosophy
The interface uses warm paper (#F4F0E8) as the working surface, ink (#172019) for authority, moss deployment green (#B8F36B) for verified readiness, and rust (#C75B3C) for attention. The palette should make code feel grounded and physical while making the “ready” state unmistakable.

### Layout Paradigm
A persistent left rail anchors navigation, while the main workspace uses an asymmetric split: a broad repository intake column and a narrower “what will run” rail. Results expand downward as an inspection trail rather than a uniform card grid.

### Signature Elements
1. Moss-green status lozenges with tiny terminal prompts.
2. A dark “deployment recipe” panel with line-numbered entry-point files.
3. Thin orchard-green connector rules that visually link detected framework to generated configuration.

### Interaction Philosophy
Interactions should feel like confirming a technical diagnosis. Inputs update the inspection trail immediately, confidence labels explain why a framework was detected, and primary actions use decisive verbs such as “Inspect repository” and “Prepare deployment.” GitHub access is visible as a future phase, never simulated.

### Animation
Use short 160–240ms ease-out transitions for tabs, status updates, and panel expansion. Use a single staggered reveal for the inspection trail after analysis. Avoid perpetual motion. Respect reduced-motion preferences.

### Typography System
Use Space Grotesk for headings and labels, and IBM Plex Mono for code, metadata, and technical values. Headlines are compact and slightly tight; body text is calm and readable. Code blocks use generous line-height and visible line numbers.

### Brand Essence
Ahadu Deploy prepares ordinary repositories for Wasmer deployment by explaining exactly what it found and what will run. Personality: precise, grounded, candid.

### Brand Voice
Headlines should sound like a senior engineer making the next step obvious. CTAs should be verbs, not promises.
Example lines: “Bring a repository. Leave with a deployment recipe.” “We found the framework. Here is the file that will start it.”

### Wordmark & Logo
The mark is a small split-arrow orchard symbol: two offset chevrons forming a rising deployment path, with a square terminal cursor at the base. It must work without text and remain legible at favicon size.

### Signature Brand Color
Ahadu Moss: #B8F36B.
