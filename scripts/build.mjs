import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const publicDir = new URL("public/", root);
const dist = new URL("dist/", root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(publicDir, dist, { recursive: true });

const routes = [
  "",
  "support",
  "privacy",
  "terms",
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
  "vendor-management-resume-evidence",
  "budget-responsibility-resume-evidence",
  "data-analysis-resume-evidence",
  "stakeholder-communication-resume-evidence",
  "training-delivery-resume-evidence",
  "change-management-resume-evidence",
  "technical-documentation-resume-evidence",
  "capacity-planning-resume-evidence",
  "project-scheduling-resume-evidence",
  "issue-escalation-resume-evidence",
  "presentation-resume-evidence",
  "mentorship-resume-evidence",
  "accessibility-resume-evidence",
  "customer-research-resume-evidence",
  "operations-resume-evidence",
  "conflict-resolution-resume-evidence",
];
for (const route of routes.slice(1)) {
  const target = new URL(`${route}/`, dist);
  await mkdir(target, { recursive: true });
  await cp(new URL(`${route}.html`, publicDir), new URL("index.html", target));
}

const urls = routes.map((route) => `  <url><loc>https://jobproof.pagecheckai.com/${route}</loc></url>`).join("\n");
await writeFile(new URL("sitemap.xml", dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile(new URL("robots.txt", dist), "User-agent: *\nAllow: /\nSitemap: https://jobproof.pagecheckai.com/sitemap.xml\n");
console.log("Built JobProofAI.");
