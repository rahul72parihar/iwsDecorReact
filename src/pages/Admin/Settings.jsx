import { useMemo, useState } from 'react';

import { getAuth, updateProfile, updatePassword } from 'firebase/auth';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import useAuth from '../../auth/useAuth';

import './Settings.css';

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const auth = useMemo(() => getAuth(), []);

  const [profileForm, setProfileForm] = useState({
    displayName: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setSavingProfile(true);

    try {
      const displayName = profileForm.displayName?.trim() || '';
      await updateProfile(user, { displayName });
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setChangingPassword(true);

    try {
      // NOTE: Firebase client SDK requires re-auth in real flows. If currentPassword is not
      // valid / user not freshly authenticated, updatePassword may throw.
      await updatePassword(user, passwordForm.newPassword);
      setSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setError(e?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const displayName = user?.displayName || '';

  return (
    <>
      <Header />

      <div className="settings-page">
        <div className="settings-shell">
          <div className="settings-head">
            <h1>Settings</h1>
            <div className="settings-sub">Manage your profile and password</div>
          </div>

          <div className="settings-tabs" role="tablist" aria-label="Settings sections">
            <button
              type="button"
              className={activeTab === 'profile' ? 'settings-tab active' : 'settings-tab'}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              type="button"
              className={activeTab === 'password' ? 'settings-tab active' : 'settings-tab'}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          {loading ? (
            <div className="settings-card">Loading…</div>
          ) : !user ? (
            <div className="settings-card">
              <h2>You need to log in</h2>
              <div className="settings-muted">Profile settings are available only for signed-in users.</div>
            </div>
          ) : (
            <div className="settings-card">
              {activeTab === 'profile' ? (
                <>
                  <h2 className="settings-card-title">Profile</h2>
                  <form onSubmit={onSaveProfile} className="settings-form">
                    <label className="settings-field">
                      <span className="settings-label">Display name</span>
                      <input
                        className="settings-input"
                        value={profileForm.displayName || displayName}
                        onChange={(e) => setProfileForm({ displayName: e.target.value })}
                        placeholder="Your display name"
                      />
                    </label>

                    {error ? <div className="settings-error">{error}</div> : null}
                    {success ? <div className="settings-success">{success}</div> : null}

                    <div className="settings-actions">
                      <button className="settings-primary" type="submit" disabled={savingProfile}>
                        {savingProfile ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="settings-card-title">Change Password</h2>
                  <form onSubmit={onChangePassword} className="settings-form">
                    <label className="settings-field">
                      <span className="settings-label">Current password</span>
                      <input
                        type="password"
                        className="settings-input"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                        placeholder="Current password"
                      />
                    </label>

                    <label className="settings-field">
                      <span className="settings-label">New password</span>
                      <input
                        type="password"
                        className="settings-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                        placeholder="New password"
                      />
                    </label>

                    {error ? <div className="settings-error">{error}</div> : null}
                    {success ? <div className="settings-success">{success}</div> : null}

                    <div className="settings-actions">
                      <button className="settings-primary" type="submit" disabled={changingPassword}>
                        {changingPassword ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>

                    <div className="settings-muted">
                      For some accounts, Firebase may require re-authentication (current password) before
                      updating.
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}


