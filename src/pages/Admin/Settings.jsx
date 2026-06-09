import { useState } from 'react';
import { updateProfile, updatePassword } from 'firebase/auth';

import useAuth from '../../auth/useAuth';
import AdminNav from './AdminNav';

import './Settings.css';

export default function AdminSettings() {
  const { user, loading } = useAuth();

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  const [editingProfile, setEditingProfile] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      await updateProfile(user, {
        displayName: profileForm.displayName.trim(),
      });

      setSuccess('Profile updated successfully.');
      setEditingProfile(false);
    } catch (err) {
      setError(err?.message || 'Failed to update profile');
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
      await updatePassword(user, passwordForm.newPassword);

      setSuccess('Password updated successfully.');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Settings</h1>
            <p>Manage administrator profile and account settings.</p>
          </div>
        </header>

        <div className="adminSettingsCard">
          <div className="adminSettingsTabs">
            <button
              type="button"
              className={
                activeTab === 'profile'
                  ? 'adminSettingsTab active'
                  : 'adminSettingsTab'
              }
              onClick={() => {
                setError('');
                setSuccess('');
                setActiveTab('profile');
              }}
            >
              Profile
            </button>

            <button
              type="button"
              className={
                activeTab === 'password'
                  ? 'adminSettingsTab active'
                  : 'adminSettingsTab'
              }
              onClick={() => {
                setError('');
                setSuccess('');
                setActiveTab('password');
              }}
            >
              Password
            </button>
          </div>

          {loading ? (
            <div className="adminSettingsLoading">
              Loading...
            </div>
          ) : !user ? (
            <div className="adminSettingsError">
              No authenticated user found.
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <>
                  <div className="adminUserInfo">
                    <div className="adminUserInfoRow">
                      <span className="adminUserInfoLabel">
                        Email Address
                      </span>

                      <span className="adminUserInfoValue">
                        {user.email || 'Not Available'}
                      </span>
                    </div>

                    <div className="adminUserInfoRow">
                      <span className="adminUserInfoLabel">
                        Display Name
                      </span>

                      <span className="adminUserInfoValue">
                        {user.displayName || 'Not Set'}
                      </span>
                    </div>
                  </div>

                  <form
                    className="adminSettingsForm"
                    onSubmit={onSaveProfile}
                  >
                    {editingProfile && (
                      <label>
                        <span>Display Name</span>

                        <input
                          type="text"
                          value={profileForm.displayName}
                          onChange={(e) =>
                            setProfileForm({
                              displayName: e.target.value,
                            })
                          }
                          placeholder="Enter display name"
                        />
                      </label>
                    )}

                    {error && (
                      <div className="adminSettingsError">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="adminSettingsSuccess">
                        {success}
                      </div>
                    )}

                    <div className="adminSettingsActions">
                      {!editingProfile ? (
                        <button
                          type="button"
                          className="adminSettingsBtn"
                          onClick={() => {
                            setProfileForm({
                              displayName:
                                user.displayName || '',
                            });

                            setEditingProfile(true);
                          }}
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="submit"
                            className="adminSettingsBtn"
                            disabled={savingProfile}
                          >
                            {savingProfile
                              ? 'Saving...'
                              : 'Save Changes'}
                          </button>

                          <button
                            type="button"
                            className="adminSettingsBtnSecondary"
                            onClick={() => {
                              setEditingProfile(false);

                              setProfileForm({
                                displayName:
                                  user.displayName || '',
                              });

                              setError('');
                              setSuccess('');
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'password' && (
                <form
                  className="adminSettingsForm"
                  onSubmit={onChangePassword}
                >
                  <label>
                    <span>Current Password</span>

                    <div className="adminPasswordField">
                      <input
                        type={
                          showCurrentPassword
                            ? 'text'
                            : 'password'
                        }
                        value={
                          passwordForm.currentPassword
                        }
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="Current password"
                      />

                      <button
                        type="button"
                        className="adminPasswordToggle"
                        onClick={() =>
                          setShowCurrentPassword(
                            (prev) => !prev
                          )
                        }
                      >
                        {showCurrentPassword
                          ? 'Hide'
                          : 'Show'}
                      </button>
                    </div>
                  </label>

                  <label>
                    <span>New Password</span>

                    <div className="adminPasswordField">
                      <input
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="New password"
                      />

                      <button
                        type="button"
                        className="adminPasswordToggle"
                        onClick={() =>
                          setShowNewPassword(
                            (prev) => !prev
                          )
                        }
                      >
                        {showNewPassword
                          ? 'Hide'
                          : 'Show'}
                      </button>
                    </div>
                  </label>

                  {error && (
                    <div className="adminSettingsError">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="adminSettingsSuccess">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="adminSettingsBtn"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? 'Updating...'
                      : 'Update Password'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}