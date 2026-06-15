# Memory Workflow: Detailed Guidelines

This document provides the operational details for the Memory Operating System (MemOS) implemented in this project.

## 1. Retrieval Strategy

### Contextual Search Queries
When using `engram_mem_search`, use the following query patterns for maximum signal:
- **For new features**: `"architecture [module name]"`, `"decision [module name]"`.
- **For bug fixes**: `"bugfix [error message or symptom]"`, `"root cause [module name]"`.
- **For refactoring**: `"pattern [component type]"`, `"convention [language]"`.

### Prioritization
- **Pinned Memories**: Always check pinned observations first as they contain the project's "Constitution" or critical constants.
- **Recent Context**: Use `engram_mem_context` to understand the "momentum" of the project (what was just finished).

## 2. Storage Strategy

### The "Durable Knowledge" Test
Before calling `engram_mem_save`, ask: *"If I were a new agent joining this project in 6 months, would this information save me 30 minutes of investigation?"*
- If YES $\rightarrow$ Store it.
- If NO $\rightarrow$ Discard it.

### Structured Entry Format
Every `mem_save` must follow the format:
- **What**: [Clear, concise description]
- **Why**: [Reasoning/Tradeoff/Constraint]
- **Where**: [Exact file paths]
- **Learned**: [The non-obvious part/the 'gotcha']

## 3. Conflict Resolution
When `engram_mem_save` returns `judgment_required=true`:
1. Analyze the candidate memories.
2. Use `engram_mem_judge` to determine the relation:
   - `supersedes`: The new memory makes the old one obsolete.
   - `conflicts_with`: The new memory contradicts the old one (requires user intervention).
   - `compatible`: Both are true but address different aspects.
   - `scoped`: The new memory is a specific case of the old one.
