import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import useAuth from "../../auth/useAuth";
import { getUserProfile, upsertUserProfile } from "../../firebase/userProfileService";
import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getDefaultAddressId,
  setDefaultAddressId,
} from "../../firebase/addressService";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./ProfilePage.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",  label: "Personal info" },
  { id: "address",  label: "Address" },
  { id: "password", label: "Password" },
];

const EMPTY_ADDRESS_FORM = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  landmark: "",
};

// ─── Password Tab ─────────────────────────────────────────────────────────────

function PasswordTab({ user }) {
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.next.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, form.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.next);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(e?.message || "Failed to update password.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 18 }}>
      <p className="profile-muted" style={{ marginBottom: 16 }}>
        Choose a strong password you don't use elsewhere.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="profile-row">
          <label className="profile-field">
            <span className="profile-muted">Current password</span>
            <input
              type="password"
              className="profile-input"
              value={form.current}
              onChange={setField("current")}
              placeholder="Enter current password"
              required
              autoComplete="current-password"
            />
          </label>

          <label className="profile-field">
            <span className="profile-muted">New password</span>
            <input
              type="password"
              className="profile-input"
              value={form.next}
              onChange={setField("next")}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </label>

          <label className="profile-field">
            <span className="profile-muted">Confirm new password</span>
            <input
              type="password"
              className="profile-input"
              value={form.confirm}
              onChange={setField("confirm")}
              placeholder="Repeat new password"
              required
              autoComplete="new-password"
            />
          </label>
        </div>

        {error && <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>}
        {success && (
          <div className="profile-success" style={{ marginTop: 12 }}>
            Password updated successfully.
          </div>
        )}

        <div className="profile-actions" style={{ justifyContent: "flex-end" }}>
          <button type="submit" className="profile-primary-btn" disabled={saving}>
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Address Tab ──────────────────────────────────────────────────────────────

function AddressTab({ uid }) {
  const [addresses, setAddresses] = useState([]);
  const [defaultId, setDefaultId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("idle"); // "idle" | "add" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    setLoading(true);
    Promise.all([listAddresses(uid), getDefaultAddressId(uid)])
      .then(([addrs, defId]) => {
        if (!mounted) return;
        setAddresses(addrs);
        setDefaultId(defId);
      })
      .catch((e) => mounted && setError(e?.message || "Failed to load addresses"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [uid]);

  const openAdd = () => {
    setForm(EMPTY_ADDRESS_FORM);
    setEditingId(null);
    setError("");
    setMode("add");
  };

  const openEdit = (addr) => {
    setForm({
      fullName:  addr.fullName  || "",
      phone:     addr.phone     || "",
      line1:     addr.line1     || "",
      line2:     addr.line2     || "",
      city:      addr.city      || "",
      state:     addr.state     || "",
      pincode:   addr.pincode   || "",
      country:   addr.country   || "India",
      landmark:  addr.landmark  || "",
    });
    setEditingId(addr.id);
    setError("");
    setMode("edit");
  };

  const cancelForm = () => {
    setMode("idle");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    setError("");
    try {
      if (mode === "add") {
        const newId = await addAddress(uid, form);
        const fresh = await listAddresses(uid);
        setAddresses(fresh);
        if (fresh.length === 1) {
          await setDefaultAddressId(uid, newId);
          setDefaultId(newId);
        }
      } else {
        await updateAddress(uid, editingId, form);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
        );
      }
      setMode("idle");
      setEditingId(null);
    } catch (e) {
      setError(e?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!uid) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteAddress(uid, id);
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (defaultId === id) {
        const nextDefault = remaining[0]?.id || null;
        if (nextDefault) {
          await setDefaultAddressId(uid, nextDefault);
          setDefaultId(nextDefault);
        } else {
          setDefaultId(null);
        }
      }
    } catch (e) {
      setError(e?.message || "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id) => {
    if (!uid || id === defaultId) return;
    try {
      await setDefaultAddressId(uid, id);
      setDefaultId(id);
    } catch (e) {
      setError(e?.message || "Failed to set default");
    }
  };

  const addressField = (key, label, placeholder, opts = {}) => (
    <label className="profile-field" key={key}>
      <span className="profile-muted">{label}</span>
      <input
        className="profile-input"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        required={opts.required}
      />
    </label>
  );

  if (loading) {
    return <p className="profile-muted" style={{ marginTop: 18 }}>Loading addresses…</p>;
  }

  return (
    <div style={{ marginTop: 18 }}>
      {mode === "idle" && (
        <>
          {addresses.length === 0 ? (
            <p className="profile-muted">No saved addresses yet.</p>
          ) : (
            <div className="address-list">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card${addr.id === defaultId ? " address-card--default" : ""}`}
                >
                  {addr.id === defaultId && (
                    <span className="address-default-badge">Default</span>
                  )}
                  <p className="address-name">{addr.fullName}</p>
                  <p className="address-line">{addr.phone}</p>
                  <p className="address-line">
                    {[addr.line1, addr.line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="address-line">
                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                  </p>
                  {addr.landmark && (
                    <p className="address-line address-landmark">Landmark: {addr.landmark}</p>
                  )}
                  <p className="address-line">{addr.country}</p>

                  <div className="address-card-actions">
                    {addr.id !== defaultId && (
                      <button
                        type="button"
                        className="profile-secondary-btn"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => openEdit(addr)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="profile-danger-btn"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                    >
                      {deletingId === addr.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>
          )}

          <div className="profile-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="profile-primary-btn" onClick={openAdd}>
              + Add Address
            </button>
          </div>
        </>
      )}

      {(mode === "add" || mode === "edit") && (
        <form onSubmit={handleSubmit}>
          <div className="profile-row">
            {addressField("fullName", "Full Name",       "Full name",                    { required: true })}
            {addressField("phone",    "Phone",           "Phone number",                 { required: true })}
            {addressField("line1",    "Address Line 1",  "House / Street",               { required: true })}
            {addressField("line2",    "Address Line 2",  "Apartment, floor, etc. (optional)")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {addressField("city",  "City",  "City",  { required: true })}
              {addressField("state", "State", "State", { required: true })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {addressField("pincode", "Pincode", "Pincode", { required: true })}
              {addressField("country", "Country", "Country")}
            </div>
            {addressField("landmark", "Landmark", "Nearby landmark (optional)")}
          </div>

          {error && <div className="profile-error">{error}</div>}

          <div className="profile-actions">
            <button
              type="button"
              className="profile-secondary-btn"
              disabled={saving}
              onClick={cancelForm}
            >
              Cancel
            </button>
            <button type="submit" className="profile-primary-btn" disabled={saving}>
              {saving ? "Saving…" : mode === "add" ? "Add Address" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ uid, user, profile, setProfile }) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.displayName || "",
    phone: profile?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || user?.displayName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, user?.displayName]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    setError("");
    try {
      await upsertUserProfile(uid, {
        displayName: form.displayName,
        phone: form.phone,
        email: user?.email || "",
        uid,
      });
      setProfile((p) => ({
        ...(p || {}),
        displayName: form.displayName,
        phone: form.phone,
        email: user?.email || "",
        uid,
      }));
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setError("");
    setIsEditing(false);
    setForm({
      displayName: profile?.displayName || user?.displayName || "",
      phone: profile?.phone || "",
    });
  };

  return (
    <div style={{ marginTop: 18 }}>
      {!isEditing ? (
        <div className="profile-readonly">
          <div className="profile-row" style={{ gap: 10 }}>
            <div className="profile-field">
              <p className="profile-label">Display Name</p>
              <p className="profile-value">{form.displayName || "—"}</p>
            </div>
            <div className="profile-field">
              <p className="profile-label">Phone</p>
              <p className="profile-value">{form.phone || "—"}</p>
            </div>
          </div>

          {error && (
            <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>
          )}

          <div className="profile-actions" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="profile-secondary-btn"
                onClick={() => navigate("/account/orders")}
              >
                My Orders
              </button>
              {/* <button
                type="button"
                className="profile-secondary-btn"
                onClick={() => navigate("/account/settings")}
              >
                Settings
              </button> */}
            </div>
            <button
              type="button"
              className="profile-primary-btn"
              onClick={() => { setError(""); setIsEditing(true); }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="profile-row">
            <label className="profile-field">
              <span className="profile-muted">Display Name</span>
              <input
                className="profile-input"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Your name"
              />
            </label>
            <label className="profile-field">
              <span className="profile-muted">Phone</span>
              <input
                className="profile-input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </label>
          </div>

          {error && <div className="profile-error">{error}</div>}

          <div className="profile-actions">
            <button
              type="button"
              className="profile-secondary-btn"
              disabled={saving}
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button type="submit" className="profile-primary-btn" disabled={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading: authLoading, signOutUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (!mounted) return;
        setInitialLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [uid]);

  const handleLogout = async () => {
    setError("");
    setSaving(true);
    try {
      await signOutUser();
      navigate("login");
    } catch (e) {
      setError(e?.message || "Failed to log out");
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
              Logged in as: <b>{user?.email || user?.uid}</b>
            </p>

            <div className="profile-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`profile-tab-btn${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>
            )}

            {activeTab === "profile" && (
              <ProfileTab uid={uid} user={user} profile={profile} setProfile={setProfile} />
            )}
            {activeTab === "address" && (
              <AddressTab uid={uid} />
            )}
            {activeTab === "password" && (
              <PasswordTab user={user} />
            )}
          </div>
        )}
      </div>

      {user && (
        <div className="profile-logout-wrapper">
          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
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