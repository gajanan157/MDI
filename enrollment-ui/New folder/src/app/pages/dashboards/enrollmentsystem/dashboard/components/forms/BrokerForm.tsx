import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { InwardFormData } from "../types";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import {
  fetchAgentDatas,
  fetchBrokerDatas,
} from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useRole } from "@/app/auth/usePermission";
import { useTranslation } from "react-i18next";

type FieldKey = keyof InwardFormData;

interface FieldConfig {
  dropdown: {
    name: FieldKey;
    label: string;
    placeholder: string;
  };
  fields: {
    name: FieldKey;
    label: string;
  }[];
}

interface Props {
  policyData: any;
}

const BrokerForm: React.FC<Props> = ({ policyData }) => {
  const {
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useFormContext<InwardFormData>();

  const { isProcessor } = useRole();
  const dispatch = useAppDispatch();

  const channelType = watch("channelType");

  const intermediary_details = policyData?.policyScheduleJsonb?.intermediary_details;

  const brokerAgentObject = policyData?.policyScheduleJsonb?.brokerAgentObject;

  const { t } = useTranslation();

  const fieldConfig: Record<string, FieldConfig> = {
    BROKER: {
      dropdown: {
        name: "broker_id",
        label: t("brokerForm.broker.dropdown.label"),
        placeholder: t("brokerForm.broker.dropdown.placeholder"),
      },
      fields: [
        { name: "policy_broker_code", label: t("brokerForm.broker.fields.code") },
        { name: "policy_broker_contact_email_id", label: t("brokerForm.broker.fields.email") },
        { name: "policy_broker_contact_mobile_no", label: t("brokerForm.broker.fields.mobile") },
        { name: "policy_broker_contact_telephone_no", label: t("brokerForm.broker.fields.telephone") },
      ],
    },

    AGENT: {
      dropdown: {
        name: "agent_id",
        label: t("brokerForm.agent.dropdown.label"),
        placeholder: t("brokerForm.agent.dropdown.placeholder"),
      },
      fields: [
        { name: "policy_agent_code", label: t("brokerForm.agent.fields.code") },
        { name: "policy_agent_contact_email_id", label: t("brokerForm.agent.fields.email") },
        { name: "policy_agent_contact_mobile_no", label: t("brokerForm.agent.fields.mobile") },
        { name: "policy_agent_contact_telephone_no", label: t("brokerForm.agent.fields.telephone") },
      ],
    },
  };

  const config = fieldConfig[channelType as keyof typeof fieldConfig];

  // Fetch dropdown data
  useEffect(() => {
    if (channelType === "AGENT") {
      dispatch(fetchAgentDatas({ onlyName: true }));
    } else if (channelType === "BROKER") {
      dispatch(fetchBrokerDatas({ onlyName: true }));
    }
  }, [channelType]);

  const { brokerData, agentData } = useAppSelector((state) => state?.broker);

  const brokerOptions = brokerData?.map((b: any) => ({
    label: b?.brokerName,
    value: b?.brokerId,
  }));

  const agentOptions = agentData?.map((a: any) => ({
    label: a?.agentName,
    value: a?.agentId,
  }));

  const getChannelType = (data: any) => {
    if (data?.broker_id) return "BROKER";
    if (data?.agent_id) return "AGENT";
    return "DIRECT";
  };

  const resetBrokerAgent = (data: any) => {
    reset({
      ...data,
      channelType: getChannelType(data),
    });
  };
  const getIntermediaryType = (intermediary_details: any) => {
    if (Object.values(intermediary_details?.broker || {})?.some(Boolean)) {
      return "BROKER";
    }
    if (Object.values(intermediary_details?.agent || {}).some(Boolean)) {
      return "AGENT";
    }
    return null;
  };

  const setIntermediaryDetails = () => {
    if (!intermediary_details) return;

    // const type = intermediary_details.intermediary_type;
    const type = getIntermediaryType(intermediary_details);

    setValue("channelType", type as any);

    if (type === "BROKER") {
      setValue("broker_id", policyData?.broker?.brokerId);
      
      setValue("policy_broker_code", intermediary_details.broker?.broker_code);
      setValue("policy_broker_contact_email_id", intermediary_details.broker?.broker_contact_email_id);
      setValue("policy_broker_contact_mobile_no", intermediary_details.broker?.broker_contact_mobile_number);
      setValue("policy_broker_contact_telephone_no", intermediary_details.broker?.broker_contact_telephone_number);
      return;
    }
    if (type === "AGENT") {
      setValue("agent_id", policyData?.agent?.agentId);

      setValue("policy_agent_code", intermediary_details?.agent?.agent_code);
      setValue("policy_agent_contact_email_id", intermediary_details.agent?.agent_contact_email_id);
      setValue("policy_agent_contact_telephone_no", intermediary_details.agent?.agent_contact_telephone_number);
      setValue("policy_agent_contact_mobile_no", intermediary_details.agent?.agent_contact_mobile_number);
    }
  };
  useEffect(() => {
    if (!policyData) return;

    if (brokerAgentObject) {
      resetBrokerAgent(brokerAgentObject);
      return;
    }

    setIntermediaryDetails();
  }, [policyData, isProcessor]);



  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
      <DropdownSelect
        label={t("brokerForm.channelType.label")}
        defaultValue={t("brokerForm.channelType.placeholder")}
        name_key="channelType"
        options={[
          { label: "Broker", value: "BROKER" },
          { label: "Agent", value: "AGENT" },
          { label: "Direct", value: "DIRECT" },
        ]}
        control={control}
        name="channelType"
        errors={errors.channelType}
        isRequired
      />
      {config && (
        <>
          <DropdownSelect
            label={config.dropdown.label}
            name={config.dropdown.name}
            name_key={config.dropdown.name}
            options={
              channelType === "AGENT" ? agentOptions : brokerOptions
            }
            // defaultValue="Select"
            defaultValue={`${config.dropdown.label}`}
            control={control}
            errors={errors[config.dropdown.name]}
            isRequired
          />
          {config?.fields?.map((field) => {
            const isOptionalField =
              field.name === "policy_broker_contact_mobile_no" ||
              field.name === "policy_broker_contact_telephone_no" ||
              field.name === "policy_agent_contact_mobile_no" ||
              field.name === "policy_agent_contact_telephone_no" ||
              field.name === "policy_agent_contact_email_id" ||
              field.name === "policy_broker_contact_email_id"
            return (
              <Input
                key={field.name}
                label={`${field.label}`}
                placeholder={field.label}
                {...register(field.name)}
                error={errors[field.name]?.message as string}
                isRequired={!isOptionalField}
                className="bg-white"
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default BrokerForm;