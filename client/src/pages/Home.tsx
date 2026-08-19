// Ahadu Deploy / Terminal Orchard: warm editorial workspace, dark terminal surfaces, Ahadu Moss readiness states.
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import JSZip from "jszip";
import { detectProject, detectionFromUrl, type ProjectDetection } from "@/lib/projectDetector";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  CloudUpload,
  Code2,
  FileCode2,
  FolderGit2,
  Github,
  Globe2,
  KeyRound,
  Loader2,
  LockKeyhole,
  MoreHorizontal,
  Play,
  Plus,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
} from "lucide-react";

const frameworks = {
  node: {
    label: "Node.js",
    tone: "bg-[#D8F8A1] text-[#1D301B]",
    icon: "JS",
    confidence: "97% match",
    clue: "package.json · express detected",
    entryFile: "server.js",
    command: "node server.js",
    build: "npm run build",
    install: "npm ci",
    recipe: `kind: wasmer.io/App.v0\nname: node-service\npackage: .\n\nentrypoint: node server.js\nport: 80`,
  },
  php: {
    label: "PHP",
    tone: "bg-[#E2DEFF] text-[#352D73]",
    icon: "PHP",
    confidence: "91% match",
    clue: "index.php · composer.json detected",
    entryFile: "public/index.php",
    command: "php -S 0.0.0.0:80 -t public",
    build: "composer install --no-dev",
    install: "composer install",
    recipe: `kind: wasmer.io/App.v0\nname: php-service\npackage: .\n\nentrypoint: public/index.php\nrunner: wcgi`,
  },
  laravel: {
    label: "Laravel",
    tone: "bg-[#FFD7CA] text-[#71321F]",
    icon: "L",
    confidence: "99% match",
    clue: "artisan · composer.json · routes detected",
    entryFile: "public/index.php",
    command: "php artisan serve --host 0.0.0.0 --port 80",
    build: "php artisan config:cache",
    install: "composer install --no-dev",
    recipe: `kind: wasmer.io/App.v0\nname: laravel-service\npackage: .\n\nentrypoint: public/index.php\nrunner: wcgi\nenv: APP_ENV=production`,
  },
  python: {
    label: "Python",
    tone: "bg-[#CDE7FF] text-[#1B4266]",
    icon: "PY",
    confidence: "94% match",
    clue: "requirements.txt · Flask import detected",
    entryFile: "app.py",
    command: "gunicorn app:app --bind 0.0.0.0:80",
    build: "python -m compileall .",
    install: "pip install -r requirements.txt",
    recipe: `kind: wasmer.io/App.v0\nname: python-service\npackage: .\n\nentrypoint: app:app\nrunner: wasix`,
  },
};

type FrameworkKey = keyof typeof frameworks;

function RailItem({ icon: Icon, label, active, soon }: { icon: typeof Radar; label: string; active?: boolean; soon?: boolean }) {
  return (
    <button
      onClick={() => soon && toast.info(`${label} is reserved for the next phase.`)}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${active ? "bg-[#B8F36B] text-[#172019] shadow-[0_5px_20px_rgba(184,243,107,0.12)]" : "text-[#A7B0A2] hover:bg-white/7 hover:text-white"}`}
    >
      <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
      <span className="flex-1">{label}</span>
      {soon && <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#6E786B]">soon</span>}
    </button>
  );
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/acme/field-notes");
  const [framework, setFramework] = useState<FrameworkKey>("node");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [sourceLabel, setSourceLabel] = useState("public URL");
  const [detectedFiles, setDetectedFiles] = useState<string[]>(["package.json", "server.js"]);
  const [detection, setDetection] = useState<ProjectDetection>(() => detectionFromUrl("https://github.com/acme/field-notes"));
  const folderInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);
  const [entryTab, setEntryTab] = useState("recipe");
  const current = frameworks[framework];
  const repoName = useMemo(() => repoUrl.split("/").slice(-1)[0] || sourceLabel.replace(/\\.zip$/i, "") || "your-repository", [repoUrl, sourceLabel]);
  const ahaduManifest = useMemo(() => JSON.stringify({ $schema: "https://ahadu-deploy.dev/schema/ahadu.json", version: 1, name: repoName, framework: detection.framework, source: { directory: "." }, entry: { file: detection.entryFile, command: detection.startCommand, port: 80, runner: detection.runner }, commands: { install: detection.installCommand, build: detection.buildCommand }, environment: { NODE_ENV: "production" }, deploy: { provider: "wasmer", region: "auto", appName: repoName } }, null, 2), [detection, repoName]);

  const inspect = () => {
    if (!repoUrl.trim()) {
      toast.error("Add a repository URL first.");
      return;
    }
    setAnalyzing(true);
    setAnalyzed(false);
    window.setTimeout(() => {
      const result = detectionFromUrl(repoUrl);
      setDetection(result);
      setDetectedFiles(result.files);
      setFramework(result.framework);
      setAnalyzing(false);
      setAnalyzed(true);
      setSourceLabel("public URL");
      toast.success(`Detected ${result.label}. Deployment recipe is ready.`);
    }, 650);
  };

  const inspectFiles = (files: string[], label: string) => {
    const result = detectProject(files);
    setDetection(result);
    setDetectedFiles(result.files);
    setFramework(result.framework);
    setSourceLabel(label);
    setAnalyzed(true);
    toast.success(`Inspected ${files.length} files. Detected ${result.label}.`);
  };

  const handleFolder = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => file.webkitRelativePath || file.name);
    if (files.length) inspectFiles(files, `${files.length} local files`);
    event.target.value = "";
  };

  const handleZip = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const archive = await JSZip.loadAsync(file);
      inspectFiles(Object.keys(archive.files).filter((path) => !archive.files[path].dir), file.name);
    } catch {
      toast.error("This ZIP could not be read. Please choose a standard project archive.");
    }
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#172019]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[244px] flex-col bg-[#172019] px-4 py-5 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#B8F36B] p-2 shadow-[0_0_0_5px_rgba(184,243,107,0.08)]"><img src="/manus-storage/ahadu-deploy-mark_d95cecff.png" alt="Ahadu Deploy mark" className="h-full w-full object-contain" /></div>
          <div>
            <div className="font-display text-[15px] font-bold tracking-[-0.03em]">Ahadu Deploy</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7F8C7B]">wasmer workspace</div>
          </div>
        </div>

        <div className="mt-11 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#5F6B5C]">Workspace</div>
        <nav className="mt-3 space-y-1">
          <RailItem icon={Radar} label="Inspect repository" active />
          <RailItem icon={CloudUpload} label="Deployments" soon />
          <RailItem icon={FolderGit2} label="Projects" soon />
        </nav>
        <div className="mt-8 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#5F6B5C]">Manage</div>
        <nav className="mt-3 space-y-1">
          <RailItem icon={Settings2} label="Settings" soon />
          <RailItem icon={CircleHelp} label="Documentation" soon />
        </nav>

        <div className="mt-auto rounded-2xl border border-white/8 bg-white/4 p-3.5">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-[#2A3529] text-[#B8F36B]"><ShieldCheck size={15} /></div>
            <div>
              <div className="text-[12px] font-semibold text-white">GitHub access is off</div>
              <p className="mt-1 text-[11px] leading-[1.45] text-[#8A9588]">Core mode only. Authorization arrives when you approve phase two.</p>
              <button onClick={() => toast.info("GitHub authorization is intentionally deferred.")} className="mt-3 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#B8F36B]">Learn about the roadmap <ArrowUpRight size={11} /></button>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 px-2 text-[11px] text-[#6F7A6C]"><span className="h-1.5 w-1.5 rounded-full bg-[#B8F36B]" />Core engine online <span className="ml-auto font-mono text-[10px]">v0.1</span></div>
      </aside>

      <main className="min-h-screen lg:pl-[244px]">
        <header className="flex h-[72px] items-center justify-between border-b border-[#D8D3C8] bg-[#F4F0E8]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#172019] p-1.5 lg:hidden"><img src="/manus-storage/ahadu-deploy-mark_d95cecff.png" alt="Ahadu Deploy mark" className="h-full w-full object-contain" /></div><span className="font-display text-[15px] font-bold tracking-[-0.04em] text-[#172019]">Ahadu Deploy</span><ChevronRight size={14} className="text-[#A4A69D]" /><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9B9D95]">Repository inspector</span></div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toast.info("Documentation will open in a future phase.")} className="hidden gap-2 text-[#697066] hover:bg-[#E8E3D9] sm:flex"><CircleHelp size={15} />Docs</Button>
            <Button size="sm" onClick={() => toast.info("GitHub authorization is not enabled in the core MVP.")} className="gap-2 rounded-lg bg-[#172019] text-[#F4F0E8] hover:bg-[#2D3D2D]"><Github size={14} />Connect GitHub <span className="font-mono text-[9px] uppercase text-[#B8F36B]">later</span></Button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-8 lg:px-10">
          <section className="relative overflow-hidden rounded-[26px] bg-[#1D2A1F] px-6 py-8 text-[#F4F0E8] shadow-[0_18px_50px_rgba(23,32,25,0.12)] sm:px-9 sm:py-10">
            <div className="absolute right-[-50px] top-[-90px] h-[310px] w-[310px] rounded-full border border-[#B8F36B]/15" /><div className="absolute right-[35px] top-[-15px] h-[210px] w-[210px] rounded-full border border-[#B8F36B]/10" />
            <div className="relative max-w-[660px]">
              <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.21em] text-[#B8F36B]"><Sparkles size={13} /> Deployment preparation, without the guesswork</div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.65rem)] font-bold leading-[0.98] tracking-[-0.065em]">Bring a repository.<br /><span className="text-[#B8F36B]">Leave with a recipe.</span></h1>
              <p className="mt-5 max-w-[520px] text-[14px] leading-[1.7] text-[#B5C0B0]">Ahadu scans the shape of your project, explains what it found, and writes the Wasmer entry point you can deploy next.</p>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 hidden w-[340px] opacity-70 xl:block"><img src="/manus-storage/ahadu-deploy-hero_f15af351.jpg" alt="Abstract repository deployment workspace" className="h-[210px] w-full object-cover object-left opacity-30 mix-blend-screen" /></div>
          </section>

          <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <div className="flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#899084]">01 / Source</div><h2 className="mt-2 font-display text-[25px] font-bold tracking-[-0.045em]">Where should we look?</h2></div><div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A9E96] sm:flex"><LockKeyhole size={12} /> no account needed</div></div>
              <div className="mt-5 rounded-2xl border border-[#D8D3C8] bg-[#FBF9F4] p-4 shadow-[0_8px_25px_rgba(40,45,37,0.04)] sm:p-5">
                <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E7E2D8] text-[#303B31]"><Globe2 size={17} /></div><div><div className="text-[12px] font-semibold">Public repository URL</div><div className="font-mono text-[10px] text-[#9A9D95]">Paste a public Git URL for the core MVP</div></div></div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Terminal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D948A]" /><Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && inspect()} className="h-12 rounded-xl border-[#D8D3C8] bg-[#F4F0E8] pl-10 font-mono text-[12px] text-[#354038] shadow-none focus-visible:ring-[#B8F36B]" placeholder="https://github.com/you/project" /></div><Button onClick={inspect} disabled={analyzing} className="h-12 rounded-xl bg-[#172019] px-5 text-[#F4F0E8] hover:bg-[#2D3D2D]">{analyzing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Radar size={16} className="mr-2" />} {analyzing ? "Inspecting…" : "Inspect repository"}</Button></div>
                <div className="mt-4 flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8D948A]">source: {sourceLabel}</span><span className="h-3 w-px bg-[#DDD8CE]" /><input ref={folderInput} type="file" hidden multiple {...({ webkitdirectory: "" } as any)} onChange={handleFolder} /><input ref={zipInput} type="file" hidden accept=".zip,application/zip" onChange={handleZip} /><button onClick={() => folderInput.current?.click()} className="flex items-center gap-1.5 rounded-full border border-[#B8C7A4] bg-[#F3F9E8] px-2.5 py-1 font-mono text-[9px] text-[#52723E] transition hover:bg-[#E8F3D4]"><FolderGit2 size={11} /> Local folder</button><button onClick={() => zipInput.current?.click()} className="flex items-center gap-1.5 rounded-full border border-[#B8C7A4] bg-[#F3F9E8] px-2.5 py-1 font-mono text-[9px] text-[#52723E] transition hover:bg-[#E8F3D4]"><Upload size={11} /> ZIP archive</button><span className="mx-1 h-3 w-px bg-[#DDD8CE]" /><button onClick={() => { setRepoUrl("https://github.com/acme/field-notes"); setFramework("node"); }} className="rounded-full border border-[#DDD8CE] px-2.5 py-1 font-mono text-[9px] text-[#858D83] transition hover:border-[#A7B68F] hover:text-[#354038]">Try Node.js</button><button onClick={() => { setRepoUrl("https://github.com/acme/ledger-api"); setFramework("laravel"); }} className="rounded-full border border-[#DDD8CE] px-2.5 py-1 font-mono text-[9px] text-[#858D83] transition hover:border-[#A7B68F] hover:text-[#354038]">Try Laravel</button><button onClick={() => { setRepoUrl("https://github.com/acme/py-signal"); setFramework("python"); }} className="rounded-full border border-[#DDD8CE] px-2.5 py-1 font-mono text-[9px] text-[#858D83] transition hover:border-[#A7B68F] hover:text-[#354038]">Try Python</button></div>
              </div>

              <div className="relative mt-10 flex items-end justify-between border-l-2 border-[#B8F36B] pl-5"><span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[#B8F36B] shadow-[0_0_0_4px_#F4F0E8]" /><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#899084]">02 / Detection</div><h2 className="mt-2 font-display text-[25px] font-bold tracking-[-0.045em]">What did we find?</h2></div><Badge className="hidden rounded-full border-0 bg-[#D8F8A1] font-mono text-[10px] uppercase tracking-[0.12em] text-[#274021] sm:flex"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#4E8B3F]" />{analyzed ? "analysis complete" : "waiting"}</Badge></div>
              <div className="relative mt-5 grid gap-3 border-l-2 border-[#B8F36B]/70 pl-5 sm:grid-cols-2"><span className="absolute -left-[5px] top-5 h-2 w-2 rounded-full bg-[#B8F36B] shadow-[0_0_0_4px_#F4F0E8]" />
                {(Object.keys(frameworks) as FrameworkKey[]).map((key) => { const item = frameworks[key]; const selected = key === framework; return <button key={key} onClick={() => setFramework(key)} className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${selected ? "border-[#9FCF5D] bg-[#F9FBEF] shadow-[0_8px_24px_rgba(118,145,61,0.09)]" : "border-[#D8D3C8] bg-[#FBF9F4] hover:border-[#B5B9AF]"}`}><div className="flex items-start gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl font-mono text-[10px] font-bold ${item.tone}`}>{item.icon}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-display text-[14px] font-bold">{item.label}</span>{selected && <Check size={14} className="text-[#5B8E34]" />}</div><div className="mt-1 truncate font-mono text-[10px] text-[#858D83]">{key === detection.framework ? detection.evidence[0]?.reason ?? item.clue : item.clue}</div></div><span className="font-mono text-[10px] font-semibold text-[#5D8243]">{key === detection.framework ? `${detection.confidence}% match` : item.confidence}</span></div><div className="mt-4 flex items-center justify-between border-t border-[#E8E4DA] pt-3 font-mono text-[10px] text-[#7D877B]"><span>entry point</span><span className="text-[#374A39]">{item.entryFile} <ChevronRight size={12} className="ml-1 inline" /></span></div></button> })}
              </div>

              <div className="relative mt-10 flex items-end justify-between border-l-2 border-[#B8F36B] pl-5"><span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[#B8F36B] shadow-[0_0_0_4px_#F4F0E8]" /><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#899084]">03 / Output</div><h2 className="mt-2 font-display text-[25px] font-bold tracking-[-0.045em]">Your deployment recipe</h2></div><button onClick={() => toast.success("Recipe copied to clipboard.")} className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#70816B] transition hover:text-[#172019] sm:flex"><FileCode2 size={14} /> copy recipe</button></div>
              <div className="mt-5 overflow-hidden rounded-2xl bg-[#172019] shadow-[0_12px_32px_rgba(23,32,25,0.16)]"><div className="flex items-center justify-between border-b border-white/8 px-4 py-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#B8F36B]" /><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D5DED0]">{repoName} / app.yaml</span></div><MoreHorizontal size={16} className="text-[#748171]" /></div><Tabs value={entryTab} onValueChange={setEntryTab}><TabsList className="h-11 w-full justify-start gap-5 rounded-none border-b border-white/8 bg-transparent px-4"><TabsTrigger value="manifest" className="rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#819080] data-[state=active]:border-[#B8F36B] data-[state=active]:text-[#B8F36B]">ahadu.json</TabsTrigger><TabsTrigger value="recipe" className="rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#819080] data-[state=active]:border-[#B8F36B] data-[state=active]:text-[#B8F36B]">app.yaml</TabsTrigger><TabsTrigger value="entry" className="rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#819080] data-[state=active]:border-[#B8F36B] data-[state=active]:text-[#B8F36B]">entry point</TabsTrigger><TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#819080] data-[state=active]:border-[#B8F36B] data-[state=active]:text-[#B8F36B]">notes</TabsTrigger></TabsList><TabsContent value="manifest" className="m-0"><div className="grid grid-cols-[34px_1fr] p-5 font-mono text-[12px] leading-[1.85] text-[#DDE8D7]"><div className="select-none border-r border-white/10 pr-3 text-right text-[#5D705D]">{ahaduManifest.split("\\n").map((_, index) => <div key={index}>{String(index + 1).padStart(2, "0")}</div>)}</div><pre className="overflow-x-auto pl-4"><code>{ahaduManifest}</code></pre></div></TabsContent><TabsContent value="recipe" className="m-0"><div className="grid grid-cols-[34px_1fr] p-5 font-mono text-[12px] leading-[1.85] text-[#DDE8D7]"><div className="select-none border-r border-white/10 pr-3 text-right text-[#5D705D]">{current.recipe.split("\\n").map((_, index) => <div key={index}>{String(index + 1).padStart(2, "0")}</div>)}</div><pre className="overflow-x-auto pl-4"><code>{current.recipe}</code></pre></div></TabsContent><TabsContent value="entry" className="m-0"><div className="grid grid-cols-[34px_1fr] p-5 font-mono text-[12px] leading-[1.85] text-[#DDE8D7]"><div className="select-none border-r border-white/10 pr-3 text-right text-[#5D705D]">{[1, 2, 3, 4, 5, 6, 7].map((line) => <div key={line}>{String(line).padStart(2, "0")}</div>)}</div><pre className="overflow-x-auto pl-4"><code>{`# detected start command\n${current.command}\n\n# install command\n${current.install}\n\n# build command\n${current.build}`}</code></pre></div></TabsContent><TabsContent value="notes" className="m-0"><div className="min-h-[190px] p-5 font-mono text-[12px] leading-[1.85] text-[#B7C5B0]">This output is generated from repository signals. GitHub authorization is intentionally not active in this version; connect a public URL or local project first.</div></TabsContent></Tabs></div>
            </section>

            <aside className="xl:pt-[52px]"><div className="sticky top-6 rounded-2xl border border-[#D8D3C8] bg-[#FBF9F4] p-5 shadow-[0_8px_25px_rgba(40,45,37,0.04)]"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#899084]">Readiness</div><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#D8F8A1] text-[#35552B]"><ShieldCheck size={16} /></div></div><div className="mt-4 font-display text-[22px] font-bold tracking-[-0.045em]">Ready to prepare</div><p className="mt-2 text-[12px] leading-[1.6] text-[#7E867B]">Your project has enough signal for a first deployment configuration.</p><div className="mt-5 space-y-3 border-t border-[#E4DFD5] pt-4"><div className="flex items-center gap-3"><div className="grid h-7 w-7 place-items-center rounded-full bg-[#E7F6D2] text-[#5B8E34]"><Check size={14} /></div><span className="text-[12px] font-medium">Framework identified</span></div><div className="flex items-center gap-3"><div className="grid h-7 w-7 place-items-center rounded-full bg-[#E7F6D2] text-[#5B8E34]"><Check size={14} /></div><span className="text-[12px] font-medium">Entry point generated</span></div><div className="flex items-center gap-3"><div className="grid h-7 w-7 place-items-center rounded-full bg-[#F1EEE8] text-[#8B9388]"><KeyRound size={14} /></div><span className="text-[12px] font-medium text-[#8B9388]">Account connection <span className="font-mono text-[9px] uppercase">later</span></span></div></div><Button onClick={() => toast.info("Deployment is prepared locally in the core MVP. Account authorization will be added after your approval.")} className="mt-6 h-11 w-full rounded-xl bg-[#B8F36B] text-[#172019] hover:bg-[#A9E35D]"><Play size={15} className="mr-2" /> Prepare deployment</Button></div><div className="mt-4 rounded-2xl bg-[#E7E2D8] p-5"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7669]"><Upload size={13} /> Private projects</div><p className="mt-3 text-[12px] leading-[1.6] text-[#566154]">Use a local folder or ZIP archive to inspect private projects without connecting GitHub.</p><button onClick={() => toast.info("Choose Local folder or ZIP archive above to inspect a private project.")} className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.13em] text-[#172019]">How it works <ArrowUpRight size={12} /></button></div></aside>
          </div>
        </div>
      </main>
    </div>
  );
}
