import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dist = new URL("../dist/", import.meta.url);

test("renders the evidence checker as the first screen", async () => {
  const html = await readFile(new URL("index.html", dist), "utf8");
  assert.match(html, /Map job requirements to resume evidence/);
  assert.match(html, /id="jobDescription"[^>]*required/);
  assert.match(html, /id="resume"[^>]*required/);
  assert.match(html, /id="truthConfirmed"[^>]*required/);
  assert.match(html, /Build evidence map/);
  assert.match(html, /No upload, account login, application submission, ATS score/);
  assert.match(html, /id="checkoutPack"[^>]*aria-disabled="true"/);
  assert.match(html, /\$19 Application Evidence Pack/);
  assert.match(html, /assets\/evidence-map\.jpg/);
  assert.doesNotMatch(html, /guarantee.{0,30}(interview|job|employment)/i);
});

test("ships browser-local mapping and current-input invalidation", async () => {
  const script = await readFile(new URL("app.js", dist), "utf8");
  assert.match(script, /function requirements/);
  assert.match(script, /function bestEvidence/);
  assert.match(script, /explicit.*partial.*missing/s);
  assert.match(script, /Missing evidence becomes a question|No matching resume line found/);
  assert.match(script, /form\.addEventListener\("input", invalidate\)/);
  assert.match(script, /reportIsCurrent\(\) && !currentReportIsDemo/);
  assert.match(script, /product: "jobproofai"/);
  assert.match(script, /application_evidence_pack/);
  assert.match(script, /\^JP-/);
  assert.match(script, /function downloadTextFile/);
  assert.match(script, /document\.body\.append\(link\)/);
  assert.match(script, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 1000\)/);
  assert.match(script, /Evidence-map download could not start\. Your current map is still available; retry download\./);
  assert.match(script, /Paid pack download could not start\. Your current evidence map and activation are still available; retry download\./);
  assert.doesNotMatch(script, /link\.click\(\);\s*window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 1000\);\s*updatePaidState/);
  assert.match(script, /fetch\(LICENSE_VERIFY_URL/);
  assert.doesNotMatch(script, /fetch\((?!LICENSE_VERIFY_URL)|XMLHttpRequest|WebSocket/);
});

test("includes privacy-safe policy and discovery files", async () => {
  const support = await readFile(new URL("support.html", dist), "utf8");
  const privacy = await readFile(new URL("privacy.html", dist), "utf8");
  const terms = await readFile(new URL("terms.html", dist), "utf8");
  const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
  const robots = await readFile(new URL("robots.txt", dist), "utf8");
  assert.match(support, /Do not send a full resume/);
  assert.match(support, /does not access ATS systems/);
  assert.match(support, /PayPal receipt ID/);
  assert.match(privacy, /not uploaded by the tool/);
  assert.match(privacy, /activation code and product name/);
  assert.match(terms, /Matching words do not prove competence, job fit, ATS compatibility/);
  assert.match(terms, /Never invent or exaggerate evidence/);
  assert.match(sitemap, /https:\/\/jobproof\.pagecheckai\.com\/support/);
  assert.match(robots, /Sitemap: https:\/\/jobproof\.pagecheckai\.com\/sitemap\.xml/);
});

test("builds extensionless policy routes", async () => {
  for (const route of ["support", "privacy", "terms"]) {
    const html = await readFile(new URL(`${route}/index.html`, dist), "utf8");
    assert.match(html, /JobProofAI/);
  }
});

test("ships thirty-five distinct evidence-first intent guides", async () => {
  const routes = [
    "map-job-description-to-resume-evidence",
    "resume-evidence-gap-checklist",
    "truthful-resume-tailoring-checklist",
    "interview-evidence-questions",
    "career-change-transferable-evidence",
    "resume-bullet-evidence-audit",
    "resume-skill-claim-verification",
    "project-experience-evidence-checklist",
    "manager-resume-outcome-evidence",
    "return-to-work-experience-mapping",
    "freelance-project-resume-evidence",
    "volunteer-experience-resume-evidence",
    "resume-certification-claim-checklist",
    "remote-work-experience-evidence",
    "customer-outcome-resume-evidence",
    "internship-resume-evidence-checklist",
    "portfolio-work-sample-evidence",
    "resume-promotion-claim-evidence",
    "cross-functional-collaboration-evidence",
    "process-improvement-resume-evidence",
    "resume-award-claim-evidence",
    "training-course-resume-evidence",
    "team-lead-resume-evidence",
    "project-deadline-resume-evidence",
    "cost-savings-resume-evidence",
    "sales-quota-resume-evidence",
    "quality-improvement-resume-evidence",
    "product-launch-resume-evidence",
    "research-project-resume-evidence",
    "customer-support-resume-evidence",
    "employee-onboarding-resume-evidence",
    "inventory-accuracy-resume-evidence",
    "event-coordination-resume-evidence",
    "compliance-documentation-resume-evidence",
    "incident-response-resume-evidence",
  ];
  const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
  const titles = new Set();
  for (const route of routes) {
    const html = await readFile(new URL(`${route}/index.html`, dist), "utf8");
    titles.add(html.match(/<title>([^<]+)<\/title>/)?.[1]);
    assert.match(html, /utm_source=seo/);
    assert.match(html, /free evidence map|evidence map|Map evidence for free|Review evidence for free|Review a role for free|Map transferable evidence/i);
    assert.match(html, /does not|No automatic|No interview|No fit/);
    assert.match(sitemap, new RegExp(`jobproof\\.pagecheckai\\.com/${route}`));
    assert.doesNotMatch(html, /guaranteed interview|guaranteed job|ATS score:|hiring probability/i);
  }
  assert.equal(titles.size, routes.length);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 39);
});
