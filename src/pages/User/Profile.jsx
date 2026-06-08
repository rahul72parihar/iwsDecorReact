import { useEffect, useMemo, useState } from "react";

import useAuth from "../../auth/useAuth";
import {
  getUserProfile,
  upsertUserProfile,
} from "../../firebase/userProfileService";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./ProfilePage.css";

export default function Profile() {
  const { user, loading: authLoading, signOutUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const uid = useMemo(() => user?.uid, [user]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!uid) return;
      setInitialLoading(true);
      setError("");
      try {
        const data = await getUserProfile(uid);

        if (!mounted) return;

        setProfile(data);
        setForm((prev) => ({
          ...prev,
          displayName: data?.displayName || user?.displayName || "",
          phone: data?.phone || "",
          addressLine1: data?.addressLine1 || "",
          city: data?.city || "",
          state: data?.state || "",
          postalCode: data?.postalCode || "",
        }));
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (!mounted) return;
        setInitialLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [uid, user?.displayName]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;

    setSaving(true);
    setError("");

    try {
      await upsertUserProfile(uid, {
        displayName: form.displayName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        email: user?.email || "",
        uid,
      });
      setProfile((p) => ({
        ...(p || {}),
        ...form,
        email: user?.email || "",
        uid,
      }));
    } catch (e) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <div className="profile-page">
        {authLoading || initialLoading ? (
          <div className="profile-card">
            <p className="profile-muted">Loading your profile…</p>
          </div>
        ) : !user ? (
          <div className="profile-card">
            <h1>Profile</h1>
            <p className="profile-muted">Please log in to view your profile.</p>
          </div>
        ) : (
          <div className="profile-card">
            <h1>Profile</h1>
            <p className="profile-muted">
              Update your details. Saved to Firestore.
            </p>

            <div style={{ marginTop: 8 }} className="profile-muted">
              Logged in as: <b>{user?.email || user?.uid}</b>
            </div>

            {!isEditing ? (
              <div className="profile-readonly" style={{ marginTop: 18 }}>
                <div className="profile-row" style={{ gap: 10 }}>
                  <div className="profile-field">
                    <p className="profile-label">Display Name</p>
                    <p className="profile-value">{form.displayName || "—"}</p>
                  </div>

                  <div className="profile-field">
                    <p className="profile-label">Phone</p>
                    <p className="profile-value">{form.phone || "—"}</p>
                  </div>

                  <div
                    className="profile-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <p className="profile-label">Address</p>
                    <p className="profile-value">
                      {[
                        form.addressLine1,
                        form.city,
                        form.state,
                        form.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>

                {error ? (
                  <div className="profile-error" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                ) : null}

                <div className="profile-actions">

                  <button
                    type="button"
                    className="profile-primary-btn"
                    onClick={() => {
                      setError("");
                      setIsEditing(true);
                    }}
                    disabled={saving}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
                <div className="profile-row">
                  <label className="profile-field">
                    <span className="profile-muted">Display Name</span>
                    <input
                      className="profile-input"
                      value={form.displayName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, displayName: e.target.value }))
                      }
                      placeholder="Your name"
                    />
                  </label>

                  <label className="profile-field">
                    <span className="profile-muted">Phone</span>
                    <input
                      className="profile-input"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="Phone number"
                    />
                  </label>

                  <label className="profile-field">
                    <span className="profile-muted">Address Line 1</span>
                    <input
                      className="profile-input"
                      value={form.addressLine1}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, addressLine1: e.target.value }))
                      }
                      placeholder="House/Street"
                    />
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <label className="profile-field">
                      <span className="profile-muted">City</span>
                      <input
                        className="profile-input"
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        placeholder="City"
                      />
                    </label>

                    <label className="profile-field">
                      <span className="profile-muted">State</span>
                      <input
                        className="profile-input"
                        value={form.state}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, state: e.target.value }))
                        }
                        placeholder="State"
                      />
                    </label>
                  </div>

                  <label className="profile-field">
                    <span className="profile-muted">Postal Code</span>
                    <input
                      className="profile-input"
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, postalCode: e.target.value }))
                      }
                      placeholder="Postal code"
                    />
                  </label>
                </div>

                {error ? <div className="profile-error">{error}</div> : null}

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-secondary-btn"
                    disabled={saving}
                    onClick={() => {
                      setError("");
                      setIsEditing(false);
                      if (profile) {
                        setForm((prev) => ({
                          ...prev,
                          displayName:
                            profile?.displayName || user?.displayName || "",
                          phone: profile?.phone || "",
                          addressLine1: profile?.addressLine1 || "",
                          city: profile?.city || "",
                          state: profile?.state || "",
                          postalCode: profile?.postalCode || "",
                        }));
                      }
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      {user && (
        <div className="profile-logout-wrapper">
          <button
            type="button"
            className="profile-logout-btn"
            onClick={async () => {
              setError("");
              try {
                await signOutUser();
                navigate("login");
              } catch (e) {
                setError(e?.message || "Failed to log out");
              }
            }}
            disabled={saving}
          >
            Log Out
          </button>
        </div>
      )}
      <Footer />
    </>
  );
}
