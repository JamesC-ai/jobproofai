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
  assert.match(script, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 1000\)/);
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
  assert.match(sitemap, /https:\/\/jobproofai\.pages\.dev\/support/);
  assert.match(robots, /Sitemap: https:\/\/jobproofai\.pages\.dev\/sitemap\.xml/);
});

test("builds extensionless policy routes", async () => {
  for (const route of ["support", "privacy", "terms"]) {
    const html = await readFile(new URL(`${route}/index.html`, dist), "utf8");
    assert.match(html, /JobProofAI/);
  }
});
