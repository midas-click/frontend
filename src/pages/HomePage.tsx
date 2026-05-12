import { useAuth } from "@clerk/clerk-react";
import { Navigate, Link } from "react-router-dom";
import { Briefcase, FileText, Sparkles, BarChart3, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Track Every Application",
    body: "Keep all your job applications organized in one place. Never lose track of where you applied or what stage you're at.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Resume Tailoring",
    body: "Automatically tailor your resume to match any job description. Highlight the skills and experience that matter most.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    body: "See your interview rate, offer rate, and which resume versions perform best. Make data-driven decisions.",
  },
  {
    icon: FileText,
    title: "Smart Match Scoring",
    body: "Get an instant match score between your resume and any job listing. Know where you stand before you apply.",
  },
];

const STEPS = [
  { step: 1, title: "Upload your resume", body: "Drag and drop your PDF resume. Our parser extracts all the key sections automatically." },
  { step: 2, title: "Add jobs you're targeting", body: "Paste a job description and let AI extract the details, or add jobs manually." },
  { step: 3, title: "Track your pipeline", body: "Move applications through a visual Kanban board — from Applied to Offer." },
  { step: 4, title: "Optimize & improve", body: "Use match scores and analytics to refine your resume and target the right roles." },
];

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
      {/* ── Nav ─────────────────────────────────── */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-brand-900 tracking-tight">MidasClick</span>
          <Link to="/jobs" className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">Jobs</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/sign-in"
            className="px-4 py-2 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="px-4 py-2 text-sm font-medium bg-brand-900 text-white rounded-btn hover:bg-brand-800 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary leading-tight tracking-tight">
          Land Your Dream Job
          <br />
          <span className="text-brand-600">With Smarter Tracking</span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          MidasClick is the all-in-one job application manager that helps you track
          every application, tailor your resume with AI, and see what's working with
          real analytics.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 text-white font-semibold rounded-btn hover:bg-brand-800 transition-colors text-sm"
          >
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/sign-in"
            className="px-6 py-3 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-text-primary mb-12">
          Everything you need to manage your job search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-card border border-border shadow-card p-6">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-btn w-fit mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────── */}
      <section className="bg-white border-t border-border py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <section className="py-20 text-center bg-brand-900">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to take control of your job search?
          </h2>
          <p className="text-brand-200 mb-8 text-sm leading-relaxed">
            Join thousands of job seekers who use MidasClick to track applications,
            tailor resumes, and land more interviews.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-900 font-semibold rounded-btn hover:bg-brand-50 transition-colors text-sm"
          >
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="bg-brand-900 border-t border-brand-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-brand-300">
          &copy; {new Date().getFullYear()} MidasClick. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
