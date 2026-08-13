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
