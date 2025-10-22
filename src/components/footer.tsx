// src/components/ui/footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="aw-container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
        <div>© {new Date().getFullYear()} ApplyWizz. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="/terms-of-service" className="hover:text-neutral-950 transition-colors">Terms</a>
          <a href="/privacy-policy" className="hover:text-neutral-950 transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
