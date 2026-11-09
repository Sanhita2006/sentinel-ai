# SENTINEL AI - Enterprise SOC UI patch (frontend only)

Unzip at the project root and overwrite. Paths match the original project layout.

## Not touched
server.ts, src/server/**, src/types/index.ts, src/data/mockData.ts, src/main.tsx,
package.json, package-lock.json, tsconfig.json, vite.config.ts, .gitignore, env files.
No dependencies were added.

## Files
Modified: index.html, src/index.css, src/App.tsx,
src/components/common/{DemoNoticeModal,InvestigationSearchBar,SeverityBar,StatusBadge}.tsx,
src/components/layout/{Header,Sidebar}.tsx, all 12 files in src/pages/.
New: src/lib/severity.ts (case-insensitive severity/verdict/urgency helpers),
src/components/ui/Soc.tsx (shared panels, KPI tiles, tags, severity meters).

## API calls (unchanged)
POST /api/investigate     body { url, enableGemini: true }        (WebsiteInvestigationPage)
POST /api/scam-analysis   body { message, sourceType }             (ScamMessageAnalysisPage)
Note: the bundled backend router only defines /api/scam-analysis. /api/investigate returns 404
until an investigate route is mounted server-side; the UI now shows that clearly.

## Verification
npm run build      -> exit 0
npx tsc --noEmit   -> exit 0 (TypeScript 7.0.2)
