import { useNavigate } from "react-router";
import { Page, PageContent } from "../../shared/providerShell";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import {
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function HospitalEmpanelmentLanding() {
  const navigate = useNavigate();
  useBreadcrumb([
    { title: "Empanel" },
  ]);

  const handleRegister = () => {
    navigate("/provider-masters/create");
  };

  return (
    <Page title="Hospital Empanelment">
      <PageContent
        noPadding
        className="flex h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] w-full flex-col overflow-hidden px-6 pt-6 pb-6"
      >
        {/* Hero */}
        <div className="relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-5 py-5 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="relative">
            <h1 className="mb-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Empanel Your Hospital Today
            </h1>
            <p className="mb-4 text-sm text-blue-100/95">
              Join our network of trusted healthcare providers. Register your
              hospital in just a few simple steps and start connecting with
              patients.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                Secure
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                Verified
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <section className="flex min-h-0 flex-1 flex-col py-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Why Empanel With Us?</h2>
            {/* <div className="mt-1 h-0.5 w-12 rounded-full bg-blue-600" /> */}
            <p className="mt-2 text-xs text-gray-600">
              Experience the benefits of being part of our healthcare network.
            </p>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group flex min-h-[88px] gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:ring-indigo-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">Verified Network</h3>
                <p className="text-xs leading-relaxed text-gray-600">
                  Join a trusted network of verified healthcare providers.
                </p>
              </div>
            </div>
            <div className="group flex min-h-[88px] gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:ring-indigo-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">Wide Reach</h3>
                <p className="text-xs leading-relaxed text-gray-600">
                  Connect with thousands of patients seeking quality care.
                </p>
              </div>
            </div>
            <div className="group flex min-h-[88px] gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:ring-indigo-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <ClockIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">Quick Onboarding</h3>
                <p className="text-xs leading-relaxed text-gray-600">
                  Simple 5-step registration process completed in minutes.
                </p>
              </div>
            </div>
            <div className="group flex min-h-[88px] gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:ring-indigo-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <TrophyIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">Quality Recognition</h3>
                <p className="text-xs leading-relaxed text-gray-600">
                  Showcase your certifications and specializations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="shrink-0 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Ready to Get Started?</h2>
              <p className="mt-0.5 text-sm text-gray-600">
                Join thousands of hospitals already empanelled with us. The
                registration process takes less than 5 minutes.
              </p>
            </div>
            <button
              onClick={handleRegister}
              type="button"
              className="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            >
              Register Now →
            </button>
          </div>
        </div>

        <footer className="shrink-0 mt-4 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          Hospital Empanelment · © {new Date().getFullYear()} All rights reserved.
        </footer>
      </PageContent>
    </Page>
  );
}
