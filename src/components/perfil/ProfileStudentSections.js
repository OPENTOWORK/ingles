'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Gift, Info } from 'lucide-react';
import ExamStatistics from '@/components/ExamStatistics';
import PasswordInput from '@/components/PasswordInput';
import ProfileAvatarUpload from '@/components/perfil/ProfileAvatarUpload';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import ProfileNightModeSetting from '@/components/perfil/ProfileNightModeSetting';
import ProfileSubscriptionCard from '@/components/perfil/ProfileSubscriptionCard';
import {
  StudentExamSummaryCards,
  StudentRecentResults,
  useStudentExamSummary,
} from '@/components/perfil/ProfileStudentOverview';
import { profileHelpHref, SKILL_ANALYSIS_COMING_SOON, studentProfileHeading } from '@/lib/studentProfileNav';
import TrainingExperienceSection from '@/components/training/TrainingExperienceSection';

function SectionHeading({ tabId, detail }) {
  const section = studentProfileHeading(tabId);
  if (!section) return null;
  return (
    <header className="perfil-student__heading">
      <p className="perfil-student__eyebrow">Profile / {section.label}</p>
      <h1>{section.label}</h1>
      {detail ? <p>{detail}</p> : null}
    </header>
  );
}

function HelpLink({ title, text }) {
  return (
    <div className="perfil-student__help">
      <strong>{title}</strong>
      <p>{text}</p>
      <Link href={profileHelpHref()}>Contact us</Link>
    </div>
  );
}

function PlanCards({
  activatingPlan,
  paidProfile,
  activePlan,
  showFreePlanUpgrade,
  subscriptionPlan,
  planSlug,
  onOpenSubscription,
}) {
  return (
    <>
      {activatingPlan && !paidProfile ? (
        <section className="profile-plan-upgrade-card" aria-live="polite">
          <span className="profile-plan-upgrade-card__badge">Plus plan</span>
          <h2 className="profile-plan-upgrade-card__title">Activating your plan</h2>
          <p className="profile-plan-upgrade-card__text">
            Payment received. Your Plus plan will show here as soon as it is registered.
          </p>
        </section>
      ) : null}
      {paidProfile && activePlan ? (
        <section className="perfil-student__card">
          <span className="perfil-student__pill">{activePlan.nombre} plan</span>
          <h2>You&apos;re on the {activePlan.nombre} plan</h2>
          <p>
            {activePlan.precioLabel && activePlan.precioLabel !== '0€' ? `${activePlan.precioLabel}. ` : ''}
            Progress tracking, exam statistics and detailed analytics are included.
          </p>
          <button type="button" className="action-btn" onClick={onOpenSubscription}>
            View subscription
          </button>
        </section>
      ) : null}
      {showFreePlanUpgrade ? (
        <section className="profile-plan-upgrade-card">
          <span className="profile-plan-upgrade-card__badge">
            {(subscriptionPlan?.nombre || planSlug || 'free').toUpperCase()} plan
          </span>
          <h2 className="profile-plan-upgrade-card__title">Upgrade to unlock your full profile</h2>
          <p className="profile-plan-upgrade-card__text">
            You&apos;re on the Free plan. Progress tracking, exam statistics and detailed analytics are included in Plus and Premium.
          </p>
          <button type="button" className="profile-plan-upgrade-card__cta" onClick={onOpenSubscription}>
            View subscription
          </button>
        </section>
      ) : null}
    </>
  );
}

export default function ProfileStudentSections(props) {
  const {
    activeTab,
    user,
    showProgressTracking,
    onOpenSubscription,
    onOpenExams,
  } = props;
  const examSummary = useStudentExamSummary(user?.id, Boolean(showProgressTracking && (activeTab === 'overview' || activeTab === 'exam-statistics')));

  return (
    <div className="perfil-student__sections">
      {activeTab === 'overview' ? (
        <>
          <SectionHeading tabId="overview" detail="Your plan and saved exam results." />
          <PlanCards {...props} />
          {showProgressTracking ? (
            <>
              <StudentExamSummaryCards {...examSummary} />
              <div className="perfil-student__split">
                <section className="perfil-student__card">
                  <h2>Your results</h2>
                  <p>Open exam statistics for the full breakdown of your saved practice.</p>
                  <button type="button" className="action-btn" onClick={onOpenExams}>
                    See exam results
                  </button>
                </section>
                <StudentRecentResults {...examSummary} />
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {activeTab === 'exam-statistics' ? (
        <>
          <SectionHeading tabId="exam-statistics" detail="Your completed tests and saved practice results." />
          {showProgressTracking ? (
            <>
              <ExamStatistics userId={user?.id} embedded />
              <StudentRecentResults {...examSummary} />
            </>
          ) : (
            <PlanCards {...props} />
          )}
        </>
      ) : null}

      {activeTab === 'error-analytics' ? (
        <>
          <SectionHeading tabId="error-analytics" detail="Patterns in your mistakes will appear here when skill analysis is ready." />
          <section className="perfil-student__card" role="status">
            <span className="perfil-student__pill">Coming soon</span>
            <h2>{SKILL_ANALYSIS_COMING_SOON}</h2>
            <p>
              This page will group your mistakes by skill. It is not ready yet, so there are no category scores to show.
              Your saved practice stays on your account.
            </p>
          </section>
        </>
      ) : null}

      {activeTab === 'training-experience' ? (
        <>
          <SectionHeading tabId="training-experience" detail="Experience points and level from your training." />
          <TrainingExperienceSection accessToken={props.accessToken} lang="en" />
        </>
      ) : null}

      {activeTab === 'account' ? <AccountSection {...props} /> : null}
      {activeTab === 'subscription' ? <SubscriptionSection {...props} /> : null}
      {activeTab === 'settings' ? <SettingsSection {...props} /> : null}
    </div>
  );
}

function AccountSection(props) {
  const {
    user,
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    biography,
    setBiography,
    personalSaveError,
    personalSaveMessage,
    saving,
    onSavePersonalData,
    clearPersonalStatus,
    avatarDisplay,
    mascotFallbackUrl,
    displayName,
    onSelectAvatar,
    avatarUploading,
    avatarError,
    subscriptionIsActive,
    subscriptionPeriodLabel,
    deleteFlowActive,
    deleteCode,
    setDeleteCode,
    deleteCodeSentAt,
    sendingDeleteCode,
    deletingAccount,
    onSendDeleteCode,
    onDeleteAccount,
  } = props;

  return (
    <>
      <SectionHeading tabId="account" detail="Your personal information and account controls." />
      <section className="perfil-student__card">
        <h2>Personal details</h2>
        <div className="perfil-student__identity-row">
          <ProfileAvatarUpload
            avatarUrl={avatarDisplay.displayUrl}
            fallbackAvatarUrl={mascotFallbackUrl}
            isDefaultMascot={avatarDisplay.isDefaultMascot}
            displayName={displayName}
            onSelectFile={onSelectAvatar}
            uploading={avatarUploading}
            error={avatarError}
            size={72}
          />
          <dl className="mis-datos-facts">
            <div className="mis-datos-fact">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="mis-datos-fact">
              <dt>Joined</dt>
              <dd>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mis-datos-form">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-display-name">Full name</label>
            <input
              id="profile-display-name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearPersonalStatus();
              }}
              className="form-input"
              placeholder="Your name"
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-birth-date">Date of birth</label>
            <input
              id="profile-birth-date"
              type="date"
              value={birthDate}
              onChange={(event) => {
                setBirthDate(event.target.value);
                clearPersonalStatus();
              }}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">About you (optional)</label>
            <textarea
              id="profile-bio"
              value={biography}
              onChange={(event) => {
                setBiography(event.target.value);
                clearPersonalStatus();
              }}
              className="form-input"
              rows={4}
              maxLength={500}
              placeholder="A short note about your preparation"
            />
          </div>
        </div>
        {personalSaveError ? <p className="form-hint form-hint--error">{personalSaveError}</p> : null}
        {personalSaveMessage ? <p className="form-hint form-hint--success">{personalSaveMessage}</p> : null}
        <button type="button" className="action-btn" onClick={onSavePersonalData} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </section>

      <section className="perfil-student__card perfil-student__card--danger" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title" className="perfil-student__danger-title">Danger zone</h2>
        <p>Only use this if you want to permanently delete your DRALO account and its data.</p>
        {subscriptionIsActive ? (
          <p className="profile-settings-panel__danger-notice" role="status">
            You have an active paid subscription. If you delete your account, billing stops at the end of your current period
            {subscriptionPeriodLabel ? ` (${subscriptionPeriodLabel})` : ''}. Your plan stays active until that date and you will not be charged again.
          </p>
        ) : null}
        <button
          type="button"
          className="action-btn profile-settings-panel__danger-btn"
          onClick={onSendDeleteCode}
          disabled={sendingDeleteCode || deletingAccount}
        >
          {sendingDeleteCode ? 'Sending code...' : 'Delete your account'}
        </button>
        {deleteFlowActive ? (
          <div className="profile-settings-panel__danger-form">
            <div className="form-group">
              <label className="form-label" htmlFor="delete-account-code">Verification code (6 digits)</label>
              <input
                id="delete-account-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={deleteCode}
                onChange={(event) => setDeleteCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input"
                placeholder="123456"
              />
              <small className="profile-settings-panel__danger-hint">
                Code sent to {user?.email}. Check inbox and spam.
                {deleteCodeSentAt ? ' If it expires, request a new one.' : ''}
              </small>
            </div>
            <button
              type="button"
              className="action-btn profile-settings-panel__danger-btn profile-settings-panel__danger-btn--confirm"
              onClick={onDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? 'Deleting...' : 'Confirm account deletion'}
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}

function SubscriptionSection(props) {
  const {
    subscriptionPlan,
    subscriptionDisplay,
    showPricingLink,
    openInviteFromUrl,
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    setInviteMessage,
    invitingFriend,
    onInviteFriend,
    inviteFeedback,
    clearInviteFeedback,
    loadingReferrals,
    referralInvitations,
    referralStatusLabel,
  } = props;

  return (
    <>
      <SectionHeading tabId="subscription" detail="Your plan, prices and referrals." />
      <Suspense fallback={<p className="section-desc">Loading subscription…</p>}>
        <ProfileSubscriptionCard
          plan={subscriptionPlan}
          description={subscriptionDisplay.descripcionCorta}
          highlights={subscriptionDisplay.highlights}
          badge={subscriptionDisplay.badge}
          showPricingLink={showPricingLink}
        />
      </Suspense>
      <p className="perfil-student__note">
        <Link href="/precios/">Compare plans</Link>
      </p>
      <ProfileCollapsibleSection title="Invite a friend, get 2 months free" defaultOpen={openInviteFromUrl}>
        <div className="profile-invite-promo" role="note">
          <div className="profile-invite-promo__icon" aria-hidden>
            <Gift size={26} strokeWidth={2} />
          </div>
          <div className="profile-invite-promo__copy">
            <span className="profile-invite-promo__badge">Referral reward</span>
            <p className="profile-invite-promo__headline">
              Invite a friend and get <strong>2 months free</strong>
            </p>
            <p className="profile-invite-promo__text">
              When your friend joins a paid plan, you get <strong>2 months free on PLUS</strong>.
              Send them an email invitation to start practising together. Referrals only count for{' '}
              <strong>new users</strong> who have never had a Dralo account.
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="invite-friend-email">Friend&apos;s email</label>
          <input
            id="invite-friend-email"
            type="email"
            value={inviteEmail}
            onChange={(event) => {
              setInviteEmail(event.target.value);
              if (inviteFeedback) clearInviteFeedback();
            }}
            className="form-input"
            placeholder="friend@email.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="invite-friend-message">Custom message (optional)</label>
          <textarea
            id="invite-friend-message"
            value={inviteMessage}
            onChange={(event) => setInviteMessage(event.target.value)}
            className="form-input"
            rows={4}
            placeholder="Hi! Join me to practise English on English Practice."
          />
        </div>
        <button type="button" onClick={onInviteFriend} className="action-btn" disabled={invitingFriend}>
          {invitingFriend ? 'Sending invitation...' : 'Send invitation'}
        </button>
        {inviteFeedback ? (
          <div className={`profile-invite-feedback profile-invite-feedback--${inviteFeedback.type}`} role="status">
            <div className="profile-invite-feedback__icon" aria-hidden>
              {inviteFeedback.type === 'success' ? <CheckCircle2 size={22} strokeWidth={2.25} /> : <Info size={22} strokeWidth={2.25} />}
            </div>
            <div className="profile-invite-feedback__copy">
              <p className="profile-invite-feedback__title">{inviteFeedback.title}</p>
              <p className="profile-invite-feedback__message">{inviteFeedback.message}</p>
            </div>
            <button type="button" className="profile-invite-feedback__dismiss" onClick={clearInviteFeedback} aria-label="Dismiss message">
              ×
            </button>
          </div>
        ) : null}
        <div className="profile-referrals">
          <h3 className="profile-referrals__title">Your invitations</h3>
          {loadingReferrals ? (
            <p className="profile-referrals__empty">Loading invitations…</p>
          ) : referralInvitations.length === 0 ? (
            <p className="profile-referrals__empty">
              You have not invited anyone yet. When a friend registers and joins a paid plan, it will appear here.
            </p>
          ) : (
            <ul className="profile-referrals__list">
              {referralInvitations.map((invitation) => (
                <li key={invitation.id} className="profile-referrals__item">
                  <div className="profile-referrals__main">
                    <span className="profile-referrals__email">{invitation.email}</span>
                    <span className={`profile-referrals__status profile-referrals__status--${invitation.status}`}>
                      {referralStatusLabel(invitation.status)}
                    </span>
                  </div>
                  {invitation.rewardGrantedAt ? (
                    <p className="profile-referrals__meta profile-referrals__meta--reward">You earned 2 months free on PLUS</p>
                  ) : invitation.paidAt ? (
                    <p className="profile-referrals__meta">
                      Joined a paid plan
                      {invitation.paidPlan ? ` (${invitation.paidPlan.toUpperCase()})` : ''} on{' '}
                      {new Date(invitation.paidAt).toLocaleDateString('en-GB')}
                    </p>
                  ) : invitation.registeredAt ? (
                    <p className="profile-referrals__meta">
                      Registered on {new Date(invitation.registeredAt).toLocaleDateString('en-GB')} — waiting for paid plan
                    </p>
                  ) : invitation.sentAt ? (
                    <p className="profile-referrals__meta">
                      Invited on {new Date(invitation.sentAt).toLocaleDateString('en-GB')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ProfileCollapsibleSection>
      <HelpLink
        title="Need help with your plan?"
        text="Questions about access, payment or your invitation email?"
      />
    </>
  );
}

function SettingsSection(props) {
  const {
    newPassword,
    setNewPassword,
    onPasswordChange,
    notifications,
    setNotifications,
    saving,
    onSaveSettings,
  } = props;

  return (
    <>
      <SectionHeading tabId="settings" detail="Security, notifications and appearance." />
      <section className="perfil-student__card">
        <h2>Security</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="profile-new-password">New password</label>
          <PasswordInput
            id="profile-new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="form-input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <button type="button" className="action-btn" onClick={onPasswordChange}>
          Change password
        </button>
      </section>
      <section className="perfil-student__card">
        <h2>Notifications</h2>
        <label className="setting-label">
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={(event) => setNotifications({ ...notifications, email: event.target.checked })}
          />
          Email notifications
        </label>
        <label className="setting-label">
          <input
            type="checkbox"
            checked={notifications.push}
            onChange={(event) => setNotifications({ ...notifications, push: event.target.checked })}
          />
          Push reminders
        </label>
        <button type="button" className="action-btn" onClick={onSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </section>
      <section className="perfil-student__card">
        <h2>Appearance</h2>
        <ProfileNightModeSetting />
      </section>
      <HelpLink title="Need help?" text="If you're having trouble with your account, we're here to help." />
    </>
  );
}
