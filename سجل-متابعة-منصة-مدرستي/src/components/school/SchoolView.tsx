import React from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpTab } from './FollowUpTab';
import { SettingsTab } from './SettingsTab';
import { ReportsTab } from './ReportsTab';

export const SchoolView: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-12">
      <main>
        {activeTab === 'followup' && <FollowUpTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
};
