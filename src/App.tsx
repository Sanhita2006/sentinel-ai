import React, { useState } from 'react';
import { PageId } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DemoNoticeModal } from './components/common/DemoNoticeModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { WebsiteInvestigationPage } from './pages/WebsiteInvestigationPage';
import { PhishingDetectionPage } from './pages/PhishingDetectionPage';
import { TlsCertificatePage } from './pages/TlsCertificatePage';
import { ScamMessageAnalysisPage } from './pages/ScamMessageAnalysisPage';
import { SecurityAssessmentPage } from './pages/SecurityAssessmentPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { InvestigationHistoryPage } from './pages/InvestigationHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { AiSecurityAssistantPage } from './pages/AiSecurityAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [currentTarget, setCurrentTarget] = useState<string>('secure-login-chase-update.info');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const handleSelectTarget = (target: string) => {
    setCurrentTarget(target);
  };

  const handleQuickInvestigate = () => {
    setActivePage('website-investigation');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActivePage}
            onSelectTarget={handleSelectTarget}
            onOpenDemoNotice={() => setIsDemoModalOpen(true)}
          />
        );
      case 'website-investigation':
        return (
          <WebsiteInvestigationPage
            currentTarget={currentTarget}
            onSelectTarget={handleSelectTarget}
            onNavigate={setActivePage}
            onOpenDemoNotice={() => setIsDemoModalOpen(true)}
          />
        );
      case 'phishing-detection':
        return <PhishingDetectionPage />;
      case 'tls-certificate':
        return <TlsCertificatePage />;
      case 'scam-analysis':
        return <ScamMessageAnalysisPage />;
      case 'security-assessment':
        return <SecurityAssessmentPage />;
      case 'threat-intelligence':
        return <ThreatIntelligencePage />;
      case 'blockchain-verification':
        return <BlockchainVerificationPage />;
      case 'history':
        return (
          <InvestigationHistoryPage
            onSelectTarget={handleSelectTarget}
            onNavigate={setActivePage}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'ai-assistant':
        return <AiSecurityAssistantPage />;
      case 'settings':
        return <SettingsPage onOpenDemoNotice={() => setIsDemoModalOpen(true)} />;
      default:
        return (
          <DashboardPage
            onNavigate={setActivePage}
            onSelectTarget={handleSelectTarget}
            onOpenDemoNotice={() => setIsDemoModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-soc-bg font-sans text-soc-text">
      {/* Responsive Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenDemoNotice={() => setIsDemoModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-200 print:pl-0 ${
          isSidebarOpen ? 'lg:pl-60' : 'lg:pl-16'
        }`}
      >
        {/* Global Header */}
        <Header
          activePage={activePage}
          onNavigate={setActivePage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenDemoNotice={() => setIsDemoModalOpen(true)}
          onQuickInvestigate={handleQuickInvestigate}
        />

        {/* Page Viewport */}
        <main className="min-w-0 flex-1 overflow-y-auto p-3 md:p-4 lg:p-5 print:p-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Transparency & Demo Data Notice Modal */}
      <DemoNoticeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
