# Consentext Phase 3.75 Working Prototype

Open `index.html` in a browser.

This prototype is now aligned to the March 17, 2026 internal handoff memo.
`03.17.26/Consentext_Phase_3_75_Internal_Handoff_Notes_03.17.26.docx` is the precedence source when documents overlap.

What the prototype now includes:
- A March 17 source-of-truth section that separates settled direction from open decisions
- A lane model that keeps Deterministic, Private, Private+, Max Intelligence, and Off-Board distinct
- Explicit treatment of the Private lane as a required internal protected model
- Patient-authorized clinician sharing without implying a full clinician-facing staff portal
- Adapter-ready AI gateway framing with provider-count pricing left open at 1 / 2 / 3 / 4
- A minimal internal ops console focused on audit lookup, troubleshooting, and operational visibility
- A tabbed workspace for Vault, Consent, Gateway, Ops, and Audit review
- Governed bundle previews that distinguish Private+ from Max Intelligence behavior

Recommended review path:
1. Start with the overview, control-plane split, and March 17 decisions section.
2. Review the lane cards to confirm the five-lane model and the locked Private requirement.
3. Use the workspace to switch between AI export, clinician share, and API consumer policy shapes.
4. Run gateway routing with and without broader context selected.
5. Inspect the Ops and Audit tabs to review trust events and minimal internal tooling scope.
