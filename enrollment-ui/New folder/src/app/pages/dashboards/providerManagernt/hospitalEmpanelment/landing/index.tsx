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
        className="enrolment-shell flex h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] w-full flex-col overflow-y-auto px-4 pt-4 pb-5 sm:px-6 sm:pt-6"
      >
        {/* Hero */}
        <div data-testid="empanelment-hero" className="relative shrink-0 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,.45),_transparent_36%),linear-gradient(125deg,#1e3a8a,#3730a3_58%,#312e81)] px-5 py-7 shadow-[0_18px_45px_rgba(49,46,129,.22)] sm:px-8 sm:py-8">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-white/15" />
          <div className="absolute -bottom-28 right-16 h-60 w-60 rounded-full border border-white/10" />
          <div className="relative max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-200">Provider network</p>
            <h1 data-testid="empanelment-page-title" className="mb-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Empanel Your Hospital Today
            </h1>
            <p data-testid="empanelment-hero-description" className="mb-5 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Join our network of trusted healthcare providers. Register your
              hospital in just a few simple steps and start connecting with
              patients.
            </p>
            <div className="flex flex-wrap gap-2">
              <span data-testid="empanelment-benefit-secure" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                Secure
              </span>
              <span data-testid="empanelment-benefit-verified" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                Verified
              </span>
              <span data-testid="empanelment-benefit-support" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <section className="flex min-h-0 flex-1 flex-col py-7">
          <div className="mb-5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">Built for better care</p>
            <h2 data-testid="empanelment-benefits-title" className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Why Empanel With Us?</h2>
            {/* <div className="mt-1 h-0.5 w-12 rounded-full bg-blue-600" /> */}
            <p className="mt-2 text-xs text-gray-600">
              Experience the benefits of being part of our healthcare network.
            </p>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div data-testid="empanelment-benefit-card-network" className="group flex min-h-[132px] gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
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
            <div data-testid="empanelment-benefit-card-reach" className="group flex min-h-[132px] gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
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
            <div data-testid="empanelment-benefit-card-onboarding" className="group flex min-h-[132px] gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
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
            <div data-testid="empanelment-benefit-card-quality" className="group flex min-h-[132px] gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
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
        <div data-testid="empanelment-cta" className="shrink-0 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 data-testid="empanelment-cta-title" className="text-lg font-bold tracking-tight text-gray-900">Ready to Get Started?</h2>
              <p className="mt-0.5 text-sm text-gray-600">
                Join thousands of hospitals already empanelled with us. The
                registration process takes less than 5 minutes.
              </p>
            </div>
            <button
              data-testid="empanelment-register-button"
              aria-label="Start hospital registration"
              onClick={handleRegister}
              type="button"
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
