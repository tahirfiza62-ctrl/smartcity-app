
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  ShieldCheck,
  Palette,
  Save,
  RotateCcw,
  CheckCircle2,
  Globe,
  Clock3,
  Mail,
  AlertTriangle,
  FileText,
  LockKeyhole,
} from "lucide-react";
import "./Settings.css";

const STORAGE_KEY = "smartcity_admin_settings";

const DEFAULT_SETTINGS = {
  systemName: "SmartCity",
  city: "Rawalpindi",
  language: "English",
  timezone: "Asia/Karachi",
  emailNotifications: true,
  complaintNotifications: true,
  emergencyNotifications: true,
  dailySummary: false,
  sessionTimeout: "30",
  strongPassword: true,
  loginAlerts: true,
  theme: "light",
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!savedMessage) return undefined;

    const timeout = setTimeout(() => setSavedMessage(""), 3000);

    return () => clearTimeout(timeout);
  }, [savedMessage]);

  function updateSetting(name, value) {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSavedMessage("");
    setError("");
  }

  function saveSettings(event) {
    event.preventDefault();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setError("");
      setSavedMessage("Settings saved successfully.");
    } catch {
      setError("Could not save settings in this browser.");
    }
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Restore all settings to their default values?"
    );

    if (!confirmed) return;

    setSettings({ ...DEFAULT_SETTINGS });
    localStorage.removeItem(STORAGE_KEY);
    setError("");
    setSavedMessage("Default settings restored.");
  }

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  function renderToggle(name, title, description, icon) {
    const Icon = icon;

    return (
      <div className="settings-toggle-row" key={name}>
        <div className="settings-toggle-info">
          <div className="settings-option-icon">
            <Icon size={19} />
          </div>

          <div>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={settings[name]}
          aria-label={title}
          className={`settings-switch ${
            settings[name] ? "is-on" : ""
          }`}
          onClick={() => updateSetting(name, !settings[name])}
        >
          <span />
        </button>
      </div>
    );
  }

  return (
    <main className="settings-page">
      <header className="settings-page-header">
        <div className="settings-page-title">
          <div className="settings-title-icon">
            <SettingsIcon size={25} />
          </div>

          <div>
            <h1>Settings</h1>
            <p>Manage your SmartCity dashboard preferences.</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-reset-btn"
          onClick={resetSettings}
        >
          <RotateCcw size={16} />
          Reset Defaults
        </button>
      </header>

      {savedMessage && (
        <div className="settings-success">
          <CheckCircle2 size={19} />
          {savedMessage}
        </div>
      )}

      {error && (
        <div className="settings-error">
          <AlertTriangle size={19} />
          {error}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <p className="settings-sidebar-label">PREFERENCES</p>

          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`settings-tab ${
                activeTab === id ? "active" : ""
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}

          <div className="settings-sidebar-note">
            <ShieldCheck size={21} />
            <strong>Admin Preferences</strong>
            <p>
              Configure your dashboard preferences and notification
              options.
            </p>
          </div>
        </aside>

        <form className="settings-form" onSubmit={saveSettings}>
          {activeTab === "general" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <Building2 size={21} />
                <div>
                  <h2>General Settings</h2>
                  <p>Configure your city's basic system information.</p>
                </div>
              </div>

              <div className="settings-fields">
                <label className="settings-field">
                  <span>System Name</span>
                  <input
                    value={settings.systemName}
                    onChange={(e) =>
                      updateSetting("systemName", e.target.value)
                    }
                    required
                    maxLength={80}
                    placeholder="Enter system name"
                  />
                </label>

                <label className="settings-field">
                  <span>City Name</span>
                  <input
                    value={settings.city}
                    onChange={(e) =>
                      updateSetting("city", e.target.value)
                    }
                    required
                    maxLength={80}
                    placeholder="Enter city name"
                  />
                </label>

                <label className="settings-field">
                  <span>Language</span>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      updateSetting("language", e.target.value)
                    }
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </label>

                <label className="settings-field">
                  <span>Timezone</span>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      updateSetting("timezone", e.target.value)
                    }
                  >
                    <option value="Asia/Karachi">
                      Pakistan Standard Time (UTC+5)
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Dubai">
                      Gulf Standard Time (UTC+4)
                    </option>
                  </select>
                </label>
              </div>

              <div className="settings-info-banner">
                <Globe size={19} />
                <p>
                  These details are preferences for this browser. They
                  will not automatically update other users' dashboards.
                </p>
              </div>
            </section>
          )}

          {activeTab === "notifications" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <Bell size={21} />
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose which alerts you want enabled.</p>
                </div>
              </div>

              <div className="settings-toggle-list">
                {renderToggle(
                  "emailNotifications",
                  "Email Notifications",
                  "Enable email notification preferences.",
                  Mail
                )}

                {renderToggle(
                  "complaintNotifications",
                  "Complaint Alerts",
                  "Enable alerts for new complaint activity.",
                  FileText
                )}

                {renderToggle(
                  "emergencyNotifications",
                  "Emergency Alerts",
                  "Enable preferences for emergency notifications.",
                  AlertTriangle
                )}

                {renderToggle(
                  "dailySummary",
                  "Daily Summary",
                  "Enable the preference for a daily activity summary.",
                  Clock3
                )}
              </div>

              <div className="settings-info-banner">
                <Bell size={19} />
                <p>
                  These switches save preferences only. Email delivery,
                  push notifications, and scheduled summaries must be
                  connected separately.
                </p>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <ShieldCheck size={21} />
                <div>
                  <h2>Security Preferences</h2>
                  <p>Review your preferred account security options.</p>
                </div>
              </div>

              <label className="settings-field settings-field-full">
                <span>Preferred Session Timeout</span>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    updateSetting("sessionTimeout", e.target.value)
                  }
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
                <small>
                  Saving this preference does not change actual server
                  session expiration.
                </small>
              </label>

              <div className="settings-toggle-list">
                {renderToggle(
                  "strongPassword",
                  "Strong Password Preference",
                  "Record a preference for strong administrator passwords.",
                  LockKeyhole
                )}

                {renderToggle(
                  "loginAlerts",
                  "Login Alert Preference",
                  "Enable your preference for login alerts.",
                  ShieldCheck
                )}
              </div>

              <div className="settings-info-banner">
                <ShieldCheck size={19} />
                <p>
                  Enforce password rules and session expiration on the
                  backend for actual security. Browser settings alone
                  cannot enforce these policies.
                </p>
              </div>
            </section>
          )}

          {activeTab === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <Palette size={21} />
                <div>
                  <h2>Appearance</h2>
                  <p>Choose the preferred dashboard appearance.</p>
                </div>
              </div>

              <div className="settings-theme-options">
                <button
                  type="button"
                  className={`settings-theme-card ${
                    settings.theme === "light" ? "selected" : ""
                  }`}
                  onClick={() => updateSetting("theme", "light")}
                >
                  <div className="settings-theme-preview theme-preview-light">
                    <span />
                    <span />
                    <span />
                  </div>
                  <strong>Light Theme</strong>
                  <small>Bright and clean interface</small>
                </button>

                <button
                  type="button"
                  className={`settings-theme-card ${
                    settings.theme === "dark" ? "selected" : ""
                  }`}
                  onClick={() => updateSetting("theme", "dark")}
                >
                  <div className="settings-theme-preview theme-preview-dark">
                    <span />
                    <span />
                    <span />
                  </div>
                  <strong>Dark Theme</strong>
                  <small>Dark interface preference</small>
                </button>
              </div>

              <div className="settings-info-banner">
                <Palette size={19} />
                <p>
                  The theme selection is saved as a preference. Applying
                  it across the dashboard requires connecting it to your
                  shared theme or layout.
                </p>
              </div>
            </section>
          )}

          <footer className="settings-form-footer">
            <span>Save your changes before leaving this page.</span>

            <button type="submit" className="settings-save-btn">
              <Save size={17} />
              Save Settings
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}