import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Join MidasClick</h1>
          <p className="text-gray-500 mt-1">Create an account to get started</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/setup"
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
