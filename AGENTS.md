# Project Memory Operating System (MemOS)

This project utilizes **Engram** for persistent, cross-session memory. The agent is required to operate as a continuous intelligence, treating the memory store as its long-term cognitive layer.

## 🧠 The Memory Protocol

### 1. Session Initialization (Cold Start)
At the beginning of every session, the agent MUST:
1. **Identify Project**: Call `engram_mem_current_project` to anchor the session.
2. **Load Context**: Call `engram_mem_context` to retrieve recent observations and session history.
3. **Anchor Architecture**: If starting a new feature, search for `type: architecture` memories related to the affected modules.

### 2. Task Execution Workflow
For every non-trivial task, follow this loop:

**Step A: Context Retrieval (The "Look Back")**
- Before writing code, search for relevant memories: `engram_mem_search(query="...", type="decision|architecture|bugfix")`.
- Identify: "How was this solved before?", "What constraints exist?", "What patterns are established?".

**Step B: Implementation**
- Execute the task following the retrieved constraints.

**Step C: Knowledge Capture (The "Look Forward")**
- After completing a task or resolving a bug, use `engram_mem_save`.
- **Requirement**: Use the structured format:
  - **What**: Concise description of the change.
  - **Why**: The reasoning, tradeoff, or user request.
  - **Where**: Exact files/paths affected.
  - **Learned**: Gotchas, edge cases, or "the hard way" discoveries.

**Step D: Session Wrap-up**
- Call `engram_mem_session_summary` to create a high-level map of the session for future agents.

---

## 🗂️ Memory Taxonomy & Quality Rules

### Categories
| Type | Content | Persistence Value |
|------|---------|-------------------|
| `architecture` | High-level structural choices, layer boundaries. | Permanent |
| `decision` | Tradeoffs, "Why we chose X over Y". | Permanent |
| `bugfix` | Root cause analysis + resolution of non-trivial bugs. | High |
| `pattern` | Established idioms, naming conventions, boilerplate. | High |
| `config` | Environment setup, tool configurations. | Medium |
| `learning` | General technical discoveries. | Medium |

### Quality Gates (Signal vs. Noise)
**✅ STORE ONLY:**
- Durable architectural decisions.
- Resolved root causes of complex bugs.
- Project-specific constraints (e.g., "Must use NgRx for X").
- Non-obvious technical discoveries.

**❌ NEVER STORE:**
- Build logs or transient compiler errors.
- Boilerplate code or generated snippets.
- Session "chatter" (e.g., "I am now reading the file").
- Temporary work-in-progress states.

---

## ⚡ Autonomous Behavior
The agent must be **proactive**. Memory retrieval and storage are not "optional extras"—they are core requirements of the development process. If the user does not request memory usage, the agent must still perform it internally to ensure quality and continuity.

## 🛠️ Optimization
- **Minimize Noise**: Use `topic_key` for evolving decisions to avoid duplicating memories.
- **Prioritize**: Use `engram_mem_pin` for critical project constants (e.g., the Constitution).
- **Cleanse**: Periodically review and update superseded memories using `engram_mem_update`.
