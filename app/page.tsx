export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6">
      <div className="max-w-md w-full rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md border border-white/20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 mb-6 shadow-lg shadow-indigo-500/30">
          <span className="text-2xl font-black">N</span>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          안녕하세요, belotty입니다
        </h1>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          가장 단순하고 깔끔한 <span className="text-cyan-400 font-semibold">TypeScript</span>,{" "}
          <span className="text-indigo-400 font-semibold">App Router</span>,{" "}
          <span className="text-teal-400 font-semibold">Tailwind CSS</span> 프로젝트입니다.
        </p>

        <div className="rounded-lg bg-black/40 p-3 font-mono text-xs text-slate-300 border border-white/10">
          app/page.tsx 에서 수정할 수 있습니다.
        </div>
      </div>
    </main>
  );
}
