import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Page, PageContent } from "../../shared/providerShell";
import FormLayout from "@/components/shared/form/FormLayout";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  hospitalRegistrationSchema,
  type HospitalRegistrationFormValues,
} from "./schema";
import { HospitalDetailsStep } from "./HospitalDetailsStep";
import { RohiniStep } from "./RohiniStep";
import { ContactStep } from "./ContactStep";
import { SuccessStep } from "./SuccessStep";
import { ChevronLeftIcon, ChevronRightIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";

const defaultValues: HospitalRegistrationFormValues = {
  hospitalName: "",
  address: {
    address: "",
    city: "",
    stateName: "",
    postalCode: "",
  },
  rohini: {
    rohiniCode: "",
    registrationValidTill: "",
    rohiniCertificate: "",
  },
  contact: {
    contactPerson: "",
    email: "",
    contactNumber: "",
  },
};

const emptyProvider = (): HospitalRegistrationFormValues => ({
  ...defaultValues,
  address: { ...defaultValues.address },
  rohini: defaultValues.rohini ? { ...defaultValues.rohini } : undefined,
  contact: { ...defaultValues.contact },
});

export default function RegistrationForm() {
  const navigate = useNavigate();
  useBreadcrumb([{ title: "Create" }]);

  type AddMode = "individual" | "group";
  const [addMode, setAddMode] = useState<AddMode>("individual");
  const [groupCount, setGroupCount] = useState<number>(1);
  const [groupName, setGroupName] = useState<string>("");
  const [groupNameError, setGroupNameError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [providersData, setProvidersData] = useState<HospitalRegistrationFormValues[]>([]);
  const [submittedCount, setSubmittedCount] = useState(0);

  const methods = useForm<HospitalRegistrationFormValues>({
    resolver: yupResolver(hospitalRegistrationSchema) as Resolver<HospitalRegistrationFormValues>,
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const isGroup = addMode === "group" && groupCount > 1;
  const totalSteps = addMode === "individual" ? 1 : groupCount;
  const canPrev = isGroup && currentStep > 0;
  const canNext = isGroup && currentStep < totalSteps - 1;
  const isLastStep = currentStep === totalSteps - 1;

  // When switching to group or group count changes, initialize providersData
  useEffect(() => {
    if (addMode === "group" && groupCount > 1) {
      setProvidersData(Array.from({ length: groupCount }, () => emptyProvider()));
      setCurrentStep(0);
    }
  }, [addMode, groupCount]);

  // Sync form with current step data when in group mode
  useEffect(() => {
    if (!isGroup || providersData.length === 0) return;
    const data = providersData[currentStep];
    if (data) methods.reset(data);
  }, [isGroup, currentStep, providersData, methods]);

  const saveCurrentToStep = () => {
    if (!isGroup || currentStep >= providersData.length) return;
    const values = methods.getValues();
    setProvidersData((prev) => {
      const next = [...prev];
      next[currentStep] = values;
      return next;
    });
  };

  const goPrev = () => {
    if (!canPrev) return;
    saveCurrentToStep();
    setCurrentStep((s) => s - 1);
  };

  const goNext = async () => {
    if (!canNext) return;
    if (isGroup && !groupName.trim()) {
      setGroupNameError("Group name is required.");
      return;
    }
    const valid = await methods.trigger();
    if (!valid) return;
    saveCurrentToStep();
    setCurrentStep((s) => s + 1);
  };

  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = (data: HospitalRegistrationFormValues) => {
    if (isGroup && !groupName.trim()) {
      setGroupNameError("Group name is required.");
      return;
    }

    if (isGroup && totalSteps > 0) {
      const final = [...providersData];
      final[currentStep] = data;
      setProvidersData(final);
      setSubmittedCount(final.length);
    } else {
      setSubmittedCount(1);
    }
    setIsSubmitted(true);
  };

  const onCancel = () => {
    navigate("/provider-masters/empanel");
  };

  if (isSubmitted) {
    return (
      <Page title="Create - Hospital Management">
        <PageContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FormProvider {...methods}>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6">
              <div className="w-full max-w-lg shrink-0">
                <SuccessStep submittedCount={submittedCount} />
              </div>
            </div>
          </FormProvider>
        </PageContent>
      </Page>
    );
  }

  return (
    <Page title="Create - Hospital Management">
      <PageContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0">
        <FormProvider {...methods}>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
            <div className="create-form-fixed-bar sticky top-0 z-10 border-b border-gray-200 bg-gray-50 shadow-sm">
              <div className="mx-auto flex max-w-full flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex gap-1 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode("individual");
                      setGroupCount(1);
                    }}
                    className={`flex items-center gap-1 rounded-t border border-b-0 border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors ${
                      addMode === "individual"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserIcon className="h-4 w-4" /> Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode("group");
                      if (groupCount < 2) setGroupCount(2);
                    }}
                    className={`flex items-center gap-1 rounded-t border border-b-0 border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors ${
                      addMode === "group"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserGroupIcon className="h-4 w-4" /> Group
                  </button>
                </div>
                {addMode === "group" && (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="input-label text-xs text-gray-700">No. of providers</span>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={groupCount}
                          onChange={(e) =>
                            setGroupCount(Math.max(2, Math.min(50, Number(e.target.value) || 2)))
                          }
                          className="h-7 w-14 rounded border border-gray-200 bg-white px-2 text-center text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="input-label text-xs text-gray-700">Group name</span>
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => {
                            setGroupName(e.target.value);
                            setGroupNameError(null);
                          }}
                          placeholder="Enter group name"
                          className={`h-7 w-48 rounded border px-2 text-xs ${
                            groupNameError ? "border-error" : "border-gray-200"
                          }`}
                        />
                        {groupNameError && (
                          <span className="input-text-error text-[10px] text-error">
                            {groupNameError}
                          </span>
                        )}
                      </div>
                    </div>
                    {totalSteps > 1 && (
                      <p className="px-2 text-xs text-gray-600">
                        Filling form for provider {currentStep + 1} of {totalSteps}.
                      </p>
                    )}
                  </>
                )}
              </div>
              {totalSteps > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={!canPrev}
                    onClick={goPrev}
                    className="gap-1 px-2.5 py-1 text-xs"
                  >
                    <ChevronLeftIcon className="h-4 w-4" /> Previous
                  </Button>
                  <span className="input-label min-w-[6.5rem] text-center text-xs font-medium text-gray-700">
                    Provider {currentStep + 1} of {totalSteps}
                  </span>
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={!canNext}
                    onClick={goNext}
                    className="gap-1 px-2.5 py-1 text-xs"
                  >
                    Next <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <FormLayout
            onSubmit={methods.handleSubmit(onSubmit)}
            FormClassName="transition-content w-full px-6 pt-3 pb-4"
          >
            <div className="min-w-0 space-y-1">
              <div className="bg-card border-border rounded-xl border p-4 shadow-sm">
                <h3 className="sub_section_title font-semibold text-gray-700">
                  Providers Details
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Enter your hospital&apos;s basic information
                </p>
                <div className="mt-2">
                  <HospitalDetailsStep showSectionHeader={false} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
                <div className="bg-card border-border flex min-w-0 flex-col rounded-xl border p-4 shadow-sm lg:min-h-[280px]">
                  <h3 className="sub_section_title font-semibold text-gray-700">
                    ROHINI Registration
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Provide your ROHINI registration details
                  </p>
                  <div className="mt-3 flex-1">
                    <RohiniStep showSectionHeader={false} compact />
                  </div>
                </div>
                <div className="bg-card border-border flex min-w-0 flex-col rounded-xl border p-4 shadow-sm lg:min-h-[280px]">
                  <h3 className="sub_section_title font-semibold text-gray-700">
                    Contact Details
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Provide contact person and communication details
                  </p>
                  <div className="mt-3 flex-1">
                    <ContactStep showSectionHeader={false} compact />
                  </div>
                </div>
              </div>

              <div className="mb-2 flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2">
                {isGroup && totalSteps > 1 && (
                  <span className="mr-auto text-xs text-gray-500">
                    {currentStep + 1} of {totalSteps}
                  </span>
                )}
                <Button type="button" className="w-24" onClick={onCancel}>
                  Cancel
                </Button>
                {!isLastStep && isGroup && totalSteps > 1 ? (
                  <Button type="button" color="primary" className="w-34" onClick={goNext}>
                    Next provider
                  </Button>
                ) : (
                  <Button type="submit" className="w-24" color="primary">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </FormLayout>
          </div>
        </FormProvider>
      </PageContent>
    </Page>
  );
}
