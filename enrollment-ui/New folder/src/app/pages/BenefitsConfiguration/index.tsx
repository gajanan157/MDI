


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  Building,
  Activity,
  Layers,
  HelpCircle,
  Clock,
  Briefcase,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  UserCheck,
  Check,
  Lock,
  Globe,
  Settings
} from 'lucide-react';
import { MasterCollection, BenefitTypeMaster, InsuranceCompany } from './types';

interface MastersViewProps {
  masters: MasterCollection;
  setMasters: React.Dispatch<React.SetStateAction<MasterCollection>>;
  insurers: InsuranceCompany[];
  isDark: boolean;
  selectedMasterItemId: string | null;
  setSelectedMasterItemId: (id: string | null) => void;
}

type TabType = 'coverages' | 'documents' | 'limitTypes' | 'limitUnits' | 'limitBasis' | 'siMaster' | 'eligibilityMaster';

export default function BenefitsConfiguration({
  masters,
  setMasters,
  insurers,
  isDark,
  selectedMasterItemId,
  setSelectedMasterItemId
}: MastersViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Notification states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    code: '',
    name: '',
    category: '',
    description: '',
    status: 'Active',
    // Custom sub-fields based on active tab
    type: '',         // for limits, diseases, benefits
    value: '',        // for limits
    operator: '',     // for limits
    icd10: '',        // for diseases
    applicableTo: '', // for waiting
    months: '',       // for waiting
    clause: '',       // for waiting/exclusions
    waivable: 'Yes',  // for exclusions
    rule: '',         // for exclusions
    applicable: '',   // for clauses
    mandatory: 'Yes', // for clauses/documents
    originalRequired: 'No', // for documents
    digitalAllowed: 'Yes',  // for documents
    applicableFor: ''       // for documents
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Core master datasets pre-populated from the user's attached text file
  const [coveragesList, setCoveragesList] = useState([
    { id: '1', code: 'COV001', name: 'Hospitalization', category: 'Inpatient', description: 'Covers overnight hospital stays, surgery, ICU, and related inpatient expenses.', status: 'Active' },
    { id: '2', code: 'COV002', name: 'Pre Hospitalization', category: 'Pre-Post', description: 'Covers diagnostic and medical costs incurred prior to hospital admission.', status: 'Active' },
    { id: '3', code: 'COV003', name: 'Post Hospitalization', category: 'Pre-Post', description: 'Covers follow-up treatments, check-ups, and medicine expenses post-discharge.', status: 'Active' },
    { id: '4', code: 'COV004', name: 'Day Care', category: 'Day Care', description: 'Covers medical treatments or surgeries requiring less than 24 hours of stay.', status: 'Active' },
    { id: '5', code: 'COV005', name: 'Maternity', category: 'Maternity', description: 'Covers pregnancy, delivery, pre-natal, and post-natal care services.', status: 'Active' },
    { id: '6', code: 'COV006', name: 'Dental', category: 'Dental', description: 'Covers routine cleanings, fillings, extractions, and major restorative dental work.', status: 'Active' },
    { id: '7', code: 'COV007', name: 'OPD', category: 'Outpatient', description: 'Covers doctor outpatient consultations, diagnostic tests, and pharmacy bills.', status: 'Active' },
    { id: '8', code: 'COV008', name: 'Critical Illness', category: 'Critical', description: 'Lump-sum or enhanced limits payout for specified life-threatening severe illnesses.', status: 'Active' },
    { id: '9', code: 'COV009', name: 'Modern Treatment', category: 'Modern', description: 'Covers advanced technology, computer-assisted, or robotic surgical procedures.', status: 'Active' },
    { id: '10', code: 'COV0010', name: 'Organ Donor', category: 'Inpatient', description: 'Covers hospital and harvesting expenses incurred for a compatible organ donor.', status: 'Active' },
    { id: '11', code: 'COV0011', name: 'AYUSH', category: 'Alternative', description: 'Covers Ayurveda, Yoga, Unani, Siddha, and Homeopathy alternative treatments.', status: 'Active' },
    { id: '12', code: 'COV0012', name: 'Newborn', category: 'Pediatric', description: 'Covers specialized pediatric care and nursery costs for newborn infants.', status: 'Active' },
    { id: '13', code: 'COV0013', name: 'Emergency', category: 'Emergency', description: 'Covers road ambulance transportation and emergency room stabilization fees.', status: 'Active' },
    { id: '14', code: 'COV0014', name: 'Preventive', category: 'Preventive', description: 'Covers disease prevention check-ups, early screenings, and wellness counsel.', status: 'Active' },
    { id: '15', code: 'COV0015', name: 'Optional Covers', category: 'Riders', description: 'Additional optional riders or benefit expansions opted for by policyholders.', status: 'Active' },
    { id: '16', code: 'COV0016', name: 'Vision', category: 'Vision', description: 'Covers eye diagnostic examinations, prescription lenses, and frame allowances.', status: 'Active' },
    { id: '17', code: 'COV0017', name: 'Vaccination', category: 'Preventive', description: 'Covers pediatric and adult scheduled immunizations and vaccinations.', status: 'Active' },
    { id: '18', code: 'COV0018', name: 'Health Checkup', category: 'Preventive', description: 'Covers annual executive physical diagnostic tests and blood panels.', status: 'Active' },
    { id: '19', code: 'COV0019', name: 'Accident', category: 'Emergency', description: 'Covers emergency procedures and therapeutic treatments following an accident.', status: 'Active' },
    { id: '20', code: 'COV0020', name: 'Wellness', category: 'Wellness', description: 'Covers gym rewards, preventive health apps, and active lifestyle trackers.', status: 'Active' },
    { id: '21', code: 'COV0021', name: 'Hospital Cash', category: 'Cash', description: 'Flat daily cash allowance paid for each day of active hospitalization.', status: 'Active' },
    { id: '22', code: 'COV0022', name: 'Stop Loss', category: 'Corporate', description: 'Aggregate financial cushion limits covering high-exposure corporate claims.', status: 'Active' }
  ]);

  const [benefitsList, setBenefitsList] = useState([
    { id: '1', code: 'BEN001', name: 'Hospitalization Expenses', category: 'Hospitalization', type: 'Basic', limitType: 'Sum Insured', limitValue: 'SI', unit: '₹', basis: 'Policy', status: 'Active', description: 'Covers medical expenses incurred during inpatient hospital stays.' },
    { id: '2', code: 'BEN002', name: 'Room Rent', category: 'Hospitalization', type: 'Basic', limitType: 'Policy Limit', limitValue: 'Schedule', unit: '₹/Day', basis: 'Claim', status: 'Active', description: 'Covers daily charges for hospital room accommodation.' },
    { id: '3', code: 'BEN003', name: 'ICU / ICCU Charges', category: 'Hospitalization', type: 'Basic', limitType: 'Policy Limit', limitValue: 'Schedule', unit: '₹/Day', basis: 'Claim', status: 'Active', description: 'Covers daily charges for intensive care unit services.' },
    { id: '4', code: 'BEN004', name: 'Medical Practitioner Fees', category: 'All-Hospitalization', type: 'Basic', limitType: 'Actual', limitValue: 'Actual', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers fees charged by doctors and consultants during treatment.' },
    { id: '5', code: 'BEN005', name: 'Surgeon Fees', category: 'Hospitalization', type: 'Basic', limitType: 'Actual', limitValue: 'Actual', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers fees charged by surgeons for surgical operations.' },
    { id: '6', code: 'BEN006', name: 'Anesthetist Fees', category: 'Hospitalization', type: 'Basic', limitType: 'Actual', limitValue: 'Actual', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers fees charged by anesthetists for surgeries.' },
    { id: '7', code: 'BEN007', name: 'Consultant Fees', category: 'All-Hospitalization', type: 'Basic', limitType: 'Actual', limitValue: 'Actual', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers fees charged by consultants during hospitalization.' },
    { id: '15', code: 'BEN015', name: 'Pre Hospitalization', category: 'Pre Hospitalization', type: 'Basic', limitType: 'Days', limitValue: '30', unit: 'Days', basis: 'Claim', status: 'Active', description: 'Covers diagnosis and medical costs prior to hospital admission.' },
    { id: '16', code: 'BEN016', name: 'Post Hospitalization', category: 'Post Hospitalization', type: 'Basic', limitType: 'Days', limitValue: '60', unit: 'Days', basis: 'Claim', status: 'Active', description: 'Covers follow-up treatments and medicine expenses post-discharge.' },
    { id: '17', code: 'BEN017', name: 'Cataract Treatment', category: 'Disease Specific', type: 'Basic', limitType: 'Policy Limit', limitValue: 'Schedule', unit: '₹', basis: 'Eye', status: 'Active', description: 'Covers cataract surgeries and ophthalmic clinical evaluations.' },
    { id: '18', code: 'BEN018', name: 'AYUSH Treatment', category: 'Alternative Medicine', type: 'Basic', limitType: 'Policy Limit', limitValue: 'Schedule', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers alternative treatments like Ayurveda, Yoga, Unani, Siddha, and Homeopathy.' },
    { id: '22', code: 'BEN022', name: 'Modern Treatment Package', category: 'Modern Treatment', type: 'Basic', limitType: 'Procedure Based', limitValue: 'Variable', unit: '₹', basis: 'Procedure', status: 'Active', description: 'Covers advanced technological medical packages.' },
    { id: '23', code: 'BEN023', name: 'Robotic Surgery', category: 'Modern Treatment', type: 'ModernTreatment', limitType: 'Procedure Based', limitValue: 'Variable', unit: '₹', basis: 'Procedure', status: 'Active', description: 'Covers computer-assisted robotic surgical procedures.' },
    { id: '51', code: 'BEN051', name: 'Vaccination Cover', category: 'Optional Covers', type: 'OptionalBenefits', limitType: 'Schedule', limitValue: 'Schedule', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers general immunization and routine vaccination schedules.' },
    { id: '53', code: 'BEN053', name: 'Dental Treatment Cover', category: 'Optional Covers', type: 'OptionalBenefits', limitType: 'Schedule', limitValue: 'Schedule', unit: '₹', basis: 'Claim', status: 'Active', description: 'Covers dental surgeries, extractions and outpatient cleanings.' },
    { id: '57', code: 'BEN057', name: 'Maternity Expenses Cover', category: 'Optional Covers', type: 'OptionalBenefits', limitType: 'Sum Insured', limitValue: 'SI', unit: '₹', basis: 'Policy', status: 'Active', description: 'Covers delivery, pre-natal, post-natal, and related pregnancy expenses.' },
    { id: '58', code: 'BEN058', name: 'Newborn Baby Cover (Day One)', category: 'Optional Covers', type: 'OptionalBenefits', limitType: 'Sum Insured', limitValue: 'SI', unit: '₹', basis: 'Policy', status: 'Active', description: 'Covers pediatric costs and newborn care from birth day one.' },
    { id: '66', code: 'BEN066', name: 'Corporate Buffer', category: 'Optional Covers', type: 'OptionalBenefits', limitType: 'Sum Insured', limitValue: 'SI', unit: '₹', basis: 'Policy', status: 'Active', description: 'Additional pool of sum insured authorized for emergency claims.' }
  ]);

  const [limitsList, setLimitsList] = useState([
    { id: 'L1', code: 'PBI00001', name: 'Max Amount Limit Rule', type: 'Rule', value: '75,000', operator: '<=', status: 'Active', description: 'Maximum cap threshold for standard corporate maternity cases.' },
    { id: 'L2', code: 'PBI00002', name: 'Per Delivery Frequency', type: 'Rule', value: '1', operator: '=', status: 'Active', description: 'Delivery frequency limit per pregnancy policy cycle.' },
    { id: 'L3', code: 'PBI00003', name: 'Normal Delivery Cover State', type: 'Rule', value: 'Covered', operator: '=', status: 'Active', description: 'Explicit coverage flag for vaginal normal delivery.' },
    { id: 'L4', code: 'PBI00004', name: 'Caesarean Section Cover State', type: 'Rule', value: 'Covered', operator: '=', status: 'Active', description: 'Explicit coverage flag for caesarean delivery.' },
    { id: 'L5', code: 'PBI00005', name: 'Pre/Post Days Window', type: 'Rule', value: '30', operator: '=', status: 'Active', description: 'Maximum allowed days window for pre-hospitalization bills.' },
    { id: 'LT1', code: 'SI', name: 'Sum Insured', type: 'Limit Type', value: '100%', operator: '—', status: 'Active', description: 'Covers up to total policy sum insured limit.' },
    { id: 'LT2', code: 'FIX', name: 'Fixed Amount', type: 'Limit Type', value: 'Static Cap', operator: '—', status: 'Active', description: 'Capped at a static maximum flat financial value.' },
    { id: 'LT3', code: 'ACT', name: 'Actual Expenses', type: 'Limit Type', value: 'Actual Ledger', operator: '—', status: 'Active', description: 'Reimbursed fully based on hospital discharge billing.' },
    { id: 'LT4', code: 'PCTSI', name: 'Percentage of SI', type: 'Limit Type', value: 'Variable %', operator: '—', status: 'Active', description: 'Sub-limit calculated on percentage of total SI.' },
    { id: 'LU1', code: 'INR', name: '₹ (Indian Rupees)', type: 'Limit Unit', value: 'Currency', operator: '—', status: 'Active', description: 'Standard financial currency measurement.' },
    { id: 'LU2', code: 'DAY', name: 'Days limit unit', type: 'Limit Unit', value: 'Time (Days)', operator: '—', status: 'Active', description: 'Temporal limit unit for room stay/treatments.' },
    { id: 'LU3', code: 'PERCENT', name: '% (Percentage unit)', type: 'Limit Unit', value: 'Ratio (%)', operator: '—', status: 'Active', description: 'Proportionate cap calculation percentage unit.' },
    { id: 'LB1', code: 'IND', name: 'Individual Basis', type: 'Limit Basis', value: 'Per Member', operator: '—', status: 'Active', description: 'Limit applies independently to each enrolled member.' },
    { id: 'LB2', code: 'FAM', name: 'Family Floater Basis', type: 'Limit Basis', value: 'Per Family', operator: '—', status: 'Active', description: 'Limit shared across the family cluster pool.' },
    { id: 'LB3', code: 'POL', name: 'Policy Level Basis', type: 'Limit Basis', value: 'Per Account', operator: '—', status: 'Active', description: 'Absolute cap for the entire corporate policy.' }
  ]);

  const [diseasesList, setDiseasesList] = useState([
    { id: 'D1', code: 'DIS001', icd10: 'H25', name: 'Age-related Cataract', category: 'Ophthalmology', type: 'Disease', status: 'Active', description: 'Cataract waiting (24/48m), Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D2', code: 'DIS002', icd10: 'H26', name: 'Other Cataract', category: 'Ophthalmology', type: 'Disease', status: 'Active', description: 'Cataract waiting (24/48m), Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D3', code: 'DIS003', icd10: 'H40', name: 'Glaucoma', category: 'Ophthalmology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D4', code: 'DIS004', icd10: 'H35', name: 'Retinal Disorders', category: 'Ophthalmology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D5', code: 'DIS005', icd10: 'N80', name: 'Endometriosis', category: 'Gynaecology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: No, Modern: No, Critical: No' },
    { id: 'D6', code: 'DIS006', icd10: 'D25', name: 'Fibroid Uterus', category: 'Gynaecology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: No, Modern: No, Critical: No' },
    { id: 'D7', code: 'DIS007', icd10: 'K40', name: 'Inguinal Hernia', category: 'General Surgery', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D8', code: 'DIS008', icd10: 'K42', name: 'Umbilical Hernia', category: 'General Surgery', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D9', code: 'DIS009', icd10: 'K80', name: 'Gall Stones', category: 'General Surgery', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D10', code: 'DIS010', icd10: 'N20', name: 'Kidney Stones', category: 'Urology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D11', code: 'DIS011', icd10: 'N21', name: 'Bladder Stones', category: 'Urology', type: 'Disease', status: 'Active', description: 'Standard waiting, Day Care: Yes, Modern: No, Critical: No' },
    { id: 'D15', code: 'DIS015', icd10: 'M17', name: 'Osteoarthritis Knee', category: 'Orthopaedics', type: 'Disease', status: 'Active', description: 'Joint replacement waiting, Day Care: No, Modern: No, Critical: No' },
    { id: 'D24', code: 'DIS024', icd10: 'O80', name: 'Normal Delivery', category: 'Maternity', type: 'Disease', status: 'Active', description: 'Maternity limits apply, Day Care: No, Modern: No, Critical: No' },
    { id: 'D25', code: 'DIS025', icd10: 'O82', name: 'Caesarean Section', category: 'Maternity', type: 'Disease', status: 'Active', description: 'Maternity limits apply, Day Care: No, Modern: No, Critical: No' },
    { id: 'D28', code: 'DIS028', icd10: 'T14', name: 'Trauma', category: 'Orthopaedic', type: 'Disease', status: 'Active', description: 'Emergency trauma stabilizing procedures, Day Care: Yes, Modern: No' },
    { id: 'P1', code: 'PROC001', icd10: '—', name: 'Cataract Surgery', category: 'Ophthalmic Surgery', type: 'Procedure', status: 'Active', description: 'Surgical extraction of cataract under BEN017. Day Care: Yes.' },
    { id: 'P2', code: 'PROC002', icd10: '—', name: 'Hernia Repair', category: 'General Surgery', type: 'Procedure', status: 'Active', description: 'Surgical repair of hernia under BEN021. Day Care: Yes.' },
    { id: 'P11', code: 'PROC011', icd10: '—', name: 'Robotic Surgery', category: 'Surgical Oncology', type: 'Procedure', status: 'Active', description: 'Modern procedure covered under BEN029. Day Care: No.' },
    { id: 'P12', code: 'PROC012', icd10: '—', name: 'Deep Brain Stimulation', category: 'Neurology', type: 'Procedure', status: 'Active', description: 'Modern procedure covered under BEN025. Day Care: Yes.' },
    { id: 'P29', code: 'PROC029', icd10: '—', name: 'LASIK Surgery', category: 'Ophthalmic Surgery', type: 'Procedure', status: 'Active', description: 'Corrective vision surgery covered under BEN068. Day Care: Yes.' }
  ]);

  const [waitingList, setWaitingList] = useState([
    { id: 'W1', code: 'WAIT001', name: 'Initial Waiting Period', applicableTo: 'All illnesses except accident', months: '1 Month', clause: 'Clause 4.3', status: 'Active', description: 'Base 30-day waiting period from initial enrollment date.' },
    { id: 'W2', code: 'WAIT002', name: 'Pre-existing Disease Waiting', applicableTo: 'Pre-existing diseases', months: '48 Months', clause: 'Clause 4.1', status: 'Active', description: 'Standard waiting period for pre-existing medical conditions.' },
    { id: 'W3', code: 'WAIT003', name: 'Specific Disease Waiting', applicableTo: 'Specified diseases/procedures', months: '24/48 Months', clause: 'Clause 4.2', status: 'Active', description: 'Waiting period for joint replacements, hernia, cataracts.' },
    { id: 'W4', code: 'WAIT004', name: 'Maternity Waiting', applicableTo: 'Normal delivery / Caesarean / Ectopic', months: '9 Months', clause: 'Clause 7.1', status: 'Active', description: 'Required waiting period before maternity claims lodging.' },
    { id: 'W5', code: 'WAIT005', name: 'Newborn Eligibility', applicableTo: 'Newborn benefit', months: '0 Months', clause: 'Clause 21.23', status: 'Active', description: 'Immediate coverage if parent maternity benefit is active.' },
    { id: 'W6', code: 'WAIT006', name: 'Cataract Waiting', applicableTo: 'Cataract treatment', months: '24/48 Months', clause: 'Clause 2.7', status: 'Active', description: 'Disease specific waiting period for cataracts.' },
    { id: 'W7', code: 'WAIT007', name: 'AYUSH Waiting', applicableTo: 'AYUSH treatment', months: 'As Policy', clause: 'Clause 2.8', status: 'Active', description: 'Subject to overall policy specifications for alternative care.' },
    { id: 'W8', code: 'WAIT008', name: 'Modern Treatment Waiting', applicableTo: 'Modern procedures', months: 'As Policy', clause: 'Clause 2.12', status: 'Active', description: 'Waiting for robotic, laser surgeries and advanced therapies.' },
    { id: 'W9', code: 'WAIT009', name: 'Infertility Waiting', applicableTo: 'Infertility treatment', months: 'As Schedule', clause: 'Clause 21.19', status: 'Active', description: 'Waiting for IVF and fertility related treatments.' },
    { id: 'W10', code: 'WAIT010', name: 'Domiciliary Eligibility', applicableTo: 'Domiciliary claims', months: 'As Policy', clause: 'Clause 21.25', status: 'Active', description: 'Home hospitalization claim eligibility constraints.' }
  ]);

  const [exclusionsList, setExclusionsList] = useState([
    { id: 'E1', code: 'EXCL01', name: 'Pre-existing Disease Waiting', category: 'Waiting', waivable: 'Yes', rule: 'RUL026', action: 'Reject until waiting complete', status: 'Active', description: 'Reject claims for pre-existing disease unless waived.' },
    { id: 'E2', code: 'EXCL02', name: 'Specific Disease Waiting (2/4 Years)', category: 'Waiting', waivable: 'Yes', rule: 'RUL028', action: 'Reject until waiting complete', status: 'Active', description: 'Excludes specified procedures for initial policy years.' },
    { id: 'E3', code: 'EXCL03', name: 'First 30 Days Waiting', category: 'Waiting', waivable: 'Yes', rule: 'RUL027', action: 'Reject', status: 'Active', description: 'Excludes medical illness claims filed within first 30 days.' },
    { id: 'E4', code: 'EXCL04', name: 'Investigation & Evaluation Only', category: 'Permanent (Waivable)', waivable: 'Yes', rule: 'RUL036', action: 'Reject unless opted', status: 'Active', description: 'Excludes diagnostics unless therapeutic hospitalization occurs.' },
    { id: 'E5', code: 'EXCL05', name: 'Rest Cure / Rehabilitation', category: 'Permanent', waivable: 'No', rule: '—', action: 'Reject', status: 'Active', description: 'Excludes charges for sanatoriums, custody, rest cures.' },
    { id: 'E6', code: 'EXCL06', name: 'Obesity / Weight Control Treatment', category: 'Permanent', waivable: 'No', rule: '—', action: 'Reject', status: 'Active', description: 'Excludes aesthetic surgical treatments for obesity.' },
    { id: 'E7', code: 'EXCL07', name: 'Change of Gender Treatment', category: 'Permanent', waivable: 'No', rule: '—', action: 'Reject', status: 'Active', description: 'Excludes surgical therapies for gender assignment.' },
    { id: 'E8', code: 'EXCL08', name: 'Cosmetic / Plastic Surgery', category: 'Permanent', waivable: 'No', rule: 'RUL039', action: 'Reject', status: 'Active', description: 'Excludes cosmetic modifications unless post-trauma.' },
    { id: 'E9', code: 'EXCL09', name: 'Hazardous or Adventure Sports', category: 'Permanent (Waivable)', waivable: 'Yes', rule: 'RUL037', action: 'Reject unless opted', status: 'Active', description: 'Excludes injuries from adventure or extreme sports.' },
    { id: 'E10', code: 'EXCL10', name: 'Breach of Law / Criminal Acts', category: 'Permanent', waivable: 'No', rule: '—', action: 'Reject', status: 'Active', description: 'Excludes treatment due to participation in illegal activities.' },
    { id: 'E11', code: 'EXCL11', name: 'Alcohol / Drug Abuse', category: 'Permanent', waivable: 'No', rule: '—', action: 'Reject', status: 'Active', description: 'Excludes rehabilitation and medical costs of substance abuse.' },
    { id: 'E12', code: 'EXCL12', name: 'Self-inflicted Injury / Suicide Attempt', category: 'Permanent', waivable: 'No', rule: 'RUL038', action: 'Reject', status: 'Active', description: 'Excludes diagnostic and therapy costs of self-harm.' },
    { id: 'E14', code: 'EXCL14', name: 'Infertility & Sterility', category: 'Permanent (Waivable)', waivable: 'Yes', rule: 'RUL041', action: 'Reject unless opted', status: 'Active', description: 'Excludes fertility therapies, IVF, unless explicitly covered.' },
    { id: 'E15', code: 'EXCL15', name: 'Maternity Expenses', category: 'Permanent (Waivable)', waivable: 'Yes', rule: 'RUL042', action: 'Reject unless opted', status: 'Active', description: 'Excludes pregnancy delivery charges unless maternity is covered.' }
  ]);

  const [clausesList, setClausesList] = useState([
    { id: 'C1', code: 'DOC001', name: 'Claim Form Document', category: 'Claim', applicable: 'All Claims', mandatory: 'Yes', status: 'Active', description: 'Standard signed reimbursement and cashless claim form.' },
    { id: 'C2', code: 'DOC002', name: 'Health Card Copy', category: 'Identity', applicable: 'Cashless & Reimbursement', mandatory: 'Yes', status: 'Active', description: 'Member insurance card or policy schedule copy.' },
    { id: 'C4', code: 'DOC004', name: 'Hospital Admission Note', category: 'Clinical', applicable: 'Hospitalization', mandatory: 'Yes', status: 'Active', description: 'Admitting medical officer summary sheet.' },
    { id: 'C5', code: 'DOC005', name: 'Discharge Summary', category: 'Clinical', applicable: 'Hospitalization', mandatory: 'Yes', status: 'Active', description: 'Full discharge record with diagnosis and treatment notes.' },
    { id: 'C6', code: 'DOC006', name: 'Final Hospital Bill', category: 'Financial', applicable: 'All Claims', mandatory: 'Yes', status: 'Active', description: 'Itemized original hospital invoice summary.' },
    { id: 'C7', code: 'DOC007', name: 'Bill Break-up Ledger', category: 'Financial', applicable: 'All Claims', mandatory: 'Yes', status: 'Active', description: 'Detailed individual ledger component lines of bill.' },
    { id: 'C8', code: 'DOC008', name: 'Money Receipt Document', category: 'Financial', applicable: 'Reimbursement', mandatory: 'Yes', status: 'Active', description: 'Official paid receipt from the hospital billing counter.' },
    { id: 'C9', code: 'DOC009', name: 'Treating Doctor Prescription', category: 'Clinical', applicable: 'All Claims', mandatory: 'Yes', status: 'Active', description: 'Doctor prescription for drugs, investigations, etc.' },
    { id: 'C26', code: 'DOC026', name: 'Cancelled Cheque', category: 'Bank', applicable: 'Reimbursement', mandatory: 'Conditional', status: 'Active', description: 'Cancelled cheque for direct bank transfer of reimbursement.' },
    { id: 'C101', code: 'RUL001', name: 'Policy active validation', category: 'Rules', applicable: 'Eligibility Check', mandatory: 'Yes', status: 'Active', description: 'Policy state must match "Active" on date of admission.' },
    { id: 'C102', code: 'RUL002', name: 'Member enrolled validation', category: 'Rules', applicable: 'Eligibility Check', mandatory: 'Yes', status: 'Active', description: 'Insured member must exist in current employee census.' },
    { id: 'C103', code: 'RUL003', name: 'Loss within policy period', category: 'Rules', applicable: 'Eligibility Check', mandatory: 'Yes', status: 'Active', description: 'Admission and discharge dates must fall within active policy term.' },
    { id: 'C104', code: 'RUL004', name: 'Hospital ROHINI registration', category: 'Rules', applicable: 'Eligibility Check', mandatory: 'Yes', status: 'Active', description: 'Treating hospital must hold a valid regulatory ROHINI registration.' },
    { id: 'C115', code: 'RUL015', name: 'Room rent within policy limit', category: 'Rules', applicable: 'Financial Validation', mandatory: 'Yes', status: 'Active', description: 'Checks daily room bill against allowed capping criteria.' }
  ]);

  const [documentsList, setDocumentsList] = useState([
    { id: 'DOC1', code: 'DOC001', name: 'Claim Form', category: 'Claim', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Mandatory Signed by insured', status: 'Active' },
    { id: 'DOC2', code: 'DOC002', name: 'Health Card Copy', category: 'Identity', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Cashless & Reimbursement', description: 'Member identification', status: 'Active' },
    { id: 'DOC3', code: 'DOC003', name: 'Policy Copy / E-card', category: 'Identity', mandatory: 'N', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Cashless & Reimbursement', description: 'If requested', status: 'Active' },
    { id: 'DOC4', code: 'DOC004', name: 'Hospital Admission Note', category: 'Clinical', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Admission details', status: 'Active' },
    { id: 'DOC5', code: 'DOC005', name: 'Discharge Summary', category: 'Clinical', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Mandatory', status: 'Active' },
    { id: 'DOC6', code: 'DOC006', name: 'Final Hospital Bill', category: 'Financial', mandatory: 'Y', originalRequired: 'Y', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Original', status: 'Active' },
    { id: 'DOC7', code: 'DOC007', name: 'Bill Break-up', category: 'Financial', mandatory: 'Y', originalRequired: 'Y', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Itemized', status: 'Active' },
    { id: 'DOC8', code: 'DOC008', name: 'Money Receipt', category: 'Financial', mandatory: 'Y', originalRequired: 'Y', digitalAllowed: 'Y', applicableFor: 'Reimbursement All Claims', description: 'Official paid receipt', status: 'Active' },
    { id: 'DOC9', code: 'DOC009', name: 'Prescription', category: 'Clinical', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Treating doctor prescription', status: 'Active' },
    { id: 'DOC10', code: 'DOC010', name: 'Diagnostic Reports', category: 'Clinical', mandatory: 'Y', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Lab/radiology diagnostic summaries', status: 'Active' },
    { id: 'DOC11', code: 'DOC011', name: 'Investigation Reports', category: 'Clinical', mandatory: 'N', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Lab/Radiology', status: 'Active' },
    { id: 'DOC12', code: 'DOC012', name: 'Operation Notes', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Surgery', description: 'Mandatory for surgeries', status: 'Active' },
    { id: 'DOC13', code: 'DOC013', name: 'Implant Sticker', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Implant Cases', description: 'If implant used', status: 'Active' },
    { id: 'DOC14', code: 'DOC014', name: 'OT Notes', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Surgery', description: 'Operation theatre details', status: 'Active' },
    { id: 'DOC15', code: 'DOC015', name: 'Anaesthesia Record', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Major Surgery', description: 'If applicable', status: 'Active' },
    { id: 'DOC16', code: 'DOC016', name: 'FIR', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Accident', status: 'Active' },
    { id: 'DOC17', code: 'DOC017', name: 'MLC Report', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Medico Legal', status: 'Active' },
    { id: 'DOC18', code: 'DOC018', name: 'Post Mortem Report', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Death Claim', description: 'Death Claim', status: 'Active' },
    { id: 'DOC19', code: 'DOC019', name: 'Death Certificate', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Death Claim', description: 'Death Claim', status: 'Active' },
    { id: 'DOC20', code: 'DOC020', name: 'Birth Certificate', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Newborn Claims', description: 'If newborn benefit', status: 'Active' },
    { id: 'DOC21', code: 'DOC021', name: 'Marriage Certificate', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Newborn Claims', description: 'Spouse addition', status: 'Active' },
    { id: 'DOC22', code: 'DOC022', name: 'Treating Doctor Certificate', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Certificate from doctor', status: 'Active' },
    { id: 'DOC23', code: 'DOC023', name: 'Referral Letter', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Referral details', status: 'Active' },
    { id: 'DOC24', code: 'DOC024', name: 'Pre-authorisation Form', category: 'Cashless', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Cash less', description: 'Pre-auth documentation', status: 'Active' },
    { id: 'DOC25', code: 'DOC025', name: 'KYC Proof', category: 'Identity', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'All Claims', description: 'Identity verification docs', status: 'Active' },
    { id: 'DOC26', code: 'DOC026', name: 'Cancelled Cheque', category: 'Bank', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Reimbursement All Claims', description: 'For direct fund transfer', status: 'Active' },
    { id: 'DOC27', code: 'DOC027', name: 'Bank Passbook', category: 'Bank', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Reimbursement All Claims', description: 'For direct fund transfer', status: 'Active' },
    { id: 'DOC28', code: 'DOC028', name: 'Organ Donor Documents', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'Transplant cases only', status: 'Active' },
    { id: 'DOC29', code: 'DOC029', name: 'Maternity Records', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'if Maternity Benefit', status: 'Active' },
    { id: 'DOC30', code: 'DOC030', name: 'Vaccination Certificate', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Vaccination Claims', description: 'If Vaccination Benefit', status: 'Active' },
    { id: 'DOC31', code: 'DOC031', name: 'LASIK Clinical Evaluation', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Eye Claims', description: 'If LASIK Covered', status: 'Active' },
    { id: 'DOC32', code: 'DOC032', name: 'AYUSH Treatment Records', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'AYUSH', description: 'Treatment records', status: 'Active' },
    { id: 'DOC33', code: 'DOC033', name: 'Police Final Report', category: 'Legal', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Accident Claims', description: 'Accident cases', status: 'Active' },
    { id: 'DOC34', code: 'DOC034', name: 'Disability Certificate', category: 'Clinical', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'PA Claims', description: 'Personal Accident claims', status: 'Active' },
    { id: 'DOC35', code: 'DOC035', name: 'Employer Certificate', category: 'Administrative', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Hospitalization', description: 'In Some cases', status: 'Active' },
    { id: 'DOC36', code: 'DOC036', name: 'Proposal Form', category: 'Underwriting', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Claims, Policy Configuration', description: 'In Some cases', status: 'Active' },
    { id: 'DOC37', code: 'DOC037', name: 'Null Endorsement', category: 'Underwriting', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Claims, Policy Configuration', description: 'In Some cases', status: 'Active' },
    { id: 'DOC38', code: 'DOC038', name: 'Add Endorsement', category: 'Underwriting', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Claims, Policy Configuration', description: 'In Some cases', status: 'Active' },
    { id: 'DOC39', code: 'DOC039', name: 'Deletion Endorsement', category: 'Underwriting', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Claims, Policy Configuration', description: 'In Some cases', status: 'Active' },
    { id: 'DOC40', code: 'DOC040', name: 'Modify Endorsement', category: 'Underwriting', mandatory: 'Conditional', originalRequired: 'N', digitalAllowed: 'Y', applicableFor: 'Claims, Policy Configuration', description: 'In Some cases', status: 'Active' }
  ]);

  const [limitTypesList, setLimitTypesList] = useState([
    { id: 'LT_SI', code: 'SI', name: 'Sum Insured', status: 'Active' },
    { id: 'LT_FIX', code: 'FIX', name: 'Fixed Amount', status: 'Active' },
    { id: 'LT_ACT', code: 'ACT', name: 'Actual Expenses', status: 'Active' },
    { id: 'LT_PCTSI', code: 'PCTSI', name: 'Percentage of SI', status: 'Active' },
    { id: 'LT_DAY', code: 'DAY', name: 'Per Day', status: 'Active' },
    { id: 'LT_CLAIM', code: 'CLAIM', name: 'Per Claim', status: 'Active' },
    { id: 'LT_EVENT', code: 'EVENT', name: 'Per Event', status: 'Active' },
    { id: 'LT_POLICY', code: 'POLICY', name: 'Policy Aggregate', status: 'Active' },
    { id: 'LT_SSI', code: 'SSI', name: 'SpecifiedSI', status: 'Active' },
    { id: 'LT_SICB', code: 'SICB', name: 'Sum Insured + CB', status: 'Active' },
    { id: 'LT_PCTSICB', code: 'PCTSICB', name: 'Percentage of SI + CB', status: 'Active' },
    { id: 'LT_STATUS', code: 'STATUS', name: 'Status', status: 'Active' },
    { id: 'LT_REG', code: 'REG', name: 'Regulatory Amts', status: 'Active' },
    { id: 'LT_PCTHOSPBILL', code: 'PCTHOSPBILL', name: 'Percentage of Hospital Bill', status: 'Active' },
    { id: 'LT_PCTCL', code: 'PCTCL', name: 'Percentage of Claim', status: 'Active' },
    { id: 'LT_ADDSI', code: 'ADDSI', name: 'Additional SI', status: 'Active' }
  ]);

  const [limitBasisList, setLimitBasisList] = useState([
    { id: 'LB_IND', code: 'IND', name: 'Individual', status: 'Active' },
    { id: 'LB_FAM', code: 'FAM', name: 'Family Floater', status: 'Active' },
    { id: 'LB_POLPERIOD', code: 'POLPERIOD', name: 'Policy', status: 'Active' },
    { id: 'LB_CLAIM', code: 'CLAIM', name: 'Claim', status: 'Active' },
    { id: 'LB_EVENT', code: 'EVENT', name: 'Occurrence', status: 'Active' },
    { id: 'LB_COVPER', code: 'COVPER', name: 'Coverage Period', status: 'Active' },
    { id: 'LB_PERSIDE', code: 'PERSIDE', name: 'Per Side', status: 'Active' },
    { id: 'LB_PERGROUP', code: 'PERGROUP', name: 'PER Master Corporate Group', status: 'Active' }
  ]);

  const [limitUnitsList, setLimitUnitsList] = useState([
    { id: 'LU_INR', code: 'INR', name: '₹', status: 'Active' },
    { id: 'LU_DAY', code: 'DAY', name: 'Days', status: 'Active' },
    { id: 'LU_PERCENT', code: 'PERCENT', name: '%', status: 'Active' },
    { id: 'LU_VISIT', code: 'VISIT', name: 'Visit', status: 'Active' },
    { id: 'LU_SESSION', code: 'SESSION', name: 'Session', status: 'Active' },
    { id: 'LU_MONTH', code: 'MONTH', name: 'Months', status: 'Active' }
  ]);

  const [siMasterList, setSiMasterList] = useState([
    { id: 'SI_001', code: 'SI001', name: 'Individual SI', status: 'Active' },
    { id: 'SI_002', code: 'SI002', name: 'Family Floater SI', status: 'Active' },
    { id: 'SI_003', code: 'SI003', name: 'Corporate Buffer', status: 'Active' },
    { id: 'SI_004', code: 'SI004', name: 'Additional SI', status: 'Active' },
    { id: 'SI_005', code: 'SI005', name: 'Recharge SI', status: 'Active' },
    { id: 'SI_006', code: 'SI006', name: 'Top Up SI', status: 'Active' },
    { id: 'SI_007', code: 'SI007', name: 'Super Top UP SI', status: 'Active' },
    { id: 'SI_008', code: 'SI008', name: 'OPD SI', status: 'Active' },
    { id: 'SI_009', code: 'SI009', name: 'Pharmcy SI', status: 'Active' },
    { id: 'SI_0010', code: 'SI0010', name: 'Consultation SI', status: 'Active' },
    { id: 'SI_0011', code: 'SI0011', name: 'Booster SI', status: 'Active' },
    { id: 'SI_0012', code: 'SI0012', name: 'Critical Illness SI', status: 'Active' },
    { id: 'SI_0013', code: 'SI0013', name: 'PA Sum Assured', status: 'Active' },
    { id: 'SI_0014', code: 'SI0014', name: 'Hospital Cash Allowance', status: 'Active' },
    { id: 'SI_0015', code: 'SI0015', name: 'Maternity SI', status: 'Active' },
    { id: 'SI_0016', code: 'SI0016', name: 'Organ Donor SI', status: 'Active' },
    { id: 'SI_0017', code: 'SI0017', name: 'Global SI', status: 'Active' },
    { id: 'SI_0018', code: 'SI0018', name: 'Infinity/ Loyalty Bonus SI', status: 'Active' },
    { id: 'SI_0019', code: 'SI0019', name: 'Inflation Shield SI', status: 'Active' },
    { id: 'SI_0020', code: 'SI0020', name: 'PortabilityContinuity SI', status: 'Active' },
    { id: 'SI_0021', code: 'SI0021', name: 'Health Return SI', status: 'Active' },
    { id: 'SI_0022', code: 'SI0022', name: 'Second Medical Opinion SI', status: 'Active' },
    { id: 'SI_0023', code: 'SI0023', name: 'No Claim Bonus SI', status: 'Active' },
    { id: 'SI_0024', code: 'SI0024', name: 'No Claim Bonus Super/Booster SI', status: 'Active' },
    { id: 'SI_0025', code: 'SI0025', name: 'Infinite Care SI', status: 'Active' },
    { id: 'SI_0026', code: 'SI0026', name: 'Super Reload/Enhance SI', status: 'Active' },
    { id: 'SI_0027', code: 'SI0027', name: 'Tenure Multiplier SI', status: 'Active' },
    { id: 'SI_0028', code: 'SI0028', name: 'Compassionate Visit SI', status: 'Active' }
  ]);

  const [eligibilityMasterList, setEligibilityMasterList] = useState([
    { id: 'EL_ELGB001', code: 'ELGB001', name: 'Employee', status: 'Active' },
    { id: 'EL_ELGB002', code: 'ELGB002', name: 'Retired', status: 'Active' },
    { id: 'EL_ELGB003', code: 'ELGB003', name: 'Dependent', status: 'Active' },
    { id: 'EL_ELGB004', code: 'ELGB004', name: 'Spouse', status: 'Active' },
    { id: 'EL_ELGB005', code: 'ELGB005', name: 'Parents', status: 'Active' },
    { id: 'EL_ELGB006', code: 'ELGB006', name: 'Children', status: 'Active' },
    { id: 'EL_ELGB007', code: 'ELGB007', name: 'Adopted Child', status: 'Active' },
    { id: 'EL_ELGB008', code: 'ELGB008', name: 'New Born', status: 'Active' },
    { id: 'EL_ELGB009', code: 'ELGB009', name: 'Parents-in-law', status: 'Active' },
    { id: 'EL_ELGB0010', code: 'ELGB0010', name: 'Sibling', status: 'Active' }
  ]);

  // Route tab from global search if triggered
  useEffect(() => {
    if (selectedMasterItemId) {
      if (selectedMasterItemId === 'benefit') {
        setActiveTab('benefits');
        setSearchQuery('Maternity');
      } else if (selectedMasterItemId === 'ailment') {
        setActiveTab('diseases');
        setSearchQuery('Cataract');
      }
      setSelectedMasterItemId(null);
    }
  }, [selectedMasterItemId]);

  // Reset page on tab/query change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, selectedStatus]);

  // Derive unique categories for active tab to show in filter dropdown
  const categoriesList = useMemo(() => {
    const list = (() => {
      switch (activeTab) {
        // case 'coverages': return coveragesList;
        case 'documents': return documentsList;
        case 'limitTypes': return limitTypesList;
        case 'limitUnits': return limitUnitsList;
        case 'limitBasis': return limitBasisList;
        case 'siMaster': return siMasterList;
        case 'eligibilityMaster': return eligibilityMasterList;
        default: return [];
      }
    })();
    const cats = Array.from(new Set(list.map(item => item.category || (item as any).type || 'General')));
    return cats.filter(Boolean).sort();
  }, [activeTab, coveragesList, documentsList, limitTypesList, limitUnitsList, limitBasisList, siMasterList, eligibilityMasterList]);

  // Dynamic label properties based on active tab
  const tabMetadata = useMemo(() => {
    switch (activeTab) {
    //   case 'coverages':
    //     return {
    //       title: 'Coverage Master',
    //       count: coveragesList.length,
    //       scopeTitle: 'Active Scope: Coverage Master',
    //       scopeDesc: 'Main insurance benefit clusters representing base cover configurations.',
    //       btnText: 'Configure Coverage',
    //       placeholder: 'Search coverages by code or name...'
    //     };
      case 'documents':
        return {
          title: 'Document Master',
          count: documentsList.length,
          scopeTitle: 'Active Scope: Document Master',
          scopeDesc: 'Mandatory and optional claims documentation, original copies verification, and digital allowances.',
          btnText: 'Register Document',
          placeholder: 'Search documents by code or name...'
        };
      case 'limitTypes':
        return {
          title: 'Limit Type Master',
          count: limitTypesList.length,
          scopeTitle: 'Active Scope: Limit Type Master',
          scopeDesc: 'Core limit type mappings representing sum insured, actuals, percentages, and capping classifications.',
          btnText: 'Register Limit Type',
          placeholder: 'Search limit types by code or meaning...'
        };
      case 'limitUnits':
        return {
          title: 'Limit Unit Master',
          count: limitUnitsList.length,
          scopeTitle: 'Active Scope: Limit Unit Master',
          scopeDesc: 'Core limit unit mappings representing standard currencies, ratios, and temporal intervals.',
          btnText: 'Register Limit Unit',
          placeholder: 'Search limit units by code or meaning...'
        };
      case 'limitBasis':
        return {
          title: 'Limit Basis Master',
          count: limitBasisList.length,
          scopeTitle: 'Active Scope: Limit Basis Master',
          scopeDesc: 'Core limit basis mappings representing individual, family floater, and coverage/policy period capping rules.',
          btnText: 'Register Limit Basis',
          placeholder: 'Search limit bases by code or meaning...'
        };
      case 'siMaster':
        return {
          title: 'SI Master',
          count: siMasterList.length,
          scopeTitle: 'Active Scope: SI Master',
          scopeDesc: 'Core Sum Insured (SI) master representing individual, family floater, top-up, and loyalty/bonus classifications.',
          btnText: 'Register Sum Insured',
          placeholder: 'Search sum insured elements by code or meaning...'
        };
      case 'eligibilityMaster':
        return {
          title: 'Eligibility Master',
          count: eligibilityMasterList.length,
          scopeTitle: 'Active Scope: Eligibility Master',
          scopeDesc: 'Sets enrollment eligibility classifications such as Employee, Spouse, Children, or Parents-in-law.',
          btnText: 'Register Eligibility',
          placeholder: 'Search eligibility elements by code or meaning...'
        };
    }
  }, [activeTab, coveragesList, documentsList, limitTypesList, limitUnitsList, limitBasisList, siMasterList, eligibilityMasterList]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let list = (() => {
      switch (activeTab) {
        // case 'coverages': return coveragesList;
        case 'documents': return documentsList;
        case 'limitTypes': return limitTypesList;
        case 'limitUnits': return limitUnitsList;
        case 'limitBasis': return limitBasisList;
        case 'siMaster': return siMasterList;
        case 'eligibilityMaster': return eligibilityMasterList;
        default: return [];
      }
    })();

    return list.filter(item => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemCategory = item.category || (item as any).type || 'General';
      const matchesCategory = selectedCategory === 'ALL' || itemCategory === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [activeTab, searchQuery, selectedCategory, selectedStatus, coveragesList, documentsList, limitTypesList, limitUnitsList, limitBasisList, siMasterList, eligibilityMasterList]);

  // Pagination Slice
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Edit / Add handler
  const handleOpenForm = (item?: any) => {
    setFormErrors({});
    if (item) {
      setIsEditMode(true);
      setEditId(item.id);
      setFormFields({
        code: item.code,
        name: item.name,
        category: item.category || '',
        description: item.description || '',
        status: item.status || 'Active',
        type: item.type || '',
        value: item.value || '',
        operator: item.operator || '',
        icd10: item.icd10 || '',
        applicableTo: item.applicableTo || '',
        months: item.months || '',
        clause: item.clause || '',
        waivable: item.waivable || 'Yes',
        rule: item.rule || '',
        applicable: item.applicable || '',
        mandatory: item.mandatory || 'Yes',
        originalRequired: item.originalRequired || 'No',
        digitalAllowed: item.digitalAllowed || 'Yes',
        applicableFor: item.applicableFor || ''
      });
    } else {
      setIsEditMode(false);
      setEditId(null);
      // Generate next automatic code code prefix as a fallback
      const prefixMap = {
        coverages: 'COV00',
        benefits: 'BEN00',
        limits: 'LIMIT0',
        diseases: 'DIS00',
        waiting: 'WAIT0',
        exclusions: 'EXCL0',
        clauses: 'CLAUSE0',
        documents: 'DOC0',
        limitTypes: 'LT_',
        limitBasis: 'LB_',
        siMaster: 'SI00',
        eligibilityMaster: 'ELGB00'
      };
      setFormFields({
        code: prefixMap[activeTab] ? prefixMap[activeTab] + Math.floor(Math.random() * 900 + 100) : '',
        name: '',
        category: '',
        description: '',
        status: 'Active',
        type: '',
        value: '',
        operator: '',
        icd10: '',
        applicableTo: '',
        months: '',
        clause: '',
        waivable: 'Yes',
        rule: '',
        applicable: '',
        mandatory: 'Yes',
        originalRequired: 'No',
        digitalAllowed: 'Yes',
        applicableFor: ''
      });
    }
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formFields.name.trim()) {
      errors.name = 'Item name is required';
    }
    if (!formFields.code.trim()) {
      errors.code = 'Registry code is required';
    } else if (/\s/.test(formFields.code)) {
      errors.code = 'Registry code must not contain spaces (use hyphens/underscores)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      id: editId || `${activeTab}-${Date.now()}`,
      code: formFields.code.toUpperCase(),
      name: formFields.name,
      category: formFields.category || (activeTab === 'limits' ? formFields.type : 'General'),
      description: formFields.description,
      status: formFields.status,
      type: formFields.type,
      value: formFields.value,
      operator: formFields.operator,
      icd10: formFields.icd10,
      applicableTo: formFields.applicableTo,
      months: formFields.months,
      clause: formFields.clause,
      waivable: formFields.waivable,
      rule: formFields.rule,
      applicable: formFields.applicable,
      mandatory: formFields.mandatory,
      originalRequired: formFields.originalRequired,
      digitalAllowed: formFields.digitalAllowed,
      applicableFor: formFields.applicableFor
    };

    if (isEditMode && editId) {
      // Edit
      const updateList = (list: any[]) => list.map(item => item.id === editId ? payload : item);
      switch (activeTab) {
        // case 'coverages': setCoveragesList(updateList); break;
        case 'documents': setDocumentsList(updateList); break;
        case 'limitTypes': setLimitTypesList(updateList); break;
        case 'limitUnits': setLimitUnitsList(updateList); break;
        case 'limitBasis': setLimitBasisList(updateList); break;
        case 'siMaster': setSiMasterList(updateList); break;
        case 'eligibilityMaster': setEligibilityMasterList(updateList); break;
      }
      setSuccessMessage(`Central ${tabMetadata?.title} master updated successfully!`);
    } else {
      // Add
      const addToList = (list: any[]) => [payload, ...list];
      switch (activeTab) {
        // case 'coverages': setCoveragesList(addToList); break;
        case 'documents': setDocumentsList(addToList); break;
        case 'limitTypes': setLimitTypesList(addToList); break;
        case 'limitUnits': setLimitUnitsList(addToList); break;
        case 'limitBasis': setLimitBasisList(addToList); break;
        case 'siMaster': setSiMasterList(addToList); break;
        case 'eligibilityMaster': setEligibilityMasterList(addToList); break;
      }
      setSuccessMessage(`New ${tabMetadata?.title} registered successfully in the central database.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Delete handler
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the central registry? All downstream configurations relying on this master might experience discrepancies.`)) {
      const deleteFromList = (list: any[]) => list.filter(item => item.id !== id);
      switch (activeTab) {
        // case 'coverages': setCoveragesList(deleteFromList); break;
        case 'documents': setDocumentsList(deleteFromList); break;
        case 'limitTypes': setLimitTypesList(deleteFromList); break;
        case 'limitUnits': setLimitUnitsList(deleteFromList); break;
        case 'limitBasis': setLimitBasisList(deleteFromList); break;
        case 'siMaster': setSiMasterList(deleteFromList); break;
        case 'eligibilityMaster': setEligibilityMasterList(deleteFromList); break;
      }
      setSuccessMessage(`Registry item removed successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Helper to color code category badges beautifully
  const getCategoryColor = (cat: string) => {
    const clean = (cat || '').toLowerCase();
    if (clean.includes('inpatient') || clean.includes('hospital')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-150';
    if (clean.includes('maternity')) return 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-150';
    if (clean.includes('dental')) return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-150';
    if (clean.includes('outpatient') || clean.includes('opd')) return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-150';
    if (clean.includes('vision') || clean.includes('eye')) return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-150';
    if (clean.includes('waiting') || clean.includes('initial')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-150';
    if (clean.includes('permanent')) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-150';
    if (clean.includes('clinical')) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-150';
    if (clean.includes('financial')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-150';
    if (clean.includes('legal')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-150';
    if (clean.includes('identity')) return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-150';
    if (clean.includes('claim')) return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-150';
    if (clean.includes('underwriting')) return 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 border-fuchsia-150';
    if (clean.includes('bank')) return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-150';
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200';
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4 pb-2 transition-colors duration-200" id="masters-view-container">
      
      {/* Header Block exactly as screenshot structure */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Master Dataset Management
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
              Define, structure, and organize the foundation rules, coverages, limits, and diseases.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Pills style exactly as screenshot layout (Sticky at the top to prevent overlapping on scroll) */}
      <div className="sticky top-0 z-20 -mt-4 pt-4 pb-2 mb-3 overflow-x-auto scroll-smooth bg-zinc-50 dark:bg-zinc-950 -mx-4 px-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
        <div className="flex gap-2">
          {(['documents', 'limitTypes', 'limitUnits', 'limitBasis', 'siMaster', 'eligibilityMaster'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = (() => {
              switch (tab) {
                // case 'coverages': return coveragesList.length;
                case 'documents': return documentsList.length;
                case 'limitTypes': return limitTypesList.length;
                case 'limitUnits': return limitUnitsList.length;
                case 'limitBasis': return limitBasisList.length;
                case 'siMaster': return siMasterList.length;
                case 'eligibilityMaster': return eligibilityMasterList.length;
              }
            })();

            const label = (() => {
              switch (tab) {
                // case 'coverages': return 'Coverage Master';
                case 'documents': return 'Document Master';
                case 'limitTypes': return 'Limit Type Master';
                case 'limitUnits': return 'Limit Unit Master';
                case 'limitBasis': return 'Limit Basis Master';
                case 'siMaster': return 'SI Master';
                case 'eligibilityMaster': return 'Eligibility Master';
              }
            })();

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700/80'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Scope Banner Block */}
      <div className="mb-3 p-2 px-3 rounded-xl border border-indigo-100/30 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/10 flex items-start gap-3">
        <div className="p-1 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-[11px] font-extrabold text-indigo-950 dark:text-indigo-200">
            {tabMetadata?.scopeTitle}
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
            {tabMetadata?.scopeDesc}
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-3 p-2 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Dataset Card Container */}
      <div className={`rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200/80'} shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col flex-1 min-h-0`}>
        
        {/* Controls Bar */}
        <div className="p-2.5 px-4 border-b border-zinc-150 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder={tabMetadata?.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-1.5 text-xs font-medium rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-250 text-zinc-700'
                }`}
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs font-bold rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-250 text-zinc-700'
                }`}
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs font-bold rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-250 text-zinc-700'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Trigger Configure Button */}
          <button
            onClick={() => handleOpenForm()}
            className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            <span>{tabMetadata?.btnText}</span>
          </button>
        </div>

        {/* Dataset Table */}
        <div className="overflow-auto flex-1 min-h-0 scroll-smooth border-t border-zinc-200/60 dark:border-zinc-800/60">
          <table className="w-full text-left border-collapse relative [&_td]:!py-2.5 [&_th]:!py-2 [&_td]:!px-5 [&_th]:!px-5 [&_td]:text-xs [&_th]:text-[10px]">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b dark:border-zinc-800 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                {/* Headers based on Active Tab */}
                {/* {activeTab === 'coverages' && (
                  <>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Code</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Name</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Category</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Description</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Status</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-right">Actions</th>
                  </>
                )} */}

                {activeTab === 'documents' && (
                  <>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Doc ID / Code</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Document Name</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Document Category</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-center">Mandatory</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-center">Original Req.</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-center">Digital Allowed</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Applicable For</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Remarks</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Status</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-right">Actions</th>
                  </>
                )}

                {(activeTab === 'limitTypes' || activeTab === 'limitUnits' || activeTab === 'limitBasis' || activeTab === 'siMaster' || activeTab === 'eligibilityMaster') && (
                  <>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Code</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">
                      {activeTab === 'limitUnits' ? 'Unit' : 'Meaning / Name'}
                    </th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4">Status</th>
                    <th className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-6 py-4 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                      <Database className="h-9 w-9 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                      <span className="font-extrabold text-zinc-700 dark:text-zinc-300 text-sm">No Registry Records Found</span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                        We couldn't find any master registry records matching your query or active filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-150 ${
                      index % 2 === 0
                        ? isDark ? 'bg-zinc-900/10 hover:bg-zinc-850/30' : 'bg-white hover:bg-zinc-50'
                        : isDark ? 'bg-zinc-900/50 hover:bg-zinc-850/50' : 'bg-zinc-50/70 hover:bg-zinc-100/80'
                    }`}
                  >
                    {/* Row mapping depends on active tab */}
                    {activeTab === 'coverages' && (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 font-mono text-[11px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                            {row.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{row.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-zinc-100 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/80">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-sm truncate" title={row.description}>
                          {row.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            row.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'documents' && (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 font-mono text-[11px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                            {row.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{row.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-zinc-100 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/80">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                            row.mandatory === 'Y' || row.mandatory === 'Yes'
                              ? 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40'
                              : row.mandatory === 'N' || row.mandatory === 'No'
                              ? 'bg-zinc-100 text-zinc-500 border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/40'
                              : 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40'
                          }`}>
                            {row.mandatory}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            row.originalRequired === 'Y' || row.originalRequired === 'Yes'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/40'
                          }`}>
                            {row.originalRequired || 'N'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            row.digitalAllowed === 'Y' || row.digitalAllowed === 'Yes'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/40'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/40'
                          }`}>
                            {row.digitalAllowed || 'Y'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{row.applicableFor}</td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate" title={row.description}>
                          {row.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            row.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {(activeTab === 'limitTypes' || activeTab === 'limitUnits' || activeTab === 'limitBasis' || activeTab === 'siMaster' || activeTab === 'eligibilityMaster') && (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 font-mono text-[11px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                            {row.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{row.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            row.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Standard Actions Row exact matching design */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenForm(row)}
                          className="text-[12px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row.id, row.name)}
                          className="text-[12px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dataset Pagination Footer */}
        <div className={`p-2 px-4 border-t border-zinc-150 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold ${
          isDark ? 'bg-zinc-900/20 text-zinc-400' : 'bg-zinc-50/50 text-zinc-500'
        }`}>
          <div>
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600'
                  : isDark ? 'border-zinc-850 hover:bg-zinc-800 text-zinc-200' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : isDark
                      ? 'text-zinc-400 hover:bg-zinc-800'
                      : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600'
                  : isDark ? 'border-zinc-850 hover:bg-zinc-800 text-zinc-200' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Dataset Configure Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden animate-slide-up ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
          }`}>
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">
                  {isEditMode ? `Modify Central ${tabMetadata?.title} Record` : tabMetadata?.btnText}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  Add or edit reference metadata directly in the central system tables.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {activeTab === 'coverages' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Coverage Code */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Coverage Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. COV011"
                        value={formFields.code}
                        onChange={(e) => setFormFields({ ...formFields, code: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                          formErrors.code
                            ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                            : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      />
                      {formErrors.code && (
                        <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.code}
                        </span>
                      )}
                    </div>

                    {/* Category Group */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Category Group
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Inpatient, Pre-Post, Day Care"
                        value={formFields.category}
                        onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Coverage Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Coverage Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hospitalization"
                      value={formFields.name}
                      onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.name
                          ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                          : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Detailed Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Detailed Registry Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide full clinical, financial, or operational descriptions..."
                      value={formFields.description}
                      onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                  </div>

                  {/* Operational Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Operational Status
                    </label>
                    <select
                      value={formFields.status}
                      onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Code */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Document Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DOC001"
                        value={formFields.code}
                        onChange={(e) => setFormFields({ ...formFields, code: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                          formErrors.code
                            ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                            : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      />
                      {formErrors.code && (
                        <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.code}
                        </span>
                      )}
                    </div>

                    {/* Document Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Document Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Claim, Identity, Clinical"
                        value={formFields.category}
                        onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Document Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Document Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Claim Form"
                      value={formFields.name}
                      onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.name
                          ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                          : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Mandatory Status */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Mandatory Status
                      </label>
                      <select
                        value={formFields.mandatory}
                        onChange={(e) => setFormFields({ ...formFields, mandatory: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <option value="Y">Y (Yes)</option>
                        <option value="N">N (No)</option>
                        <option value="Conditional">Conditional</option>
                      </select>
                    </div>

                    {/* Original Required */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Original Required
                      </label>
                      <select
                        value={formFields.originalRequired}
                        onChange={(e) => setFormFields({ ...formFields, originalRequired: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <option value="Y">Y (Yes)</option>
                        <option value="N">N (No)</option>
                      </select>
                    </div>

                    {/* Digital Allowed */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Digital Copy Allowed
                      </label>
                      <select
                        value={formFields.digitalAllowed}
                        onChange={(e) => setFormFields({ ...formFields, digitalAllowed: e.target.value })}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <option value="Y">Y (Yes)</option>
                        <option value="N">N (No)</option>
                      </select>
                    </div>
                  </div>

                  {/* Applicable For */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Applicable For
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All Claims, Cashless & Reimbursement, Hospitalization"
                      value={formFields.applicableFor}
                      onChange={(e) => setFormFields({ ...formFields, applicableFor: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                  </div>

                  {/* Remarks (Description) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Remarks / Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Mandatory Signed by insured"
                      value={formFields.description}
                      onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                  </div>

                  {/* Operational Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Operational Status
                    </label>
                    <select
                      value={formFields.status}
                      onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab !== 'coverages' && activeTab !== 'documents' && (
                <div className="space-y-4">
                  {/* Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {activeTab === 'limitTypes' ? 'Limit Type Code' : activeTab === 'limitUnits' ? 'Limit Unit Code' : activeTab === 'limitBasis' ? 'Limit Basis Code' : activeTab === 'siMaster' ? 'SI Code' : 'Eligibility Code'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={activeTab === 'limitTypes' ? "e.g. SI" : activeTab === 'limitUnits' ? "e.g. INR" : activeTab === 'limitBasis' ? "e.g. IND" : activeTab === 'siMaster' ? "e.g. SI001" : "e.g. ELGB001"}
                      value={formFields.code}
                      onChange={(e) => setFormFields({ ...formFields, code: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.code
                          ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                          : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                    {formErrors.code && (
                      <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.code}
                      </span>
                    )}
                  </div>

                  {/* Meaning / Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {activeTab === 'limitUnits' ? 'Unit / Symbol' : 'Meaning / Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={activeTab === 'limitTypes' ? "e.g. Sum Insured" : activeTab === 'limitUnits' ? "e.g. Days" : activeTab === 'limitBasis' ? "e.g. Individual" : activeTab === 'siMaster' ? "e.g. Individual SI" : "e.g. Employee"}
                      value={formFields.name}
                      onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.name
                          ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-100'
                          : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Operational Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Operational Status
                    </label>
                    <select
                      value={formFields.status}
                      onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md cursor-pointer"
                >
                  {isEditMode ? 'Save Changes' : 'Register central master'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
