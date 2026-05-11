import { useState } from "react";
import { UserCircle, Plus, Check, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api } from "@/api/client";

export interface ProfileOption {
  id: string;
  name: string;
  headline?: string;
}

interface ProfileSwitcherProps {
  profiles: ProfileOption[];
  activeProfileId: string | null;
  onSwitch: (profileId: string) => void;
  onCreateNew: () => void;
  onProfilesChanged: () => void;
  loading?: boolean;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSwitch,
  onCreateNew,
  onProfilesChanged,
  loading,
}: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileOption | null>(null);
  const [editName, setEditName] = useState("");
  const [editHeadline, setEditHeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProfileOption | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const label = activeProfile ? activeProfile.name : "Select Profile";

  const startEdit = (profile: ProfileOption) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditHeadline(profile.headline || "");
  };

  const saveEdit = async () => {
    if (!editingProfile || !editName.trim()) return;
    setSaving(true);
    try {
      await api.profiles.update(editingProfile.id, {
        name: editName.trim(),
        headline: editHeadline.trim() || undefined,
      });
      setEditingProfile(null);
      onProfilesChanged();
    } catch (e) {
      console.error("Update profile failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.profiles.delete(deleteTarget.id);
      if (activeProfileId === deleteTarget.id) {
        const remaining = profiles.filter((p) => p.id !== deleteTarget.id);
        if (remaining.length > 0) {
          onSwitch(remaining[0].id);
        }
      }
      onProfilesChanged();
    } catch (e) {
      console.error("Delete profile failed:", e);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400 px-2">Loading profiles...</div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:border-purple-300 transition-colors"
      >
        <UserCircle className="w-4 h-4 text-purple-500" />
        <span className="text-gray-700">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {profiles.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                No profiles yet
              </div>
            )}
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`group flex items-center px-2 py-1.5 hover:bg-purple-50 transition-colors ${
                  profile.id === activeProfileId ? "bg-purple-50" : ""
                }`}
              >
                <button
                  onClick={() => {
                    onSwitch(profile.id);
                    setOpen(false);
                  }}
                  className="flex-1 text-left text-sm min-w-0"
                >
                  <div className={`truncate ${profile.id === activeProfileId ? "text-purple-700 font-medium" : "text-gray-700"}`}>
                    {profile.name}
                  </div>
                  {profile.headline && (
                    <div className="text-xs text-gray-400 truncate">{profile.headline}</div>
                  )}
                </button>

                {profile.id === activeProfileId && (
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mx-1" />
                )}

                {/* Edit / Delete — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(profile);
                    }}
                    title="Edit profile"
                    className="p-1 rounded hover:bg-purple-100 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(profile);
                      }}
                      title="Delete profile"
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => {
                onCreateNew();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create new profile
            </button>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Profile"
        message={`Delete profile "${deleteTarget?.name}"? All data scoped to this profile will become inaccessible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Edit dialog */}
      {editingProfile && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setEditingProfile(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline (optional)
                </label>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editName.trim() || saving}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
