import { useState } from 'react';

const STORAGE_KEY = 'sahayakProfile';
const DEFAULTS = {
  name: 'Anonymous User',
  id: '#SHY-4471',
  caseRef: 'CR-2026-0142',
  contact: 'Not set',
};

function loadSavedProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch (e) {
    // ignore — fall through to defaults
  }
  return DEFAULTS;
}

export default function Profile() {
  const [profile, setProfile] = useState(loadSavedProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function startEdit() {
    setDraft(profile);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function saveEdit() {
    const cleaned = {
      name: draft.name.trim() || DEFAULTS.name,
      id: draft.id.trim() || '—',
      caseRef: draft.caseRef.trim() || '—',
      contact: draft.contact.trim() || 'Not set',
    };
    setProfile(cleaned);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch (e) {
      // localStorage unavailable — edits still apply for this session
    }
    setIsEditing(false);
  }

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  const shown = isEditing ? draft : profile;

  return (
    <div className="profile-scroll">

      <div className="profile-header-card">
        <div className="profile-avatar-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="profile-header-info">
          <div className="profile-name">{profile.name}</div>
          <div className="profile-meta-row">
            <div className="profile-meta-tag">Anonymous ID: <b>{profile.id}</b></div>
            <div className="profile-meta-tag">Case ref: <b>{profile.caseRef}</b></div>
          </div>
        </div>
        {!isEditing && (
          <button className="profile-edit-btn" onClick={startEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit profile
          </button>
        )}
      </div>

      <div className="profile-stats-row">
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'var(--teal-soft)', color: 'var(--teal-deep)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l5-6 4 4 6-8 3 3" />
            </svg>
          </div>
          <div>
            <div className="profile-stat-label">7-day avg stress</div>
            <div className="profile-stat-value">42/100</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <div>
            <div className="profile-stat-label">Total check-ins</div>
            <div className="profile-stat-value">18</div>
          </div>
        </div>
      </div>

      <div className="profile-edit-card">
        <div className="card-title">Edit profile</div>
        <div className="card-caption">Update your display details</div>
        <div className="profile-form-grid">
          <div className="profile-form-field">
            <label>Display name</label>
            <input
              type="text"
              value={shown.name}
              disabled={!isEditing}
              onChange={(e) => updateDraft('name', e.target.value)}
            />
          </div>
          <div className="profile-form-field">
            <label>Anonymous ID</label>
            <input
              type="text"
              value={shown.id}
              disabled={!isEditing}
              onChange={(e) => updateDraft('id', e.target.value)}
            />
          </div>
          <div className="profile-form-field">
            <label>Case reference</label>
            <input
              type="text"
              value={shown.caseRef}
              disabled={!isEditing}
              onChange={(e) => updateDraft('caseRef', e.target.value)}
            />
          </div>
          <div className="profile-form-field">
            <label>Preferred contact time</label>
            <input
              type="text"
              value={shown.contact}
              disabled={!isEditing}
              onChange={(e) => updateDraft('contact', e.target.value)}
            />
          </div>
        </div>
        {isEditing && (
          <div className="profile-edit-actions">
            <button className="profile-save-btn" onClick={saveEdit}>Save changes</button>
            <button className="profile-cancel-btn" onClick={cancelEdit}>Cancel</button>
          </div>
        )}
      </div>

    </div>
  );
}