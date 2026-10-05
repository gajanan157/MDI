import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ApiResponse, memberData, memberService, postApi } from "@/app/api/apiService";
import { Input } from "@/components/ui";

type Status = "verify" | "success" | "failed";

interface Props {
  open: boolean;
  isEndorsementMember?: boolean;
  insuredMemberId: string;
  onClose: () => void;
  setMemberData: Dispatch<SetStateAction<any>>;
  onVerified: () => void;

}

const verifyEmployeeCode = async <T extends object>(payload: T, insuredMemberId: string,): Promise<ApiResponse<any>> => {
  try {
    const endpoint = `v1/members/details/${insuredMemberId}/unmask`;
    return await postApi<any, T>(memberService, endpoint, payload);
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
};
const verifyEndorsementEmployeeCode = async <T extends object>(payload: T, insuredMemberId: string,): Promise<ApiResponse<any>> => {
  try {
    const endpoint = `v1/member/details/${insuredMemberId}/unmask`;
    return await postApi<any, T>(memberData, endpoint, payload);
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
};
export default function VerifyEmployeeModal({ isEndorsementMember, open, onClose, insuredMemberId, setMemberData, onVerified }: Readonly<Props>) {
  const [status, setStatus] = useState<Status>("verify");
  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeCodeError, setEmployeeCodeError] = useState("");


  useEffect(() => {
    if (open) {
      setStatus("verify");
    }
  }, [open]);

  const verifyEmployee = async () => {
    if (!employeeCode.trim()) {
      setEmployeeCodeError("Employee code is required");
      return;
    }
    try {
      setLoading(true);
      const finalPayload = {
        employeeCode,
        screenname: "Member_Details",
      }
      const finalPayload2 = {
        employeeCode,
        screenname: "Endorsement_Member_Details",
      }
      const response = isEndorsementMember ? await verifyEndorsementEmployeeCode(finalPayload2, insuredMemberId) : await verifyEmployeeCode(finalPayload, insuredMemberId); if (response.success) {
        setMemberData(response?.data?.data)
        setStatus("success");
        onVerified();

      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white shadow-xl">
              {status === "verify" && (
                <VerifyForm
                  employeeCode={employeeCode}
                  setEmployeeCode={setEmployeeCode}
                  loading={loading}
                  onVerify={verifyEmployee}
                  onClose={onClose}
                  employeeCodeError={employeeCodeError}
                  setEmployeeCodeError={setEmployeeCodeError}
                />
              )}

              {status === "success" && (
                <SuccessView
                  employeeCode={employeeCode}
                  onContinue={() => {
                    onClose();
                  }}
                />
              )}

              {status === "failed" && (
                <FailedView
                  employeeCode={employeeCode}
                  onRetry={() => setStatus("verify")}
                  onClose={onClose}
                />
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function VerifyForm({
  employeeCode,
  setEmployeeCode,
  onVerify,
  loading,
  onClose,
  employeeCodeError,
  setEmployeeCodeError,

}: any) {
  return (
    <>
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Verify Employee</h2>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-5">
            <ShieldCheckIcon className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <p className="text-center text-gray-600">
          This information is masked for security reasons.
          <br />
          Please enter your employee code.
        </p>
        <Input
          label="Employee Code"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Enter Employee Code"
          onChange={(e) => {
            setEmployeeCode(e.target.value);
            if (employeeCodeError) {
              setEmployeeCodeError("");
            }
          }}
          value={employeeCode}
          isRequired
          error={employeeCodeError}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border px-6 py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onVerify}
            className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </>
  );
}

function SuccessView({ employeeCode, onContinue }: any) {
  return (
    <div className="p-8">
      <div className="flex justify-center">
        <CheckCircleIcon className="h-20 w-20 text-green-500" />
      </div>

      <h2 className="mt-5 text-center text-2xl font-bold text-green-600">
        Verification Successful
      </h2>

      <p className="mt-2 text-center text-gray-500">
        You are authorized to view masked information.
      </p>

      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5">
        <Row label="Employee Code" value={employeeCode} />
        <Row
          label="Verification Status"
          value={<span className="font-semibold text-green-600">Verified</span>}
        />
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={onContinue}
          className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function FailedView({
  employeeCode,
  onRetry,
  onClose,
}: any) {
  return (
    <div className="p-8">
      <div className="flex justify-center">
        <XCircleIcon className="h-20 w-20 text-red-500" />
      </div>

      <h2 className="mt-5 text-center text-2xl font-bold text-red-600">
        Verification Failed
      </h2>

      <p className="mt-2 text-center text-gray-500">
        The employee code you entered is invalid.
      </p>

      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
        <Row label="Employee Code" value={employeeCode} />

        <Row
          label="Verification Status"
          value={<span className="font-semibold text-red-600">Not Verified</span>}
        />

        <Row
          label="Reason"
          value="Invalid Employee Code"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg border px-5 py-2"
        >
          Cancel
        </button>

        <button
          onClick={onRetry}
          className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: Readonly<{
  label: string;
  value: any;
}>) {
  return (
    <div className="mb-3 flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}