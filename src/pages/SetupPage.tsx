import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateOrganization, useOrganizationList } from "@clerk/clerk-react";
import { Building2, ArrowRight } from "lucide-react";

export default function SetupPage() {
  const navigate = useNavigate();
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: {},
  });

  useEffect(() => {
    if (isLoaded && userMemberships?.data?.length) {
      // User already has an org (invited or created one) → skip to dashboard
      navigate("/", { replace: true });
    }
  }, [isLoaded, userMemberships, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasOrg = userMemberships?.data && userMemberships.data.length > 0;

  if (hasOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
        <div className="text-center max-w-md">
          <Building2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
          <p className="text-gray-500 mb-6">
            You're a member of an organization. Continue to your dashboard.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your team</h1>
          <p className="text-gray-500 mt-1">
            Set up your organization to start tracking applications
          </p>
        </div>
        <CreateOrganization
          afterCreateOrganizationUrl="/"
          skipInvitationScreen={true}
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg border-0 rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
