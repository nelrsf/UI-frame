# Project Continuity Guide

This guide outlines how to maintain a "seamless" development experience across months and years of project evolution using persistent memory.

## 1. The Continuity Chain
The continuity of the project is maintained through the **Session $\rightarrow$ Summary $\rightarrow$ Context** chain:
1. **Session**: Active work happens.
2. **Summary**: `engram_mem_session_summary` captures the "delta" of the session.
3. **Context**: The next agent loads the summary via `engram_mem_context`, instantly inheriting the previous agent's mental state.

## 2. Handling Project Evolution
As the project grows, memories can become stale. The following maintenance tasks should be performed periodically:
- **Memory Audit**: Search for `type: architecture` and verify if they still match the codebase.
- **Superseding**: Use `engram_mem_update` or `mem_judge` to mark old decisions as superseded by newer ones.
- **Pinning Updates**: Update pinned memories when core project constants (e.g., the official stack) change.

## 3. Avoiding the "Memory Wall"
To prevent the context window from being overwhelmed by irrelevant memories:
- **Precise Searching**: Avoid generic searches; use specific keywords and filters.
- **Semantic Grouping**: Use `topic_key` to group related updates into a single evolving memory rather than 10 separate observations.
- **Surgical Retrieval**: Only retrieve the specific memories needed for the current task, not the entire project history.

## 4. Onboarding New Agents
When a new agent (or a new session) starts:
1. Load `AGENTS.md` to understand the protocol.
2. Load `.engram/MEM_WORKFLOW.md` for storage rules.
3. Load `engram_mem_context` to see the recent "trail of breadcrumbs".
