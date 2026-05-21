import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center hover:opacity-80 transition-opacity">
            <BrandLogo imageClassName="h-10" textClassName="text-xl" />
          </Link>
          <p className="text-gray-500 mt-1">Sign in to manage your job applications</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              card: "shadow-lg border-0 rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
