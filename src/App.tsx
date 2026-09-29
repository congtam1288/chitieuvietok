import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/common/AppHeader';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/views/HomeScreen';
import { TransactionsScreen } from './components/views/TransactionsScreen';
import { ReportsScreen } from './components/views/ReportsScreen';
import { BudgetScreen } from './components/views/BudgetScreen';
import { AccountScreen } from './components/views/AccountScreen';
import { VoiceModal } from './components/voice/VoiceModal';
import { TransactionModals } from './components/transactions/TransactionModals';
import { AuxiliaryModals } from './components/common/AuxiliaryModals';
import { GoalModal } from './components/goals/GoalModal';
import { AuthOnboardingScreen } from './components/auth/AuthOnboardingScreen';

const AppContent: React.FC = () => {
  const { activeTab, themeConfig, authState } = useApp();

  // If user is not authenticated or the 7-day trial has expired, show Onboarding / Auth screen
  if (!authState.isAuthenticated || authState.trialExpired) {
    return <AuthOnboardingScreen />;
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center selection:bg-emerald-500 selection:text-white transition-colors duration-300"
      style={{
        background: themeConfig.bgGradient,
        color: themeConfig.isDark ? '#F8FAFC' : '#1E293B'
      }}
    >
      {/* Mobile-Centric Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative px-4">
        {/* Persistent Top Header */}
        <AppHeader />

        {/* Dynamic Main View */}
        <main className="flex-1 w-full mt-1">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'transactions' && <TransactionsScreen />}
          {activeTab === 'reports' && <ReportsScreen />}
          {activeTab === 'budget' && <BudgetScreen />}
          {(activeTab === 'account' || activeTab === 'settings') && <AccountScreen />}
        </main>

        {/* Persistent Floating Bottom Navigation */}
        <BottomNav />

        {/* Global Modals */}
        <VoiceModal />
        <TransactionModals />
        <AuxiliaryModals />
        <GoalModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
