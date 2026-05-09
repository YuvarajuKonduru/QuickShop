export default function AboutPage() {
  return (
    <section className="max-w-2xl space-y-4">
      <p className="text-sm uppercase tracking-[0.3em] text-amber-400">About</p>
      <h1 className="text-4xl font-semibold tracking-tight text-white">
        This is a static route.
      </h1>
      <p className="text-lg leading-7 text-stone-300">
        This page exists because you created app/about/page.tsx. The folder name
        becomes the URL segment, so this file renders at /about.
      </p>
    </section>
  );
}