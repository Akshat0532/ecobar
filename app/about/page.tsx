export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-mist/60">About EcoTrace</p>
        <h1 className="text-4xl font-semibold text-mist">A better way to understand your impact</h1>
        <div className="space-y-6 text-mist/80">
          <p>
            EcoTrace was built to make carbon accounting more accessible. The goal is to help conscious people make smarter daily decisions without complexity.
          </p>
          <p>
            Our focus is privacy, clarity, and practical guidance. That means no unnecessary tracking, easy-to-read insights, and a calculator you can trust.
          </p>
        </div>
      </div>
    </main>
  );
}
