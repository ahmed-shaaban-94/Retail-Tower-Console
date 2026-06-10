# Spec Quality Checklist — RF-4a

- [X] Scope is a single RF surface (RF-4a read: list / inspect / dismiss).
- [X] Out-of-scope is explicit (RF-4b writes; reopen / bulk-dismiss; OpenAPI edits; new deps).
- [X] Every consumed op is named and runtime-verified at the codegen pin.
- [X] Error handling specifies documented-only statuses per op (AS-5).
- [X] The 007 `forbidden` (403) 8th category is distinguished from the non-disclosing 404.
- [X] Dismiss 409 is `already_reconciled` (terminal), not a field conflict.
- [X] The read surface consumes only `ReviewQueueItem` (no `sale_context`).
- [X] Boundary gates (VG-3 generated-client-only, VG-4 no cross-op, VG-5 no frontend authz) are stated and testable.
- [X] Auth boundary (`cookieAuth` tenant-admin / store-operator) is stated.
- [X] No new runtime dependency is required.
