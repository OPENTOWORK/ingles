'use client';

import { useCallback, useEffect, useState } from 'react';
import ProfileStudentSections from '@/components/perfil/ProfileStudentSections';
import ProfileStudentSidebar from '@/components/perfil/ProfileStudentSidebar';
import { landingFont } from '@/components/home/landing/landingFont';
import { getPlanBySlug, getPlanProfileDisplay } from '@/data/financialPlanConfig';
import {
  buildStudentProfileHistoryUrl,
  resolveStudentProfileTab,
} from '@/lib/studentProfileNav';

const PREVIEW_USER = {
  id: null,
  email: 'preview@dralo.local',
  created_at: '2026-03-12T00:00:00.000Z',
};

export default function StudentProfilePreview() {
  const plan = getPlanBySlug('premium');
  const [activeTab, setActiveTab] = useState('overview');
  const [fullName, setFullName] = useState('Emma Lewis');
  const [birthDate, setBirthDate] = useState('1998-04-02');
  const [biography, setBiography] = useState('');
  const [personalSaveMessage, setPersonalSaveMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [settingsNote, setSettingsNote] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState(null);

  useEffect(() => {
    const apply = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      setActiveTab(resolveStudentProfileTab(tab));
    };
    apply();
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, []);

  const handleSelectTab = useCallback((tabId) => {
    setActiveTab(tabId);
    const next = buildStudentProfileHistoryUrl(window.location.href, tabId);
    window.history.pushState({ profileTab: tabId }, '', next);
  }, []);

  return (
    <main className={`shell perfil-page perfil-page--student ${landingFont.variable}`}>
      <ProfileStudentSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        displayName={fullName}
        planLabel="Plus plan"
      />
      <div className="perfil-student__column">
        <p className="perfil-student__note">
          Local preview, no account. You can open every section. Nothing is saved.
        </p>
        <ProfileStudentSections
          activeTab={activeTab}
          user={PREVIEW_USER}
          showProgressTracking
          activatingPlan={false}
          paidProfile
          activePlan={plan}
          showFreePlanUpgrade={false}
          subscriptionPlan={plan}
          planSlug="premium"
          onOpenSubscription={() => handleSelectTab('subscription')}
          onOpenExams={() => handleSelectTab('exam-statistics')}
          accessToken=""
          fullName={fullName}
          setFullName={setFullName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          biography={biography}
          setBiography={setBiography}
          personalSaveError=""
          personalSaveMessage={personalSaveMessage}
          saving={false}
          onSavePersonalData={() => setPersonalSaveMessage('Preview only. Nothing was saved.')}
          clearPersonalStatus={() => setPersonalSaveMessage('')}
          avatarDisplay={{ displayUrl: '', isDefaultMascot: true }}
          mascotFallbackUrl=""
          displayName={fullName}
          onSelectAvatar={() => {}}
          avatarUploading={false}
          avatarError=""
          subscriptionIsActive
          subscriptionPeriodLabel="12 December 2026"
          deleteFlowActive={false}
          deleteCode=""
          setDeleteCode={() => {}}
          deleteCodeSentAt={null}
          sendingDeleteCode={false}
          deletingAccount={false}
          onSendDeleteCode={() => setPersonalSaveMessage('Preview only. The account is not deleted.')}
          onDeleteAccount={() => {}}
          subscriptionDisplay={getPlanProfileDisplay(plan)}
          showPricingLink
          openInviteFromUrl={false}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteMessage={inviteMessage}
          setInviteMessage={setInviteMessage}
          invitingFriend={false}
          onInviteFriend={() =>
            setInviteFeedback({
              type: 'success',
              title: 'Preview only',
              message: 'No invitation was sent.',
            })
          }
          inviteFeedback={inviteFeedback}
          clearInviteFeedback={() => setInviteFeedback(null)}
          loadingReferrals={false}
          referralInvitations={[]}
          referralStatusLabel={(status) => status || 'Sent'}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          onPasswordChange={() => setSettingsNote('Preview only. The password was not changed.')}
          notifications={notifications}
          setNotifications={setNotifications}
          onSaveSettings={() => setSettingsNote('Preview only. Settings were not saved.')}
        />
        {activeTab === 'settings' && settingsNote ? (
          <p className="perfil-student__note">{settingsNote}</p>
        ) : null}
      </div>
    </main>
  );
}
