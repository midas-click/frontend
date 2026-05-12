import { useState, useEffect, useCallback, useRef } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useStore } from "@/store";
import { OrgSwitcher } from "./OrgSwitcher";
import { ProfileSwitcher, ProfileOption } from "./ProfileSwitcher";
import { api } from "@/api/client";

interface CreateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateProfileDialog({ open, onClose, onCreated }: CreateProfileDialogProps) {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.profiles.create({ name: name.trim(), headline: headline.trim() || undefined });
      onCreated();
      setName("");
      setHeadline("");
      onClose();
    } catch (err: any) {
      console.error("Create profile failed:", err);
      alert("Failed to create profile: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-xl shadow-xl z-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Profile</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex (Frontend)"
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
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </>
  );
}

/** Header bar with org switcher, profile switcher, and user menu. */
export function AuthHeader() {
  const { user } = useUser();
  const storeSetActiveProfileId = useStore((s) => s.setActiveProfileId);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    () => localStorage.getItem("midas-active-profile")
  );
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const autoCreateAttempted = useRef(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await api.profiles.list();
      setProfiles(data.map((p: any) => ({ id: p.id, name: p.name, headline: p.headline })));

      // Auto-select first profile if none is currently active
      const storedId = localStorage.getItem("midas-active-profile");
      const storedValid = storedId && data.some((p: any) => p.id === storedId);
      if (data.length > 0 && !storedValid) {
        const firstId = data[0].id;
        setActiveProfileId(firstId);
        localStorage.setItem("midas-active-profile", firstId);
        storeSetActiveProfileId(firstId);
      }

      // Auto-create a default profile if none exist yet
      if (data.length === 0 && !autoCreateAttempted.current && user) {
        autoCreateAttempted.current = true;
        const defaultName =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "Default";

        try {
          const created: any = await api.profiles.create({ name: defaultName });
          const newProfile = { id: created.id, name: created.name, headline: created.headline };
          setProfiles([newProfile]);
          setActiveProfileId(created.id);
          localStorage.setItem("midas-active-profile", created.id);
          storeSetActiveProfileId(created.id);
        } catch (e) {
          console.error("Auto-create profile failed:", e);
          autoCreateAttempted.current = false; // allow retry on next fetch
        }
      }
    } catch {
      // Not yet authenticated or org not selected
    } finally {
      setProfilesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfiles();
  }, [fetchProfiles, user]);

  const handleSwitchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    localStorage.setItem("midas-active-profile", profileId);
    storeSetActiveProfileId(profileId);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-3">
      <OrgSwitcher />

      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={handleSwitchProfile}
        onCreateNew={() => setShowCreateDialog(true)}
        onProfilesChanged={fetchProfiles}
        loading={profilesLoading}
      />

      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />

      <CreateProfileDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={fetchProfiles}
      />
    </div>
  );
}
