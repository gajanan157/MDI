import DropdownSelect from "@/components/shared/form/DropdownSelect"
import { Page } from "@/components/shared/Page"
import { PageContent } from "@/components/shared/PageContent"
import { Input } from "@/components/ui"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { policySchema } from "./policySchema"
import { useBreadcrumb } from "@/hooks/useBreadcrumbs"
import { useParams } from "react-router"


const defaultValues = {
    insurerName: "Star Health",
    productName: "Family Optima",
    uinNumber: "UIN123456",
    uoCode: "UO001",
    underwritingBranch: "Bangalore",
    servicingBranch: "Bangalore",

    corporate: {
        groupName: "ABC Group",
        corporateName: "ABC Pvt Ltd",
        address: "Bangalore",
        pinCode: "560001",
        city: "Bangalore",
        state: "Karnataka",
        corporateId: "CORP001",
    },

    broker: {
        brokerName: "Marsh",
        brokerCode: "BR001",
        brokerEmail: "broker@mail.com",
        brokerMobile: "9876543210",
    },

    spoc: {
        spocName: "Rahul",
        spocEmail: "spoc@mail.com",
        spocContact: "9876543210",
    },

    hr: {
        hrName: "HR Manager",
        hrEmail: "hr@mail.com",
        hrContact: "9876543210",
        physicalCard: "Yes",
        welcomeMail: "Yes",
    },

    policy: {
        policyType: "Fresh",
        policyNumber: "POL123",
        riskStartDate: "2026-01-01",
        riskEndDate: "2027-01-01",
        netPremium: 1000,
        gst: 180,
        totalPremium: 1180,
    },
}

export default function PolicyAllDetails() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        reset
    } = useForm({
        resolver: yupResolver(policySchema as any),
        defaultValues,
    })
    const [isEditMode, setIsEditMode] = useState(false)
    const param = useParams()
    useBreadcrumb([
        { title: "Inward", path: "/enrolment-system/inward" },
        { title: param?.id ? `${param?.id} Inward Update` : "" },
    ]);

    const netPremium = watch("policy.netPremium")
    const gst = watch("policy.gst")

    // ✅ Auto Calculate Total Premium
    useEffect(() => {
        if (netPremium && gst) {
            setValue(
                "policy.totalPremium",
                Number(netPremium) + Number(gst)
            )
        }
    }, [netPremium, gst, setValue])

    const onSubmit = () => {
    }

    return (
        <Page title="All Policy Details">
            <PageContent className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                    {/* 1️⃣ INSURER DETAILS */}
                    <Section title="1. Insurer Details">
                        <DropdownSelect
                            label="Insurer Name"
                            name="insurerName"
                            control={control}
                            options={[{ value: "Star Health", label: "Star Health" }]}
                            errors={errors.insurerName}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <DropdownSelect
                            label="Product Name"
                            name="productName"
                            control={control}
                            options={[{ value: "Family Optima", label: "Family Optima" }]}
                            errors={errors.productName}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="UIN Number"
                            {...register("uinNumber")}
                            error={errors?.uinNumber?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="UO Code"
                            {...register("uoCode")}
                            error={errors?.uoCode?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <DropdownSelect
                            label="Underwriting Branch"
                            name="underwritingBranch"
                            control={control}
                            options={[{ value: "Bangalore", label: "Bangalore" }]}
                            errors={errors.underwritingBranch}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <DropdownSelect
                            label="Servicing Branch"
                            name="servicingBranch"
                            control={control}
                            options={[{ value: "Bangalore", label: "Bangalore" }]}
                            errors={errors.servicingBranch}
                            isRequired
                            disabled={!isEditMode}

                        />
                    </Section>

                    {/* 2️⃣ CORPORATE DETAILS */}
                    <Section title="2. Corporate Details">
                        <Input
                            label="Group Name"
                            {...register("corporate.groupName")}
                            error={errors?.corporate?.groupName?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Corporate Name"
                            {...register("corporate.corporateName")}
                            error={errors?.corporate?.corporateName?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Address"
                            {...register("corporate.address")}
                            error={errors?.corporate?.address?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Pin Code"
                            {...register("corporate.pinCode")}
                            error={errors?.corporate?.pinCode?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="City"
                            {...register("corporate.city")}
                            error={errors?.corporate?.city?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="State"
                            {...register("corporate.state")}
                            error={errors?.corporate?.state?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Corporate ID"
                            {...register("corporate.corporateId")}
                            error={errors?.corporate?.corporateId?.message}
                            isRequired
                            disabled={!isEditMode}

                        />
                    </Section>
                    {/* 3️⃣ BROKER DETAILS */}
                    <Section title="3. Broker Details">
                        <DropdownSelect
                            label="Broker Name"
                            name="broker.brokerName"
                            control={control}
                            options={[
                                { value: "Marsh", label: "Marsh" },
                                { value: "Aon", label: "Aon" },
                            ]}
                            errors={errors?.broker?.brokerName}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Broker Code"
                            {...register("broker.brokerCode")}
                            error={errors?.broker?.brokerCode?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Broker Email"
                            {...register("broker.brokerEmail")}
                            error={errors?.broker?.brokerEmail?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Broker Mobile"
                            {...register("broker.brokerMobile")}
                            error={errors?.broker?.brokerMobile?.message}
                            isRequired
                            disabled={!isEditMode}

                        />
                    </Section>
                    {/* 4️⃣ SPOC DETAILS */}
                    <Section title="4. SPOC Details">
                        <Input
                            label="Spoc Name"
                            {...register("spoc.spocName")}
                            error={errors?.spoc?.spocName?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Spoc Email"
                            {...register("spoc.spocEmail")}
                            error={errors?.spoc?.spocEmail?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Spoc Contact Number"
                            {...register("spoc.spocContact")}
                            error={errors?.spoc?.spocContact?.message}
                            isRequired
                            disabled={!isEditMode}

                        />
                    </Section>
                    {/* 5️⃣ CORPORATE HR DETAILS */}
                    <Section title="5. Corporate HR Details">
                        <Input
                            label="HR Name"
                            {...register("hr.hrName")}
                            error={errors?.hr?.hrName?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="HR Email"
                            {...register("hr.hrEmail")}
                            error={errors?.hr?.hrEmail?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            label="HR Contact"
                            {...register("hr.hrContact")}
                            error={errors?.hr?.hrContact?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <DropdownSelect
                            label="Physical Card Required"
                            name="hr.physicalCard"
                            control={control}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            errors={errors?.hr?.physicalCard}
                            disabled={!isEditMode}

                        />

                        <DropdownSelect
                            label="Welcome Mail Required"
                            name="hr.welcomeMail"
                            control={control}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            errors={errors?.hr?.welcomeMail}
                            disabled={!isEditMode}

                        />
                    </Section>


                    {/* 6️⃣ POLICY DETAILS */}
                    <Section title="6. Policy Details">
                        <DropdownSelect
                            label="Policy Type"
                            name="policy.policyType"
                            control={control}
                            options={[
                                { value: "Fresh", label: "Fresh" },
                                { value: "Renewal", label: "Renewal" },
                            ]}
                            errors={errors?.policy?.policyType}
                            disabled={!isEditMode}

                        />

                        <Input
                            label="Policy Number"
                            {...register("policy.policyNumber")}
                            error={errors?.policy?.policyNumber?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            type="date"
                            label="Risk Start Date"
                            {...register("policy.riskStartDate")}
                            error={errors?.policy?.riskStartDate?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            type="date"
                            label="Risk End Date"
                            {...register("policy.riskEndDate")}
                            error={errors?.policy?.riskEndDate?.message}
                            isRequired
                            disabled={!isEditMode}

                        />

                        <Input
                            type="number"
                            label="Net Premium"
                            {...register("policy.netPremium")}
                            isRequired
                            disabled={!isEditMode}
                        />

                        <Input
                            type="number"
                            label="GST"
                            {...register("policy.gst")}
                            isRequired
                            disabled={!isEditMode}
                        />

                        <Input
                            type="number"
                            label="Total Premium"
                            {...register("policy.totalPremium")}
                            isRequired
                            disabled={!isEditMode}
                        />
                    </Section>

                    {/* 9️⃣ Save / Cancel */}
                    <div className="flex gap-4 justify-end">
                        {!isEditMode ? (
                            <button
                                type="button"
                                onClick={() => setIsEditMode(true)}
                                className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset(defaultValues)
                                        setIsEditMode(false)
                                    }}
                                    className="cursor-pointer bg-gray-400 text-white px-6 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Update
                                </button>
                            </>
                        )}
                    </div>

                </form>
            </PageContent>
        </Page>
    )
}

const Section = ({ title, children }: any) => (
    <div className="border rounded-lg bg-white">
        <div className="bg-blue-700 text-white px-4 py-2 font-semibold text-sm rounded-t-lg">
            {title}
        </div>
        <div className="p-4 grid grid-cols-3 gap-2">
            {children}
        </div>
    </div>
)