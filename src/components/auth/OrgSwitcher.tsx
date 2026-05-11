import { useState } from "react";
import {
  useOrganizationList,
  useOrganization,
  OrganizationProfile,
} from "@clerk/clerk-react";
import { Building2, Check, ChevronDown, Settings } from "lucide-react";

/** Org switcher with Manage option for admins. */
export function OrgSwitcher() {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {},
  });
  const { organization: activeOrg, membership } = useOrganization();
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  if (!isLoaded || !userMemberships?.data) {
    return (
      <div className="text-sm text-gray-400 px-2">Loading...</div>
    );
  }

  const orgs = userMemberships.data.map((m) => m.organization);
  const label = activeOrg?.name || (orgs.length > 0 ? orgs[0].name : "No organization");
  const isAdmin = membership?.role === "org:admin";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:border-purple-300 transition-colors"
      >
        <Building2 className="w-4 h-4 text-purple-500" />
        <span className="text-gray-700 max-w-[120px] truncate">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {orgs.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                No organizations
              </div>
            )}
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={async () => {
                  await setActive({ organization: org.id });
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-purple-50 transition-colors ${
                  activeOrg?.id === org.id
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                <span className="truncate">{org.name}</span>
                {activeOrg?.id === org.id && (
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                )}
              </button>
            ))}

            {isAdmin && activeOrg && (
              <>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    setOpen(false);
                    setManageOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage organization
                </button>
              </>
            )}
          </div>
        </>
      )}

      {manageOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setManageOpen(false)}
          />
          <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <OrganizationProfile
                routing="virtual"
                afterLeaveOrganizationUrl="/setup"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
