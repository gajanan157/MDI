/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RelationshipMaster {
    id: string;
    name: string; // e.g. "Self", "Spouse", "Child 1", "Child 2", "Parent", "Parent-in-law"
    code: string;
    maxAgeLimit: number;
  }
  
  export interface RoomRentMaster {
    id: string;
    roomType: string; // e.g. "General Ward", "Semi-Private Room", "Private AC Room", "Suite", "ICU"
    cappingType: 'percentage' | 'fixed' | 'no-limit';
    defaultCappingValue: number; // e.g. 1% of Sum Insured, or 5000 per day
  }
  
  export interface AilmentMaster {
    id: string;
    name: string; // e.g. "Cataract", "Hernia", "Joint Replacement", "Maternity", "Diabetes"
    icdCode: string; // e.g. "H26.9", "K40"
    standardWaitingPeriodMonths: number; // e.g. 24 months, 90 days, etc.
  }
  
  export interface HospitalMaster {
    id: string;
    name: string; // e.g. "Apollo Hospitals, Chennai", "Fortis Hospital, Gurgaon", "Manipal Hospital, Bangalore"
    city: string;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    empanelledInsurers: string[]; // IC IDs empanelled with
  }
  
  export interface CoPayMaster {
    id: string;
    type: 'Zone-wise' | 'Hospital-wise' | 'Ailment-wise' | 'Age-wise' | 'Standard';
    description: string;
    percentage: number;
  }
  
  export interface ExclusionMaster {
    id: string;
    code: string; // e.g. "IRDAI-EXCL-01"
    clauseName: string; // e.g. "Cosmetic Surgery Exclusion"
    category: 'Standard' | 'Permanent' | 'Conditional';
  }
  
  export interface BenefitTypeMaster {
    id: string;
    name: string; // e.g. "Pre-Hospitalization Expenses", "Post-Hospitalization Expenses", "Daycare Procedures", "Maternity Benefit", "Ambulance Charges", "Critical Illness Rider"
    code: string;
    defaultLimitType: 'full-sum-insured' | 'percentage' | 'fixed';
    defaultLimitValue: number;
    description: string;
  }
  
  export interface InsuranceCompany {
    id: string;
    name: string; // e.g. "National Insurance Company", "ICICI Lombard General Insurance"
    type: 'PSU' | 'Private';
    logoUrl?: string;
  }
  
  // Master collection container
  export interface MasterCollection {
    relationships: RelationshipMaster[];
    rooms: RoomRentMaster[];
    ailments: AilmentMaster[];
    hospitals: HospitalMaster[];
    coPays: CoPayMaster[];
    exclusions: ExclusionMaster[];
    benefitTypes: BenefitTypeMaster[];
  }
  
  // GMC Base Configuration
  export interface GmcProduct {
    id: string;
    icId: string; // reference to InsuranceCompany
    name: string; // e.g. "GMC Standard Plan 2026"
    version: string; // e.g. "v1.2"
    effectiveFrom: string;
    effectiveTo: string;
    status: 'Draft' | 'Active' | 'Deprecated';
    
    // Base values (Masters references & configuration)
    baseSumInsuredOptions: number[]; // e.g. [300000, 500000, 1000000]
    roomRentCapping: { [roomId: string]: { cappingType: 'percentage' | 'fixed' | 'no-limit'; value: number } };
    ailmentWaitingPeriods: { [ailmentId: string]: number }; // months
    copayDetails: { [copayId: string]: { enabled: boolean; percentage: number } };
    standardExclusions: string[]; // exclusionMaster IDs
    benefits: { [benefitId: string]: { limitType: 'full-sum-insured' | 'percentage' | 'fixed'; limitValue: number } };
  }
  
  // Corporate Policy Configuration (Overlay on GMC)
  export interface CorporatePolicy {
    id: string;
    corporateName: string; // e.g. "Acme Manufacturing Pvt Ltd"
    icId: string;
    gmcProductId: string;
    policyNumber: string;
    policyPeriodStart: string;
    policyPeriodEnd: string;
    headcount: number;
    premiumBasis: 'Per Life' | 'Floater Family Rate' | 'Age-band-wise';
    status: 'Draft' | 'Pending Approval' | 'Active';
    
    // Overrides (only store deltas, if not present here, it's inherited from GMC)
    overrides: {
      sumInsuredOptions?: number[]; // if overridden
      roomRentCapping?: { [roomId: string]: { cappingType: 'percentage' | 'fixed' | 'no-limit'; value: number } };
      ailmentWaitingPeriods?: { [ailmentId: string]: number };
      copayDetails?: { [copayId: string]: { enabled: boolean; percentage: number } };
      addedExclusions?: string[]; // IDs added
      waivedExclusions?: string[]; // IDs waived
      benefits?: { [benefitId: string]: { limitType: 'full-sum-insured' | 'percentage' | 'fixed'; limitValue: number } };
    };
  }
  
  // Member Benefit Profile Configuration (Overlay on Corporate Policy)
  export interface MemberBenefitProfile {
    id: string;
    policyId: string; // reference to CorporatePolicy
    gradeName: string; // e.g. "Grade A - Executive", "Grade B - Associate"
    employeeCount: number;
    
    // Overrides (only store deltas, if not present here, it's inherited from Corporate Policy, which is in turn inherited from GMC)
    overrides: {
      sumInsuredDefault?: number; // e.g. specific SI for this grade, e.g. 1000000
      roomRentCapping?: { [roomId: string]: { cappingType: 'percentage' | 'fixed' | 'no-limit'; value: number } };
      benefits?: { [benefitId: string]: { limitType: 'full-sum-insured' | 'percentage' | 'fixed'; limitValue: number } };
      dependentEligibility?: {
        maxChildren: number;
        spouseCovered: boolean;
        parentsCovered: boolean;
        parentAgeLimit: number;
      };
      ageBasedLoadingPercentage?: number; // e.g. 5% loading for members above 60
    };
  }
  