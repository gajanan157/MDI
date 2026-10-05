export const policyFamilyDefinitionRules = [
  {
    "ruleCode": "PRIMARY_MEMBER",
    "isMandatory": true,
    "allowedRelationships": [
      "SELF",
      "EMPLOYEE"
    ],
    "relationshipCategory": "SELF",
    "count": {
      "min": 1,
      "max": 1
    },
    "age": {
      "min": 18,
      "max": 70
    }
  },
  {
    "ruleCode": "SPOUSE",
    "isMandatory": false,
    "allowedRelationships": [
      "SPOUSE",
      "PARTNER",
      "HUSBAND",
      "WIFE",
      "SPOUSE EMPLOYED",
      "SPOUSE UNEMPLOYED"
    ],
    "relationshipCategory": "SPOUSE",
    "count": {
      "min": 0,
      "max": 1
    },
    "age": {
      "min": 18,
      "max": 70
    }
  },
  {
    "ruleCode": "CHILD",
    "isMandatory": false,
    "allowedRelationships": [
      "SON",
      "DAUGHTER",
      "CHILD",
      "DEPENDANT CHILD",
      "UNMARRIED OR DIVORCED OR WIDOWED DAUGHTERS",
      "UNMARRIED DAUGHTERS",
      "DIVORCED DAUGHTERS",
      "WIDOWED DAUGHTERS",
      "DEPENDENT CHILD (PHYSICALLY/MENTALLY CHALLENGED)"
    ],
    "relationshipCategory": "CHILD",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 0,
      "max": 25
    }
  },
  {
    "ruleCode": "PARENT",
    "isMandatory": false,
    "allowedRelationships": [
      "MOTHER",
      "FATHER"
    ],
    "relationshipCategory": "PARENT",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 45,
      "max": 80
    }
  },
  {
    "ruleCode": "PARENT_CROSS_COMBO_ALLOWED",
    "isMandatory": false,
    "allowedRelationships": [
      "MOTHER",
      "FATHER",
      "MOTHER IN LAW",
      "FATHER IN LAW",
      "MOTHER_IN_LAW",
      "FATHER_IN_LAW",
      "MOTHER-IN-LAW",
      "FATHER-IN-LAW"
    ],
    "relationshipCategory": "PARENT",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 45,
      "max": 90
    }
  },
  {
    "ruleCode": "IN_LAW",
    "isMandatory": false,
    "allowedRelationships": [
      "MOTHER IN LAW",
      "FATHER IN LAW",
      "MOTHER_IN_LAW",
      "FATHER_IN_LAW",
      "MOTHER-IN-LAW",
      "FATHER-IN-LAW"
    ],
    "relationshipCategory": "IN_LAW",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 0,
      "max": 2
    }
  },
  {
    "ruleCode": "PARENT_CROSS_COMBO_NOT_ALLOWED",
    "isMandatory": false,
    "allowedRelationships": [
      "MOTHER",
      "FATHER",
      "MOTHER IN LAW",
      "FATHER IN LAW",
      "MOTHER-IN-LAW",
      "FATHER-IN-LAW"
    ],
    "relationshipCategory": "PARENT",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 45,
      "max": 80
    }
  },
  {
    "ruleCode": "SIBLING",
    "isMandatory": false,
    "allowedRelationships": [
      "BROTHER",
      "SISTER"
    ],
    "relationshipCategory": "SIBLING",
    "count": {
      "min": 0,
      "max": 2
    },
    "age": {
      "min": 18,
      "max": 65
    }
  }
]
type Rule = {
  ruleCode: string;
  count: { min: number; max: number };
  age: { min: number; max: number };
};
type PolicyData = Record<string, any>;
const hasValidRange = (obj?: { from?: any; to?: any }) =>
  obj?.from !== "" &&
  obj?.to !== "" &&
  obj?.from !== undefined &&
  obj?.to !== undefined;

export function mapPolicyFamilyRules(
  rules: Rule[],
  basePolicyData: PolicyData
): Rule[] {
  let updatedRules: Rule[] = [];

  rules?.forEach((rule) => {
    let updatedRule = { ...rule };

    switch (rule.ruleCode) {
      case "PRIMARY_MEMBER":
        if (hasValidRange(basePolicyData.selfAge)) {
          updatedRule.age = {
            min: Number(basePolicyData.selfAge.from),
            max: Number(basePolicyData.selfAge.to),
          };
          updatedRules.push(updatedRule);
        }
        break;

      case "SPOUSE":
        if (hasValidRange(basePolicyData.spouseAge)) {
          updatedRule.age = {
            min: Number(basePolicyData.spouseAge.from),
            max: Number(basePolicyData.spouseAge.to),
          };
          updatedRules.push(updatedRule);
        }
        break;

      case "CHILD":
        if (hasValidRange(basePolicyData.childAge)) {
          updatedRule.age = {
            min: Number(basePolicyData.childAge.from),
            max: Number(basePolicyData.childAge.to),
          };
          updatedRule.count = {
            ...rule.count,
            max: Number(basePolicyData.childCount ?? 1),
          };
          updatedRules.push(updatedRule);
        }
        break;

      case "SIBLING":
        if (
          basePolicyData.showSibling &&
          hasValidRange(basePolicyData.siblingAge)
        ) {
          updatedRule.age = {
            min: Number(basePolicyData.siblingAge.from),
            max: Number(basePolicyData.siblingAge.to),
          };
          updatedRule.count = {
            ...rule.count,
            max: Number(basePolicyData.siblingCount ?? 1),
          };
          updatedRules.push(updatedRule);
        }
        break;

      default:
        break;
    }
  });

  // ✅ Parent handling (same as before but conditional)
  const parentType = basePolicyData.parentType;
  let parentRule: Rule | null = null;

  if (hasValidRange(basePolicyData.parentAge)) {
    if (parentType === "FATHER_MOTHER") {
      parentRule = rules.find((r) => r.ruleCode === "PARENT") || null;
    }

    if (parentType?.startsWith("ANY_")) {
      const count = Number(parentType.split("_")[1]) || 2;

      parentRule =
        rules.find((r) => r.ruleCode === "PARENT_CROSS_COMBO_ALLOWED") || null;

      if (parentRule) {
        parentRule = {
          ...parentRule,
          count: {
            ...parentRule.count,
            max: count,
          },
        };
      }
    }

    if (parentType === "ONE_SET") {
      parentRule =
        rules.find(
          (r) => r.ruleCode === "PARENT_CROSS_COMBO_NOT_ALLOWED"
        ) || null;
    }
    if (parentType === "IN_LAW") {
      parentRule =
        rules.find(
          (r) => r.ruleCode === "IN_LAW"
        ) || null;
    }

    if (parentRule) {
      parentRule = {
        ...parentRule,
        age: {
          min: Number(basePolicyData.parentAge.from),
          max: Number(basePolicyData.parentAge.to),
        },
      };

      updatedRules.push(parentRule);
    }
  }

  return updatedRules;
}
export const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "string") {
    value = value.replace(/,/g, "");
  }

  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};
export function transformToUpdateJson(data: any) {
  const corporateFieldsRaw = {
    address: data?.address || "",
    postalCode: data?.postalCode || "",
    corporateId: data?.corporateId || "",
    corporateIndustrySectorId:
      data?.corporateIndustrySectorId || "",
    city: data?.city || "",
    stateName: data?.stateName || "",
    groupName: data?.groupName || "",
  };

  const hasCorporateData = Object.values(corporateFieldsRaw).some((val) => val !== "" && val !== null && val !== undefined);
  return {
    icObject: {
      insurer_id: data?.insurer_id || "",
      insurerType: data?.insurerType || "",
      master_product_id: data?.master_product_id || "",
      insurer_issuing_office_id: data?.insurer_issuing_office_id || "",
      insurer_regional_office_id: data?.insurer_regional_office_id || "",
      insurer_divisional_office_id: data?.insurer_divisional_office_id || "",
    },

    ...(hasCorporateData && {
      corporateObject: {
        ...corporateFieldsRaw,
        corpEmail: data?.corpEmail || "",
        corpMobile: data?.corpMobile || "",

        policy_proposer_gst_number: data?.policy_proposer_gst_number || "",
        policy_proposer_pan_number: data?.policy_proposer_pan_number || "",
        policy_proposer_contact_telephone_no: data?.policy_proposer_contact_telephone_no || "",
      },
    }),
    policyObject: {
      policyNumber: data?.policyNumber || "",
      dummyPolicyNumber: data?.dummyPolicyNumber || "",
      policyStartDate: data?.policyStartDate || "",
      policyEndDate: data?.policyEndDate || "",

      sumInsured: toNumber(data?.sumInsured),
      netPremium: toNumber(data?.netPremium),
      grossPremium: toNumber(data?.grossPremium),


      policyRecordType: data?.policyRecordType || "",
      totalLivesInsured: data?.totalLivesInsured || "",

      totalEmployee: data?.totalEmployee || "",
      totalDependent: data?.totalDependent || "",
      policySubType: data?.policySubType || "",
      policyPlan: data?.policyPlan || "",
      policyRenewalType: data?.policyRenewalType || "",

      policyCorporateBufferFlag:
        data?.policyCorporateBufferFlag || "",

      policyCopaymentFlag:
        data?.policyCopaymentFlag || "",

      policySubTypePolicyNumber:
        data?.policySubTypePolicyNumber || "",

      previousPolicyNumber:
        data?.previousPolicyNumber || "",

      policyCorporateBufferAmount:
        data?.policyCorporateBufferAmount || "",

      policyCopaymentPercentage:
        data?.policyCopaymentPercentage || "",
      policyCopaymentAmount:
        data?.policyCopaymentAmount || "",

      parentType: data?.parentType || "",
      showSibling: data?.showSibling || "",
      showSelf: data?.showSelf || "",
      noLimit: data?.noLimit || false,
      childCount: data?.childCount || "",
      
      linkDummyNumber: data?.linkDummyNumber || false,
      
      selfAge: data?.selfAge || "",
      spouseAge: data?.spouseAge || "",
      childAge: data?.childAge || "",
      parentAge: data?.parentAge || "",
      siblingAge: data?.siblingAge || "",

      policy_divisional_officer_code: data?.policy_divisional_officer_code || "",
      policy_divisional_officer_contact_email_id: data?.policy_divisional_officer_contact_email_id || "",
      policy_divisional_officer_contact_mobile_no: data?.policy_divisional_officer_contact_mobile_no || "",
      policy_divisional_officer_contact_telephone_no: data?.policy_divisional_officer_contact_telephone_no || "",
      policy_divisional_officer_name: data?.policy_divisional_officer_name || "",
      // policy_proposal_date: data?.policy_proposal_date || "",
      policy_proposal_number: data?.policy_proposal_number || "",

      policy_co_insurer_Flag:
        data?.policy_co_insurer_Flag || "",

      co_insurers: data?.co_insurers || [],

      physical_cards_required:
        data?.physical_cards_required || "",

      vip_tagging: data?.vip_tagging || "",

      client_welcome_mailer:
        data?.client_welcome_mailer || "",

      // gradeEnabled: data?.gradeEnabled || false,
      // designationEnabled: data?.designationEnabled || false,

      corporate_payee: data?.corporate_payee || false,
      insured_payee: data?.insured_payee || false,
      e_card_type: data?.e_card_type || "",

      // grades: data?.gradeEnabled ? data?.grades || [] : [],
      // designations: data?.designationEnabled ? data?.designations || [] : [],
    },

    brokerAgentObject: {
      broker_id: data?.broker_id || "",
      channelType: data?.channelType || "",

      policy_broker_code:
        data?.policy_broker_code || "",

      policy_broker_contact_email_id:
        data?.policy_broker_contact_email_id || "",

      policy_broker_contact_mobile_no:
        data?.policy_broker_contact_mobile_no || "",

      policy_broker_contact_telephone_no:
        data?.policy_broker_contact_telephone_no || "",

      agent_id: data?.agent_id || "",

      policy_agent_code:
        data?.policy_agent_code || "",

      policy_agent_contact_email_id:
        data?.policy_agent_contact_email_id || "",

      policy_agent_contact_mobile_no:
        data?.policy_agent_contact_mobile_no || "",

      policy_agent_contact_telephone_no:
        data?.policy_agent_contact_telephone_no || "",
    },

    tpaSpocObject: {
      tpa_spoc_contact_email_id: data?.tpa_spoc_contact_email_id || "",
      tpa_spoc_contact_mobile_no: data?.tpa_spoc_contact_mobile_no || "",
      tpa_spoc_contact_telephone_no: data?.tpa_spoc_contact_telephone_no || "",

      tpa_fees: data?.tpa_fees || "",
      tpa_servicing_branch: data?.tpa_servicing_branch || "",
      tpa_spoc_id: data?.tpa_spoc_id || ""
    },
  };
}
export const buildPayloadByStep = (
  currentStep: string,
  previousJson: any,
  currentFormData: any,
  FamilyDefination: any
) => {

  const transformedData = transformToUpdateJson(currentFormData);

  const payload = {
    ...previousJson,

    policyFamilyDefinitionRules: FamilyDefination?.length === 0 ? previousJson?.policyFamilyDefinitionRules : FamilyDefination,
  };

  switch (currentStep) {

    case "insurer":
      payload.icObject = {
        ...previousJson?.icObject,
        ...transformedData?.icObject,
      };
      break;

    case "corporate":
      payload.corporateObject = {
        ...previousJson?.corporateObject,
        ...transformedData?.corporateObject,
      };
      break;

    case "policy":
      payload.policyObject = {
        ...previousJson?.policyObject,
        ...transformedData?.policyObject,
      };
      break;

    case "broker":
      payload.brokerAgentObject = {
        ...previousJson?.brokerAgentObject,
        ...transformedData?.brokerAgentObject,
      };
      break;

    case "spoc":
      payload.tpaSpocObject = {
        ...previousJson?.tpaSpocObject,
        ...transformedData?.tpaSpocObject,
      };
      break;

    default:
      break;
  }

  return payload;
};