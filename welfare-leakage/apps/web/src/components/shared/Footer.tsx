export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-6 py-6">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700">Digital India</span>
          <span aria-hidden="true">|</span>
          <span>Government of India</span>
          <span aria-hidden="true">|</span>
          <span>MeitY / NIC</span>
        </div>
        <div className="flex gap-4 text-xs text-neutral-500">
          <a href="#" className="hover:text-brand-purple">Privacy Policy</a>
          <a href="#" className="hover:text-brand-purple">Terms of Use</a>
          <a href="#" className="hover:text-brand-purple">Sitemap</a>
        </div>
        <p className="text-xs text-neutral-400">
          v1.0.0 — Hackathon Prototype
        </p>
      </div>
    </footer>
  );
}
