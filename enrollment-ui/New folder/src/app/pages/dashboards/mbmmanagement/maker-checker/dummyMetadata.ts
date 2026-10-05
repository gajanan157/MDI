import { CommentsMetadata } from "@/hooks/useComments";
import { StatusMetadata } from "@/hooks/useStatus";

export const dummyCommentsMetadata: CommentsMetadata = {
  "policy_metadata.insurance_company_name": [
    {
      id: "comment-1",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "Please verify the insurance company name is correct.",
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
      replies: [
        {
          id: "reply-1",
          userId: "checker-user",
          userRole: "checker",
          comment: "Verified. Company name is correct.",
          createdAt: "2024-01-15T11:00:00.000Z",
          updatedAt: "2024-01-15T11:00:00.000Z",
        },
      ],
    },
  ],
  "policy_metadata.product_name": [
    {
      id: "comment-2",
      userId: "maker2-user",
      userRole: "maker2",
      comment: "Product name needs to be updated to match the latest version.",
      createdAt: "2024-01-15T09:15:00.000Z",
      updatedAt: "2024-01-15T09:15:00.000Z",
    },
  ],
  "policy_metadata.product_type": [
    {
      id: "comment-3",
      userId: "checker-user",
      userRole: "checker",
      comment: "Product type classification looks good.",
      createdAt: "2024-01-15T14:20:00.000Z",
      updatedAt: "2024-01-15T14:20:00.000Z",
    },
  ],
  "policy_metadata.policy_category": [
    {
      id: "comment-4",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "Category is correct.",
      createdAt: "2024-01-15T08:45:00.000Z",
      updatedAt: "2024-01-15T08:45:00.000Z",
    },
    {
      id: "comment-5",
      userId: "checker-user",
      userRole: "checker",
      comment: "Agreed. No changes needed.",
      createdAt: "2024-01-15T15:30:00.000Z",
      updatedAt: "2024-01-15T15:30:00.000Z",
    },
  ],

  // Definitions table rows
  "definitions[0]": [
    {
      id: "comment-6",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "This definition needs clarification.",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
    },
  ],
  "definitions[1]": [
    {
      id: "comment-7",
      userId: "checker-user",
      userRole: "checker",
      comment: "Definition is clear and accurate.",
      createdAt: "2024-01-15T11:30:00.000Z",
      updatedAt: "2024-01-15T11:30:00.000Z",
    },
  ],

  // Other base covers table rows
  "other_base_covers[0]": [
    {
      id: "comment-8",
      userId: "maker2-user",
      userRole: "maker2",
      comment: "Cover limit seems too high. Please review.",
      createdAt: "2024-01-15T09:30:00.000Z",
      updatedAt: "2024-01-15T09:30:00.000Z",
      replies: [
        {
          id: "reply-2",
          userId: "checker-user",
          userRole: "checker",
          comment: "Limit is appropriate based on industry standards.",
          createdAt: "2024-01-15T12:00:00.000Z",
          updatedAt: "2024-01-15T12:00:00.000Z",
        },
      ],
    },
  ],
  "other_base_covers[1]": [
    {
      id: "comment-9",
      userId: "checker-user",
      userRole: "checker",
      comment: "This cover looks good.",
      createdAt: "2024-01-15T13:00:00.000Z",
      updatedAt: "2024-01-15T13:00:00.000Z",
    },
  ],

  // Additional and optional covers
  "additional_and_optional_covers[0]": [
    {
      id: "comment-10",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "Optional cover details need to be added.",
      createdAt: "2024-01-15T10:15:00.000Z",
      updatedAt: "2024-01-15T10:15:00.000Z",
    },
  ],

  // Modern and advanced treatments
  "modern_and_advanced_treatments[0]": [
    {
      id: "comment-11",
      userId: "checker-user",
      userRole: "checker",
      comment: "Treatment coverage is comprehensive.",
      createdAt: "2024-01-15T14:00:00.000Z",
      updatedAt: "2024-01-15T14:00:00.000Z",
    },
  ],
  "modern_and_advanced_treatments[1]": [
    {
      id: "comment-12",
      userId: "maker2-user",
      userRole: "maker2",
      comment: "Need to verify if this treatment is covered.",
      createdAt: "2024-01-15T09:45:00.000Z",
      updatedAt: "2024-01-15T09:45:00.000Z",
    },
  ],

  // Exclusions
  "exclusions.specific_disease_waiting_periods[0]": [
    {
      id: "comment-13",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "Waiting period seems reasonable.",
      createdAt: "2024-01-15T08:30:00.000Z",
      updatedAt: "2024-01-15T08:30:00.000Z",
    },
  ],
  "exclusions.permanent_exclusions[0]": [
    {
      id: "comment-14",
      userId: "checker-user",
      userRole: "checker",
      comment: "Permanent exclusions are clearly stated.",
      createdAt: "2024-01-15T15:00:00.000Z",
      updatedAt: "2024-01-15T15:00:00.000Z",
    },
  ],

  // Eligibility and entry conditions
  "eligibility_and_entry_conditions.dependent_definition": [
    {
      id: "comment-15",
      userId: "maker1-user",
      userRole: "maker1",
      comment: "Dependent definition is clear.",
      createdAt: "2024-01-15T07:00:00.000Z",
      updatedAt: "2024-01-15T07:00:00.000Z",
    },
  ],
  "eligibility_and_entry_conditions.family_definition": [
    {
      id: "comment-16",
      userId: "checker-user",
      userRole: "checker",
      comment: "Family definition needs to be more specific.",
      createdAt: "2024-01-15T16:00:00.000Z",
      updatedAt: "2024-01-15T16:00:00.000Z",
    },
  ],

  // Claims process
  "claims_process.documents_required[0]": [
    {
      id: "comment-17",
      userId: "maker2-user",
      userRole: "maker2",
      comment: "Document list is complete.",
      createdAt: "2024-01-15T09:00:00.000Z",
      updatedAt: "2024-01-15T09:00:00.000Z",
    },
  ],

  // Annexures
  "annexures_endorsements_and_schedules[0]": [
    {
      id: "comment-18",
      userId: "checker-user",
      userRole: "checker",
      comment: "Annexure details are accurate.",
      createdAt: "2024-01-15T17:00:00.000Z",
      updatedAt: "2024-01-15T17:00:00.000Z",
    },
  ],
};

/**
 * Dummy status metadata for testing
 * Structure: { [fieldPath: string]: StatusValue }
 */
export const dummyStatusMetadata: StatusMetadata = {
  // Policy metadata fields
  "policy_metadata.insurance_company_name": "approved",
  "policy_metadata.product_name": "approve_with_pendency",
  "policy_metadata.product_type": "approved",
  "policy_metadata.policy_category": "approved",
  "policy_metadata.uin": null, // No status set
  "policy_metadata.irda_file_number": "approved",
  "policy_metadata.policy_period": "approved",
  "policy_metadata.sum_insured_structure": "approve_with_pendency",
  "policy_metadata.geographical_scope": "approved",
  "policy_metadata.currency": "approved",

  // Policy schedule
  "policy_schedule.policy_tenure": "approved",

  // Definitions table rows
  "definitions[0]": "approved",
  "definitions[1]": "approve_with_pendency",
  "definitions[2]": "approved",
  "definitions[3]": null, // No status set
  "definitions[4]": "approved",

  // Other base covers table rows
  "other_base_covers[0]": "approve_with_pendency",
  "other_base_covers[1]": "approved",
  "other_base_covers[2]": "approved",
  "other_base_covers[3]": "rejected",
  "other_base_covers[4]": "approved",

  // Additional and optional covers
  "additional_and_optional_covers[0]": "approved",
  "additional_and_optional_covers[1]": "approve_with_pendency",

  // Modern and advanced treatments
  "modern_and_advanced_treatments[0]": "approved",
  "modern_and_advanced_treatments[1]": "approved",
  "modern_and_advanced_treatments[2]": "reverse_to_maker",
  "modern_and_advanced_treatments[3]": "approved",
  "modern_and_advanced_treatments[4]": "approved",

  // Exclusions
  "exclusions.specific_disease_waiting_periods[0]": "approved",
  "exclusions.specific_disease_waiting_periods[1]": "approved",
  "exclusions.specific_disease_waiting_periods[2]": "approve_with_pendency",
  "exclusions.permanent_exclusions[0]": "approved",
  "exclusions.permanent_exclusions[1]": "approved",
  "exclusions.permanent_exclusions[2]": "rejected",
  "exclusions.permanent_exclusions[3]": "approved",
  "exclusions.permanent_exclusions[4]": "approved",

  // Eligibility and entry conditions
  "eligibility_and_entry_conditions.dependent_definition": "approved",
  "eligibility_and_entry_conditions.family_definition": "approve_with_pendency",
  "eligibility_and_entry_conditions.relationship_coverage.0": "approved",
  "eligibility_and_entry_conditions.relationship_coverage.1": "approved",
  "eligibility_and_entry_conditions.continuity_benefits": "approved",

  // Maternity and newborn benefits
  "maternity_and_newborn_benefits.covered": "approved",

  // Claims process
  "claims_process.documents_required[0]": "approved",
  "claims_process.documents_required[1]": "approved",
  "claims_process.documents_required[2]": "approve_with_pendency",
  "claims_process.documents_required[3]": "approved",
  "claims_process.documents_required[4]": "approved",

  // Annexures
  "annexures_endorsements_and_schedules[0]": "approved",

  // Sub limits and capping
  "sub_limits_and_capping": "approved",

  // Co-payment and deductibles
  "co_payment_and_deductibles": "approve_with_pendency",
};

/**
 * Helper function to get dummy comments metadata for a specific request ID
 * In a real application, this would fetch from an API
 */
export function getDummyCommentsMetadata(_requestId?: string): CommentsMetadata {
  return dummyCommentsMetadata;
}

export function getDummyStatusMetadata(_requestId?: string): StatusMetadata {

  return dummyStatusMetadata;
}

