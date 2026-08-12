const form = document.querySelector("#proofForm");
const role = document.querySelector("#role");
const jobDescription = document.querySelector("#jobDescription");
const resume = document.querySelector("#resume");
const truthConfirmed = document.querySelector("#truthConfirmed");
const results = document.querySelector("#results");
const summary = document.querySelector("#summary");
const status = document.querySelector("#status");
const reviewSection = document.querySelector("#reviewSection");
const reviewList = document.querySelector("#reviewList");
const copyReport = document.querySelector("#copyReport");
const downloadReport = document.querySelector("#downloadReport");
const checkoutPack = document.querySelector("#checkoutPack");
const paymentStatus = document.querySelector("#paymentStatus");
const packCode = document.querySelector("#packCode");
const activatePack = document.querySelector("#activatePack");
const downloadPack = document.querySelector("#downloadPack");
const packStatus = document.querySelector("#packStatus");
let currentReport = "";
let currentReportIsDemo = false;
let reportSignature = "";
let packActive = false;
const LICENSE_VERIFY_URL = "https://namebatch.pagecheckai.com/api/licenses/verify";
const CHECKOUT_URL = "https://namebatch.pagecheckai.com/api/checkout?v=jobproof-20260812&product=jobproofai&utm_source=jobproofai&utm_medium=owned&utm_campaign=conversion&utm_content=qualified_evidence_map";
const STORAGE_KEY = "jobproofai-paid-code";

const stopWords = new Set("a an and are as at be by for from has have in is it of on or our that the this to we will with you your required preferred ability experience years including using work".split(" "));

function terms(text) {
  return [...new Set((text.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []).filter((word) => !stopWords.has(word)))];
}

function lines(text) {
  return text.split(/\n+|(?<=[.!?])\s+/).map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim()).filter((line) => line.length >= 18);
}

function requirements(text) {
  return lines(text).filter((line) => /responsib|required|prefer|experience|skill|manage|build|create|lead|support|analy|develop|coordinate|communicat|implement|own|deliver|maintain|improve/i.test(line)).slice(0, 16);
}

function bestEvidence(requirement, resumeLines) {
  const wanted = terms(requirement);
  return resumeLines.map((line) => {
    const present = new Set(terms(line));
    const matches = wanted.filter((term) => present.has(term));
    return { line, matches };
  }).sort((a, b) => b.matches.length - a.matches.length)[0] || { line: "", matches: [] };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function currentSignature() {
  return JSON.stringify({ role: role.value.trim(), jobDescription: jobDescription.value.trim(), resume: resume.value.trim(), truthConfirmed: truthConfirmed.checked });
}

function reportIsCurrent() {
  return Boolean(currentReport) && reportSignature === currentSignature();
}

function updatePaidState(message = "") {
  const qualified = reportIsCurrent() && !currentReportIsDemo;
  if (qualified) {
    checkoutPack.href = CHECKOUT_URL;
    checkoutPack.setAttribute("aria-disabled", "false");
    paymentStatus.textContent = "The current evidence map qualifies for the optional pack. Review the scope before paying.";
  } else {
    checkoutPack.removeAttribute("href");
    checkoutPack.setAttribute("aria-disabled", "true");
    paymentStatus.textContent = currentReportIsDemo
      ? "The synthetic example is for preview only. Use your own de-identified text before checkout."
      : "Build a current non-demo evidence map before checkout becomes available.";
  }
  downloadPack.disabled = !packActive || !qualified;
  if (message) packStatus.textContent = message;
}

function invalidate() {
  currentReport = "";
  results.replaceChildren();
  summary.hidden = true;
  reviewSection.hidden = true;
  copyReport.disabled = true;
  downloadReport.disabled = true;
  status.textContent = "Inputs changed. Build a new evidence map before using the report.";
  currentReportIsDemo = false;
  reportSignature = "";
  updatePaidState(packActive ? "Inputs changed. Build a new current map before downloading the paid pack." : "Inputs changed. Build a new current map before checkout.");
}

function buildReport() {
  const reqs = requirements(jobDescription.value);
  const resumeLines = lines(resume.value);
  if (reqs.length < 3) {
    status.textContent = "Add at least three clear responsibilities or requirements to the job description.";
    return;
  }
  const mapped = reqs.map((requirement) => {
    const evidence = bestEvidence(requirement, resumeLines);
    const level = evidence.matches.length >= 3 ? "explicit" : evidence.matches.length ? "partial" : "missing";
    return { requirement, evidence: evidence.line, matches: evidence.matches, level };
  });
  const counts = Object.fromEntries(["explicit", "partial", "missing"].map((level) => [level, mapped.filter((item) => item.level === level).length]));
  summary.innerHTML = `<div><strong>${counts.explicit}</strong><span>explicit</span></div><div><strong>${counts.partial}</strong><span>partial</span></div><div><strong>${counts.missing}</strong><span>missing</span></div>`;
  summary.hidden = false;
  results.innerHTML = mapped.map((item) => `<article class="result ${item.level}"><div class="result-top"><span>${item.level}</span><strong>${escapeHtml(item.requirement)}</strong></div><p>${item.level === "missing" ? "No matching resume line found. Ask whether you have real evidence before adding anything." : `Closest resume evidence: ${escapeHtml(item.evidence)}`}</p><small>${item.matches.length ? `Shared terms: ${escapeHtml(item.matches.join(", "))}` : "Do not add unsupported keywords."}</small></article>`).join("");
  const followUps = mapped.filter((item) => item.level !== "explicit").slice(0, 8).map((item) => `Can you verify a real project, task, outcome, credential, or work sample for: ${item.requirement}`);
  reviewList.innerHTML = [...followUps, "Check every employer, title, date, metric, tool, credential, and outcome against your records.", "Keep the final wording natural and accurate; do not repeat keywords merely to influence a scanner.", "Ask a trusted human reviewer to compare the final resume with the source job description."].map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  reviewSection.hidden = false;
  currentReport = [`JobProofAI evidence map`, `Target role: ${role.value}`, `Boundary: text evidence review only; no ATS, interview, or hiring prediction.`, "", ...mapped.flatMap((item, index) => [`${index + 1}. [${item.level.toUpperCase()}] ${item.requirement}`, item.level === "missing" ? "   Evidence: none found; verify before adding." : `   Evidence: ${item.evidence}`, `   Shared terms: ${item.matches.join(", ") || "none"}`]), "", "Truthful follow-up checklist", ...[...reviewList.children].map((item) => `- ${item.textContent}`)].join("\n");
  status.textContent = `Mapped ${mapped.length} stated requirements. This is not a job-fit or ATS score.`;
  copyReport.disabled = false;
  downloadReport.disabled = false;
  reportSignature = currentSignature();
  updatePaidState(packActive ? "Current map ready. Download the paid pack when ready." : "Current map ready. Enter a JP- activation code after checkout to unlock the paid pack.");
}

form.addEventListener("submit", (event) => { event.preventDefault(); if (form.reportValidity()) buildReport(); });
form.addEventListener("input", invalidate);
document.querySelector("#clearAll").addEventListener("click", () => { form.reset(); role.value = ""; invalidate(); status.textContent = "Complete both text fields to build a current evidence map."; });
document.querySelector("#loadExample").addEventListener("click", () => {
  role.value = "Customer Success Operations Manager";
  jobDescription.value = "Lead customer onboarding operations and improve time to value across a B2B software portfolio.\nBuild reporting dashboards and analyze adoption trends for quarterly business reviews.\nCoordinate with product, sales, and support teams to resolve recurring customer issues.\nRequired: experience managing CRM workflows and documenting repeatable processes.\nPreferred: experience with SQL and customer health scoring.";
  resume.value = "Operations Specialist, Example Software, 2022-2025.\nCoordinated onboarding checklists with product, sales, and support for 30 business accounts.\nBuilt weekly adoption dashboards in Google Sheets and documented recurring handoff issues.\nMaintained HubSpot CRM workflows and created repeatable renewal-review procedures.\nPrepared quarterly account summaries using product usage exports.\nWorked with support leads to categorize recurring setup questions.";
  truthConfirmed.checked = true;
  invalidate();
  currentReportIsDemo = true;
  updatePaidState("Synthetic example loaded. It cannot qualify for checkout.");
  status.textContent = "Example loaded. Build the evidence map to review synthetic text.";
});
copyReport.addEventListener("click", async () => { if (!currentReport) return; await navigator.clipboard.writeText(currentReport); status.textContent = "Current evidence map copied."; });
downloadReport.addEventListener("click", () => { if (!currentReport) return; const url = URL.createObjectURL(new Blob([currentReport], { type: "text/plain" })); const link = document.createElement("a"); link.href = url; link.download = "jobproofai-evidence-map.txt"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = "Evidence-map download started. Wait for your browser to confirm the file."; });

function paidPackText() {
  return [
    "JobProofAI Application Evidence Pack",
    "Generated locally from the current evidence map. No ATS, interview, hiring, employment, or income result is predicted or guaranteed.",
    "",
    currentReport,
    "",
    "Claim verification table",
    "- For every suggested claim, record the employer/project, date range, source record, your exact contribution, and a person or artifact that can verify it.",
    "- Remove any metric, tool, credential, title, scope, or outcome you cannot verify.",
    "- Separate direct experience from adjacent exposure, training, observation, or planned learning.",
    "",
    "Final human-review checklist",
    "- Compare every final line against the source resume and your records.",
    "- Check chronology, tense, role ownership, units, currencies, team size, and attribution.",
    "- Keep natural wording; do not repeat keywords simply to influence a scanner.",
    "- Ask a trusted reviewer to challenge ambiguous or inflated claims.",
    "- Review the employer's official application instructions before submitting.",
  ].join("\n");
}

async function verifyPackCode(rawCode, { quiet = false } = {}) {
  const code = rawCode.trim().toUpperCase();
  if (!/^JP-[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/.test(code)) {
    packActive = false;
    updatePaidState(quiet ? "Enter a valid JP- activation code." : "That activation code format is not valid.");
    return false;
  }
  if (!quiet) packStatus.textContent = "Checking activation code...";
  try {
    const response = await fetch(LICENSE_VERIFY_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, product: "jobproofai" }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.valid || data.entitlement !== "application_evidence_pack") {
      packActive = false;
      updatePaidState("That activation code was not accepted for JobProofAI.");
      return false;
    }
    localStorage.setItem(STORAGE_KEY, code);
    packActive = true;
    packCode.value = code;
    updatePaidState(reportIsCurrent() && !currentReportIsDemo ? "Activation verified. Download the paid pack when ready." : "Activation verified. Build a current non-demo map before downloading.");
    return true;
  } catch {
    packActive = false;
    updatePaidState("Could not reach the license service. Try again, or use support with your PayPal receipt.");
    return false;
  }
}

activatePack.addEventListener("click", () => verifyPackCode(packCode.value));
downloadPack.addEventListener("click", () => {
  if (!packActive || !reportIsCurrent() || currentReportIsDemo) return updatePaidState("Build a current non-demo map and activate the pack before downloading.");
  const url = URL.createObjectURL(new Blob([paidPackText()], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "jobproofai-application-evidence-pack.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  updatePaidState("Paid pack download started. Wait for your browser to confirm the file.");
});

const storedCode = localStorage.getItem(STORAGE_KEY);
if (storedCode) verifyPackCode(storedCode, { quiet: true });
else updatePaidState();
