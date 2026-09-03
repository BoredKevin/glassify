import { ThemeProvider, AtmosphericAuroraBackground } from '@boredkevin/ui';
import { HomePage } from './pages/HomePage';
import { LicensesModal } from './components/LicensesModal';
import { Glasses } from 'lucide-react';

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
        {/* Ambient fluid aurora background from @boredkevin/ui */}
        <AtmosphericAuroraBackground opacity={0.3} blur={120} />

        {/* Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col items-center px-3.5 sm:px-4 py-4 sm:py-6">
          {/* Top Brand Nav */}
          <header className="w-full max-w-md flex items-center justify-between py-2 mb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Glasses className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-foreground flex items-center gap-1.5">
                  Glassify
                </span>
              </div>
            </div>
          </header>

          {/* Main App Experience */}
          <main className="w-full flex-1 flex flex-col justify-start">
            <HomePage />
          </main>

          {/* Footer */}
          <footer className="w-full max-w-md py-4 text-center text-xs text-muted-foreground border-t border-border/40 mt-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
              <span>© {currentYear}</span>
              <a
                href="https://github.com/boredkevin/glassify"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
              >
                boredkevin/glassify
              </a>
              <span className="text-muted-foreground/60 select-none">•</span>
              <span>v{__APP_VERSION__}</span>
              <span className="text-muted-foreground/60 select-none">•</span>
              <span>({__BUILD_HASH__})</span>
              <span className="text-muted-foreground/60 select-none">•</span>
              <LicensesModal />
            </div>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}



