const vaultPods = {
  biomarkers: {
    title: "Biomarkers Pod",
    description: "Structured lab values and raw report artifacts live here.",
    assets: [
      { name: "LDL / HDL timeline", detail: "Structured values normalized from uploaded lab reports." },
      { name: "Quest lipid panel PDF", detail: "Raw artifact stored for custody; AI export falls back to structured values unless sanitized." },
      { name: "Baseline lipid profile", detail: "Derived baseline summary tied back to source VaultItems." }
    ]
  },
  wearables: {
    title: "Wearables Pod",
    description: "High-frequency device data with derived-first sharing defaults.",
    assets: [
      { name: "Sleep summary - 14 days", detail: "Derived L1 summary for AI-safe export and coach-friendly sharing." },
      { name: "HRV daily aggregates", detail: "Connector-normalized values with provenance back to raw sync items." },
      { name: "Apple Watch raw heart rate", detail: "Raw series available internally, never default for outbound shares." }
    ]
  },
  records: {
    title: "Records Pod",
    description: "EHR, EMR, and PHR documents stay under stricter guardrails.",
    assets: [
      { name: "Visit summary PDF", detail: "Available for custody and API consumer review, blocked from AI export in Phase 3.75." },
      { name: "Discharge instructions", detail: "Raw document artifact with stronger review requirements." }
    ]
  },
  identity: {
    title: "Identity Pod",
    description: "Identifiers are minimized by default and blocked from AI-bound shares.",
    assets: [
      { name: "Primary email", detail: "Explicit toggle only for non-AI recipients." },
      { name: "Home address", detail: "Safe Harbor identifier, excluded from AI export." },
      { name: "MRN linkage", detail: "Stored for custody but never exposed to AI-bound bundles." }
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
  { match: /trend|timeline|show|list|values|calculate/i, lane: "Deterministic", summary: "No AI is needed for this request. Structured retrieval is enough.", internal: true, privacy: 95, capability: 28, control: 96, outputClass: "structured_internal", leaves: "Nothing", role: "Trust anchor" },
  { match: /explain|understand|summarize/i, lane: "Private", summary: "Protected internal AI can explain sensitive personal context without external export.", internal: true, privacy: 90, capability: 55, control: 92, outputClass: "protected_internal", leaves: "Sensitive record data stays internal", role: "Highest-privacy AI lane" },
  { match: /lifestyle|habits|general/i, lane: "Private+", summary: "Reduced context packet is enough for broader external assistance.", internal: false, privacy: 78, capability: 74, control: 90, outputClass: "derived_only", leaves: "Minimum-necessary reduced context", role: "Adoption bridge" },
  { match: /compare|research|treatment/i, lane: "Max Intelligence", summary: "Broader governed external reasoning is needed for this request.", internal: false, privacy: 62, capability: 96, control: 78, outputClass: "governed_external", leaves: "More context may leave under governance", role: "Consumer freedom while keeping Consentext in front" },
  { match: /paste my records directly into chatgpt|directly into claude|bypass consentext|outside consentext/i, lane: "Off-Board", summary: "This action leaves Consentext protections and is no longer governed by the trust kernel.", internal: false, offboard: true, privacy: 20, capability: 100, control: 0, outputClass: "outside_protection", leaves: "Potentially anything the user chooses to share", role: "Outside Consentext protections" }
];

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
const workstreams = [
  {
    title: "Data / experience layer",
    badge: "Data plane",
    status: "Existing exploration",
    description: "Vault storage, tracker dashboards, wearable ingestion, and lab/record visualizations continue to improve.",
    focus: [
      "Vault storage + tracker portals",
      "Wearable ingestion and sync",
      "Lab schema & biomarker organization",
      "Health dashboard surfaces"
    ]
  },
  {
    title: "Governance architecture layer",
    badge: "Phase 3.75",
    status: "Design + prototype",
    description: "The trust kernel, consent engine, AI gateway, and audit work together to decide what leaves the vault.",
    focus: [
      "Trust boundary + consent engine",
      "Policy evaluation & de-identification",
      "AI gateway lane routing",
      "Append-only audit"
    ]
  },
  {
    title: "Future integration layer",
    badge: "Future integration",
    status: "Planned",
    description: "Connecting the governance controls back to the data plane and downstream APIs later.",
    focus: [
      "Governance-to-data integration",
      "API enforcement + recipient verification",
      "Off-board planning + signals",
      "External system gating"
    ]
  }
];
const healthMetrics = {
  ldl: { value: 142, unit: "mg/dL", target: 130, note: "Down from 154 last month.", fill: 78 },
  rhr: { value: 58, unit: " bpm", target: 60, note: "High-confidence baseline; no drift.", fill: 60 },
  sleep: { value: 7.1, unit: " h", target: 7.5, note: "Coaching target 7h 30m.", fill: 76 },
  hrv: { value: 55, unit: "", target: 60, note: "HRV trending up 8% vs last week.", fill: 68 }
};

const statusPolicyId = document.getElementById("status-policy-id");
const statusShare = document.getElementById("status-share");
const statusRecipient = document.getElementById("status-recipient");
const statusLane = document.getElementById("status-lane");
const statusAuditCount = document.getElementById("status-audit-count");

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function classifyAction(action) {
  if (action.includes("off_board")) return "offboard";
  if (action.includes("denied") || action.includes("failed")) return "deny";
  if (action.includes("policy") || action.includes("share")) return "policy";
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
}

function renderAudit() {
  const items = state.audit.filter((entry) => state.auditFilter === "all" || entry.kind === state.auditFilter || (state.auditFilter === "offboard" && entry.action.includes("off_board")));
  auditFeed.innerHTML = items.map((entry, index) => `
    <article class="audit-item audit-kind-${entry.kind} ${index === 0 ? "new-audit" : ""}">
      <div>
        <div class="audit-meta">${entry.time}</div>
        <strong>${entry.action}</strong>
        <span class="audit-badge audit-badge-${entry.kind}">${entry.kind}</span>
      </div>
      <p>${entry.summary}</p>
    </article>
  `).join("");
  renderTimeline();
}

function renderControlStatus() {
  const policy = state.activePolicy;
  if (statusPolicyId) statusPolicyId.textContent = policy ? policy.policy_id : "policy-000";
  if (statusShare) statusShare.textContent = state.shareStatus === "active" ? "Active" : "Revoked";
  if (statusRecipient) statusRecipient.textContent = policy ? (policy.recipient_type === "ai_export" ? "AI export" : "API consumer") : "Not set";
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
  const policyPods = state.activePolicy ? state.activePolicy.pod_types : [];
  podsTableBody.innerHTML = Object.entries(vaultPods).map(([key, pod]) => {
    const allowed = policyPods.includes(key) && state.shareStatus === "active";
    const status = allowed ? "Included" : state.shareStatus === "revoked" ? "Revoked" : "Not selected";
    const note = ["identity", "records"].includes(key)
      ? "AI export restricted for identifiers and records."
      : "Derived summaries available for governed export.";
    return `
      <tr>
        <td><strong>${pod.title}</strong></td>
        <td>${status}</td>
        <td>${note}</td>
      </tr>
    `;
  }).join("");
  renderDashboard();
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
    `What leaves: ${lane.leaves}`,
    `Strategic role: ${lane.role}`,
    lane.internal ? "Contained inside the Consentext trust kernel" : lane.offboard ? "User exits the trust kernel at will" : "Governed external export"
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
  selectLane(laneMap.find((item) => item.lane === "Private+") || laneMap[0]);
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
  podTitle.textContent = pod.title;
  podDescription.textContent = pod.description;
  assetList.innerHTML = pod.assets.map((asset) => `
    <li>
      <strong>${asset.name}</strong>
      <span>${asset.detail}</span>
    </li>
  `).join("");
  podButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.pod === key));
}

function computeEffectivePolicy() {
  const requestedPods = [];
  if (scopeBiomarkers.checked) requestedPods.push("biomarkers");
  if (scopeWearables.checked) requestedPods.push("wearables");
  if (scopeRecords.checked) requestedPods.push("records");
  if (scopeIdentity.checked) requestedPods.push("identity");

  const recipient = recipientType.value;
  const guardrails = [];
  let effectiveIdentifiers = identifiersToggle.checked;
  let effectiveGranularity = granularity.value;

  if (recipient === "ai_export") {
    if (requestedPods.includes("identity")) guardrails.push("Identity pod removed: AI export hard-blocks identifiers.");
    if (requestedPods.includes("records")) guardrails.push("Records pod removed: AI export excludes records documents in Phase 3.75.");
    effectiveIdentifiers = false;
    effectiveGranularity = "derived_only";
    guardrails.push("Identifiers forced off for AI export.");
    guardrails.push("Wearables forced to derived-only for AI export.");
  } else {
    guardrails.push(recipientVerified.checked ? "Recipient verification satisfied for API access." : "API consumer requests deny until recipient verification passes.");
    if (scopeRecords.checked) guardrails.push("Records pod requires stronger review and explicit user selection.");
    if (scopeIdentity.checked && !identifiersToggle.checked) guardrails.push("Identity pod selected but identifiers remain off.");
  }

  const normalizedPods = requestedPods.filter((pod) => !(recipient === "ai_export" && ["identity", "records"].includes(pod)));
  if (!normalizedPods.length) normalizedPods.push("biomarkers");

  const policy = {
    policy_id: `policy-${String(state.policyVersion).padStart(3, "0")}`,
    share_status: state.shareStatus,
    recipient_type: recipient,
    purpose: purpose.value,
    duration: duration.value,
    pod_types: normalizedPods,
    identifiers_included: recipient === "ai_export" ? false : effectiveIdentifiers,
    wearables_granularity: effectiveGranularity,
    recipient_verification_required: recipient === "api_consumer" ? "jwt" : "none",
    recipient_verified: recipient === "api_consumer" ? recipientVerified.checked : true,
    minimal_disclosure: true,
    deidentify_by_default: true
  };

  return { policy, guardrails };
}

function renderPolicy() {
  const { policy, guardrails } = computeEffectivePolicy();
  state.activePolicy = policy;
  guardrailList.innerHTML = guardrails.map((item) => `<li>${item}</li>`).join("");
  policyJson.textContent = JSON.stringify(policy, null, 2);
  policyChips.innerHTML = [
    `Recipient: ${policy.recipient_type}`,
    `Purpose: ${policy.purpose}`,
    `Duration: ${policy.duration}`,
    `Pods: ${policy.pod_types.join(", ")}`,
    `Identifiers: ${policy.identifiers_included ? "on" : "off"}`
  ].map((chip) => `<span class="policy-chip">${chip}</span>`).join("");
}

function resolveLane(prompt) {
  return laneMap.find((item) => item.match.test(prompt)) || laneMap[1];
}

function updateHero(route) {
  heroLane.textContent = route.lane;
  heroSummary.textContent = route.summary;
  heroPrompt.textContent = route.prompt;
  heroAllowedCount.textContent = `${route.included.length || 1} allowed items`;
  heroBlockedCount.textContent = `${route.blocked.length || 0} blocked items`;
  heroOutputClass.textContent = route.outputClass;
  heroStatus.textContent = route.statusLabel;
  heroStatus.className = `status-pill ${route.statusClass}`;
  meterPrivacy.style.width = `${route.privacy}%`;
  meterCapability.style.width = `${route.capability}%`;
  meterControl.style.width = `${route.control}%`;
}

function runRouting() {
  const prompt = promptSelect.value;
  const lane = resolveLane(prompt);
  const { policy } = computeEffectivePolicy();
  const source = [];
  const included = [];
  const blocked = [];
  let status = "allow";
  let decision = "Allowed";
  let reason = "Request can proceed within the active policy and control-plane guardrails.";

  if (policy.pod_types.includes("biomarkers")) source.push("Biomarker values");
  if (policy.pod_types.includes("wearables")) source.push("Wearable summaries");
  if (scopeRecords.checked) source.push("Record documents requested");
  if (scopeIdentity.checked) source.push("Identity fields requested");
  if (!source.length) source.push("Minimal biomarker context");

  if (lane.internal) {
    included.push("Internal protected processing path");
    included.push(/trend|show|list/i.test(prompt) ? "Structured biomarker retrieval" : "Protected explanation context");
    blocked.push("No external provider involved");
  } else if (lane.offboard) {
    status = "deny";
    decision = "Off-Board";
    reason = "The user is bypassing Consentext and leaving the governed environment.";
    blocked.push("Outside Consentext protections");
    blocked.push("No minimization or audit beyond exit event");
    addAudit("off_board_exit", `User chose to bypass Consentext for: ${prompt}`);
  } else if (policy.recipient_type !== "ai_export") {
    status = "deny";
    decision = "Denied";
    reason = "Prompt requires an AI export-capable path, but the active share is configured for API consumer access.";
    blocked.push("recipient_type mismatch");
  } else if (state.shareStatus !== "active") {
    status = "deny";
    decision = "Denied";
    reason = "Share is revoked, so no future export is allowed.";
    blocked.push("share_revoked");
  } else {
    included.push("AI export share is active");
    included.push("Identifiers excluded");
    included.push("Records pod excluded");
    if (policy.pod_types.includes("wearables")) included.push("Wearables reduced to derived summaries");
    if (lane.lane === "Max Intelligence") blocked.push("Two-step high-risk review still required before real export");
  }

  routeLane.textContent = lane.lane;
  routeSummary.textContent = status === "allow" ? lane.summary : reason;
  routeStatus.textContent = decision;
  routeStatus.className = `status-pill ${status === "allow" ? "status-allow" : "status-deny"}`;
  routeSource.innerHTML = source.map((item) => `<li>${item}</li>`).join("");
  routeIncluded.innerHTML = (included.length ? included : ["No governed output generated"]).map((item) => `<li>${item}</li>`).join("");
  routeBlocked.innerHTML = (blocked.length ? blocked : ["No additional blocks triggered"]).map((item) => `<li>${item}</li>`).join("");

  const bundle = status === "allow"
    ? {
        prompt,
        lane: lane.lane.toLowerCase().replace("+", "_plus").replace(" ", "_"),
        recipient_type: lane.internal ? "internal" : policy.recipient_type,
        pod_scope: lane.internal ? ["biomarkers", "derived"] : policy.pod_types,
        identifiers_included: false,
        records_included: false,
        transform_level: lane.lane === "Deterministic" ? "none" : "L1/L2",
        output_classification: lane.outputClass,
        share_status: state.shareStatus,
        user_message: lane.summary
      }
    : {
        prompt,
        decision: decision.toLowerCase(),
        reason_code: blocked[0] || "internal_error_fail_closed",
        share_status: state.shareStatus,
        summary: reason
      };

  routeJson.textContent = JSON.stringify(bundle, null, 2);

  const heroRoute = {
    lane: lane.lane,
    summary: status === "allow" ? lane.summary : reason,
    prompt,
    included,
    blocked,
    outputClass: lane.outputClass,
    privacy: lane.privacy,
    capability: lane.capability,
    control: lane.control,
    statusLabel: decision,
    statusClass: status === "allow" ? "status-allow" : "status-deny"
  };
  state.currentRoute = heroRoute;
  updateHero(heroRoute);
  renderControlStatus();

  if (!lane.offboard) {
    addAudit(status === "allow" ? "context_generated" : "context_generation_denied", `${decision}: ${prompt}`);
  }
}

function runApiSimulation() {
  const { policy } = computeEffectivePolicy();
  const requestedPod = apiPod.value;
  const withinScope = apiScope.value === "within_scope";
  let decision = "Denied";
  let statusClass = "status-deny";
  let summary = "API consumer requests are denied until the conditions below are satisfied.";
  if (policy.recipient_type !== "api_consumer") {
    summary = "Active share is not configured for API consumer access.";
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
  apiDecision.textContent = decision;
  apiStatus.textContent = decision;
  apiStatus.className = `status-pill ${statusClass}`;
  apiReason.textContent = summary;
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
[recipientType, purpose, duration, granularity, scopeBiomarkers, scopeWearables, scopeRecords, scopeIdentity, identifiersToggle, recipientVerified].forEach((input) => input.addEventListener("change", renderPolicy));
applyPolicy.addEventListener("click", () => {
  state.shareStatus = "active";
  state.policyVersion += 1;
  renderPolicy();
  addAudit("share_created", `Policy ${state.activePolicy.policy_id} applied for ${state.activePolicy.recipient_type}.`);
});
revokeShare.addEventListener("click", () => {
  state.shareStatus = "revoked";
  renderPolicy();
  addAudit("share_revoked", `Policy ${state.activePolicy.policy_id} was revoked. Future access is denied.`);
});
if (runRoute) runRoute.addEventListener("click", runRouting);
if (runApi) runApi.addEventListener("click", runApiSimulation);
renderPod("biomarkers");
renderPolicy();
renderLaneCards();
renderWorkstreams();
state.currentRoute = {
  lane: "Private+",
  summary: "Reduced context packet prepared for external AI assistance.",
  prompt: "What lifestyle changes may improve these labs?",
  included: ["Derived wearable summary", "Biomarker values", "AI export share active"],
  blocked: ["Identity pod blocked", "Records pod blocked"],
  outputClass: "derived_only",
  privacy: 82,
  capability: 58,
  control: 90,
  statusLabel: "Allowed",
  statusClass: "status-allow"
};
updateHero(state.currentRoute);
renderControlStatus();
addAudit("consent_policy_created", "Initial prototype policy loaded using the control-plane defaults.");
addAudit("auth_login", "User entered the prototype workspace and established an authenticated session.");



