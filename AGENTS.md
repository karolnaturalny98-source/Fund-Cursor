# Agent Instructions (Constant Rules)

These rules are global and MUST be respected in every refactor, audit or change.

---

## 1. Do NOT modify these files without explicit permission
- `components/landing/Hero.tsx`
- `globals.css`
- any file containing the comment: `DO NOT MODIFY` or `LOCKED COMPONENT`

If you think one of these files should be improved, write the suggestion in  
`agent-style-audit.md → TODO`, but DO NOT touch the file.

---

## 2. Design System (mandatory)

### 2.1 Allowed UI components
Use ONLY the following base UI components for layout and styling:
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/section.tsx`
- `components/ui/heading.tsx`
- `components/ui/text.tsx`
- (Optional) `components/ui/surface.tsx` / `border-box.tsx`

If a new visual pattern is needed →  
Create a variant inside an existing component, NOT a new component.

### 2.2 Tailwind
- Use ONLY Tailwind utilities and these UI components.
- Do NOT write custom CSS unless absolutely necessary and isolated.
- Do NOT add selectors to globals.css.

### 2.3 Forbidden patterns
- Do NOT copy button-like Tailwind classes onto non-buttons.
- Do NOT use `Button` component for non-interactive elements.
- Do NOT mix button styles with borders/surfaces/cards.

---

## 3. Safe Workflow (must follow)

### 3.1 Never refactor the entire project at once  
Work ONLY on:
- one page OR  
- one component OR  
- one specific issue type (e.g., button styles on non-buttons)

### 3.2 Before making changes
Always:
1. Read the file(s)
2. Explain your plan
3. Wait for approval (Codex CLI: full-auto still must print plan)

### 3.3 After changes
- Show diff
- Update `agent-style-audit.md`:
  - What changed
  - Why
  - Next steps / TODO

---

## 4. Special rules for inconsistent UI

When encountering inconsistent or duplicated visual patterns:
- Unify them into existing UI components
- If uncertain, ask before making the change
- NEVER guess global styles or redesign unless asked

---

## 5. If you’re unsure — STOP and ask
Whenever logic is unclear:
- halt execution
- describe the ambiguity
- propose 2–3 options
- wait for confirmation

---

## 6. Golden Rule
**Do NOT break working UI sections.  
If something looks custom and polished → assume it is intentional until told otherwise.**
