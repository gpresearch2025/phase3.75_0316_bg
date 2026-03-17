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
      { name: "MRN linkage", detail: "Stored for custody and patient-authorized clinician sharing under tighter scope." }
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
    match: /compare|research|treatment/i,
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
    description: "Patient-authorized clinician sharing and a minimal ops console should be real surfaces now, without implying a full staff portal.",
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
  currentRoute: null
};

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
const statusPolicyId = document.getElementById("status-policy-id");
const statusShare = document.getElementById("status-share");
const statusRecipient = document.getElementById("status-recipient");
const statusLane = document.getElementById("status-lane");
const statusAuditCount = document.getElementById("status-audit-count");
const opsLastEvent = document.getElementById("ops-last-event");
const opsShareState = document.getElementById("ops-share-state");
const opsRecipientMode = document.getElementById("ops-recipient-mode");
const opsProviderMode = document.getElementById("ops-provider-mode");
const opsLastSummary = document.getElementById("ops-last-summary");

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function classifyAction(action) {
  if (action.includes("off_board")) return "offboard";
  if (action.includes("denied") || action.includes("failed")) return "deny";
  if (action.includes("policy") || action.includes("share") || action.includes("verification")) return "policy";
  return "allow";
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
        status = "Patient authorized";
        note = "Available only to the verified clinician destination within the scoped share.";
      } else if (policy.recipient_type === "api_consumer" && key === "identity" && !policy.identifiers_included) {
        status = "Selected, masked";
        note = "Scope includes identity but identifiers remain masked until explicitly allowed.";
      } else {
        status = "Included";
        note = policy.recipient_type === "api_consumer"
          ? "Accessible only after recipient verification and scope checks."
          : policy.recipient_type === "clinician_share"
            ? "Included in the patient-authorized clinician share."
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

function renderOps() {
  const policy = state.activePolicy;
  const last = state.audit[0];
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
  if (opsLastSummary) opsLastSummary.textContent = last ? last.summary : "Apply a policy or run a route to populate ops context.";
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
    if (requestedPods.includes("records")) guardrails.push("Records are held for Max Intelligence or clinician sharing only; Private+ keeps them out.");
    if (requestedPods.includes("identity") && effectiveIdentifiers) guardrails.push("Identifiers may only participate in broader governed context, never in Private+.");
    if (requestedPods.includes("identity") && !effectiveIdentifiers) guardrails.push("Identity selected but identifiers remain off until explicit authorization.");
    if (effectiveGranularity === "raw_if_allowed") guardrails.push("Raw wearable detail is reserved for broader governed context when specifically authorized.");
  } else if (recipient === "clinician_share") {
    guardrails.push(recipientVerified.checked ? "Destination verification satisfied for clinician share." : "Clinician share stays pending until the doctor, clinic, or hospital destination is verified.");
    guardrails.push("Patient-authorized clinician sharing can scope purpose, duration, and selected pods now.");
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
    clinician_share_mode: recipient === "clinician_share" ? "patient_authorized" : "none"
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
  if (policy.recipient_type === "clinician_share") chips.push("Share path: patient authorized");
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

renderPod("biomarkers");
if (promptSelect) promptSelect.value = "What lifestyle changes may improve these labs?";
renderPolicy();
renderLaneCards();
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
addAudit("consent_policy_created", "Initial prototype policy loaded using the March 17 control-plane defaults.");
addAudit("auth_login", "User entered the prototype workspace and established an authenticated session.");
