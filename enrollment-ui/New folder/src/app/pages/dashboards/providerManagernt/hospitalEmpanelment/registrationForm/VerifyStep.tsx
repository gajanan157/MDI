import { EnvelopeIcon } from "@heroicons/react/24/outline";

export interface VerifyStepProps {
  /** Email address the verification link was sent to. Shown as "your registered email" when not provided. */
  email?: string;
}

export function VerifyStep({ email }: Readonly<VerifyStepProps>) {
  const displayEmail = email?.trim() || "your registered email";

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white">
          <EnvelopeIcon className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-sm text-gray-600">
          Verification link sent to {displayEmail}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Check your inbox and click the verification link. For demo
        </p>
      </div>
    </div>
  );
}
