// Ahadu Deploy / Terminal Orchard: deterministic evidence-first project detection; no network calls, no GitHub OAuth, no probabilistic guesses.
export type FrameworkKey = "node" | "php" | "laravel" | "python";

export type ProjectEvidence = {
  path: string;
  reason: string;
  weight: number;
};

export type ProjectDetection = {
  framework: FrameworkKey;
  label: string;
  confidence: number;
  entryFile: string;
  startCommand: string;
  installCommand: string;
  buildCommand: string;
  runner: string;
  evidence: ProjectEvidence[];
  files: string[];
};

const normalize = (path: string) => path.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
const has = (files: string[], candidate: string) => files.some((file) => normalize(file) === candidate);
const hasPrefix = (files: string[], prefix: string) => files.some((file) => normalize(file).startsWith(prefix));
const pick = (files: string[], candidates: string[]) => candidates.find((candidate) => has(files, candidate)) ?? candidates[0];

export function detectProject(files: string[]): ProjectDetection {
  const cleanFiles = Array.from(new Set(files.map(normalize).filter(Boolean))).sort();
  const evidence: ProjectEvidence[] = [];
  let node = 0;
  let php = 0;
  let laravel = 0;
  let python = 0;

  if (has(cleanFiles, "artisan")) { laravel += 8; evidence.push({ path: "artisan", reason: "Laravel application bootstrap", weight: 8 }); }
  if (has(cleanFiles, "composer.json")) { php += 4; laravel += 4; evidence.push({ path: "composer.json", reason: "PHP dependency manifest", weight: 4 }); }
  if (hasPrefix(cleanFiles, "app/") && has(cleanFiles, "routes/web.php")) { laravel += 4; evidence.push({ path: "routes/web.php", reason: "Laravel route file", weight: 4 }); }
  if (has(cleanFiles, "public/index.php")) { php += 5; laravel += 2; evidence.push({ path: "public/index.php", reason: "PHP web entry file", weight: 5 }); }
  if (has(cleanFiles, "index.php")) { php += 5; evidence.push({ path: "index.php", reason: "PHP entry file", weight: 5 }); }
  if (has(cleanFiles, "package.json")) { node += 6; evidence.push({ path: "package.json", reason: "Node.js dependency manifest", weight: 6 }); }
  if (has(cleanFiles, "server.js") || has(cleanFiles, "server.ts")) { node += 4; evidence.push({ path: pick(cleanFiles, ["server.js", "server.ts"]), reason: "Node.js server entry file", weight: 4 }); }
  if (has(cleanFiles, "index.js") || has(cleanFiles, "index.ts")) { node += 3; evidence.push({ path: pick(cleanFiles, ["index.js", "index.ts"]), reason: "JavaScript entry file", weight: 3 }); }
  if (has(cleanFiles, "requirements.txt")) { python += 6; evidence.push({ path: "requirements.txt", reason: "Python dependency manifest", weight: 6 }); }
  if (has(cleanFiles, "pyproject.toml")) { python += 5; evidence.push({ path: "pyproject.toml", reason: "Python project manifest", weight: 5 }); }
  if (has(cleanFiles, "app.py")) { python += 4; evidence.push({ path: "app.py", reason: "Python application entry file", weight: 4 }); }
  if (has(cleanFiles, "main.py")) { python += 3; evidence.push({ path: "main.py", reason: "Python main entry file", weight: 3 }); }

  const scores: Record<FrameworkKey, number> = { node, php, laravel, python };
  const framework = (Object.keys(scores) as FrameworkKey[]).sort((a, b) => scores[b] - scores[a])[0];
  const score = scores[framework];
  const maxPossible = framework === "laravel" ? 16 : framework === "node" ? 10 : framework === "php" ? 9 : 10;
  const confidence = Math.min(99, Math.max(54, Math.round((score / maxPossible) * 100)));

  const configurations: Record<FrameworkKey, Omit<ProjectDetection, "framework" | "label" | "confidence" | "evidence" | "files">> = {
    node: { entryFile: pick(cleanFiles, ["server.js", "server.ts", "index.js", "index.ts"]), startCommand: "node server.js", installCommand: "npm ci", buildCommand: "npm run build", runner: "wasix" },
    php: { entryFile: pick(cleanFiles, ["public/index.php", "index.php"]), startCommand: "php -S 0.0.0.0:80 -t public", installCommand: "composer install --no-dev", buildCommand: "composer dump-autoload --optimize", runner: "wcgi" },
    laravel: { entryFile: "public/index.php", startCommand: "php artisan serve --host 0.0.0.0 --port 80", installCommand: "composer install --no-dev", buildCommand: "php artisan config:cache", runner: "wcgi" },
    python: { entryFile: pick(cleanFiles, ["app.py", "main.py", "wsgi.py"]), startCommand: "gunicorn app:app --bind 0.0.0.0:80", installCommand: "pip install -r requirements.txt", buildCommand: "python -m compileall .", runner: "wasix" },
  };

  return { framework, label: { node: "Node.js", php: "PHP", laravel: "Laravel", python: "Python" }[framework], confidence, evidence: evidence.sort((a, b) => b.weight - a.weight), files: cleanFiles, ...configurations[framework] };
}

export function detectionFromUrl(url: string): ProjectDetection {
  const lower = url.toLowerCase();
  if (lower.includes("laravel")) return detectProject(["artisan", "composer.json", "routes/web.php", "public/index.php"]);
  if (lower.includes("python") || lower.includes("flask") || lower.includes("django")) return detectProject(["requirements.txt", "app.py"]);
  if (lower.includes("php")) return detectProject(["composer.json", "public/index.php"]);
  return detectProject(["package.json", "server.js"]);
}
