const recipientLabels = {
  ai_export: "AI export",
  clinician_share: "Clinician share",
  api_consumer: "API consumer"
};

const purposeLabels = {
  explanation: "Explanation",
  lifestyle_guidance: "Lifestyle guidance",
  clinician_consult: "Clinician consult",
  research_compare: "Research comparison"
};

const vaultPods = {
  biomarkers: {
    title: "Biomarkers Pod",
    description: "Structured lab values and raw report artifacts live here.",
    assets: [
      { name: "LDL / HDL timeline", detail: "Structured values normalized from uploaded lab reports." },
      { name: "Quest lipid panel PDF", detail: "Raw artifact stored for custody and broader governed review when explicitly authorized." },
      { name: "Baseline lipid profile", detail: "Derived baseline summary tied back to source VaultItems." }
    ]
  },
  wearables: {
    title: "Wearables Pod",
    description: "High-frequency device data with derived-first sharing defaults.",
    assets: [
      { name: "Sleep summary - 14 days", detail: "Derived L1 summary for AI-safe export and coach-friendly sharing." },
      { name: "HRV daily aggregates", detail: "Connector-normalized values with provenance back to raw sync items." },
      { name: "Apple Watch raw heart rate", detail: "Raw series remains available for protected internal use and broader governed review when explicitly authorized." }
    ]
  },
  records: {
    title: "Records Pod",
    description: "EHR, EMR, and PHR documents stay under stronger guardrails.",
    assets: [
      { name: "Medication list", detail: "Allowed as record data in the Vault and clinician-sharing packet, but not a launch AI guidance category." },
      { name: "Visit summary PDF", detail: "Available for clinician sharing or Max Intelligence only after explicit policy selection." },
      { name: "Discharge instructions", detail: "Raw document artifact with stronger review requirements." }
    ]
  },
  identity: {
    title: "Identity Pod",
    description: "Identifiers are minimized by default and only participate under explicit authorization.",
    assets: [
      { name: "Primary email", detail: "Explicit toggle only for broader governed context or clinician sharing." },
      { name: "Home address", detail: "Safe Harbor identifier, never part of the Private+ default route." },
      { name: "MRN linkage", detail: "Stored for custody and user-authorized clinician sharing under tighter scope." }
    ]
  },
  derived: {
    title: "Derived Context",
    description: "Deterministic summaries, baselines, and deviations power minimum-necessary sharing.",
    assets: [
      { name: "Deviation event - LDL spike", detail: "Non-diagnostic derived event within time-window constraints." },
      { name: "Baseline sleep profile", detail: "L1 reproducible summary used for guidance-oriented requests." },
      { name: "Context bundle manifest", detail: "Previewable payload summary before outbound sharing." }
    ]
  }
};

const laneMap = [
  {
    match: /trend|timeline|show|list|values|calculate/i,
    lane: "Deterministic",
    summary: "No AI is needed for this request. Structured retrieval is enough.",
    internal: true,
    privacy: 95,
    capability: 28,
    control: 96,
    outputClass: "structured_internal",
    leaves: "Nothing leaves the governed environment",
    role: "Structured trust anchor",
    phaseStatus: "Include",
    promise: "Repeatable retrieval for users who do not want AI.",
    adapterPath: "No external provider path"
  },
  {
    match: /explain|understand|summarize/i,
    lane: "Private",
    summary: "Required internal protected model handles sensitive health context without leaving Consentext.",
    internal: true,
    privacy: 90,
    capability: 55,
    control: 92,
    outputClass: "protected_internal",
    leaves: "Sensitive context stays inside Consentext",
    role: "Locked internal AI lane",
    phaseStatus: "Locked requirement",
    promise: "Internal protected model is mandatory in Phase 3.75.",
    adapterPath: "Internal protected model only"
  },
  {
    match: /lifestyle|habits|general/i,
    lane: "Private+",
    summary: "Minimum-necessary or de-identified context is prepared for governed external assistance.",
    internal: false,
    privacy: 80,
    capability: 74,
    control: 90,
    outputClass: "minimum_necessary_external",
    leaves: "Reduced or de-identified context only",
    role: "Minimum-necessary external lane",
    phaseStatus: "Include",
    promise: "Useful external assistance without broad disclosure.",
    adapterPath: "Adapter-ready base, provider count open"
  },
  {
    match: /compare|research|questions|options/i,
    lane: "Max Intelligence",
    summary: "Broader user-authorized context can move through the governed gateway for highest-capability assistance.",
    internal: false,
    privacy: 58,
    capability: 96,
    control: 76,
    outputClass: "broader_governed_external",
    leaves: "Broader user-authorized governed context",
    role: "Broader governed external lane",
    phaseStatus: "Target include unless priced out",
    promise: "Preserves freedom without forcing Off-Board behavior.",
    adapterPath: "Adapter-ready base, provider count open"
  },
  {
    match: /paste my records directly into chatgpt|directly into claude|bypass consentext|outside consentext/i,
    lane: "Off-Board",
    summary: "This action leaves Consentext protections and is no longer governed by the trust kernel.",
    internal: false,
    offboard: true,
    privacy: 20,
    capability: 100,
    control: 0,
    outputClass: "outside_protection",
    leaves: "Potentially anything the user chooses to share",
    role: "Outside Consentext protections",
    phaseStatus: "Product path, not protected lane",
    promise: "Models the real path when a user leaves Consentext.",
    adapterPath: "User chooses an external tool directly"
  }
];

const workstreams = [
  {
    title: "Data / experience layer",
    badge: "Data plane",
    status: "Existing exploration",
    description: "Vault storage, tracker dashboards, wearable ingestion, and lab or record visualizations continue in parallel.",
    focus: [
      "Vault storage + tracker portals",
      "Wearable ingestion and sync",
      "Lab schema and biomarker organization",
      "Share preview surfaces"
    ]
  },
  {
    title: "Governance architecture layer",
    badge: "Phase 3.75",
    status: "Design + prototype",
    description: "The trust kernel, consent engine, AI gateway, and audit work together to decide what leaves the vault.",
    focus: [
      "Trust boundary + consent engine",
      "Policy evaluation and de-identification",
      "AI gateway lane routing",
      "Append-only audit"
    ]
  },
  {
    title: "Clinician share and ops layer",
    badge: "Working direction",
    status: "Prototype now",
    description: "User-authorized clinician sharing and a minimal ops console should be real surfaces now, without implying a full staff portal.",
    focus: [
      "Doctor / clinic / hospital share path",
      "Audit lookup and troubleshooting",
      "Operational visibility for the internal team",
      "Staff portal remains deferred"
    ]
  },
  {
    title: "Adapter-ready integration layer",
    badge: "Architecture now",
    status: "Implementation later",
    description: "Provider adapters, EHR interfaces, and API contracts should stay modular so later builders can extend them without re-architecting.",
    focus: [
      "Gateway base plus 1 / 2 / 3 / 4 pricing",
      "Reference integration pattern still open",
      "API enforcement + recipient verification",
      "Wearable and EHR rollout later"
    ]
  }
];

const scenarioPresets = [
  {
    id: "labs-explainer",
    title: "Explain labs safely",
    badge: "Private lane",
    summary: "Show the internal protected explanation path for a straightforward health question.",
    outcome: "Internal protected model, no external provider",
    recipient: "ai_export",
    purpose: "explanation",
    duration: "24_hours",
    granularity: "derived_only",
    pods: ["biomarkers", "wearables"],
    identifiers: false,
    verified: true,
    prompt: "Explain my latest lab results in plain English",
    targetTab: "gateway",
    autoRoute: true
  },
  {
    id: "clinician-share",
    title: "Share with clinician",
    badge: "Clinician share path",
    summary: "Prepare a user-authorized packet for a doctor, clinic, or hospital without implying a full staff portal.",
    outcome: "Scoped share packet for a verified destination",
    recipient: "clinician_share",
    purpose: "clinician_consult",
    duration: "30_days",
    granularity: "derived_only",
    pods: ["biomarkers", "records", "identity"],
    identifiers: true,
    verified: true,
    prompt: null,
    targetTab: "consent",
    autoRoute: false
  },
  {
    id: "max-intelligence",
    title: "Use stronger AI reasoning",
    badge: "Max Intelligence lane",
    summary: "Show the broader governed route when the user wants deeper reasoning and explicitly authorizes more context.",
    outcome: "Broader governed context while Consentext stays in front",
    recipient: "ai_export",
    purpose: "research_compare",
    duration: "24_hours",
    granularity: "raw_if_allowed",
    pods: ["biomarkers", "wearables", "records", "identity"],
    identifiers: true,
    verified: true,
    prompt: "Compare research summaries for high LDL and list clinician questions",
    targetTab: "gateway",
    autoRoute: true
  },
  {
    id: "off-board-risk",
    title: "Show the off-board risk",
    badge: "Off-Board path",
    summary: "Demonstrate the real user exit path when someone leaves Consentext and pastes data into an outside tool directly.",
    outcome: "User leaves the protected environment",
    recipient: "ai_export",
    purpose: "lifestyle_guidance",
    duration: "one_time",
    granularity: "derived_only",
    pods: ["biomarkers", "wearables"],
    identifiers: false,
    verified: true,
    prompt: "I will paste my records directly into ChatGPT",
    targetTab: "gateway",
    autoRoute: true
  }
];

const healthMetrics = {
  ldl: { value: 142, unit: "mg/dL", target: 130, note: "Down from 154 last month.", fill: 78 },
  rhr: { value: 58, unit: " bpm", target: 60, note: "High-confidence baseline; no drift.", fill: 60 },
  sleep: { value: 7.1, unit: " h", target: 7.5, note: "Coaching target 7h 30m.", fill: 76 },
  hrv: { value: 55, unit: "", target: 60, note: "HRV trending up 8% vs last week.", fill: 68 }
};

const state = {
  shareStatus: "active",
  policyVersion: 1,
  activePolicy: null,
  audit: [],
  auditFilter: "all",
  currentRoute: null,
  opsFilter: "all",
  opsSearch: "",
  activeScenario: ""
};

const topbar = document.querySelector(".topbar");
const topNav = document.getElementById("top-nav");
const topbarToggle = document.getElementById("topbar-toggle");
const bossModeToggle = document.getElementById("boss-mode-toggle");
const themeToggle = document.getElementById("theme-toggle");
const focusModeToggle = document.getElementById("focus-mode-toggle");
const heroBossToggle = document.getElementById("hero-boss-toggle");
const presentationBossToggle = document.getElementById("presentation-boss-toggle");
const presentationThemeToggle = document.getElementById("presentation-theme-toggle");
const focusHiddenSections = document.querySelectorAll("[data-focus-hidden='true']");
const focusHiddenLinks = document.querySelectorAll("[data-focus-link='true']");
const bossHiddenSections = document.querySelectorAll("[data-boss-hidden='true']");
const bossHiddenLinks = document.querySelectorAll("[data-boss-link='true']");
const topbarStorageKey = "consentext.topbar.collapsed";
const focusModeStorageKey = "consentext.focusmode.enabled";
const bossModeStorageKey = "consentext.bossmode.enabled";
const themeStorageKey = "consentext.theme.enterprise_light";
const pageRouteDefinitions = {
  overview: {
    kicker: "Page 1 of 4",
    title: "Overview",
    description: "Start with the system boundary, launch scope, and the shortest accurate framing of Consentext before you drill into the deeper technical surfaces."
  },
  walkthrough: {
    kicker: "Page 2 of 4",
    title: "Walkthrough",
    description: "Use the narrated review, presentation controls, and downloadable review assets when you want the architecture story presented cleanly without opening the full workspace first."
  },
  architecture: {
    kicker: "Page 3 of 4",
    title: "Architecture",
    description: "Inspect the control-plane split, open decisions, lane semantics, trust flow, glossary terms, and workstreams as a dedicated technical page instead of one long scroll."
  },
  workspace: {
    kicker: "Page 4 of 4",
    title: "Workspace",
    description: "Move into the live prototype controls, scenario presets, audit proof, handoff view, and export surfaces when you want to review behavior instead of only reading summaries."
  }
};
const pageRouteSections = document.querySelectorAll("[data-page-routes]");
const pageNavLinks = document.querySelectorAll("[data-page-nav]");
const pageRouteCards = document.querySelectorAll("[data-page-link]");
const pageRouteKicker = document.getElementById("page-route-kicker");
const pageRouteTitle = document.getElementById("page-route-title");
const pageRouteDescription = document.getElementById("page-route-description");

const podButtons = document.querySelectorAll(".pod-button");
const podTitle = document.getElementById("pod-title");
const podDescription = document.getElementById("pod-description");
const assetList = document.getElementById("asset-list");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const filterChips = document.querySelectorAll(".filter-chip");

const recipientType = document.getElementById("recipient-type");
const purpose = document.getElementById("purpose");
const duration = document.getElementById("duration");
const granularity = document.getElementById("granularity");
const scopeBiomarkers = document.getElementById("scope-biomarkers");
const scopeWearables = document.getElementById("scope-wearables");
const scopeRecords = document.getElementById("scope-records");
const scopeIdentity = document.getElementById("scope-identity");
const identifiersToggle = document.getElementById("identifiers-toggle");
const recipientVerified = document.getElementById("recipient-verified");
const guardrailList = document.getElementById("guardrail-list");
const policyJson = document.getElementById("policy-json");
const policyChips = document.getElementById("policy-chips");
const applyPolicy = document.getElementById("apply-policy");
const revokeShare = document.getElementById("revoke-share");

const promptSelect = document.getElementById("prompt-select");
const runRoute = document.getElementById("run-route");
const routeLane = document.getElementById("route-lane");
const routeSummary = document.getElementById("route-summary");
const routeStatus = document.getElementById("route-status");
const routeIncluded = document.getElementById("route-included");
const routeBlocked = document.getElementById("route-blocked");
const routeSource = document.getElementById("route-source");
const routeJson = document.getElementById("route-json");

const heroLane = document.getElementById("hero-lane");
const heroSummary = document.getElementById("hero-summary");
const heroStatus = document.getElementById("hero-status");
const heroPrompt = document.getElementById("hero-prompt");
const heroAllowedCount = document.getElementById("hero-allowed-count");
const heroBlockedCount = document.getElementById("hero-blocked-count");
const heroOutputClass = document.getElementById("hero-output-class");
const meterPrivacy = document.getElementById("meter-privacy");
const meterCapability = document.getElementById("meter-capability");
const meterControl = document.getElementById("meter-control");

const apiPod = document.getElementById("api-pod");
const apiScope = document.getElementById("api-scope");
const runApi = document.getElementById("run-api");
const apiDecision = document.getElementById("api-decision");
const apiStatus = document.getElementById("api-status");
const apiReason = document.getElementById("api-reason");

const auditFeed = document.getElementById("audit-feed");
const metricLdl = document.getElementById("metric-ldl");
const metricRhr = document.getElementById("metric-rhr");
const metricSleep = document.getElementById("metric-sleep");
const metricHrv = document.getElementById("metric-hrv");
const metricLdlBar = document.getElementById("metric-ldl-bar");
const metricRhrBar = document.getElementById("metric-rhr-bar");
const metricSleepBar = document.getElementById("metric-sleep-bar");
const metricHrvBar = document.getElementById("metric-hrv-bar");
const metricLdlNote = document.getElementById("metric-ldl-note");
const metricRhrNote = document.getElementById("metric-rhr-note");
const metricSleepNote = document.getElementById("metric-sleep-note");
const metricHrvNote = document.getElementById("metric-hrv-note");
const timelineList = document.getElementById("timeline-list");
const podsTableBody = document.getElementById("pods-table");
const laneCardsContainer = document.getElementById("lane-cards");
const laneName = document.getElementById("lane-name");
const laneSummaryText = document.getElementById("lane-summary");
const lanePrivacyBar = document.getElementById("lane-privacy-bar");
const laneCapabilityBar = document.getElementById("lane-capability-bar");
const laneControlBar = document.getElementById("lane-control-bar");
const lanePrivacyLabel = document.getElementById("lane-privacy-label");
const laneCapabilityLabel = document.getElementById("lane-capability-label");
const laneControlLabel = document.getElementById("lane-control-label");
const laneStatusListEl = document.getElementById("lane-status-list");
const workstreamGrid = document.getElementById("workstream-grid");
const scenarioGrid = document.getElementById("scenario-grid");
const laneComparisonGrid = document.getElementById("lane-comparison-grid");
const statusPolicyId = document.getElementById("status-policy-id");
const statusShare = document.getElementById("status-share");
const statusRecipient = document.getElementById("status-recipient");
const statusLane = document.getElementById("status-lane");
const statusAuditCount = document.getElementById("status-audit-count");
const opsLastEvent = document.getElementById("ops-last-event");
const opsShareState = document.getElementById("ops-share-state");
const opsRecipientMode = document.getElementById("ops-recipient-mode");
const opsProviderMode = document.getElementById("ops-provider-mode");
const opsLastLane = document.getElementById("ops-last-lane");
const opsOpenRisks = document.getElementById("ops-open-risks");
const opsLastSummary = document.getElementById("ops-last-summary");
const opsHealthShare = document.getElementById("ops-health-share");
const opsHealthShareNote = document.getElementById("ops-health-share-note");
const opsHealthGateway = document.getElementById("ops-health-gateway");
const opsHealthGatewayNote = document.getElementById("ops-health-gateway-note");
const opsHealthAudit = document.getElementById("ops-health-audit");
const opsHealthAuditNote = document.getElementById("ops-health-audit-note");
const opsSearch = document.getElementById("ops-search");
const opsFilterChips = document.querySelectorAll(".ops-filter-chip");
const opsEventList = document.getElementById("ops-event-list");
const trustPolicyId = document.getElementById("trust-policy-id");
const trustPolicySummary = document.getElementById("trust-policy-summary");
const trustRecipientMode = document.getElementById("trust-recipient-mode");
const trustFlowLane = document.getElementById("trust-flow-lane");
const trustFlowLaneSummary = document.getElementById("trust-flow-lane-summary");
const trustFlowGateway = document.getElementById("trust-flow-gateway");
const trustFlowGatewaySummary = document.getElementById("trust-flow-gateway-summary");
const trustFlowProof = document.getElementById("trust-flow-proof");
const trustFlowProofSummary = document.getElementById("trust-flow-proof-summary");
const trustLastProof = document.getElementById("trust-last-proof");
const trustLastProofNote = document.getElementById("trust-last-proof-note");
const themeStatus = document.getElementById("theme-status");
const printBrief = document.getElementById("print-brief");
const downloadPolicy = document.getElementById("download-policy");
const downloadAudit = document.getElementById("download-audit");
const downloadClinicianPacket = document.getElementById("download-clinician-packet");
const artifactPolicyPreview = document.getElementById("artifact-policy-preview");
const auditSummaryPreview = document.getElementById("audit-summary-preview");
const clinicianPacketPreview = document.getElementById("clinician-packet-preview");

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function classifyAction(action) {
  if (action.includes("off_board")) return "offboard";
  if (action.includes("denied") || action.includes("failed")) return "deny";
  if (action.includes("policy") || action.includes("share") || action.includes("verification")) return "policy";
  return "allow";
}

function buildPolicyNarrative(policy) {
  if (!policy) return "No active policy is loaded yet.";
  if (policy.recipient_type === "clinician_share") {
    return `User-authorized clinician sharing is scoped for ${purposeLabels[policy.purpose] || policy.purpose} across ${policy.pod_types.join(", ")}.`;
  }
  if (policy.recipient_type === "api_consumer") {
    return `API consumer access is governed by verification checks and the current share scope across ${policy.pod_types.join(", ")}.`;
  }
  return `AI export is governed as ${policy.deidentify_by_default ? "minimum-necessary by default" : "broader authorized"} across ${policy.pod_types.join(", ")}.`;
}

function buildAuditSummary() {
  const latestEvents = state.audit.slice(0, 6).map((entry) => ({
    time: entry.time,
    action: entry.action,
    kind: entry.kind,
    summary: entry.summary
  }));

  return {
    generated_at: new Date().toISOString(),
    active_policy: state.activePolicy ? state.activePolicy.policy_id : "none",
    share_state: state.shareStatus,
    current_lane: state.currentRoute ? state.currentRoute.lane : "pending",
    event_count: state.audit.length,
    recent_risks: latestEvents.filter((entry) => ["deny", "offboard"].includes(entry.kind)).length,
    events: latestEvents
  };
}

function buildClinicianPacket() {
  const policy = state.activePolicy || computeEffectivePolicy().policy;
  const podSummaries = policy.pod_types.map((pod) => {
    const source = vaultPods[pod];
    return {
      pod,
      label: source ? source.title : pod,
      highlights: source ? source.assets.slice(0, 2).map((asset) => asset.name) : []
    };
  });

  return {
    packet_id: `clinician-packet-${policy.policy_id}`,
    readiness: policy.recipient_type === "clinician_share" ? "user_authorized_share_ready" : "preview_only_not_clinician_mode",
    destination_type: policy.recipient_type === "clinician_share" ? "doctor_clinic_or_hospital" : recipientLabels[policy.recipient_type],
    purpose: purposeLabels[policy.purpose] || policy.purpose,
    duration: policy.duration,
    destination_verified: policy.recipient_verified,
    identifiers_included: policy.identifiers_included,
    notes: policy.recipient_type === "clinician_share"
      ? "This preview models a user-authorized packet for a verified clinician destination."
      : "Switch recipient type to clinician share for a fully aligned packet preview.",
    included_pods: podSummaries
  };
}

function downloadTextAsset(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function renderArtifactPreviews() {
  if (artifactPolicyPreview) {
    artifactPolicyPreview.textContent = JSON.stringify(state.activePolicy || computeEffectivePolicy().policy, null, 2);
  }
  if (auditSummaryPreview) {
    auditSummaryPreview.textContent = JSON.stringify(buildAuditSummary(), null, 2);
  }
  if (clinicianPacketPreview) {
    clinicianPacketPreview.textContent = JSON.stringify(buildClinicianPacket(), null, 2);
  }
}

function renderTrustFlow() {
  const policy = state.activePolicy || computeEffectivePolicy().policy;
  const last = state.audit[0];
  const route = state.currentRoute;

  if (trustPolicyId) trustPolicyId.textContent = policy ? policy.policy_id : "policy-000";
  if (trustPolicySummary) trustPolicySummary.textContent = buildPolicyNarrative(policy);
  if (trustRecipientMode) trustRecipientMode.textContent = policy ? recipientLabels[policy.recipient_type] : "Not set";
  if (trustFlowLane) trustFlowLane.textContent = route ? route.lane : "Pending";
  if (trustFlowLaneSummary) trustFlowLaneSummary.textContent = route ? route.summary : "Run a preset or a route to show the current decision.";
  if (trustFlowGateway) {
    trustFlowGateway.textContent = !policy
      ? "Gateway pending"
      : policy.recipient_type === "ai_export"
        ? "Adapter-ready gateway"
        : policy.recipient_type === "clinician_share"
          ? "Verified clinician path"
          : "Verified API contract";
  }
  if (trustFlowGatewaySummary) {
    trustFlowGatewaySummary.textContent = !policy
      ? "No active outbound posture is loaded."
      : policy.recipient_type === "ai_export"
        ? "Consentext keeps the provider decision behind the governed gateway."
        : policy.recipient_type === "clinician_share"
          ? "The share path stays user-authorized and destination-bound."
          : "The fetch path stays constrained by verification and scope checks.";
  }
  if (trustFlowProof) trustFlowProof.textContent = last ? last.action : "Audit proof pending";
  if (trustFlowProofSummary) trustFlowProofSummary.textContent = last ? last.summary : "New trust events will appear here after routes, shares, or API tests run.";
  if (trustLastProof) trustLastProof.textContent = last ? last.action : "No events yet";
  if (trustLastProofNote) trustLastProofNote.textContent = last ? last.summary : "Run a preset, policy change, or route to populate the proof trail.";
}

function addAudit(action, summary) {
  state.audit.unshift({
    time: nowLabel(),
    action,
    summary,
    kind: classifyAction(action)
  });
  renderAudit();
  renderControlStatus();
  renderOps();
}

function renderAudit() {
  if (!auditFeed) return;
  const items = state.audit.filter((entry) => state.auditFilter === "all" || entry.kind === state.auditFilter || (state.auditFilter === "offboard" && entry.action.includes("off_board")));
  auditFeed.innerHTML = items.length
    ? items.map((entry, index) => `
      <article class="audit-item audit-kind-${entry.kind} ${index === 0 ? "new-audit" : ""}">
        <div>
          <div class="audit-meta">${entry.time}</div>
          <strong>${entry.action}</strong>
          <span class="audit-badge audit-badge-${entry.kind}">${entry.kind}</span>
        </div>
        <p>${entry.summary}</p>
      </article>
    `).join("")
    : '<article class="audit-item"><div><strong>No events yet</strong></div><p>Run routing, policy changes, or API tests to populate the ledger.</p></article>';
  renderTimeline();
}
function renderControlStatus() {
  const policy = state.activePolicy;
  if (statusPolicyId) statusPolicyId.textContent = policy ? policy.policy_id : "policy-000";
  if (statusShare) statusShare.textContent = state.shareStatus === "active" ? "Active" : "Revoked";
  if (statusRecipient) statusRecipient.textContent = policy ? recipientLabels[policy.recipient_type] : "Not set";
  if (statusLane) statusLane.textContent = state.currentRoute ? state.currentRoute.lane : "Pending";
  if (statusAuditCount) statusAuditCount.textContent = String(state.audit.length);
}

function renderTimeline() {
  if (!timelineList) return;
  const entries = state.audit.slice(0, 4);
  timelineList.innerHTML = entries.length
    ? entries.map((entry) => `
      <li>
        <strong>${entry.action}</strong>
        <span>${entry.time}</span>
        <p>${entry.summary}</p>
      </li>
    `).join("")
    : '<li class="muted">No trust events yet.</li>';
}

function renderPodsTable() {
  if (!podsTableBody) return;
  const policy = state.activePolicy;
  podsTableBody.innerHTML = Object.entries(vaultPods).map(([key, pod]) => {
    let status = "Pending";
    let note = "Apply a policy to see how this pod participates.";

    if (policy) {
      if (state.shareStatus === "revoked") {
        status = "Revoked";
        note = "Reauthorize the share before this pod can move.";
      } else if (!policy.pod_types.includes(key)) {
        status = "Not selected";
        if (key === "records") note = "Available for clinician sharing or broader governed review when explicitly selected.";
        if (key === "identity") note = "Explicit authorization is required before identifiers can participate.";
        if (!["records", "identity"].includes(key)) note = "Select this pod to include it in the active policy.";
      } else if (policy.recipient_type === "ai_export" && key === "records") {
        status = "Broader lane only";
        note = "Private+ keeps records out; Max Intelligence can use selected records under governed authorization.";
      } else if (policy.recipient_type === "ai_export" && key === "identity") {
        status = "Broader lane only";
        note = "Private+ keeps identifiers out; broader governed routes require explicit authorization.";
      } else if (policy.recipient_type === "clinician_share" && ["records", "identity"].includes(key)) {
        status = "User authorized";
        note = "Available only to the verified clinician destination within the scoped share.";
      } else if (policy.recipient_type === "api_consumer" && key === "identity" && !policy.identifiers_included) {
        status = "Selected, masked";
        note = "Scope includes identity but identifiers remain masked until explicitly allowed.";
      } else {
        status = "Included";
        note = policy.recipient_type === "api_consumer"
          ? "Accessible only after recipient verification and scope checks."
          : policy.recipient_type === "clinician_share"
            ? "Included in the user-authorized clinician share."
            : "Available to the governed route within the active policy.";
      }
    }

    return `
      <tr>
        <td><strong>${pod.title}</strong></td>
        <td>${status}</td>
        <td>${note}</td>
      </tr>
    `;
  }).join("");
}

function renderMetrics() {
  if (!metricLdl) return;
  const update = (metricKey, valueEl, barEl, noteEl) => {
    const metric = healthMetrics[metricKey];
    if (!metric) return;
    if (valueEl) valueEl.textContent = `${metric.value}${metric.unit}`;
    if (noteEl) noteEl.textContent = metric.note;
    if (barEl) barEl.style.width = `${Math.min(100, metric.fill)}%`;
  };

  update("ldl", metricLdl, metricLdlBar, metricLdlNote);
  update("rhr", metricRhr, metricRhrBar, metricRhrNote);
  update("sleep", metricSleep, metricSleepBar, metricSleepNote);
  update("hrv", metricHrv, metricHrvBar, metricHrvNote);
}

function renderDashboard() {
  renderMetrics();
  renderPodsTable();
  renderTimeline();
}

function renderOpsConsole() {
  if (!opsEventList) return;
  const filteredEvents = state.audit.filter((entry) => {
    const matchesFilter = state.opsFilter === "all" || entry.kind === state.opsFilter;
    const query = state.opsSearch.trim().toLowerCase();
    const haystack = `${entry.action} ${entry.summary} ${entry.kind}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesFilter && matchesSearch;
  });

  opsEventList.innerHTML = filteredEvents.length
    ? filteredEvents.map((entry) => `
      <article class="ops-event ops-event-${entry.kind}">
        <div class="ops-event-meta">
          <strong>${entry.action}</strong>
          <span>${entry.time}</span>
        </div>
        <p>${entry.summary}</p>
      </article>
    `).join("")
    : '<article class="ops-event ops-event-empty"><div class="ops-event-meta"><strong>No matching events</strong><span>Adjust search or filters</span></div><p>The current console filter did not match any trust events.</p></article>';
}

function renderOps() {
  const policy = state.activePolicy;
  const last = state.audit[0];
  const route = state.currentRoute;
  const recentRisks = state.audit.slice(0, 8).filter((entry) => ["deny", "offboard"].includes(entry.kind)).length;

  if (opsLastEvent) opsLastEvent.textContent = last ? last.action : "No events yet";
  if (opsShareState) opsShareState.textContent = state.shareStatus === "active" ? "Active share" : "Revoked share";
  if (opsRecipientMode) opsRecipientMode.textContent = policy ? recipientLabels[policy.recipient_type] : "Not set";
  if (opsProviderMode) {
    opsProviderMode.textContent = !policy
      ? "Not set"
      : policy.recipient_type === "ai_export"
        ? "Adapter-ready base; count open"
        : policy.recipient_type === "clinician_share"
          ? "Clinician destination, no AI provider"
          : "API contract only";
  }
  if (opsLastLane) opsLastLane.textContent = route ? route.lane : "Pending";
  if (opsOpenRisks) opsOpenRisks.textContent = String(recentRisks + (state.shareStatus !== "active" ? 1 : 0));
  if (opsLastSummary) opsLastSummary.textContent = last ? last.summary : "Apply a policy or run a route to populate ops context.";

  if (opsHealthShare) opsHealthShare.textContent = state.shareStatus === "active" ? "Healthy" : "Needs attention";
  if (opsHealthShareNote) {
    opsHealthShareNote.textContent = state.shareStatus === "active"
      ? "Active share is ready for governed use."
      : "Revoked share blocks future governed exports until reauthorized.";
  }
  if (opsHealthGateway) opsHealthGateway.textContent = route && route.statusClass === "status-deny" ? "Review" : "Ready";
  if (opsHealthGatewayNote) {
    opsHealthGatewayNote.textContent = !route
      ? "Run a preset or route to populate the current gateway state."
      : route.statusClass === "status-deny"
        ? route.summary
        : `${route.lane} is the latest explainable route.`;
  }
  if (opsHealthAudit) opsHealthAudit.textContent = state.audit.length ? "Visible" : "Pending";
  if (opsHealthAuditNote) {
    opsHealthAuditNote.textContent = state.audit.length
      ? `${state.audit.length} trust event${state.audit.length === 1 ? "" : "s"} available for lookup.`
      : "New events will appear here after routes, shares, or API tests run.";
  }

  renderOpsConsole();
  renderArtifactPreviews();
  renderTrustFlow();
  renderLaneComparison();
}

function updateLaneDetail(lane) {
  if (!lane) return;
  if (laneName) laneName.textContent = lane.lane;
  if (laneSummaryText) laneSummaryText.textContent = lane.summary;
  if (lanePrivacyLabel) lanePrivacyLabel.textContent = `${lane.privacy}%`;
  if (laneCapabilityLabel) laneCapabilityLabel.textContent = `${lane.capability}%`;
  if (laneControlLabel) laneControlLabel.textContent = `${lane.control}%`;
  if (lanePrivacyBar) lanePrivacyBar.style.width = `${lane.privacy}%`;
  if (laneCapabilityBar) laneCapabilityBar.style.width = `${lane.capability}%`;
  if (laneControlBar) laneControlBar.style.width = `${lane.control}%`;

  const statuses = [
    `Phase 3.75 status: ${lane.phaseStatus}`,
    `What leaves: ${lane.leaves}`,
    `Governance promise: ${lane.promise}`,
    lane.internal ? "Provider path: internal protected model only" : lane.offboard ? "Provider path: user exits Consentext" : `Provider path: ${lane.adapterPath}`
  ];

  if (laneStatusListEl) {
    laneStatusListEl.innerHTML = statuses.map((item) => `<li>${item}</li>`).join("");
  }
}

function selectLane(lane) {
  if (!lane) return;
  laneCardsContainer?.querySelectorAll(".lane-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.lane === lane.lane);
  });
  updateLaneDetail(lane);
}

function renderLaneCards() {
  if (!laneCardsContainer) return;
  laneCardsContainer.innerHTML = laneMap.map((lane) => `
    <button type="button" class="lane-card" data-lane="${lane.lane}">
      <strong>${lane.lane}</strong>
      <p>${lane.role}</p>
    </button>
  `).join("");

  laneCardsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".lane-card");
    if (!button) return;
    const selected = laneMap.find((item) => item.lane === button.dataset.lane);
    if (selected) selectLane(selected);
  });

  selectLane(laneMap.find((item) => item.lane === "Private") || laneMap[0]);
}

function renderLaneComparison() {
  if (!laneComparisonGrid) return;
  laneComparisonGrid.innerHTML = laneMap.map((lane) => `
    <article class="lane-compare-card ${state.currentRoute?.lane === lane.lane ? "is-active" : ""}">
      <div class="lane-compare-head">
        <span class="lane-chip ${lane.lane === "Deterministic" ? "lane-deterministic" : lane.lane === "Private" ? "lane-private" : lane.lane === "Private+" ? "lane-privateplus" : lane.lane === "Max Intelligence" ? "lane-max" : "lane-offboard"}">${lane.lane}</span>
        <strong>${lane.role}</strong>
      </div>
      <p>${lane.promise}</p>
      <div class="lane-compare-stats">
        <span>Privacy ${lane.privacy}%</span>
        <span>Capability ${lane.capability}%</span>
        <span>Control ${lane.control}%</span>
      </div>
      <ul class="check-list lane-compare-list">
        <li>${lane.summary}</li>
        <li>${lane.leaves}</li>
        <li>${lane.internal ? "Internal protected model only" : lane.offboard ? "Outside Consentext protections" : lane.adapterPath}</li>
      </ul>
    </article>
  `).join("");
}

function applyScenarioPreset(presetId) {
  const preset = scenarioPresets.find((item) => item.id === presetId);
  if (!preset) return;

  state.activeScenario = preset.id;
  if (recipientType) recipientType.value = preset.recipient;
  if (purpose) purpose.value = preset.purpose;
  if (duration) duration.value = preset.duration;
  if (granularity) granularity.value = preset.granularity;
  if (scopeBiomarkers) scopeBiomarkers.checked = preset.pods.includes("biomarkers");
  if (scopeWearables) scopeWearables.checked = preset.pods.includes("wearables");
  if (scopeRecords) scopeRecords.checked = preset.pods.includes("records");
  if (scopeIdentity) scopeIdentity.checked = preset.pods.includes("identity");
  if (identifiersToggle) identifiersToggle.checked = preset.identifiers;
  if (recipientVerified) recipientVerified.checked = preset.verified;
  if (promptSelect && preset.prompt) promptSelect.value = preset.prompt;

  state.shareStatus = "active";
  renderPolicy();
  switchTab(preset.targetTab);
  renderScenarioPresets();

  if (preset.autoRoute && preset.prompt) {
    runRouting();
  } else {
    renderArtifactPreviews();
    renderTrustFlow();
    renderLaneComparison();
  }
}

function renderScenarioPresets() {
  if (!scenarioGrid) return;
  scenarioGrid.innerHTML = scenarioPresets.map((preset) => `
    <article class="scenario-card ${state.activeScenario === preset.id ? "is-active" : ""}">
      <div class="scenario-head">
        <span class="mini-label">${preset.badge}</span>
        <strong>${preset.title}</strong>
      </div>
      <p>${preset.summary}</p>
      <div class="scenario-outcome">${preset.outcome}</div>
      <button type="button" class="button button-secondary scenario-button" data-scenario-id="${preset.id}">Load Preset</button>
    </article>
  `).join("");

  scenarioGrid.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => {
      applyScenarioPreset(button.dataset.scenarioId);
    });
  });
}

function renderWorkstreams() {
  if (!workstreamGrid) return;
  workstreamGrid.innerHTML = workstreams.map((item) => `
    <article class="workstream-card">
      <span class="mini-label">${item.badge}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="workstream-tags">
        ${item.focus.map((topic) => `<span>${topic}</span>`).join("")}
      </div>
      <div class="workstream-status">${item.status}</div>
    </article>
  `).join("");
}

function renderPod(key) {
  const pod = vaultPods[key];
  if (!pod) return;
  if (podTitle) podTitle.textContent = pod.title;
  if (podDescription) podDescription.textContent = pod.description;
  if (assetList) {
    assetList.innerHTML = pod.assets.map((asset) => `
      <li>
        <strong>${asset.name}</strong>
        <span>${asset.detail}</span>
      </li>
    `).join("");
  }
  podButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.pod === key));
}

function computeEffectivePolicy() {
  const requestedPods = [];
  if (scopeBiomarkers.checked) requestedPods.push("biomarkers");
  if (scopeWearables.checked) requestedPods.push("wearables");
  if (scopeRecords.checked) requestedPods.push("records");
  if (scopeIdentity.checked) requestedPods.push("identity");
  if (!requestedPods.length) requestedPods.push("biomarkers");

  const recipient = recipientType.value;
  const guardrails = [];
  const effectiveIdentifiers = identifiersToggle.checked;
  const effectiveGranularity = granularity.value;

  if (recipient === "ai_export") {
    guardrails.push("Private+ defaults to minimum-necessary or de-identified context.");
    guardrails.push("Max Intelligence can use broader user-authorized context through the governed gateway.");
    guardrails.push("Medication may remain in record data, but launch AI excludes medication recommendations, dosing, interaction clearance, and treatment-direction outputs.");
    if (requestedPods.includes("records")) guardrails.push("Records are held for Max Intelligence or clinician sharing only; Private+ keeps them out.");
    if (requestedPods.includes("identity") && effectiveIdentifiers) guardrails.push("Identifiers may only participate in broader governed context, never in Private+.");
    if (requestedPods.includes("identity") && !effectiveIdentifiers) guardrails.push("Identity selected but identifiers remain off until explicit authorization.");
    if (effectiveGranularity === "raw_if_allowed") guardrails.push("Raw wearable detail is reserved for broader governed context when specifically authorized.");
  } else if (recipient === "clinician_share") {
    guardrails.push(recipientVerified.checked ? "Destination verification satisfied for clinician share." : "Clinician share stays pending until the doctor, clinic, or hospital destination is verified.");
    guardrails.push("User-authorized clinician sharing can scope purpose, duration, and selected pods now.");
    guardrails.push("Medication may travel as part of the selected record set, but it is not a launch AI guidance category.");
    guardrails.push("Full clinician-facing staff portal remains deferred.");
  } else {
    guardrails.push(recipientVerified.checked ? "Recipient verification satisfied for API access." : "API consumer requests deny until recipient verification passes.");
    if (requestedPods.includes("records")) guardrails.push("Records pod requires stronger review and explicit user selection.");
    if (requestedPods.includes("identity") && !effectiveIdentifiers) guardrails.push("Identity pod selected but identifiers remain off.");
    guardrails.push("Implementation can land later as long as the interface stays stable now.");
  }

  const policy = {
    policy_id: `policy-${String(state.policyVersion).padStart(3, "0")}`,
    share_status: state.shareStatus,
    recipient_type: recipient,
    purpose: purpose.value,
    duration: duration.value,
    pod_types: requestedPods,
    identifiers_included: effectiveIdentifiers,
    wearables_granularity: effectiveGranularity,
    recipient_verification_required: recipient === "api_consumer" ? "jwt" : recipient === "clinician_share" ? "verified_destination" : "gateway_policy",
    recipient_verified: recipient === "ai_export" ? true : recipientVerified.checked,
    minimal_disclosure: true,
    deidentify_by_default: recipient === "ai_export",
    gateway_adapter_mode: recipient === "ai_export" ? "adapter_ready_base" : "not_applicable",
    provider_count_pricing: recipient === "ai_export" ? "price_1_2_3_4_then_decide" : "n/a",
    clinician_share_mode: recipient === "clinician_share" ? "user_authorized" : "none"
  };

  return { policy, guardrails };
}
function renderPolicy() {
  const { policy, guardrails } = computeEffectivePolicy();
  state.activePolicy = policy;
  if (guardrailList) guardrailList.innerHTML = guardrails.map((item) => `<li>${item}</li>`).join("");
  if (policyJson) policyJson.textContent = JSON.stringify(policy, null, 2);

  const chips = [
    `Recipient: ${recipientLabels[policy.recipient_type]}`,
    `Purpose: ${purposeLabels[policy.purpose] || policy.purpose}`,
    `Duration: ${policy.duration}`,
    `Pods: ${policy.pod_types.join(", ")}`,
    `Identifiers: ${policy.identifiers_included ? "on" : "off"}`
  ];

  if (policy.recipient_type === "ai_export") chips.push("Providers: price 1 / 2 / 3 / 4");
  if (policy.recipient_type === "clinician_share") chips.push("Share path: user authorized");
  if (policy.recipient_type === "api_consumer") chips.push(`Verification: ${policy.recipient_verified ? "passed" : "required"}`);

  if (policyChips) policyChips.innerHTML = chips.map((chip) => `<span class="policy-chip">${chip}</span>`).join("");
  renderDashboard();
  renderControlStatus();
  renderOps();
}

function resolveLane(prompt) {
  return laneMap.find((item) => item.match.test(prompt)) || laneMap[1];
}

function updateHero(route) {
  if (!route) return;
  if (heroLane) heroLane.textContent = route.lane;
  if (heroSummary) heroSummary.textContent = route.summary;
  if (heroPrompt) heroPrompt.textContent = route.prompt;
  if (heroAllowedCount) heroAllowedCount.textContent = `${route.included.length || 1} allowed items`;
  if (heroBlockedCount) heroBlockedCount.textContent = `${route.blocked.length || 0} blocked items`;
  if (heroOutputClass) heroOutputClass.textContent = route.outputClass;
  if (heroStatus) {
    heroStatus.textContent = route.statusLabel;
    heroStatus.className = `status-pill ${route.statusClass}`;
  }
  if (meterPrivacy) meterPrivacy.style.width = `${route.privacy}%`;
  if (meterCapability) meterCapability.style.width = `${route.capability}%`;
  if (meterControl) meterControl.style.width = `${route.control}%`;
}

function renderRouteState(route, source, included, blocked, bundle) {
  if (routeLane) routeLane.textContent = route.lane;
  if (routeSummary) routeSummary.textContent = route.summary;
  if (routeStatus) {
    routeStatus.textContent = route.statusLabel;
    routeStatus.className = `status-pill ${route.statusClass}`;
  }
  if (routeSource) routeSource.innerHTML = source.map((item) => `<li>${item}</li>`).join("");
  if (routeIncluded) routeIncluded.innerHTML = included.map((item) => `<li>${item}</li>`).join("");
  if (routeBlocked) routeBlocked.innerHTML = blocked.map((item) => `<li>${item}</li>`).join("");
  if (routeJson) routeJson.textContent = JSON.stringify(bundle, null, 2);
  state.currentRoute = route;
  updateHero(route);
  renderControlStatus();
  renderOps();
}

function runRouting() {
  const prompt = promptSelect.value;
  const lane = resolveLane(prompt);
  const policy = state.activePolicy || computeEffectivePolicy().policy;
  const requestedPods = policy.pod_types;
  const source = [];
  const included = [];
  const blocked = [];
  let status = "allow";
  let decision = "Allowed";
  let reason = "Request can proceed within the active policy and control-plane guardrails.";
  let bundle;

  if (requestedPods.includes("biomarkers")) source.push("Biomarker values");
  if (requestedPods.includes("wearables")) source.push(policy.wearables_granularity === "raw_if_allowed" ? "Wearable detail requested" : "Wearable summaries");
  if (requestedPods.includes("records")) source.push("Record documents requested");
  if (requestedPods.includes("identity") || policy.identifiers_included) source.push("Identifiers requested");
  if (!source.length) source.push("Minimal biomarker context");

  if (lane.offboard) {
    status = "deny";
    decision = "Off-Board";
    reason = "The user is bypassing Consentext and leaving the governed environment.";
    blocked.push("Outside Consentext protections");
    blocked.push("No minimization or audit beyond exit event");
    bundle = {
      prompt,
      decision: "off_board",
      reason_code: "user_left_consentext",
      share_status: state.shareStatus,
      summary: reason
    };
    addAudit("off_board_exit", `User chose to bypass Consentext for: ${prompt}`);
  } else if (!lane.internal && state.shareStatus !== "active") {
    status = "deny";
    decision = "Denied";
    reason = "Share is revoked, so no future governed export is allowed.";
    blocked.push("share_revoked");
    bundle = {
      prompt,
      decision: "denied",
      reason_code: "share_revoked",
      share_status: state.shareStatus,
      summary: reason
    };
  } else if (!lane.internal && policy.recipient_type !== "ai_export") {
    status = "deny";
    decision = "Denied";
    reason = `Prompt requires the AI gateway, but the active share is configured for ${recipientLabels[policy.recipient_type].toLowerCase()}.`;
    blocked.push("recipient_type_mismatch");
    bundle = {
      prompt,
      decision: "denied",
      reason_code: "recipient_type_mismatch",
      share_status: state.shareStatus,
      summary: reason
    };
  } else if (lane.internal) {
    included.push("Required internal protected model path");
    included.push(requestedPods.includes("records") ? "Selected records stay inside Consentext" : /trend|show|list|calculate/i.test(prompt) ? "Structured biomarker retrieval" : "Protected explanation context");
    if (policy.identifiers_included && requestedPods.includes("identity")) included.push("Identifiers remain internal to Consentext");
    blocked.push("No external provider involved");
    bundle = {
      prompt,
      lane: lane.lane.toLowerCase().replace(" ", "_"),
      recipient_type: "internal",
      pod_scope: requestedPods.length ? requestedPods : ["biomarkers", "derived"],
      identifiers_included: policy.identifiers_included,
      records_included: requestedPods.includes("records"),
      wearables_granularity: policy.wearables_granularity,
      transform_level: lane.lane === "Deterministic" ? "none" : "protected_internal",
      output_classification: lane.outputClass,
      share_status: state.shareStatus,
      gateway_adapter_mode: "not_applicable",
      provider_count_pricing: "n/a",
      context_authorization: "internal_only",
      user_message: lane.summary
    };
  } else {
    included.push("AI gateway adapter-ready base is active");
    included.push("Provider-count decision remains open until pricing (1 / 2 / 3 / 4)");

    if (lane.lane === "Private+") {
      included.push("Minimum-necessary export bundle");
      if (requestedPods.includes("biomarkers")) included.push("Biomarker context allowed");
      if (requestedPods.includes("wearables")) included.push(policy.wearables_granularity === "raw_if_allowed" ? "Wearables reduced to derived summary for Private+" : "Wearable derived summary");
      blocked.push(requestedPods.includes("records") ? "Records withheld in Private+" : "Records stay out of the Private+ default route");
      blocked.push(policy.identifiers_included && requestedPods.includes("identity") ? "Identifiers withheld in Private+" : "Identifiers stay off in the Private+ default route");

      const podScope = requestedPods.filter((pod) => !["records", "identity"].includes(pod));
      bundle = {
        prompt,
        lane: "private_plus",
        recipient_type: policy.recipient_type,
        pod_scope: podScope.length ? podScope : ["biomarkers", "derived"],
        identifiers_included: false,
        records_included: false,
        wearables_granularity: policy.wearables_granularity === "raw_if_allowed" ? "derived_only_for_private_plus" : policy.wearables_granularity,
        transform_level: "minimum_necessary_l1_l2",
        output_classification: lane.outputClass,
        share_status: state.shareStatus,
        gateway_adapter_mode: policy.gateway_adapter_mode,
        provider_count_pricing: policy.provider_count_pricing,
        context_authorization: "minimum_necessary",
        user_message: lane.summary
      };
    } else {
      included.push("Broader user-authorized governed context");
      if (requestedPods.includes("wearables")) included.push(policy.wearables_granularity === "raw_if_allowed" ? "Wearable detail allowed by policy" : "Wearable summary allowed by policy");
      if (requestedPods.includes("records")) included.push("Selected records available under governed review"); else blocked.push("No records selected for broader-context route");
      if (policy.identifiers_included && requestedPods.includes("identity")) included.push("Selected identifiers allowed by explicit authorization"); else blocked.push("Identifiers remain off unless explicitly authorized");
      blocked.push("Final Max Intelligence scope still depends on pricing tradeoffs");

      bundle = {
        prompt,
        lane: "max_intelligence",
        recipient_type: policy.recipient_type,
        pod_scope: requestedPods.length ? requestedPods : ["biomarkers"],
        identifiers_included: policy.identifiers_included && requestedPods.includes("identity"),
        records_included: requestedPods.includes("records"),
        wearables_granularity: policy.wearables_granularity,
        transform_level: "broader_governed_context",
        output_classification: lane.outputClass,
        share_status: state.shareStatus,
        gateway_adapter_mode: policy.gateway_adapter_mode,
        provider_count_pricing: policy.provider_count_pricing,
        context_authorization: "broader_user_authorized",
        review_state: "target_scope_pricing_pending",
        user_message: lane.summary
      };
    }
  }

  const route = {
    lane: lane.lane,
    summary: status === "allow" ? lane.summary : reason,
    prompt,
    included: included.length ? included : ["No governed output generated"],
    blocked: blocked.length ? blocked : ["No additional blocks triggered"],
    outputClass: lane.outputClass,
    privacy: lane.privacy,
    capability: lane.capability,
    control: lane.control,
    statusLabel: decision,
    statusClass: status === "allow" ? "status-allow" : "status-deny"
  };

  renderRouteState(route, source, route.included, route.blocked, bundle);

  if (!lane.offboard) {
    addAudit(status === "allow" ? "context_generated" : "context_generation_denied", `${decision}: ${prompt}`);
  }
}

function runApiSimulation() {
  const policy = state.activePolicy || computeEffectivePolicy().policy;
  const requestedPod = apiPod.value;
  const withinScope = apiScope.value === "within_scope";
  let decision = "Denied";
  let statusClass = "status-deny";
  let summary = "API consumer requests are denied until the conditions below are satisfied.";

  if (policy.recipient_type !== "api_consumer") {
    summary = `Active share is configured for ${recipientLabels[policy.recipient_type].toLowerCase()}, not API consumer access.`;
    addAudit("api_context_fetch_denied", summary);
  } else if (!policy.recipient_verified) {
    summary = "Recipient verification failed before vault payload access.";
    addAudit("recipient_verification_failed", summary);
  } else if (state.shareStatus !== "active") {
    summary = "Share is revoked or inactive, so fetch is denied.";
    addAudit("api_context_fetch_denied", summary);
  } else if (!withinScope || !policy.pod_types.includes(requestedPod)) {
    summary = "Requested pod is outside the active share scope.";
    addAudit("api_context_fetch_denied", summary);
  } else {
    decision = "Granted";
    statusClass = "status-allow";
    summary = `API fetch granted for ${requestedPod} within the active share scope.`;
    addAudit("api_context_fetch_granted", summary);
  }

  if (apiDecision) apiDecision.textContent = decision;
  if (apiStatus) {
    apiStatus.textContent = decision;
    apiStatus.className = `status-pill ${statusClass}`;
  }
  if (apiReason) apiReason.textContent = summary;
}

function switchTab(tabName) {
  tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tabName));
  tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tabName));
}

podButtons.forEach((button) => button.addEventListener("click", () => renderPod(button.dataset.pod)));
tabButtons.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
filterChips.forEach((button) => button.addEventListener("click", () => {
  state.auditFilter = button.dataset.filter;
  filterChips.forEach((chip) => chip.classList.toggle("is-active", chip === button));
  renderAudit();
}));

opsFilterChips.forEach((button) => button.addEventListener("click", () => {
  state.opsFilter = button.dataset.opsFilter;
  opsFilterChips.forEach((chip) => chip.classList.toggle("is-active", chip === button));
  renderOpsConsole();
}));

opsSearch?.addEventListener("input", () => {
  state.opsSearch = opsSearch.value;
  renderOpsConsole();
});

[recipientType, purpose, duration, granularity, scopeBiomarkers, scopeWearables, scopeRecords, scopeIdentity, identifiersToggle, recipientVerified].forEach((input) => {
  input?.addEventListener("change", renderPolicy);
});

applyPolicy?.addEventListener("click", () => {
  state.shareStatus = "active";
  state.policyVersion += 1;
  renderPolicy();
  addAudit("share_created", `Policy ${state.activePolicy.policy_id} applied for ${recipientLabels[state.activePolicy.recipient_type]}.`);
});

revokeShare?.addEventListener("click", () => {
  state.shareStatus = "revoked";
  renderPolicy();
  addAudit("share_revoked", `Policy ${state.activePolicy.policy_id} was revoked. Future governed export is denied.`);
});

if (runRoute) runRoute.addEventListener("click", runRouting);
if (runApi) runApi.addEventListener("click", runApiSimulation);
printBrief?.addEventListener("click", () => {
  window.open("executive-brief.html?print=1", "_blank", "noopener");
});
downloadPolicy?.addEventListener("click", () => {
  downloadTextAsset("consentext-policy.json", JSON.stringify(state.activePolicy || computeEffectivePolicy().policy, null, 2), "application/json;charset=utf-8");
});
downloadAudit?.addEventListener("click", () => {
  downloadTextAsset("consentext-audit-summary.json", JSON.stringify(buildAuditSummary(), null, 2), "application/json;charset=utf-8");
});
downloadClinicianPacket?.addEventListener("click", () => {
  downloadTextAsset("consentext-clinician-packet.json", JSON.stringify(buildClinicianPacket(), null, 2), "application/json;charset=utf-8");
});

renderPod("biomarkers");
if (promptSelect) promptSelect.value = "What lifestyle changes may improve these labs?";
renderPolicy();
renderLaneCards();
renderLaneComparison();
renderScenarioPresets();
renderWorkstreams();

const initialRoute = {
  lane: "Private+",
  summary: "Minimum-necessary context packet prepared for governed external AI assistance.",
  prompt: "What lifestyle changes may improve these labs?",
  included: ["AI gateway adapter-ready base is active", "Minimum-necessary export bundle", "Wearable derived summary"],
  blocked: ["Records stay out of the Private+ default route", "Identifiers stay off in the Private+ default route"],
  outputClass: "minimum_necessary_external",
  privacy: 80,
  capability: 74,
  control: 90,
  statusLabel: "Allowed",
  statusClass: "status-allow"
};

const initialBundle = {
  prompt: initialRoute.prompt,
  lane: "private_plus",
  recipient_type: "ai_export",
  pod_scope: ["biomarkers", "wearables"],
  identifiers_included: false,
  records_included: false,
  wearables_granularity: "derived_only",
  transform_level: "minimum_necessary_l1_l2",
  output_classification: initialRoute.outputClass,
  share_status: state.shareStatus,
  gateway_adapter_mode: "adapter_ready_base",
  provider_count_pricing: "price_1_2_3_4_then_decide",
  context_authorization: "minimum_necessary",
  user_message: initialRoute.summary
};

renderRouteState(
  initialRoute,
  ["Biomarker values", "Wearable summaries"],
  initialRoute.included,
  initialRoute.blocked,
  initialBundle
);
renderDashboard();
renderControlStatus();
renderOps();
addAudit("consent_policy_created", "Initial prototype policy loaded using the March 17 control-plane baseline plus the March 19 medication-scope override.");
addAudit("auth_login", "User entered the prototype workspace and established an authenticated session.");

const walkthroughStage = document.getElementById("walkthrough-stage");
const walkthroughTitle = document.getElementById("walkthrough-title");
const walkthroughSummary = document.getElementById("walkthrough-summary");
const walkthroughKicker = document.getElementById("walkthrough-kicker");
const walkthroughStep = document.getElementById("walkthrough-step");
const walkthroughHook = document.getElementById("walkthrough-hook");
const walkthroughCC = document.getElementById("walkthrough-cc");
const walkthroughPills = document.getElementById("walkthrough-pills");
const walkthroughStatus = document.getElementById("walkthrough-status");
const walkthroughProgressFill = document.getElementById("walkthrough-progress-fill");
const walkthroughChapters = document.getElementById("walkthrough-chapters");
const walkthroughFallback = document.getElementById("walkthrough-fallback");
const walkthroughPlay = document.getElementById("walkthrough-play");
const walkthroughPause = document.getElementById("walkthrough-pause");
const walkthroughRestart = document.getElementById("walkthrough-restart");
const walkthroughFullscreen = document.getElementById("walkthrough-fullscreen");

const walkthroughSegments = [
  {
    theme: "trust",
    kicker: "What this is",
    title: "Consentext in one sentence",
    summary: "This chapter frames the system as a policy and routing layer before the implementation surfaces start showing up.",
    hook: "Consentext is the control boundary between stored health context and any outbound use.",
    pills: ["Trust boundary", "Routing contract", "Audit-first control"],
    speech: "The fastest technical framing is this. Consentext is a control boundary that sits between stored health context and every outbound AI or share action. The vault holds context. Consent and policy decide what may move. The gateway enforces the selected route. Audit records what happened. The system is valuable because disclosure behavior stops being implicit. Instead of letting every request act like a raw export, the product classifies the request, chooses the correct lane, applies transforms, and leaves proof behind. That control boundary is the main idea the rest of the prototype is trying to make concrete."
  },
  {
    theme: "problem",
    kicker: "Why it matters",
    title: "The current failure mode is implicit disclosure",
    summary: "The site addresses the gap between wanting useful AI and not having explicit, inspectable disclosure behavior.",
    hook: "Most current flows either overexpose data or force the user to avoid useful tooling entirely.",
    pills: ["Implicit exports", "Unsafe copy-paste behavior", "No durable proof"],
    speech: "The problem is not just that health data is sensitive. The deeper problem is that most current AI flows make disclosure behavior implicit. A user pastes something into a tool, a system forwards context to a provider, or a share occurs with weak scoping, and nobody has a stable contract for what actually left. Consentext is trying to solve that gap. The user should be able to get useful explanation and stronger reasoning without every request turning into a broad export. The architecture matters because it creates explicit scope, explicit route selection, and explicit proof rather than relying on hand-wavy trust language."
  },
  {
    theme: "architecture",
    kicker: "How it is shaped",
    title: "The vault stays separate from the control plane",
    summary: "This chapter explains the most important design choice: data custody and disclosure decisions are different responsibilities.",
    hook: "The vault owns context. The control plane owns decisions. The gateway owns outbound enforcement.",
    pills: ["Data plane", "Control plane", "Fail-closed gateway"],
    speech: "The most important architecture choice is the split between the vault and the control plane. The vault is where stored health context, raw artifacts, and derived summaries live. The control plane is where consent logic, policy objects, lane selection, minimization, de-identification, and audit live. The gateway then becomes the only governed path to external systems. That separation matters because storing context is not the same job as deciding what may leave. Once those responsibilities are separated, the system can fail closed, keep the policy object legible, and make outbound behavior inspectable instead of magical."
  },
  {
    theme: "routing",
    kicker: "How requests move",
    title: "Every request resolves to a lane",
    summary: "The lane model is how the system turns policy into capability, disclosure class, and enforcement behavior.",
    hook: "Not every request deserves the same model path or the same disclosure posture.",
    pills: ["Five distinct lanes", "Capability matched to risk", "Off-board path modeled honestly"],
    speech: "Once the boundary is clear, the next idea is the lane model. Deterministic requests stay retrieval-only. Private requests use the internal protected model. Private Plus uses minimum-necessary or de-identified governed export. Max Intelligence uses broader user-authorized governed export. Off-Board models the moment the user leaves Consentext entirely. In implementation terms, the lane is the compact output of policy evaluation. It tells the rest of the system what class of context is allowed to move, which transforms apply, which gateway path is legal, and what kind of audit event should be appended."
  },
  {
    theme: "private",
    kicker: "The trust promise",
    title: "Private and Private+ enforce different outbound contracts",
    summary: "This chapter covers the most important implementation distinction in the prototype.",
    hook: "Private stays internal. Private+ is the narrow external lane. Those are different contracts, not different colors.",
    pills: ["Private is mandatory", "Private+ is narrow by default", "Distinct output classes"],
    speech: "One of the most important March decisions is that Private and Private Plus are not interchangeable. Private is the locked internal lane. It requires a protected model running inside Consentext-controlled systems, and that is a phase requirement, not a nice-to-have. Private Plus is different. It is the narrow governed external lane where only minimum-necessary or de-identified context may move. The reason this distinction matters is that it changes real system behavior. Different transforms run. Different output classifications appear. Different provider paths are legal. If those two lanes collapse, the rest of the control plane loses meaning."
  },
  {
    theme: "max",
    kicker: "Higher capability",
    title: "Max Intelligence is broader governed routing, not a bypass",
    summary: "This chapter explains why the highest-capability lane still belongs inside the same control model.",
    hook: "Sometimes narrow context is not enough, but the system still needs to stay in front of the exchange.",
    pills: ["Broader user authorization", "Still gateway-mediated", "Not the same as off-board"],
    speech: "Max Intelligence exists for the moments when a narrow route is not enough. A user may want deeper comparison, broader reasoning, or a more capable external model path than Private Plus can support. The important thing is that Consentext still stays in front of that exchange. The user authorizes broader context, the gateway still mediates provider access, and the audit log still records the route. That is what makes Max Intelligence different from Off-Board. Off-Board means the user leaves the protected environment. Max Intelligence means the system offers a broader governed lane without abandoning the control relationship."
  },
  {
    theme: "sharing",
    kicker: "Real-world workflow",
    title: "Clinician sharing and internal ops are part of the system now",
    summary: "The architecture story is not only about AI prompts. It also includes user-authorized shares, a medication launch boundary, and operational visibility.",
    hook: "Clinician handoff and support visibility need real surfaces, not just future-state notes.",
    pills: ["User-authorized clinician share", "Medication in records only", "Minimal ops console"],
    speech: "The prototype also has to show that this is more than an AI routing demo. A user-authorized clinician share path is now part of the system contract. That means a person can scope what should be sent to a doctor, clinic, or hospital without pretending a full staff portal already exists. The March nineteenth medication note adds an important launch boundary on top of that. Medication may exist in the record set and in the clinician packet, but launch AI does not offer dosing advice, medication recommendations, interaction clearance, or treatment-direction outputs. On top of that, the internal team needs enough operational visibility to support the system. They need event lookup, route search, recent risk review, and proof that a share or route behaved the way policy said it should. That is why the prototype now includes both the clinician packet preview and the internal ops console."
  },
  {
    theme: "presentation",
    kicker: "How to present it",
    title: "Summary mode, the brief, and exported artifacts make review asynchronous",
    summary: "This chapter explains why the site now works as a review package instead of only a live prototype.",
    hook: "You can simplify the page, switch to a lighter docs look, and leave with real artifacts instead of screenshots.",
    pills: ["Summary mode", "Technical brief and PDF", "MP4, captions, and JSON exports"],
    speech: "A useful change in this pass is that the site no longer depends on a live presenter remembering every talking point. You can turn on Summary Mode to hide the denser prototype surfaces. You can switch to a lighter documentation theme for daytime review. You can open a one-page technical brief, download the narrated MP4 walkthrough, and export the current policy, audit summary, or clinician packet preview. That matters because it turns the prototype into a review package that a senior developer can inspect asynchronously, not just a live demo that disappears when the meeting ends."
  },
  {
    theme: "outcome",
    kicker: "What to repeat back",
    title: "The implementation takeaway",
    summary: "This closing chapter gives the short architectural framing to carry out of the walkthrough.",
    hook: "Consentext is a policy engine plus governed gateway, not just a prompt interface.",
    pills: ["Explicit lane contracts", "Gateway-mediated export", "Append-only proof"],
    speech: "The implementation takeaway is this. Consentext is a policy engine plus governed gateway in front of health-context use. It separates data custody from disclosure logic, enforces distinct lane contracts, and records what happened as audit proof. The system gives users a safer internal path, a narrow governed external path, a broader governed path when they explicitly want it, and an honest model of what happens when they leave protections entirely. It also stays modular enough for later provider adapters, clinician workflows, and integration work. That is the architecture this walkthrough is trying to make legible."
  }
];

const walkthroughState = {
  index: 0,
  isPlaying: false,
  isPaused: false,
  runId: 0
};

function getActivePageRoute() {
  const params = new URLSearchParams(window.location.search);
  const requestedRoute = params.get("page");
  return pageRouteDefinitions[requestedRoute] ? requestedRoute : "overview";
}

function sectionSupportsPageRoute(section, route) {
  const supportedRoutes = (section.dataset.pageRoutes || "")
    .split(/\s+/)
    .filter(Boolean);

  return !supportedRoutes.length || supportedRoutes.includes(route) || supportedRoutes.includes("all");
}

function scrollToVisibleHashTarget() {
  if (!window.location.hash) return;

  const target = document.getElementById(window.location.hash.slice(1));
  if (!target || target.hidden) return;

  window.setTimeout(() => {
    target.scrollIntoView({ block: "start", behavior: "smooth" });
  }, 90);
}

function initializePageRoute() {
  const route = getActivePageRoute();
  const config = pageRouteDefinitions[route];

  document.body.dataset.pageRoute = route;
  document.title = `${config.title} | Consentext Phase 3.75`;

  if (pageRouteKicker) pageRouteKicker.textContent = config.kicker;
  if (pageRouteTitle) pageRouteTitle.textContent = config.title;
  if (pageRouteDescription) pageRouteDescription.textContent = config.description;

  pageRouteSections.forEach((section) => {
    const shouldShow = sectionSupportsPageRoute(section, route);
    section.hidden = !shouldShow;
    section.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  });

  pageNavLinks.forEach((link) => {
    const isActive = link.dataset.pageNav === route;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  pageRouteCards.forEach((card) => {
    const isActive = card.dataset.pageLink === route;
    card.classList.toggle("is-active", isActive);
    if (isActive) {
      card.setAttribute("aria-current", "page");
    } else {
      card.removeAttribute("aria-current");
    }
  });

  scrollToVisibleHashTarget();
}

function setTopbarCollapsed(collapsed, { persist = true } = {}) {
  if (!topbar || !topbarToggle || !topNav) return;

  topbar.classList.toggle("is-collapsed", collapsed);
  topbarToggle.textContent = collapsed ? "Expand header" : "Minimize header";
  topbarToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  topbarToggle.setAttribute("aria-label", collapsed ? "Expand header navigation" : "Minimize header navigation");
  topNav.setAttribute("aria-hidden", collapsed ? "true" : "false");

  topNav.querySelectorAll("a").forEach((link) => {
    link.tabIndex = collapsed ? -1 : 0;
  });

  if (!persist) return;

  try {
    window.localStorage.setItem(topbarStorageKey, collapsed ? "true" : "false");
  } catch (error) {
    // Storage can fail in embedded contexts; the toggle should still work.
  }
}

function initializeTopbar() {
  if (!topbar || !topbarToggle || !topNav) return;

  let shouldCollapse = false;

  try {
    shouldCollapse = window.localStorage.getItem(topbarStorageKey) === "true";
  } catch (error) {
    shouldCollapse = false;
  }

  setTopbarCollapsed(shouldCollapse, { persist: false });
  topbarToggle.addEventListener("click", () => {
    setTopbarCollapsed(!topbar.classList.contains("is-collapsed"));
  });
}

function setFocusMode(enabled, { persist = true } = {}) {
  document.body.classList.toggle("focus-mode", enabled);

  if (focusModeToggle) {
    focusModeToggle.textContent = enabled ? "Focus mode on" : "Focus mode off";
    focusModeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    focusModeToggle.setAttribute("aria-label", enabled ? "Disable focus mode" : "Enable focus mode");
  }

  focusHiddenSections.forEach((section) => {
    section.setAttribute("aria-hidden", enabled ? "true" : "false");
  });

  focusHiddenLinks.forEach((link) => {
    link.tabIndex = enabled ? -1 : 0;
  });

  if (!persist) return;

  try {
    window.localStorage.setItem(focusModeStorageKey, enabled ? "true" : "false");
  } catch (error) {
    // Storage can fail in embedded contexts; the toggle should still work.
  }
}

function initializeFocusMode() {
  if (!focusModeToggle) return;

  let shouldEnableFocusMode = false;

  try {
    shouldEnableFocusMode = window.localStorage.getItem(focusModeStorageKey) === "true";
  } catch (error) {
    shouldEnableFocusMode = false;
  }

  setFocusMode(shouldEnableFocusMode, { persist: false });
  focusModeToggle.addEventListener("click", () => {
    setFocusMode(!document.body.classList.contains("focus-mode"));
  });
}

function setBossMode(enabled, { persist = true } = {}) {
  document.body.classList.toggle("boss-mode", enabled);

  if (bossModeToggle) {
    bossModeToggle.textContent = enabled ? "Summary mode on" : "Summary mode off";
    bossModeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    bossModeToggle.setAttribute("aria-label", enabled ? "Disable summary mode" : "Enable summary mode");
  }
  if (heroBossToggle) heroBossToggle.textContent = enabled ? "Turn Summary Mode Off" : "Turn Summary Mode On";
  if (presentationBossToggle) presentationBossToggle.textContent = enabled ? "Turn Summary Mode Off" : "Turn Summary Mode On";

  bossHiddenSections.forEach((section) => {
    section.setAttribute("aria-hidden", enabled ? "true" : "false");
  });

  bossHiddenLinks.forEach((link) => {
    link.tabIndex = enabled ? -1 : 0;
  });

  if (!persist) return;

  try {
    window.localStorage.setItem(bossModeStorageKey, enabled ? "true" : "false");
  } catch (error) {
    // Storage can fail in embedded contexts; the toggle should still work.
  }
}

function initializeBossMode() {
  let shouldEnableBossMode = false;

  try {
    shouldEnableBossMode = window.localStorage.getItem(bossModeStorageKey) === "true";
  } catch (error) {
    shouldEnableBossMode = false;
  }

  setBossMode(shouldEnableBossMode, { persist: false });
  [bossModeToggle, heroBossToggle, presentationBossToggle].forEach((button) => {
    button?.addEventListener("click", () => {
      setBossMode(!document.body.classList.contains("boss-mode"));
    });
  });
}

function setThemeMode(enabled, { persist = true } = {}) {
  document.body.classList.toggle("theme-light", enabled);

  if (themeToggle) {
    themeToggle.textContent = enabled ? "Dark theme" : "Light theme";
    themeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    themeToggle.setAttribute("aria-label", enabled ? "Switch to dark technical theme" : "Switch to light documentation theme");
  }
  if (presentationThemeToggle) {
    presentationThemeToggle.textContent = enabled ? "Switch to Dark Theme" : "Switch to Light Theme";
  }
  if (themeStatus) {
    themeStatus.textContent = enabled
      ? "The lighter documentation theme is active. Switch back when you want the darker technical control-room look."
      : "The current presentation starts in the darker technical theme. Switch when you want a cleaner documentation-style review surface.";
  }

  if (!persist) return;

  try {
    window.localStorage.setItem(themeStorageKey, enabled ? "true" : "false");
  } catch (error) {
    // Storage can fail in embedded contexts; the toggle should still work.
  }
}

function initializeThemeMode() {
  let shouldEnableLightTheme = false;

  try {
    shouldEnableLightTheme = window.localStorage.getItem(themeStorageKey) === "true";
  } catch (error) {
    shouldEnableLightTheme = false;
  }

  setThemeMode(shouldEnableLightTheme, { persist: false });
  [themeToggle, presentationThemeToggle].forEach((button) => {
    button?.addEventListener("click", () => {
      setThemeMode(!document.body.classList.contains("theme-light"));
    });
  });
}

function updateWalkthroughButtons() {
  if (walkthroughPause) walkthroughPause.textContent = walkthroughState.isPaused ? "Resume" : "Pause";
}

function canUseWalkthroughFullscreen() {
  return Boolean(
    walkthroughStage &&
    typeof walkthroughStage.requestFullscreen === "function" &&
    typeof document.exitFullscreen === "function" &&
    document.fullscreenEnabled !== false
  );
}

function updateWalkthroughFullscreenButton() {
  if (!walkthroughStage || !walkthroughFullscreen) return;

  const isFullscreen = document.fullscreenElement === walkthroughStage;
  const canUseFullscreen = canUseWalkthroughFullscreen();

  walkthroughStage.classList.toggle("is-fullscreen", isFullscreen);
  walkthroughFullscreen.textContent = isFullscreen ? "Exit Full Screen" : "Full Screen";
  walkthroughFullscreen.disabled = !canUseFullscreen;
  walkthroughFullscreen.setAttribute("aria-pressed", isFullscreen ? "true" : "false");

  if (canUseFullscreen) {
    walkthroughFullscreen.removeAttribute("title");
  } else {
    walkthroughFullscreen.title = "Full screen is not available in this browser";
  }
}

function renderWalkthroughChapters() {
  if (!walkthroughChapters) return;
  walkthroughChapters.innerHTML = walkthroughSegments.map((segment, index) => `
    <button type="button" class="walkthrough-chapter ${index === walkthroughState.index ? "is-active" : ""}" data-walkthrough-index="${index}">
      <span>Chapter ${index + 1}</span>
      <strong>${segment.title}</strong>
      <p>${segment.hook}</p>
    </button>
  `).join("");

  walkthroughChapters.querySelectorAll(".walkthrough-chapter").forEach((button) => {
    button.addEventListener("click", () => {
      const targetIndex = Number(button.dataset.walkthroughIndex);
      const shouldResume = walkthroughState.isPlaying || walkthroughState.isPaused;
      stopWalkthrough();
      walkthroughState.index = targetIndex;
      renderWalkthrough();
      if (shouldResume) startWalkthrough();
    });
  });
}

function renderWalkthrough() {
  if (!walkthroughStage) return;
  const segment = walkthroughSegments[walkthroughState.index];
  walkthroughStage.dataset.theme = segment.theme;
  if (walkthroughTitle) walkthroughTitle.textContent = segment.title;
  if (walkthroughSummary) walkthroughSummary.textContent = segment.summary;
  if (walkthroughKicker) walkthroughKicker.textContent = segment.kicker;
  if (walkthroughStep) walkthroughStep.textContent = `Chapter ${walkthroughState.index + 1} of ${walkthroughSegments.length}`;
  if (walkthroughHook) walkthroughHook.textContent = segment.hook;
  if (walkthroughCC) walkthroughCC.textContent = segment.speech;
  if (walkthroughPills) walkthroughPills.innerHTML = segment.pills.map((pill) => `<span class="walkthrough-pill">${pill}</span>`).join("");
  if (walkthroughProgressFill) walkthroughProgressFill.style.width = `${((walkthroughState.index + 1) / walkthroughSegments.length) * 100}%`;
  if (walkthroughStatus && !walkthroughState.isPlaying && !walkthroughState.isPaused) walkthroughStatus.textContent = `Ready: chapter ${walkthroughState.index + 1} of ${walkthroughSegments.length}`;
  renderWalkthroughChapters();
  updateWalkthroughButtons();
  updateWalkthroughFullscreenButton();
}

function stopWalkthrough() {
  walkthroughState.runId += 1;
  walkthroughState.isPlaying = false;
  walkthroughState.isPaused = false;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  updateWalkthroughButtons();
}

function scoreWalkthroughVoice(voice) {
  if (!voice || !/en/i.test(voice.lang || "")) return -1;

  const name = voice.name || "";
  let score = 0;

  if (/Natural|Neural|Multilingual|Online/i.test(name)) score += 60;
  if (/Andrew|Ava|Emma|Brian|Jenny|Aria|Michelle|Roger|Guy|Samantha|Google US English/i.test(name)) score += 35;
  if (/Zira|David|Mark|Hazel/i.test(name)) score -= 10;
  if (voice.localService) score += 5;

  return score;
}

function pickWalkthroughVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((voice) => /en/i.test(voice.lang));
  return voices
    .slice()
    .sort((a, b) => scoreWalkthroughVoice(b) - scoreWalkthroughVoice(a))[0] || null;
}

function speakWalkthroughSegment() {
  if (!("speechSynthesis" in window)) {
    if (walkthroughStatus) walkthroughStatus.textContent = "Voice unavailable in this browser";
    if (walkthroughFallback) walkthroughFallback.textContent = "This browser does not expose speech synthesis, so use the chapter buttons and captions as the full script.";
    walkthroughState.isPlaying = false;
    updateWalkthroughButtons();
    return;
  }

  const currentRun = ++walkthroughState.runId;
  const segment = walkthroughSegments[walkthroughState.index];
  const utterance = new SpeechSynthesisUtterance(segment.speech);
  const voice = pickWalkthroughVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = /Natural|Neural|Multilingual|Online/i.test(voice?.name || "") ? 1 : 0.96;
  utterance.pitch = 0.98;

  utterance.onstart = () => {
    walkthroughState.isPlaying = true;
    walkthroughState.isPaused = false;
    if (walkthroughStatus) walkthroughStatus.textContent = `Playing chapter ${walkthroughState.index + 1} of ${walkthroughSegments.length}`;
    if (walkthroughFallback) walkthroughFallback.textContent = "If your browser blocks speech, the captions and chapter buttons still give you the full talk track.";
    updateWalkthroughButtons();
  };

  utterance.onend = () => {
    if (currentRun !== walkthroughState.runId || walkthroughState.isPaused) return;
    if (walkthroughState.index < walkthroughSegments.length - 1) {
      walkthroughState.index += 1;
      renderWalkthrough();
      speakWalkthroughSegment();
      return;
    }
    walkthroughState.isPlaying = false;
    walkthroughState.isPaused = false;
    if (walkthroughStatus) walkthroughStatus.textContent = "Walkthrough complete. Press restart to play it again.";
    updateWalkthroughButtons();
  };

  utterance.onerror = () => {
    walkthroughState.isPlaying = false;
    walkthroughState.isPaused = false;
    if (walkthroughStatus) walkthroughStatus.textContent = "Voice playback hit a browser limitation";
    if (walkthroughFallback) walkthroughFallback.textContent = "Voice playback could not start here, but the captions still show the full script chapter by chapter.";
    updateWalkthroughButtons();
  };

  renderWalkthrough();
  window.speechSynthesis.cancel();
  window.setTimeout(() => window.speechSynthesis.speak(utterance), 80);
}

function startWalkthrough(fromStart = false) {
  if (!walkthroughStage) return;
  if (fromStart) {
    stopWalkthrough();
    walkthroughState.index = 0;
    renderWalkthrough();
  }

  if (walkthroughState.isPaused && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
    walkthroughState.isPaused = false;
    walkthroughState.isPlaying = true;
    if (walkthroughStatus) walkthroughStatus.textContent = `Playing chapter ${walkthroughState.index + 1} of ${walkthroughSegments.length}`;
    updateWalkthroughButtons();
    return;
  }

  if (walkthroughState.isPlaying) return;
  speakWalkthroughSegment();
}

function pauseWalkthrough() {
  if (!walkthroughStage || !("speechSynthesis" in window)) return;
  if (walkthroughState.isPlaying && !walkthroughState.isPaused) {
    window.speechSynthesis.pause();
    walkthroughState.isPaused = true;
    walkthroughState.isPlaying = false;
    if (walkthroughStatus) walkthroughStatus.textContent = `Paused on chapter ${walkthroughState.index + 1}`;
    updateWalkthroughButtons();
    return;
  }

  if (walkthroughState.isPaused) {
    startWalkthrough();
  }
}

async function toggleWalkthroughFullscreen() {
  if (!walkthroughStage || !walkthroughFullscreen) return;

  if (!canUseWalkthroughFullscreen()) {
    if (walkthroughStatus) walkthroughStatus.textContent = "Full screen is not available in this browser";
    return;
  }

  try {
    if (document.fullscreenElement === walkthroughStage) {
      await document.exitFullscreen();
    } else {
      await walkthroughStage.requestFullscreen();
    }
  } catch (error) {
    if (walkthroughStatus) walkthroughStatus.textContent = "Full screen could not start in this browser";
  }
}

if (walkthroughPlay) walkthroughPlay.addEventListener("click", () => startWalkthrough());
if (walkthroughPause) walkthroughPause.addEventListener("click", pauseWalkthrough);
if (walkthroughRestart) walkthroughRestart.addEventListener("click", () => startWalkthrough(true));
if (walkthroughFullscreen) walkthroughFullscreen.addEventListener("click", toggleWalkthroughFullscreen);
document.addEventListener("fullscreenchange", updateWalkthroughFullscreenButton);
window.addEventListener("hashchange", scrollToVisibleHashTarget);
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => renderWalkthrough();
}
initializePageRoute();
initializeTopbar();
initializeFocusMode();
initializeBossMode();
initializeThemeMode();
renderWalkthrough();
