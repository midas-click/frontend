import { useState } from "react";
import { UserCircle, Plus, Check, ChevronDown } from "lucide-react";

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
  loading?: boolean;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSwitch,
  onCreateNew,
  loading,
}: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const label = activeProfile ? activeProfile.name : "Select Profile";

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
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {profiles.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                No profiles yet
              </div>
            )}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  onSwitch(profile.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-purple-50 transition-colors ${
                  profile.id === activeProfileId ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                }`}
              >
                <div>
                  <div>{profile.name}</div>
                  {profile.headline && (
                    <div className="text-xs text-gray-400">{profile.headline}</div>
                  )}
                </div>
                {profile.id === activeProfileId && (
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                )}
              </button>
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
    </div>
  );
}
