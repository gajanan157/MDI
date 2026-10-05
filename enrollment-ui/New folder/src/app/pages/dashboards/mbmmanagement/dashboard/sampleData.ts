export const sampleData = {
  $schema: "http://json-schema.org/draft-07/schema#",
  product_version: {
    version_code: "NIAHLGP21285V022021",
    effective_from: "2020-10-01",
    effective_to: "2021-09-30",
  },
  policy_metadata: {
    insurance_company_name: "THE NEW INDIA ASSURANCE CO. LTD",
    product_name: "GROUP MEDICLAIM POLICY FOR WORKERS",
    product_type: "Group Health Insurance",
    policy_category: "Indemnity",
    uin: "NIAHLGP21285V022021",
    irda_file_number: "NIAHLGP21285V022021",
    geographical_scope: "India",
    currency: "INR",
    sources: [
      {
        page_number: 1,
        snippet:
          "GROUP MEDICLAIM POLICY FOR WORKERS\nTHE NEW INDIA ASSURANCE CO. LTD\nRegd. & Head Office: 87, M.G. Road, Fort, Mumbai – 400 001",
      },
    ],
  },
  policy_schedule: {
    sum_insured: {
      limit_type: "Variable",
      text_description: "As designated in the Schedule hereto",
      sources: [
        {
          page_number: 1,
          snippet:
            "Whereas Insured designated in the Schedule hereto has by a proposal and declaration dated as stated in the Schedule...",
        },
      ],
    },
    tables: [
      {
        table_id: "payment_schedule_specified_diseases",
        title:
          "SCHEDULE OF PAYMENT FOR SPECIFIED DISEAES / Name of Illness / Operation - Maximum Charges",
        headers: [
          "Name of Illness / Operation",
          "Maximum Charges Inclusive of Room / ICU / OT Charges / Surgeons. Anesthetist, doctors fees, medicines, internal appliances and the charges incurred during hospitalization period. (Rs)",
        ],
        rows: [
          {
            row_number: 1,
            cells: ["Angiography", "12,000/-"],
          },
          {
            row_number: 2,
            cells: ["Appendicectomy", "16,200/-"],
          },
          {
            row_number: 3,
            cells: ["Arthroscopy", "10,800/-"],
          },
          {
            row_number: 4,
            cells: ["Cataract with imported foldable lens", "10,800/-"],
          },
          {
            row_number: 5,
            cells: ["Cheolecystectomy", "18,000/-"],
          },
          {
            row_number: 6,
            cells: ["Exploratory Laprotomy", "15,000/-"],
          },
          {
            row_number: 7,
            cells: ["Fissurectomy", "9,000/-"],
          },
          {
            row_number: 8,
            cells: ["Fistulectomy", "10,800/-"],
          },
          {
            row_number: 9,
            cells: ["Haemorrhoidectomy", "8,100/-"],
          },
          {
            row_number: 10,
            cells: ["Hernia-Inguinal", "16,200/-"],
          },
          {
            row_number: 11,
            cells: ["Hernia- Ventral/Incisional", "19,800/-"],
          },
          {
            row_number: 12,
            cells: ["Hysterectomy", "22,500/-"],
          },
          {
            row_number: 13,
            cells: ["Kidney stone/lithotripsy", "13,500/-"],
          },
          {
            row_number: 14,
            cells: ["Mastectomy (Radical)", "36,000/-"],
          },
          {
            row_number: 15,
            cells: ["PID-Disectomy", "31,500/-"],
          },
          {
            row_number: 16,
            cells: ["Septoplasty", "9,000/-"],
          },
          {
            row_number: 17,
            cells: ["Tonsillectomy", "7,200/-"],
          },
          {
            row_number: 18,
            cells: ["TURP", "18,000/-"],
          },
          {
            row_number: 19,
            cells: ["Tympanoplasty", "13,500/-"],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet:
              "Name of Illness / Operation Maximum Charges Inclusive of Room / ICU / OT Charges / Surgeons. Anesthetist, doctors fees, medicines, internal appliances and the charges incurred during hospitalization period. (Rs)",
          },
        ],
      },
      {
        table_id: "per_day_charges_limit",
        title:
          "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less",
        headers: [
          "PER DAY CHARGES",
          "FOR SI 50K",
          "FOR SI 75K",
          "FOR SI 100K",
          "FOR SI 200K",
        ],
        rows: [
          {
            row_number: 1,
            cells: [
              "Room rent (inclusive of nursing/treatment charges)",
              "450",
              "450",
              "1000",
              "2000",
            ],
          },
          {
            row_number: 2,
            cells: [
              "Minor surgery/Day care room rent per day",
              "450",
              "450",
              "1000",
              "2000",
            ],
          },
          {
            row_number: 3,
            cells: [
              "Operation Theatre Charges",
              "1260",
              "1260",
              "1600",
              "1800",
            ],
          },
          {
            row_number: 4,
            cells: ["Anesthesia", "630", "630", "800", "950"],
          },
          {
            row_number: 5,
            cells: ["Anesthetist Fees", "945", "945", "1200", "1400"],
          },
          {
            row_number: 6,
            cells: ["Surgeon fees", "3150", "3150", "3500", "4300"],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet:
              "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less:\nPER DAY CHARGES FOR SI 50K FOR SI 75K FOR SI 100K FOR SI 200K",
          },
        ],
      },
      {
        table_id: "intermediate_surgery_charges",
        title: "INTERMIDIATE SURGERY CHARGES",
        headers: [
          "INTERMIDIATE SURGERY",
          "FOR SI 50K",
          "FOR SI 75K",
          "FOR SI 100K",
          "FOR SI 200K",
        ],
        rows: [
          {
            row_number: 1,
            cells: ["Room rent", "450", "450", "1000", "2000"],
          },
          {
            row_number: 2,
            cells: [
              "Operation Theatre Charges",
              "1764",
              "1764",
              "2200",
              "2500",
            ],
          },
          {
            row_number: 3,
            cells: ["Anesthesia", "882", "882", "1100", "1300"],
          },
          {
            row_number: 4,
            cells: ["Anesthetist Fees", "1323", "1323", "1600", "1900"],
          },
          {
            row_number: 5,
            cells: ["Surgeon fees", "4410", "4410", "5400", "6300"],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet: "INTERMIDIATE SURGERY\nRoom rent 450 450 1000 2000",
          },
        ],
      },
      {
        table_id: "major_surgery_charges",
        title: "MAJOR SURGERY CHARGES",
        headers: [
          "MAJOR SURGERY",
          "FOR SI 50K",
          "FOR SI 75K",
          "FOR SI 100K",
          "FOR SI 200K",
        ],
        rows: [
          {
            row_number: 1,
            cells: ["Room rent", "450", "450", "1000", "2000"],
          },
          {
            row_number: 2,
            cells: [
              "Operation Theatre Charges",
              "2520",
              "2520",
              "3200",
              "3700",
            ],
          },
          {
            row_number: 3,
            cells: ["Anesthesia", "1260", "1260", "1600", "1900"],
          },
          {
            row_number: 4,
            cells: ["Anesthetist Fees", "1890", "1890", "2300", "2800"],
          },
          {
            row_number: 5,
            cells: ["Surgeon fees", "6300", "6300", "7500", "9000"],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet: "MAJOR SURGERY\nRoom rent 450 450 1000 2000",
          },
        ],
      },
      {
        table_id: "supra_major_surgery_charges",
        title: "SUPRA MAJOR SURGERY CHARGES",
        headers: [
          "SUPRA MAJOR SURGERY",
          "FOR SI 50K",
          "FOR SI 75K",
          "FOR SI 100K",
          "FOR SI 200K",
        ],
        rows: [
          {
            row_number: 1,
            cells: ["Room rent", "450", "450", "1000", "2000"],
          },
          {
            row_number: 2,
            cells: [
              "Operation Theatre Charges",
              "5040",
              "5040",
              "6300",
              "7500",
            ],
          },
          {
            row_number: 3,
            cells: ["Anesthesia", "2520", "2520", "3100", "3700"],
          },
          {
            row_number: 4,
            cells: ["Anesthetist Fees", "3780", "3780", "4700", "5500"],
          },
          {
            row_number: 5,
            cells: ["Surgeon fees", "12600", "12600", "15000", "17000"],
          },
          {
            row_number: 6,
            cells: [
              "ICU Charges (per day with all intensive care infrastructure & facilities)",
              "1800",
              "1800",
              "2250",
              "2700",
            ],
          },
          {
            row_number: 7,
            cells: ["Ventilator Charges (Per day)", "450", "450", "600", "800"],
          },
          {
            row_number: 8,
            cells: [
              "Visit Charges (Per day irrespective of number of visits)",
              "360",
              "360",
              "500",
              "600",
            ],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet: "SUPRA MAJOR SURGERY\nRoom rent 450 450 1000 2000",
          },
        ],
      },
    ],
    sources: [
      {
        page_number: 1,
        snippet:
          "Schedule hereto has by a proposal and declaration dated as stated in the Schedule...",
      },
    ],
  },
  definitions: [
    {
      term: "ACCIDENT",
      definition:
        "is a sudden, unforeseen and involuntary event caused by external, visible and violent means.",
      sources: [
        {
          page_number: 4,
          snippet:
            "ACCIDENT is a sudden, unforeseen and involuntary event caused by external, visible and violent means.",
        },
      ],
    },
    {
      term: "AGE",
      definition:
        "means age of the Insured person on last birthday as on date of commencement of the Policy.",
      sources: [
        {
          page_number: 4,
          snippet:
            "AGE means age of the Insured person on last birthday as on date of commencement of the Policy.",
        },
      ],
    },
    {
      term: "ANY ONE ILLNESS",
      definition:
        "means continuous Period of illness and it includes relapse within 45 days from the date of last consultation with the Hospital where treatment may have been taken.",
      sources: [
        {
          page_number: 4,
          snippet:
            "ANY ONE ILLNESS means continuous Period of illness and it includes relapse within 45 days from the date of last consultation with the Hospital where treatment may have been taken.",
        },
      ],
    },
    {
      term: "AYUSH TREATMENT",
      definition:
        "refers to Hospitalisation treatments given under Ayurveda, Yoga and Naturopathy, Unani, Siddha and Homeopathy systems.",
      sources: [
        {
          page_number: 5,
          snippet:
            "AYUSH TREATMENT refers to Hospitalisation treatments given under Ayurveda, Yoga and Naturopathy, Unani, Siddha and Homeopathy systems.",
        },
      ],
    },
    {
      term: "AYUSH HOSPITAL",
      definition:
        "is a Healthcare facility wherein medical / surgical / para-surgical treatment procedures and interventions are carried out by AYUSH Medical Practitioner(s) comprising of any of the following: a. Central or State Government AYUSH Hospital or b. Teaching hospital attached to AYUSH College recognized by the Central Government / Central Council of Indian Medicine / Central Council for Homeopathy; or c. AYUSH Hospital, standalone or co-located with in-patient healthcare facility of any recognized system of medicine, registered with the local authorities, wherever applicable, and is under the supervision of a qualified registered AYUSH Medical Practitioner and must comply with all the following criterion: i. Having at least 5 in-patient beds; ii. Having qualified AYUSH Medical Practitioner in charge round the clock; iii. Having dedicated AYUSH therapy sections as required and/or has equipped operation theatre where surgical procedures are to be carried out; iv. Maintaining daily records of the patients and making them accessible to the insurance company’s authorized representative.",
      sources: [
        {
          page_number: 5,
          snippet:
            "AYUSH HOSPITAL is a Healthcare facility wherein medical / surgical / para-surgical treatment procedures and interventions are carried out by AYUSH Medical Practitioner(s)",
        },
      ],
    },
    {
      term: "AYUSH DAY CARE CENTRE",
      definition:
        "means and includes Community Health Centre (CHC), Primary Health Centre (PHC), Dispensary, Clinic, Polyclinic or any such health centre which is registered with the local authorities, wherever applicable and having facilities for carrying out treatment procedures and medical or surgical/para-surgical interventions or both under the supervision of registered AYUSH Medical Practitioner(s) on day care basis without in-patient services and must comply with all the following criterion: i. Having qualified registered AYUSH Medical Practitioner(s) in charge; ii. Having dedicated AYUSH therapy sections as required and/or has equipped operation theatre where surgical procedures are to be carried out; iii. Maintaining daily records of the patients and making them accessible to the insurance company’s authorized representative.",
      sources: [
        {
          page_number: 5,
          snippet:
            "AYUSH DAY CARE CENTRE means and includes Community Health Centre (CHC), Primary Health Centre (PHC), Dispensary, Clinic, Polyclinic or any such health centre",
        },
      ],
    },
    {
      term: "BREAK IN POLICY",
      definition:
        "means the period of gap that occurs at the end of the existing policy term, when the premium due for renewal on a given policy is not paid on or before the premium renewal date or within 30 days thereof.",
      sources: [
        {
          page_number: 5,
          snippet:
            "BREAK IN POLICY means the period of gap that occurs at the end of the existing policy term, when the premium due for renewal on a given policy is not paid on or before the premium renewal date or within 30 days thereof.",
        },
      ],
    },
    {
      term: "CASHLESS FACILITY",
      definition:
        "means a facility extended by the insurer to the Insured where the payments, of the costs of treatment undergone by the Insured in accordance with the policy terms and conditions, are directly made to the network provider by the Company to the extent pre-authorization approved.",
      sources: [
        {
          page_number: 5,
          snippet:
            "CASHLESS FACILITY means a facility extended by the insurer to the Insured where the payments, of the costs of treatment undergone by the Insured in accordance with the policy terms and conditions, are directly made to the network provider by the Company to the extent pre-authorization approved.",
        },
      ],
    },
    {
      term: "CONDITION PRECEDENT",
      definition:
        "means a policy term or condition upon which the Company's liability under the policy is conditional upon.",
      sources: [
        {
          page_number: 5,
          snippet:
            "CONDITION PRECEDENT means a policy term or condition upon which the Company's liability under the policy is conditional upon.",
        },
      ],
    },
    {
      term: "CONGENITAL ANOMALY",
      definition:
        "refers to a condition(s) which is present since birth, and which is abnormal with reference to form, structure or position. i. CONGENITAL INTERNAL ANOMALY means a Congenital Anomaly which is not in the visible and accessible parts of the body. ii. CONGENITAL EXTERNAL ANOMALY means a Congenital Anomaly which is in the visible and accessible parts of the body",
      sources: [
        {
          page_number: 6,
          snippet:
            "CONGENITAL ANOMALY refers to a condition(s) which is present since birth, and which is abnormal with reference to form, structure or position.",
        },
      ],
    },
    {
      term: "DAY CARE CENTRE",
      definition:
        "A day care centre means any institution established for day care treatment of illness and/or injuries or a medical setup within a hospital and which has been registered with the local authorities, wherever applicable, and is under supervision of a registered and qualified Medical Practitioner AND must comply with all minimum criteria as under: - Has qualified nursing staff under its employment; - Has qualified medical practitioner/s in charge; - Has a fully equipped operation theatre of its own where surgical procedures are carried out; - Maintains daily records of patients and will make these accessible to the insurance company’s authorized personnel.",
      sources: [
        {
          page_number: 6,
          snippet:
            "DAY CARE CENTRE: A day care centre means any institution established for day care treatment of illness and/or injuries or a medical setup within a hospital",
        },
      ],
    },
    {
      term: "DAY CARE TREATMENT",
      definition:
        "refers to medical treatment or Surgery which are: - Undertaken under General or Local Anesthesia in a Hospital / Day Care Centre in less than 24 hours because of technological advancement, and - Which would have otherwise required a Hospitalization of more than 24 hours. Treatment normally taken on an out-patient basis is not included in the scope of this definition.",
      sources: [
        {
          page_number: 6,
          snippet:
            "DAY CARE TREATMENT refers to medical treatment or Surgery which are: - Undertaken under General or Local Anesthesia in a Hospital / Day Care Centre in less than 24 hours",
        },
      ],
    },
    {
      term: "DENTAL TREATMENT",
      definition:
        "is treatment carried out by a dental practitioner including examinations, fillings (where appropriate), crowns, extractions and surgery excluding any form of cosmetic surgery/implants.",
      sources: [
        {
          page_number: 6,
          snippet:
            "DENTAL TREATMENT is treatment carried out by a dental practitioner including examinations, fillings (where appropriate), crowns, extractions and surgery excluding any form of cosmetic surgery/implants.",
        },
      ],
    },
    {
      term: "DISCLOSURE TO INFORMATION NORM",
      definition:
        "The policy shall be void and all premium paid thereon shall be forfeited to Us in the event of misrepresentation, mis-description or non-disclosure of any material fact.",
      sources: [
        {
          page_number: 6,
          snippet:
            "DISCLOSURE TO INFORMATION NORM: The policy shall be void and all premium paid thereon shall be forfeited to Us in the event of misrepresentation, mis-description or non-disclosure of any material fact.",
        },
      ],
    },
    {
      term: "EMERGENCY CARE",
      definition:
        "means management for an Illness or Injury which results in symptoms which occur suddenly and unexpectedly, and requires immediate care by a medical practitioner to prevent death or serious long-term impairment of the Insured Person’s health.",
      sources: [
        {
          page_number: 6,
          snippet:
            "EMERGENCY CARE means management for an Illness or Injury which results in symptoms which occur suddenly and unexpectedly, and requires immediate care by a medical practitioner",
        },
      ],
    },
    {
      term: "GRACE PERIOD",
      definition:
        "means specified period of time immediately following the premium due date during which a payment can be made to renew or continue the Policy in force without loss of continuity benefits such as waiting period and coverage of pre-existing diseases. Coverage is not available for the period for which no premium is received.",
      sources: [
        {
          page_number: 6,
          snippet:
            "GRACE PERIOD means specified period of time immediately following the premium due date during which a payment can be made to renew or continue the Policy in force without loss of continuity benefits",
        },
      ],
    },
    {
      term: "HOSPITAL",
      definition:
        "means any institution established for Inpatient Care and Day Care Treatment of Illness or Injury and which has been registered as a Hospital with the local authorities under the Clinical Establishment (Registration and Regulation) Act, 2010 or under the enactments specified under the schedule of Section 56(1) of the said act OR complies with all minimum criteria as under: - has at least 10 inpatient beds, in those towns having a population of less than 10,00,000 and 15 inpatient beds in all other places; - has qualified nursing staff under its employment round the clock; - has qualified medical practitioner (s) in charge round the clock; - has a fully equipped operation theatre of its own where surgical procedures are carried out - maintains daily records of patients and will make these accessible to the Insurance company’s authorized personnel.",
      sources: [
        {
          page_number: 6,
          snippet:
            "HOSPITAL means any institution established for Inpatient Care and Day Care Treatment of Illness or Injury and which has been registered as a Hospital",
        },
      ],
    },
    {
      term: "HOSPITALISATION",
      definition:
        "means admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments, where such admission could be for a period of less than 24consecutive hours. [List of procedures follows in 3.18 including: Anti-Rabies Vaccination, Hysterectomy, Appendectomy, Hernia repair, Coronary Angiography, Lithotripsy, Coronary Angioplasty, Parenteral Chemotherapy, Dental surgery following an Accident, Piles / Fistula, Dilatation & Curettage (D & C) of Cervix, Prostate, Eye surgery, Radiotherapy, Fracture /dislocation excluding hairline fracture, Sinusitis, Gastrointestinal Tract system, Stone in Gall Bladder, Pancreas, and Bile Duct, Haemo-Dialysis, Tonsillectomy, Hydrocele, Urinary Tract System OR any other Surgeries / Procedures agreed by TPA/Company which require less than 24 hours hospitalization due to advancement in Medical Technology.]",
      sources: [
        {
          page_number: 7,
          snippet:
            "HOSPITALISATION means admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments",
        },
      ],
    },
    {
      term: "ILLNESS",
      definition:
        "means a sickness or a disease or pathological condition leading to the impairment of normal physiological function which manifests itself during the Policy Period and requires medical treatment.",
      sources: [
        {
          page_number: 7,
          snippet:
            "ILLNESS means a sickness or a disease or pathological condition leading to the impairment of normal physiological function which manifests itself during the Policy Period and requires medical treatment.",
        },
      ],
    },
    {
      term: "INJURY",
      definition:
        "means accidental physical bodily harm excluding illness or disease solely and directly caused by external, violent and visible and evident means which is verified and certified by a Medical Practitioner.",
      sources: [
        {
          page_number: 7,
          snippet:
            "INJURY means accidental physical bodily harm excluding illness or disease solely and directly caused by external, violent and visible and evident means which is verified and certified by a Medical Practitioner.",
        },
      ],
    },
    {
      term: "INPATIENT CARE",
      definition:
        "means treatment for which the Insured Person has to stay in a Hospital for more than 24 hours for a covered event.",
      sources: [
        {
          page_number: 8,
          snippet:
            "INPATIENT CARE means treatment for which the Insured Person has to stay in a Hospital for more than 24 hours for a covered event.",
        },
      ],
    },
    {
      term: "INSURED PERSON",
      definition: "means person(s) named in the schedule of the Policy.",
      sources: [
        {
          page_number: 8,
          snippet:
            "INSURED PERSON means person(s) named in the schedule of the Policy.",
        },
      ],
    },
    {
      term: "INTENSIVE CARE UNIT (ICU)",
      definition:
        "means an identified section, ward or wing of a Hospital which is under the constant supervision of a dedicated Medical Practitioner, and which is specially equipped for the continuous monitoring and treatment of patients who are in a critical condition, or require life support facilities and where the level of care and supervision is considerably more sophisticated and intensive than in the ordinary and other wards.",
      sources: [
        {
          page_number: 8,
          snippet:
            "INTENSIVE CARE UNIT (ICU) means an identified section, ward or wing of a Hospital which is under the constant supervision of a dedicated Medical Practitioner",
        },
      ],
    },
    {
      term: "ICU (INTENSIVE CARE UNIT) CHARGES",
      definition:
        "means the amount charged by a Hospital towards ICU expenses on a per day basis which shall include the expenses for ICU bed, general medical support services provided to any ICU patient including monitoring devices, critical care nursing and intensivist charges.",
      sources: [
        {
          page_number: 8,
          snippet:
            "ICU (INTENSIVE CARE UNIT) CHARGES means the amount charged by a Hospital towards ICU expenses on a per day basis which shall include the expenses for ICU bed",
        },
      ],
    },
    {
      term: "MEDICAL ADVICE",
      definition:
        "means any consultation or advice from a Medical Practitioner including the issue of any prescription or repeat prescription.",
      sources: [
        {
          page_number: 8,
          snippet:
            "MEDICAL ADVICE means any consultation or advice from a Medical Practitioner including the issue of any prescription or repeat prescription.",
        },
      ],
    },
    {
      term: "MEDICAL EXPENSES",
      definition:
        "means those expenses that an Insured Person has necessarily and actually incurred for medical treatment on account of Illness or Injury on the advice of a Medical Practitioner, as long as these are no more than would have been payable if the Insured Person had not been Insured and no more than other Hospitals or doctors in the same locality would have charged for the same medical treatment.",
      sources: [
        {
          page_number: 8,
          snippet:
            "MEDICAL EXPENSES means those expenses that an Insured Person has necessarily and actually incurred for medical treatment on account of Illness or Injury on the advice of a Medical Practitioner",
        },
      ],
    },
    {
      term: "MEDICALLY NECESSARY treatment",
      definition:
        "is defined as any treatment, tests, medication, or stay in Hospital or part of a stay in Hospital which - is required for the medical management of the Illness or Injury suffered by the Insured; - must not exceed the level of care necessary to provide safe, adequate and appropriate medical care in scope, duration, or intensity; - must have been prescribed by a Medical Practitioner; - must conform to the professional standards widely accepted in international medical practice or by the medical community in India.",
      sources: [
        {
          page_number: 8,
          snippet:
            "MEDICALLY NECESSARY treatment is defined as any treatment, tests, medication, or stay in Hospital or part of a stay in Hospital which",
        },
      ],
    },
    {
      term: "MEDICAL PRACTITIONER",
      definition:
        "means a person who holds a valid registration from the medical council of any state or Medical council of India or Council for Indian Medicine or for Homeopathy set up by the Government of India or a state Government and is thereby entitled to practice medicine within its jurisdiction; and is acting within the scope and jurisdiction of his license. Note: The Medical Practitioner should not be the insured or close family members.",
      sources: [
        {
          page_number: 8,
          snippet:
            "MEDICAL PRACTITIONER means a person who holds a valid registration from the medical council of any state or Medical council of India or Council for Indian Medicine",
        },
      ],
    },
    {
      term: "NETWORK HOSPITAL",
      definition:
        "means Hospitals enlisted by the Company, TPA or jointly by the Company and TPA to provide medical services to an Insured by a cashless facility.",
      sources: [
        {
          page_number: 9,
          snippet:
            "NETWORK HOSPITAL means Hospitals enlisted by the Company, TPA or jointly by the Company and TPA to provide medical services to an Insured by a cashless facility.",
        },
      ],
    },
    {
      term: "NON-NETWORK HOSPITAL",
      definition: "means any Hospital that is not part of the network.",
      sources: [
        {
          page_number: 9,
          snippet:
            "NON-NETWORK HOSPITAL means any Hospital that is not part of the network.",
        },
      ],
    },
    {
      term: "NOTIFICATION OF CLAIM",
      definition:
        "means the process of intimating a claim to the Company or TPA through any of the recognized modes of communication.",
      sources: [
        {
          page_number: 9,
          snippet:
            "NOTIFICATION OF CLAIM means the process of intimating a claim to the Company or TPA through any of the recognized modes of communication.",
        },
      ],
    },
    {
      term: "PRE-EXISTING DISEASE (PED)",
      definition:
        "means any condition, ailment, Injury or Illness a. That is/are diagnosed by a physician within 48 months prior to the effective date of the Policy issued by Us and its reinstatement or b. For which medical advice or treatment was recommended by, or received from, a physician within 48 months prior to the effective date of the Policy or its reinstatement.",
      sources: [
        {
          page_number: 9,
          snippet:
            "PRE-EXISTING DISEASE (PED) means any condition, ailment, Injury or Illness a. That is/are diagnosed by a physician within 48 months prior to the effective date of the Policy issued by Us",
        },
      ],
    },
    {
      term: "PRE-HOSPITALISATION MEDICAL EXPENSES",
      definition:
        "mean Medical Expenses incurred during the period preceding the Insured Person is Hospitalised, provided that: i. Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalization was required, and ii. The Inpatient Hospitalization claim for such Hospitalization is admissible by the Insurance Company.",
      sources: [
        {
          page_number: 9,
          snippet:
            "PRE-HOSPITALISATION MEDICAL EXPENSES mean Medical Expenses incurred during the period preceding the Insured Person is Hospitalised",
        },
      ],
    },
    {
      term: "POST-HOSPITALISATION MEDICAL EXPENSES",
      definition:
        "mean Medical Expenses incurred during the period immediately after the Insured Person is discharged from the hospital provided that: i. Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalisation was required, and ii. The Inpatient Hospitalisation claim for such Hospitalisation is admissible by the Insurance Company.",
      sources: [
        {
          page_number: 9,
          snippet:
            "POST-HOSPITALISATION MEDICAL EXPENSES mean Medical Expenses incurred during the period immediately after the Insured Person is discharged from the hospital provided that",
        },
      ],
    },
    {
      term: "POLICY",
      definition:
        "means these Policy wordings, the Policy Schedule and any applicable endorsements or extensions attaching to or forming part thereof. The Policy contains details of the extent of cover available to the Insured person, what is excluded from the cover and the terms & conditions on which the Policy is issued to The Insured person.",
      sources: [
        {
          page_number: 9,
          snippet:
            "POLICY means these Policy wordings, the Policy Schedule and any applicable endorsements or extensions attaching to or forming part thereof.",
        },
      ],
    },
    {
      term: "POLICY PERIOD",
      definition:
        "means period of one policy year as mentioned in the schedule for which the Policy is issued.",
      sources: [
        {
          page_number: 9,
          snippet:
            "POLICY PERIOD means period of one policy year as mentioned in the schedule for which the Policy is issued.",
        },
      ],
    },
    {
      term: "POLICY SCHEDULE",
      definition:
        "means the Policy Schedule attached to and forming part of Policy.",
      sources: [
        {
          page_number: 9,
          snippet:
            "POLICY SCHEDULE means the Policy Schedule attached to and forming part of Policy.",
        },
      ],
    },
    {
      term: "POLICY YEAR",
      definition:
        "means a period of twelve months beginning from the date of commencement of the policy period and ending on the last day of such twelve-month period. For the purpose of subsequent years, policy year shall mean a period of twelve months commencing from the end of the previous policy year and lapsing on the last day of such twelve-month period, till the policy period, as mentioned in the schedule.",
      sources: [
        {
          page_number: 9,
          snippet:
            "POLICY YEAR means a period of twelve months beginning from the date of commencement of the policy period and ending on the last day of such twelve-month period.",
        },
      ],
    },
    {
      term: "PREFERRED PROVIDER NETWORK (PPN)",
      definition:
        "means network providers in specific cities which have agreed to a cashless packaged pricing for specified planned procedures for Our policyholders. The list of planned procedures is available with Us / TPA and subject to amendment from time to time. Reimbursement of expenses incurred in PPN for the procedures (as listed under PPN package) shall be subject to the rates applicable to PPN package pricing.",
      sources: [
        {
          page_number: 9,
          snippet:
            "PREFERRED PROVIDER NETWORK (PPN) means network providers in specific cities which have agreed to a cashless packaged pricing for specified planned procedures for Our policyholders.",
        },
      ],
    },
    {
      term: "QUALIFIED NURSE",
      definition:
        "means a person who holds a valid registration from the Nursing Council of India or the Nursing Council of any state in India.",
      sources: [
        {
          page_number: 10,
          snippet:
            "QUALIFIED NURSE means a person who holds a valid registration from the Nursing Council of India or the Nursing Council of any state in India.",
        },
      ],
    },
    {
      term: "REASONABLE AND CUSTOMARY CHARGES",
      definition:
        "mean the charges for services or supplies, which are the standard charges for the specific provider and consistent with the prevailing charges in the geographical area for identical or similar services, taking into account the nature of the Illness / Injury involved.",
      sources: [
        {
          page_number: 10,
          snippet:
            "REASONABLE AND CUSTOMARY CHARGES mean the charges for services or supplies, which are the standard charges for the specific provider and consistent with the prevailing charges",
        },
      ],
    },
    {
      term: "RENEWAL",
      definition:
        "means the terms on which the contract of insurance can be renewed on mutual consent with a provision of grace period for treating the renewal continuous for the purpose of gaining credit for pre-existing diseases, time-bound exclusions and for all waiting periods.",
      sources: [
        {
          page_number: 10,
          snippet:
            "RENEWAL means the terms on which the contract of insurance can be renewed on mutual consent with a provision of grace period for treating the renewal continuous",
        },
      ],
    },
    {
      term: "ROOM RENT",
      definition:
        "means the amount charged by a Hospital for the occupancy of a bed per day (24 hours) basis and shall include associated medical expenses.",
      sources: [
        {
          page_number: 10,
          snippet:
            "ROOM RENT means the amount charged by a Hospital for the occupancy of a bed per day (24 hours) basis and shall include associated medical expenses.",
        },
      ],
    },
    {
      term: "SUB-LIMIT",
      definition:
        "means a cost sharing requirement under this policy in which We would not be liable to pay any amount in excess of the pre-defined limit.",
      sources: [
        {
          page_number: 10,
          snippet:
            "SUB-LIMIT means a cost sharing requirement under this policy in which We would not be liable to pay any amount in excess of the pre-defined limit.",
        },
      ],
    },
    {
      term: "SUM INSURED",
      definition:
        "means the pre-defined limit specified in the Policy Schedule. Sum Insured represents the maximum, total and cumulative liability for any and all claims made under the Policy, in respect of all Insured Persons during the Policy Year.",
      sources: [
        {
          page_number: 10,
          snippet:
            "SUM INSURED means the pre-defined limit specified in the Policy Schedule. Sum Insured represents the maximum, total and cumulative liability for any and all claims made under the Policy",
        },
      ],
    },
    {
      term: "SURGERY OR SURGICAL PROCEDURE",
      definition:
        "means manual and / or operative procedure (s) required for treatment of an illness or injury, correction of deformities and defects, diagnosis and cure of diseases, relief of suffering or prolongation of life, performed in a hospital or day care centre by a medical practitioner. 1. SUPRA MAJOR SURGERY: Surgery that involves operations on vital organs or expensive radical surgeries, which in normal course endangers the life of patient. 2. MAJOR SURGERY: any surgical procedure that requires anaesthesia or respiratory assistance. It involves openings into the great cavities of the body; Major Joint replacement, Major Multiple Fractures, all operations in the course of which hazards of severe haemorrhage are possible. 3. INTER MEDIATE SURGERY: Surgery involving the incision of deep fascia or deeper structures but not endangering the life of patient in normal circumstances. It may or may not be done in General Anaesthesia. 4. MINOR SURGERY: Surgical procedure that does not involve anaesthesia or respiratory assistance.",
      sources: [
        {
          page_number: 10,
          snippet:
            "SURGERY OR SURGICAL PROCEDURE means manual and / or operative procedure (s) required for treatment of an illness or injury, correction of deformities and defects",
        },
      ],
    },
    {
      term: "THIRD PARTY ADMINISTRATORS (TPA)",
      definition:
        "means a Company registered with the Authority, and engaged by an Insurer, for a fee or by whatever name called and as may be mentioned in the health services agreement, for providing health services.",
      sources: [
        {
          page_number: 10,
          snippet:
            "THIRD PARTY ADMINISTRATORS (TPA) means a Company registered with the Authority, and engaged by an Insurer, for a fee or by whatever name called",
        },
      ],
    },
    {
      term: "WAITING PERIOD",
      definition:
        "means a period from the inception of this Policy during which specified diseases / treatments are not covered. On completion of the period, diseases / treatments shall be covered provided the Policy has been continuously renewed without any break.",
      sources: [
        {
          page_number: 11,
          snippet:
            "WAITING PERIOD means a period from the inception of this Policy during which specified diseases / treatments are not covered. On completion of the period, diseases / treatments shall be covered provided the Policy has been continuously renewed without any break.",
        },
      ],
    },
  ],
  base_covers: {
    hospitalization: {
      covered: true,
      minimum_duration: {
        limit_type: "Variable",
        value: 24,
        unit: "Hours",
        text_description:
          "admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments, where such admission could be for a period of less than 24consecutive hours.",
        conditions: [
          {
            text: "admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments",
            type: "Restriction",
            sources: [
              {
                page_number: 7,
                snippet:
                  "HOSPITALISATION means admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 7,
            snippet:
              "HOSPITALISATION means admission in a Hospital for a minimum period of 24 in patient Care consecutive hours",
          },
        ],
      },
      description:
        "The Company undertakes that if during the period stated in the Schedule... any Insured Person shall contract any Illness or sustain any Injury... incur Medical Expenses / Surgery at any Hospital / Day Care Center as an Inpatient, the Company will pay to the Insured Person the amount of such expenses as good fall under different heads mentioned below",
      conditions: [
        {
          text: "Reasonably and Customarily, and Medically Necessarily incurred",
          type: "Restriction",
          sources: [
            {
              page_number: 1,
              snippet:
                "as are Reasonably and Customarily, and Medically Necessarily incurred thereof by or on behalf of such Insured Person.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "NOW THIS POLICY WITNESSES that subject to the terms, conditions, exclusions and definitions contained herein... the Company undertakes that if during the period stated in the Schedule",
        },
      ],
    },
    room_rent: {
      limit: {
        limit_type: "Actuals",
        actuals_basis: "Insurer_Norms",
        text_description:
          "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less. Per Day Charges depend on SI 50K/75K/100K/200K. For SI 50K/75K: Room rent 450. For SI 100K: 1000. For SI 200K: 2000.",
        conditions: [
          {
            text: "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less",
            type: "Financial",
            sources: [
              {
                page_number: 2,
                snippet:
                  "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less:",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet:
              "PER DAY CHARGES FOR SI 50K FOR SI 75K FOR SI 100K FOR SI 200K\nRoom rent (inclusive of nursing/treatment charges) 450 450 1000 2000",
          },
        ],
      },
      room_category: "Any",
      proportionate_deduction_applicable: true,
      tables: [
        {
          table_id: "per_day_charges_limit",
          title:
            "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less - Room Rent Rows",
          headers: [
            "PER DAY CHARGES",
            "FOR SI 50K",
            "FOR SI 75K",
            "FOR SI 100K",
            "FOR SI 200K",
          ],
          rows: [
            {
              row_number: 1,
              cells: [
                "Room rent (inclusive of nursing/treatment charges)",
                "450",
                "450",
                "1000",
                "2000",
              ],
            },
            {
              row_number: 2,
              cells: [
                "Minor surgery/Day care room rent per day",
                "450",
                "450",
                "1000",
                "2000",
              ],
            },
          ],
          sources: [
            {
              page_number: 2,
              snippet:
                "Room rent (inclusive of nursing/treatment charges) 450 450 1000 2000\nMinor surgery/Day care room rent per day 450 450 1000 2000",
            },
          ],
        },
      ],
      conditions: [
        {
          text: "In case of admission to a room / ICU / ICCU at rates exceeding the limits as mentioned under sec 2.10, the payment of all other expenses incurred at the Hospital, with the exception of cost of medicines / implants, shall be affected in the same proportion as the admissible rate per day bears to the actual rate per day of room rent / ICU / ICCU charges.",
          type: "Financial",
          sources: [
            {
              page_number: 3,
              snippet:
                "In case of admission to a room / ICU / ICCU at rates exceeding the limits as mentioned under sec 2.10, the payment of all other expenses incurred at the Hospital, with the exception of cost of medicines / implants, shall be affected in the same proportion as the admissible rate per day bears to the actual rate per day of room rent / ICU / ICCU charges.",
            },
          ],
        },
        {
          text: "Room, Boarding Expenses as provided by the hospital including Nursing charges.",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "2.1 Room, Boarding Expenses as provided by the hospital including Nursing charges.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "Room, Boarding Expenses as provided by the hospital including Nursing charges.",
        },
        {
          page_number: 2,
          snippet:
            "PER DAY CHARGES FOR SI 50K FOR SI 75K FOR SI 100K FOR SI 200K",
        },
        {
          page_number: 3,
          snippet:
            "Note:The amounts payable under Sec 2.1 and sec 2.2 shall be at the rate applicable to the opted Sum Insured.",
        },
      ],
    },
    icu_rent: {
      limit: {
        limit_type: "Actuals",
        actuals_basis: "Insurer_Norms",
        text_description:
          "Supra Major Surgery - ICU Charges (per day with all intensive care infrastructure & facilities) - SI 50k: 1800, SI 75k: 1800, SI 100k: 2250, SI 200k: 2700.",
        conditions: [
          {
            text: "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less",
            type: "Financial",
            sources: [
              {
                page_number: 2,
                snippet:
                  "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less:",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 2,
            snippet:
              "ICU Charges (per day with all intensive care infrastructure & facilities) 1800 1800 2250 2700",
          },
        ],
      },
      conditions: [
        {
          text: "Intensive Care Unit (ICU) / Intensive Cardiac Care Unit (ICCU) expenses.",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "2.2 Intensive Care Unit (ICU) / Intensive Cardiac Care Unit (ICCU) expenses.",
            },
          ],
        },
        {
          text: "In case of admission to a room / ICU / ICCU at rates exceeding the limits as mentioned under sec 2.10, the payment of all other expenses incurred at the Hospital, with the exception of cost of medicines / implants, shall be affected in the same proportion as the admissible rate per day bears to the actual rate per day of room rent / ICU / ICCU charges.",
          type: "Financial",
          sources: [
            {
              page_number: 3,
              snippet:
                "In case of admission to a room / ICU / ICCU at rates exceeding the limits... the payment of all other expenses... shall be affected in the same proportion",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.2 Intensive Care Unit (ICU) / Intensive Cardiac Care Unit (ICCU) expenses.",
        },
        {
          page_number: 2,
          snippet:
            "ICU Charges (per day with all intensive care infrastructure & facilities)",
        },
      ],
    },
    pre_hospitalization: {
      days: {
        limit_type: "Days",
        value: 30,
        unit: "Days",
        text_description:
          "Pre-hospitalization medical charges up to 30 days period.",
        sources: [
          {
            page_number: 1,
            snippet:
              "2.5 Pre-hospitalization medical charges up to 30 days period.",
          },
        ],
      },
      conditions: [
        {
          text: "Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalization was required",
          type: "Restriction",
          sources: [
            {
              page_number: 9,
              snippet:
                "Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalization was required",
            },
          ],
        },
        {
          text: "The Inpatient Hospitalization claim for such Hospitalization is admissible by the Insurance Company.",
          type: "Restriction",
          sources: [
            {
              page_number: 9,
              snippet:
                "The Inpatient Hospitalization claim for such Hospitalization is admissible by the Insurance Company.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.5 Pre-hospitalization medical charges up to 30 days period.",
        },
      ],
    },
    post_hospitalization: {
      days: {
        limit_type: "Days",
        value: 60,
        unit: "Days",
        text_description:
          "Post-hospitalization medical charges up to 60 days period.",
        sources: [
          {
            page_number: 1,
            snippet:
              "2.6 Post-hospitalization medical charges up to 60 days period.",
          },
        ],
      },
      conditions: [
        {
          text: "Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalisation was required",
          type: "Restriction",
          sources: [
            {
              page_number: 9,
              snippet:
                "Such Medical Expenses are incurred for the same condition for which the Insured Person’s Hospitalisation was required",
            },
          ],
        },
        {
          text: "The Inpatient Hospitalisation claim for such Hospitalisation is admissible by the Insurance Company.",
          type: "Restriction",
          sources: [
            {
              page_number: 9,
              snippet:
                "The Inpatient Hospitalisation claim for such Hospitalisation is admissible by the Insurance Company.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.6 Post-hospitalization medical charges up to 60 days period.",
        },
      ],
    },
    day_care_treatment: {
      covered: true,
      procedure_basis: "All_Medically_Necessary",
      conditions: [
        {
          text: "Day Care Center as an Inpatient",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "incur Medical Expenses / Surgery at any Hospital / Day Care Center as an Inpatient",
            },
          ],
        },
        {
          text: "HOSPITALISATION means admission in a Hospital for a minimum period of 24 in patient Care consecutive hours except for specified procedures / treatments... OR any other Surgeries / Procedures agreed by TPA/Company which require less than 24 hours hospitalization due to advancement in Medical Technology.",
          type: "Eligibility",
          sources: [
            {
              page_number: 7,
              snippet:
                "OR any other Surgeries / Procedures agreed by TPA/Company which require less than 24 hours hospitalization due to advancement in Medical Technology.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "incur Medical Expenses / Surgery at any Hospital / Day Care Center as an Inpatient",
        },
        {
          page_number: 7,
          snippet:
            "OR any other Surgeries / Procedures agreed by TPA/Company which require less than 24 hours hospitalization due to advancement in Medical Technology.",
        },
      ],
    },
    ambulance: {
      road_ambulance_limit: {
        limit_type: "Actuals",
        value: 1000,
        unit: "INR",
        text_description: "actual expenses, subject to maximum of Rs. 1,000/-",
        conditions: [
          {
            text: "in case patient has to be shifted from residence to hospital for admission in Emergency Ward or ICU or from one Hospital to another Hospital by fully equipped ambulance for better medical facilities.",
            type: "Restriction",
            sources: [
              {
                page_number: 1,
                snippet:
                  "in case patient has to be shifted from residence to hospital for admission in Emergency Ward or ICU or from one Hospital to another Hospital by fully equipped ambulance for better medical facilities.",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 1,
            snippet:
              "Ambulances services – actual expenses, subject to maximum of Rs. 1,000/-",
          },
        ],
      },
      air_ambulance_covered: false,
      conditions: [
        {
          text: "in case patient has to be shifted from residence to hospital for admission in Emergency Ward or ICU or from one Hospital to another Hospital by fully equipped ambulance for better medical facilities.",
          type: "Restriction",
          sources: [
            {
              page_number: 1,
              snippet:
                "in case patient has to be shifted from residence to hospital for admission in Emergency Ward or ICU or from one Hospital to another Hospital by fully equipped ambulance for better medical facilities.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.8 Ambulances services – actual expenses, subject to maximum of Rs. 1,000/-",
        },
      ],
    },
    ayush_treatment: {
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 25,
        unit: "%",
        text_description: "admissible up to 25% of the sum insured",
        conditions: [
          {
            text: "provided the treatment for Illness and Injury, is taken in AYUSH Hospital.",
            type: "Restriction",
            sources: [
              {
                page_number: 1,
                snippet:
                  "provided the treatment for Illness and Injury, is taken in AYUSH Hospital.",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 1,
            snippet:
              "AYUSH Expenses incurred for Ayurvedic / Homeopathic / Unani Treatment are admissible up to 25% of the sum insured",
          },
        ],
      },
      conditions: [
        {
          text: "AYUSH Expenses incurred for Ayurvedic / Homeopathic / Unani Treatment",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "2.7 AYUSH Expenses incurred for Ayurvedic / Homeopathic / Unani Treatment",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.7 AYUSH Expenses incurred for Ayurvedic / Homeopathic / Unani Treatment are admissible up to 25% of the sum insured provided the treatment for Illness and Injury, is taken in AYUSH Hospital.",
        },
      ],
    },
    organ_donor_expenses: {
      covered: true,
      sub_limit: {
        limit_type: "Variable",
        text_description:
          "The Company’s liability towards expenses incurred on the donor and the insured recipient shall not exceed the sum insured of the insured person receiving the organ.",
        sources: [
          {
            page_number: 1,
            snippet:
              "The Company’s liability towards expenses incurred on the donor and the insured recipient shall not exceed the sum insured of the insured person receiving the organ.",
          },
        ],
      },
      conditions: [
        {
          text: "Hospitalization expenses (excluding cost of organ) incurred on the donor during the course of organ transplant to the insured person.",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "Hospitalization expenses (excluding cost of organ) incurred on the donor during the course of organ transplant to the insured person.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.9 Hospitalization expenses (excluding cost of organ) incurred on the donor during the course of organ transplant to the insured person.",
        },
      ],
    },
    mental_illness_treatment: {
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 25,
        unit: "%",
        text_description:
          "sub-limit up to 25% of Sum Insured per policy period",
        sources: [
          {
            page_number: 3,
            snippet:
              "This cover will have a sub-limit up to 25% of Sum Insured per policy period.",
          },
        ],
      },
      waiting_period: {
        limit_type: "Variable",
        value: 48,
        unit: "Months",
        text_description: "covered after a waiting period of 48 months",
        sources: [
          {
            page_number: 3,
            snippet: "covered after a waiting period of 48 months",
          },
        ],
      },
      conditions: [
        {
          text: "We shall indemnify the Hospital or the Insured the Medical Expenses (including Pre and Post Hospitalisation Expenses) related to following and they are covered after a waiting period of 48 months with a sub-limit up to 25% of Sum Insured per policy period.",
          type: "Financial",
          sources: [
            {
              page_number: 3,
              snippet:
                "We shall indemnify the Hospital or the Insured the Medical Expenses (including Pre and Post Hospitalisation Expenses) related to following and they are covered after a waiting period of 48 months with a sub-limit up to 25% of Sum Insured per policy period.",
            },
          ],
        },
        {
          text: "The below covers are subject to the patient simultaneously exhibiting the following traits and requiring Hospitalisation as per the treating Psychiatrist’s advice: 1. Major Depressive Disorder- when the patient is aggressive or violent. 2. Acute psychotic conditions – aggressive / violent behavior or hallucinations, incoherent talking or agitation. 3. Schizophrenia - esp. Psychotic episodes. 4. Bipolar disorder - manic phase.",
          type: "Medical",
          sources: [
            {
              page_number: 3,
              snippet:
                "The below covers are subject to the patient simultaneously exhibiting the following traits and requiring Hospitalisation as per the treating Psychiatrist’s advice",
            },
          ],
        },
        {
          text: "Treatment of any Injury due to Suicidality shall not be covered.",
          type: "Restriction",
          sources: [
            {
              page_number: 3,
              snippet:
                "Treatment of any Injury due to Suicidality shall not be covered.",
            },
          ],
        },
        {
          text: "Treatment shall be undertaken at a Hospital categorized as Mental Health Establishment or at a Hospital with a specific department for Mental Illness, under a Medical Practitioner qualified as Mental Health Professional.",
          type: "Procedural",
          sources: [
            {
              page_number: 3,
              snippet:
                "Treatment shall be undertaken at a Hospital categorized as Mental Health Establishment or at a Hospital with a specific department for Mental Illness, under a Medical Practitioner qualified as Mental Health Professional.",
            },
          ],
        },
        {
          text: "Any kind of Psychological counselling, cognitive / family / group / behavior / palliative therapy or other kinds of psychotherapy for which Hospitalisation is not necessary shall not be covered.",
          type: "Restriction",
          sources: [
            {
              page_number: 3,
              snippet:
                "Any kind of Psychological counselling, cognitive / family / group / behavior / palliative therapy or other kinds of psychotherapy for which Hospitalisation is not necessary shall not be covered.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 3,
          snippet:
            "2.11 SPECIFIC COVERAGES: c) Treatment of mental illness, stress or psychological disorders and neurodegenerative disorders",
        },
      ],
    },
    consumables: {
      covered: false,
      coverage_basis: "Listed_Items_Only",
      list_tables: [
        {
          table_id: "Annexure_I_List_I",
          title:
            "List I – Items for which coverage is not available in the policy",
          headers: ["S No", "Item"],
          rows: [
            {
              row_number: 1,
              cells: ["1", "BABY FOOD"],
            },
            {
              row_number: 2,
              cells: ["2", "BABY UTILITIES CHARGES"],
            },
            {
              row_number: 3,
              cells: ["3", "BEAUTY SERVICES"],
            },
            {
              row_number: 4,
              cells: ["4", "BELTS/ BRACES"],
            },
            {
              row_number: 5,
              cells: ["5", "BUDS"],
            },
            {
              row_number: 6,
              cells: ["6", "COLD PACK/HOT PACK"],
            },
            {
              row_number: 7,
              cells: ["7", "CARRY BAGS"],
            },
            {
              row_number: 8,
              cells: ["8", "EMAIL / INTERNET CHARGES"],
            },
            {
              row_number: 9,
              cells: [
                "9",
                "FOOD CHARGES (OTHER THAN PATIENT's DIET PROVIDED BY HOSPITAL)",
              ],
            },
            {
              row_number: 10,
              cells: ["10", "LEGGINGS"],
            },
            {
              row_number: 11,
              cells: ["11", "LAUNDRY CHARGES"],
            },
            {
              row_number: 12,
              cells: ["12", "MINERAL WATER"],
            },
            {
              row_number: 13,
              cells: ["13", "SANITARY PAD"],
            },
            {
              row_number: 14,
              cells: ["14", "TELEPHONE CHARGES"],
            },
            {
              row_number: 15,
              cells: ["15", "GUEST SERVICES"],
            },
            {
              row_number: 16,
              cells: ["16", "CREPE BANDAGE"],
            },
            {
              row_number: 17,
              cells: ["17", "DIAPER OF ANY TYPE"],
            },
            {
              row_number: 18,
              cells: ["18", "EYELET COLLAR"],
            },
            {
              row_number: 19,
              cells: ["19", "SLINGS"],
            },
            {
              row_number: 20,
              cells: [
                "20",
                "BLOOD GROUPING AND CROSS MATCHING OF DONORS SAMPLES",
              ],
            },
            {
              row_number: 21,
              cells: [
                "21",
                "SERVICE CHARGES WHERE NURSING CHARGE ALSO CHARGED",
              ],
            },
            {
              row_number: 22,
              cells: ["22", "TELEVISION CHARGES"],
            },
            {
              row_number: 23,
              cells: ["23", "SURCHARGES"],
            },
            {
              row_number: 24,
              cells: ["24", "ATTENDANT CHARGES"],
            },
            {
              row_number: 25,
              cells: [
                "25",
                "EXTRA DIET OF PATIENT (OTHER THAN THAT WHICH FORMS PART OF BED CHARGE)",
              ],
            },
            {
              row_number: 26,
              cells: ["26", "BIRTH CERTIFICATE"],
            },
            {
              row_number: 27,
              cells: ["27", "CERTIFICATE CHARGES"],
            },
            {
              row_number: 28,
              cells: ["28", "COURIER CHARGES"],
            },
            {
              row_number: 29,
              cells: ["29", "CONVEYANCE CHARGES"],
            },
            {
              row_number: 30,
              cells: ["30", "MEDICAL CERTIFICATE"],
            },
            {
              row_number: 31,
              cells: ["31", "MEDICAL RECORDS"],
            },
            {
              row_number: 32,
              cells: ["32", "PHOTOCOPIES CHARGES"],
            },
            {
              row_number: 33,
              cells: ["33", "MORTUARY CHARGES"],
            },
            {
              row_number: 34,
              cells: ["34", "WALKING AIDS CHARGES"],
            },
            {
              row_number: 35,
              cells: ["35", "OXYGEN CYLINDER (FOR USAGE OUTSIDE THE HOSPITAL)"],
            },
            {
              row_number: 36,
              cells: ["36", "SPACER"],
            },
            {
              row_number: 37,
              cells: ["37", "SPIROMETRE"],
            },
            {
              row_number: 38,
              cells: ["38", "NEBULIZER KIT"],
            },
            {
              row_number: 39,
              cells: ["39", "STEAM INHALER"],
            },
            {
              row_number: 40,
              cells: ["40", "ARMSLING"],
            },
            {
              row_number: 41,
              cells: ["41", "THERMOMETER"],
            },
            {
              row_number: 42,
              cells: ["42", "CERVICAL COLLAR"],
            },
            {
              row_number: 43,
              cells: ["43", "SPLINT"],
            },
            {
              row_number: 44,
              cells: ["44", "DIABETIC FOOT WEAR"],
            },
            {
              row_number: 45,
              cells: ["45", "KNEE BRACES (LONG/ SHORT/ HINGED)"],
            },
            {
              row_number: 46,
              cells: ["46", "KNEE IMMOBILIZER/SHOULDER IMMOBILIZER"],
            },
            {
              row_number: 47,
              cells: ["47", "LUMBO SACRAL BELT"],
            },
            {
              row_number: 48,
              cells: ["48", "NIMBUS BED OR WATER OR AIR BED CHARGES"],
            },
            {
              row_number: 49,
              cells: ["49", "AMBULANCE COLLAR"],
            },
            {
              row_number: 50,
              cells: ["50", "AMBULANCE EQUIPMENT"],
            },
            {
              row_number: 51,
              cells: ["51", "ABDOMINAL BINDER"],
            },
            {
              row_number: 52,
              cells: ["52", "PRIVATE NURSES CHARGES- SPECIAL NURSING CHARGES"],
            },
            {
              row_number: 53,
              cells: ["53", "SUGAR FREE TABLETS"],
            },
            {
              row_number: 54,
              cells: [
                "54",
                "CREAMS POWDERS LOTIONS (Toiletries are not payable, only prescribed medical pharmaceuticals payable)",
              ],
            },
            {
              row_number: 55,
              cells: ["55", "ECG ELECTRODES"],
            },
            {
              row_number: 56,
              cells: ["56", "GLOVES"],
            },
            {
              row_number: 57,
              cells: ["57", "NEBULISATION KIT"],
            },
            {
              row_number: 58,
              cells: [
                "58",
                "ANY KIT WITH NO DETAILS MENTIONED [DELIVERY KIT, ORTHOKIT, RECOVERY KIT, ETC]",
              ],
            },
            {
              row_number: 59,
              cells: ["59", "KIDNEY TRAY"],
            },
            {
              row_number: 60,
              cells: ["60", "MASK"],
            },
            {
              row_number: 61,
              cells: ["61", "OUNCE GLASS"],
            },
            {
              row_number: 62,
              cells: ["62", "OXYGEN MASK"],
            },
            {
              row_number: 63,
              cells: ["63", "PELVIC TRACTION BELT"],
            },
            {
              row_number: 64,
              cells: ["64", "PAN CAN"],
            },
            {
              row_number: 65,
              cells: ["65", "TROLLY COVER"],
            },
            {
              row_number: 66,
              cells: ["66", "UROMETER, URINE JUG"],
            },
            {
              row_number: 67,
              cells: ["67", "AMBULANCE"],
            },
            {
              row_number: 68,
              cells: ["68", "VASOFIX SAFETY"],
            },
          ],
          sources: [
            {
              page_number: 21,
              snippet:
                "ANNEXURE I: List I – Items for which coverage is not available in the policy",
            },
          ],
        },
      ],
      conditions: [
        {
          text: "The expenses that are not covered in this policy are placed under List-I of Annexure-I.",
          type: "Restriction",
          sources: [
            {
              page_number: 20,
              snippet:
                "The expenses that are not covered in this policy are placed under List-I of Annexure-I.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 20,
          snippet:
            "The expenses that are not covered in this policy are placed under List-I of Annexure-I.",
        },
      ],
    },
  },
  other_base_covers: [
    {
      cover_name: "Fees",
      covered: true,
      conditions: [
        {
          text: "Surgeon, Anesthetist, Medical Practitioner, Consultants, Specialists Fees.",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "2.3 Surgeon, Anesthetist, Medical Practitioner, Consultants, Specialists Fees.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.3 Surgeon, Anesthetist, Medical Practitioner, Consultants, Specialists Fees.",
        },
      ],
    },
    {
      cover_name: "Medical Expenses",
      covered: true,
      conditions: [
        {
          text: "Anesthesia, Blood, Oxygen, Operation Theatre Charges, Surgical Appliances, Medicines & Drugs, Diagnostic Materials and X-ray, Dialysis, Chemotherapy, Radiotherapy, Cost of Pacemaker, Artificial Limbs & Cost of Organs and similar expenses.",
          type: "Eligibility",
          sources: [
            {
              page_number: 1,
              snippet:
                "2.4 Anesthesia, Blood, Oxygen, Operation Theatre Charges, Surgical Appliances, Medicines & Drugs, Diagnostic Materials and X-ray, Dialysis, Chemotherapy, Radiotherapy, Cost of Pacemaker, Artificial Limbs & Cost of Organs and similar expenses.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 1,
          snippet:
            "2.4 Anesthesia, Blood, Oxygen, Operation Theatre Charges, Surgical Appliances, Medicines & Drugs...",
        },
      ],
    },
    {
      cover_name: "Impairment of Persons’ intellectual faculties",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 5,
        unit: "%",
        text_description:
          "up to 5% of Sum Insured, maximum upto Rs. 25,000 per policy period",
        conditions: [
          {
            text: "maximum upto Rs. 25,000 per policy period",
            type: "Financial",
            sources: [
              {
                page_number: 3,
                snippet: "maximum upto Rs. 25,000 per policy period",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 3,
            snippet:
              "covered up to 5% of Sum Insured, maximum upto Rs. 25,000 per policy period",
          },
        ],
      },
      conditions: [
        {
          text: "by usage of drugs, stimulants or depressants as prescribed by a medical practitioner",
          type: "Medical",
          sources: [
            {
              page_number: 3,
              snippet:
                "by usage of drugs, stimulants or depressants as prescribed by a medical practitioner",
            },
          ],
        },
        {
          text: "subject to it arising during treatment of covered illness.",
          type: "Restriction",
          sources: [
            {
              page_number: 3,
              snippet:
                "subject to it arising during treatment of covered illness.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 3,
          snippet:
            "2.11 SPECIFIC COVERAGES: a) Impairment of Persons’ intellectual faculties",
        },
      ],
    },
    {
      cover_name: "Artificial life maintenance",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description:
          "covered up to 10% of Sum Insured and for a maximum of 15 days per policy period following admission for a covered illness.",
        conditions: [
          {
            text: "for a maximum of 15 days per policy period following admission for a covered illness.",
            type: "Restriction",
            sources: [
              {
                page_number: 3,
                snippet:
                  "for a maximum of 15 days per policy period following admission for a covered illness.",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 3,
            snippet:
              "covered up to 10% of Sum Insured and for a maximum of 15 days per policy period following admission for a covered illness.",
          },
        ],
      },
      conditions: [
        {
          text: "including life support machine use, where such treatment will not result in recovery or restoration of the previous state of Health under any circumstances unless in a vegetative state as certified by the treating medical practitioner",
          type: "Medical",
          sources: [
            {
              page_number: 3,
              snippet:
                "including life support machine use, where such treatment will not result in recovery or restoration of the previous state of Health under any circumstances unless in a vegetative state as certified by the treating medical practitioner",
            },
          ],
        },
        {
          text: "Explanation: Expenses up to the date of confirmation by the treating doctor that the patient is in vegetative state shall be covered as per the terms and conditions of the policy contract",
          type: "Administrative",
          sources: [
            {
              page_number: 3,
              snippet:
                "Explanation: Expenses up to the date of confirmation by the treating doctor that the patient is in vegetative state shall be covered as per the terms and conditions of the policy contract",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 3,
          snippet: "2.11 SPECIFIC COVERAGES: b) Artificial life maintenance",
        },
      ],
    },
    {
      cover_name: "Puberty and Menopause related Disorders",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 25,
        unit: "%",
        text_description:
          "sub-limit of up to 25% of Sum Insured per policy period.",
        sources: [
          {
            page_number: 3,
            snippet:
              "This cover will have a sub-limit of up to 25% of Sum Insured per policy period.",
          },
        ],
      },
      waiting_period: {
        limit_type: "Variable",
        value: 24,
        unit: "Months",
        text_description: "after 24 months of continuous coverage",
        sources: [
          {
            page_number: 3,
            snippet: "after 24 months of continuous coverage",
          },
        ],
      },
      conditions: [
        {
          text: "Treatment for any symptoms, Illness, complications arising due to physiological conditions associated with Puberty, Menopause such as menopausal bleeding or flushing is covered only as Inpatient procedure",
          type: "Medical",
          sources: [
            {
              page_number: 3,
              snippet:
                "Treatment for any symptoms, Illness, complications arising due to physiological conditions associated with Puberty, Menopause such as menopausal bleeding or flushing is covered only as Inpatient procedure",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 3,
          snippet:
            "2.11 SPECIFIC COVERAGES: d) Puberty and Menopause related Disorders",
        },
      ],
    },
    {
      cover_name: "Age Related Macular Degeneration (ARMD)",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description:
          "sub-limit of 10% of Sum Insured, maximum upto Rs. 75,000 per policy period.",
        conditions: [
          {
            text: "maximum upto Rs. 75,000 per policy period",
            type: "Financial",
            sources: [
              {
                page_number: 4,
                snippet: "maximum upto Rs. 75,000 per policy period.",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 4,
            snippet:
              "This cover will have a sub-limit of 10% of Sum Insured, maximum upto Rs. 75,000 per policy period.",
          },
        ],
      },
      waiting_period: {
        limit_type: "Variable",
        value: 48,
        unit: "Months",
        text_description: "covered after 48 months of continuous coverage",
        sources: [
          {
            page_number: 4,
            snippet: "covered after 48 months of continuous coverage",
          },
        ],
      },
      conditions: [
        {
          text: "only for Intravitreal Injections and anti – VEGF medication.",
          type: "Medical",
          sources: [
            {
              page_number: 4,
              snippet:
                "only for Intravitreal Injections and anti – VEGF medication.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 4,
          snippet:
            "2.11 SPECIFIC COVERAGES: e) Age Related Macular Degeneration (ARMD)",
        },
      ],
    },
    {
      cover_name: "Behavioural and Neuro developmental Disorders",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 25,
        unit: "%",
        text_description: "sub-limit of 25% of Sum Insured per policy period.",
        sources: [
          {
            page_number: 4,
            snippet:
              "This cover will have a sub-limit of 25% of Sum Insured per policy period.",
          },
        ],
      },
      waiting_period: {
        limit_type: "Variable",
        value: 24,
        unit: "Months",
        text_description:
          "covered as Inpatient procedure after 24 months of continuous coverage.",
        sources: [
          {
            page_number: 4,
            snippet:
              "covered as Inpatient procedure after 24 months of continuous coverage.",
          },
        ],
      },
      conditions: [
        {
          text: "Disorders of adult personality and Disorders of speech and language including stammering, dyslexia; are covered as Inpatient procedure",
          type: "Medical",
          sources: [
            {
              page_number: 4,
              snippet:
                "Disorders of adult personality and Disorders of speech and language including stammering, dyslexia; are covered as Inpatient procedure",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 4,
          snippet:
            "2.11 SPECIFIC COVERAGES: f) Behavioural and Neuro developmental Disorders",
        },
      ],
    },
    {
      cover_name: "Genetic diseases or disorders",
      covered: true,
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 25,
        unit: "%",
        text_description: "sub-limit of 25% of Sum Insured per policy period",
        sources: [
          {
            page_number: 4,
            snippet: "sub-limit of 25% of Sum Insured per policy period",
          },
        ],
      },
      waiting_period: {
        limit_type: "Variable",
        value: 48,
        unit: "Months",
        text_description: "48 months waiting periods.",
        sources: [
          {
            page_number: 4,
            snippet: "with 48 months waiting periods.",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.11 SPECIFIC COVERAGES: g) Genetic diseases or disorders are covered with a sub-limit of 25% of Sum Insured per policy period with 48 months waiting periods.",
        },
      ],
    },
  ],
  modern_and_advanced_treatments: [
    {
      treatment_name:
        "Uterine Artery Embolization and HIFU (High intensity focused ultrasound)",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet:
              "Uterine Artery Embolization and HIFU (High intensity focused ultrasound) Upto 10% of Sum Insured",
          },
        ],
      },
      conditions: [
        {
          text: "covered (wherever medically indicated) either as in patient or as part of day care treatment in a hospital up to the limit specified against each procedure during the policy period.",
          type: "Restriction",
          sources: [
            {
              page_number: 4,
              snippet:
                "covered (wherever medically indicated) either as in patient or as part of day care treatment in a hospital up to the limit specified against each procedure during the policy period.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.1 Uterine Artery Embolization and HIFU (High intensity focused ultrasound) Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Balloon Sinuplasty",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Balloon Sinuplasty. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.2 Balloon Sinuplasty. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Deep Brain stimulation",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Deep Brain stimulation. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.3 Deep Brain stimulation. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Oral chemotherapy",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Oral chemotherapy. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.4 Oral chemotherapy. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name:
        "Immunotherapy- Monoclonal Antibody to be given as injection",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet:
              "Immunotherapy- Monoclonal Antibody to be given as injection. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.5 Immunotherapy- Monoclonal Antibody to be given as injection. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Intravitreal injections",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Intravitreal injections. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.6 Intravitreal injections. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Robotic surgeries",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Robotic surgeries. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.7 Robotic surgeries. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Stereotactic radio surgeries",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Stereotactic radio surgeries. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.8 Stereotactic radio surgeries. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "Bronchial Thermoplasty",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet: "Bronchial Thermoplasty. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet: "2.12.9 Bronchial Thermoplasty. Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name:
        "Vaporisation of the prostrate (Green laser treatment or holmium laser treatment)",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet:
              "Vaporisation of the prostrate (Green laser treatment or holmium laser treatment). Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.10 Vaporisation of the prostrate (Green laser treatment or holmium laser treatment). Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name: "IONM - (Intra Operative Neuro Monitoring)",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet:
              "IONM - (Intra Operative Neuro Monitoring). Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.11 IONM - (Intra Operative Neuro Monitoring). Upto 10% of Sum Insured",
        },
      ],
    },
    {
      treatment_name:
        "Stem cell therapy: Hematopoietic stem cells for bone marrow transplant for haematological conditions",
      sub_limit: {
        limit_type: "Percentage_of_SI",
        value: 10,
        unit: "%",
        text_description: "Upto 10% of Sum Insured",
        sources: [
          {
            page_number: 4,
            snippet:
              "Stem cell therapy: Hematopoietic stem cells for bone marrow transplant for haematological conditions to be covered. Upto 10% of Sum Insured",
          },
        ],
      },
      sources: [
        {
          page_number: 4,
          snippet:
            "2.12.12 Stem cell therapy: Hematopoietic stem cells for bone marrow transplant for haematological conditions to be covered. Upto 10% of Sum Insured",
        },
      ],
    },
  ],
  maternity_and_newborn_benefits: {
    covered: false,
    conditions: [
      {
        text: "Medical treatment expenses traceable to childbirth (including complicated deliveries and caesarean sections incurred during hospitalization) except ectopic pregnancy",
        type: "Exception",
        sources: [
          {
            page_number: 14,
            snippet:
              "Medical treatment expenses traceable to childbirth (including complicated deliveries and caesarean sections incurred during hospitalization) except ectopic pregnancy",
          },
        ],
      },
      {
        text: "Expenses towards miscarriage (unless due to an accident) and lawful medical termination of pregnancy during the policy period.",
        type: "Restriction",
        sources: [
          {
            page_number: 14,
            snippet:
              "Expenses towards miscarriage (unless due to an accident) and lawful medical termination of pregnancy during the policy period.",
          },
        ],
      },
    ],
    sources: [
      {
        page_number: 14,
        snippet: "4.4.15 MATERNITY EXPENSES (Code - Excl18)",
      },
    ],
  },
  exclusions: {
    initial_waiting_period: {
      duration: {
        limit_type: "Days",
        value: 30,
        unit: "Days",
        text_description:
          "FIRST THIRTY DAYS WAITING PERIOD (Code- Excl03) - Expenses related to the treatment of any illness within 30 days from the first policy commencement date shall be excluded except claims arising due to an accident, provided the same are covered.",
        sources: [
          {
            page_number: 12,
            snippet:
              "4.3 FIRST THIRTY DAYS WAITING PERIOD (Code- Excl03) a. Expenses related to the treatment of any illness within 30 days from the first policy commencement date shall be excluded",
          },
        ],
      },
      conditions: [
        {
          text: "except claims arising due to an accident, provided the same are covered.",
          type: "Exception",
          sources: [
            {
              page_number: 12,
              snippet:
                "except claims arising due to an accident, provided the same are covered.",
            },
          ],
        },
        {
          text: "This exclusion shall not, however, apply if the Insured Person has Continuous Coverage for more than twelve months.",
          type: "Exception",
          sources: [
            {
              page_number: 12,
              snippet:
                "This exclusion shall not, however, apply if the Insured Person has Continuous Coverage for more than twelve months.",
            },
          ],
        },
        {
          text: "The within referred waiting period is made applicable to the enhanced sum insured in the event of granting higher sum insured subsequently.",
          type: "Restriction",
          sources: [
            {
              page_number: 12,
              snippet:
                "The within referred waiting period is made applicable to the enhanced sum insured in the event of granting higher sum insured subsequently.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 12,
          snippet: "4.3 FIRST THIRTY DAYS WAITING PERIOD (Code- Excl03)",
        },
      ],
    },
    pre_existing_disease: {
      waiting_period: {
        limit_type: "Variable",
        value: 48,
        unit: "Months",
        text_description:
          "until the expiry of 48 months of continuous coverage after the date of inception of the first policy with us.",
        sources: [
          {
            page_number: 11,
            snippet:
              "Expenses related to the treatment of a pre-existing Disease (PED) and its direct complications shall be excluded until the expiry of 48 months of continuous coverage",
          },
        ],
      },
      definition:
        "means any condition, ailment, Injury or Illness a. That is/are diagnosed by a physician within 48 months prior to the effective date of the Policy issued by Us and its reinstatement or b. For which medical advice or treatment was recommended by, or received from, a physician within 48 months prior to the effective date of the Policy or its reinstatement.",
      conditions: [
        {
          text: "In case of enhancement of Sum Insured the exclusion shall apply afresh to the extent of Sum Insured increase.",
          type: "Restriction",
          sources: [
            {
              page_number: 11,
              snippet:
                "In case of enhancement of Sum Insured the exclusion shall apply afresh to the extent of Sum Insured increase.",
            },
          ],
        },
        {
          text: "If the Insured Person is continuously covered without any break as defined under the portability norms of the extant IRDAI (Health Insurance) Regulations then waiting period for the same would be reduced to the extent of prior coverage.",
          type: "Exception",
          sources: [
            {
              page_number: 11,
              snippet:
                "If the Insured Person is continuously covered without any break... then waiting period for the same would be reduced to the extent of prior coverage.",
            },
          ],
        },
        {
          text: "Coverage under the policy after the expiry of 48 months for any pre-existing disease is subject to the same being declared at the time of application and accepted by us.",
          type: "Administrative",
          sources: [
            {
              page_number: 11,
              snippet:
                "Coverage under the policy after the expiry of 48 months for any pre-existing disease is subject to the same being declared at the time of application and accepted by us.",
            },
          ],
        },
      ],
      sources: [
        {
          page_number: 11,
          snippet: "4.1 PRE-EXISTING DISEASES (Code- Excl01)",
        },
      ],
    },
    specific_disease_waiting_periods: [
      {
        duration: {
          limit_type: "Days",
          value: 90,
          unit: "Days",
          text_description: "90 Days Waiting Period",
          sources: [
            {
              page_number: 11,
              snippet: "(i) 90 Days Waiting Period",
            },
          ],
        },
        diseases_list: [
          "Diabetes Mellitus",
          "Hypertension",
          "Cardiac Conditions",
        ],
        conditions: [
          {
            text: "This exclusion shall not be applicable for claims arising due to an accident.",
            type: "Exception",
            sources: [
              {
                page_number: 11,
                snippet:
                  "This exclusion shall not be applicable for claims arising due to an accident.",
              },
            ],
          },
          {
            text: "If any of the specified disease/procedure falls under the waiting period specified for pre existing diseases, then the longer of the two waiting periods shall apply.",
            type: "Restriction",
            sources: [
              {
                page_number: 11,
                snippet:
                  "If any of the specified disease/procedure falls under the waiting period specified for pre existing diseases, then the longer of the two waiting periods shall apply.",
              },
            ],
          },
        ],
        sources: [
          {
            page_number: 11,
            snippet:
              "(i) 90 Days Waiting Period 1. Diabetes Mellitus 2. Hypertension 3. Cardiac Conditions",
          },
        ],
      },
      {
        duration: {
          limit_type: "Variable",
          value: 24,
          unit: "Months",
          text_description: "24 Months waiting period",
          sources: [
            {
              page_number: 11,
              snippet: "(ii) 24 Months waiting period",
            },
          ],
        },
        diseases_list: [
          "Any Skin disorders",
          "All internal & external benign tumors, cysts, polyps of any kind, including benign breast lumps",
          "Benign Ear, Nose, Throat disorders",
          "Benign Prostate Hypertrophy",
          "Cataract & age-related eye ailments",
          "Gastric/ Duodenal Ulcer",
          "Gout & Rheumatism",
          "Hernia of all types",
          "Hydrocele",
          "Hysterectomy for Menorrhagia/Fibromyoma, Myomectomy and Prolapse of uterus",
          "Non-Infective Arthritis",
          "Piles, Fissure and Fistula in Anus",
          "Pilonidal Sinus, Sinusitis and related disorders",
          "Prolapse Inter Vertebral Disc unless arising from Accident",
          "Stone in Gall Bladder & Bile duct",
          "Stones in Urinary Systems",
          "Unknown Congenital Internal Anomaly",
          "Varicose Veins and Varicose Ulcers",
          "Puberty and Menopause related Disorders",
          "Behavioural and Neuro-Developmental Disorders: a. Disorders of adult personality b. Disorders of speech and language including stammering, dyslexia",
        ],
        sources: [
          {
            page_number: 11,
            snippet:
              "(ii) 24 Months waiting period 1. Any Skin disorders 2. All internal & external benign tumors...",
          },
          {
            page_number: 12,
            snippet: "6. Gastric/ Duodenal Ulcer 7. Gout & Rheumatism...",
          },
        ],
      },
      {
        duration: {
          limit_type: "Variable",
          value: 48,
          unit: "Months",
          text_description: "48 Months waiting period",
          sources: [
            {
              page_number: 12,
              snippet: "(iii) 48 Months waiting period",
            },
          ],
        },
        diseases_list: [
          "Joint Replacement due to Degenerative Condition",
          "Age-related Osteoarthritis & Osteoporosis",
          "Treatment of mental illness, stress or psychological disorders and neurodegenerative disorders",
          "Age Related Macular Degeneration (ARMD)",
          "Genetic diseases or disorders",
          "External Congenital Diseases",
        ],
        sources: [
          {
            page_number: 12,
            snippet:
              "(iii) 48 Months waiting period 1. Joint Replacement due to Degenerative Condition...",
          },
        ],
      },
    ],
    permanent_exclusions: [
      {
        code: "Excl04",
        title: "INVESTIGATION & EVALUATION",
        description:
          "a. Expenses related to any admission primarily for diagnostics and evaluation purposes. b. Any diagnostic expenses which are not related or not incidental to the current diagnosis and treatment However, Treatment for any symptoms, Illness, complications arising due to physiological conditions for which aetiology is unknown is not excluded. It is covered with a Sub-Limit of upto 10% of Sum Insured per policy period.",
        sources: [
          {
            page_number: 12,
            snippet: "4.4.1 INVESTIGATION & EVALUATION (Code- Excl04)",
          },
        ],
      },
      {
        code: "Excl05",
        title: "REST CURE, REHABILITATION AND RESPITE CARE",
        description:
          "Expenses related to any admission primarily for enforced bed rest and not for receiving treatment. This also includes: a. Custodial care either at home or in a nursing facility for personal care such as help with activities of daily living such as bathing, dressing, moving around either by skilled nurses or assistant or non-skilled persons. b. Any services for people who are terminally ill to address physical, social, emotional and spiritual needs. However, Expenses related to any admission primarily for enteral feedings is not excluded, if the Oral intake is absent for a period of at-least 5 days. It will be covered for a Maximum period of 14 days in a Policy Period.",
        sources: [
          {
            page_number: 12,
            snippet:
              "4.4.2 REST CURE, REHABILITATION AND RESPITE CARE (Code- Excl05)",
          },
          {
            page_number: 13,
            snippet:
              "However, Expenses related to any admission primarily for enteral feedings is not excluded, if the Oral intake is absent for a period of at-least 5 days.",
          },
        ],
      },
      {
        code: "Excl06",
        title: "OBESITY/ WEIGHT CONTROL",
        description:
          "Expenses related to the surgical treatment of obesity that does not fulfil all the below conditions: a. Surgery to be conducted is upon the advice of the Doctor b. The surgery/Procedure conducted should be supported by clinical protocols c. The member has to be 18 years of age or older and d. Body Mass Index (BMI); 1. greater than or equal to 40 or 2. greater than or equal to 35 in conjunction with any of the following severe co morbidities following failure of less invasive methods of weight loss: i. Obesity-related cardiomyopathy ii. Coronary heart disease iii. Severe Sleep Apnea iv. Uncontrolled Type2 Diabetes",
        sources: [
          {
            page_number: 13,
            snippet: "4.4.3 OBESITY/ WEIGHT CONTROL (Code- Excl06)",
          },
        ],
      },
      {
        code: "Excl07",
        title: "CHANGE-OF-GENDER TREATMENTS",
        description:
          "Expenses related to any treatment, including surgical management, to change characteristics of the body to those of the opposite sex.",
        sources: [
          {
            page_number: 13,
            snippet: "4.4.4 CHANGE-OF-GENDER TREATMENTS (Code- Excl07)",
          },
        ],
      },
      {
        code: "Excl08",
        title: "COSMETIC OR PLASTIC SURGERY",
        description:
          "Expenses for cosmetic or plastic surgery or any treatment to change appearance unless for reconstruction following an Accident, Burn(s) or Cancer or as part of medically necessary treatment to remove a direct and immediate health risk to the insured. For this to be considered a medical necessity, it must be certified by the attending Medical Practitioner.",
        sources: [
          {
            page_number: 13,
            snippet: "4.4.5 COSMETIC OR PLASTIC SURGERY (Code- Excl08)",
          },
        ],
      },
      {
        code: "Excl09",
        title: "HAZARDOUS OR ADVENTURE SPORTS",
        description:
          "Expenses related to any treatment necessitated due to participation as a professional in hazardous or adventure sports, including but not limited to, para-jumping, rock climbing, mountaineering, rafting, motor racing, horse racing or scuba diving, hand gliding, sky diving, deep-sea diving. However, Treatment related to Injury or Illness associated with Hazardous activities related to particular line of employment or occupation (not for recreational purpose) is not excluded.",
        sources: [
          {
            page_number: 13,
            snippet: "4.4.6 HAZARDOUS OR ADVENTURE SPORTS (Code- Excl09)",
          },
        ],
      },
      {
        code: "Excl10",
        title: "BREACH OF LAW",
        description:
          "Expenses for treatment directly arising from or consequent upon any Insured Person committing or attempting to commit a breach of law with criminal intent.",
        sources: [
          {
            page_number: 13,
            snippet: "4.4.7 BREACH OF LAW (Code- Excl10)",
          },
          {
            page_number: 14,
            snippet:
              "Expenses for treatment directly arising from or consequent upon any Insured Person committing or attempting to commit a breach of law with criminal intent.",
          },
        ],
      },
      {
        code: "Excl11",
        title: "EXCLUDED PROVIDERS",
        description:
          "Expenses incurred towards treatment in any hospital or by any Medical Practitioner or any other provider specifically excluded by the Insurer and disclosed in its website / notified to the policyholders are not admissible. However, in case of life-threatening situations or following an accident, expenses up to the stage of stabilization are payable but not the complete claim.",
        sources: [
          {
            page_number: 14,
            snippet: "4.4.8 EXCLUDED PROVIDERS (Code-Excl11)",
          },
        ],
      },
      {
        code: "Excl12",
        title: "Treatment for, Alcoholism, drug or substance abuse",
        description:
          "Treatment for, Alcoholism, drug or substance abuse or any addictive condition and consequences thereof.",
        sources: [
          {
            page_number: 14,
            snippet:
              "4.4.9 Treatment for, Alcoholism, drug or substance abuse or any addictive condition and consequences thereof. (Code- Excl12)",
          },
        ],
      },
      {
        code: "Excl13",
        title:
          "Treatments received in health hydros, nature cure clinics, spas",
        description:
          "Treatments received in health hydros, nature cure clinics, spas or similar establishments or private beds registered as a nursing home attached to such establishments or where admission is arranged wholly or partly for domestic reasons.",
        sources: [
          {
            page_number: 14,
            snippet:
              "4.4.10 Treatments received in health hydros, nature cure clinics, spas or similar establishments... (Code- Excl13)",
          },
        ],
      },
      {
        code: "Excl14",
        title: "Dietary supplements and substances",
        description:
          "Dietary supplements and substances that can be purchased without prescription, including but not limited to Vitamins, minerals and organic substances unless prescribed by a medical practitioner as part of hospitalization claim or day care procedure.",
        sources: [
          {
            page_number: 14,
            snippet:
              "4.4.11 Dietary supplements and substances that can be purchased without prescription... (Code- Excl14)",
          },
        ],
      },
      {
        code: "Excl15",
        title: "REFRACTIVE ERROR",
        description:
          "Expenses related to the treatment for correction of eye sight due to refractive error less than 7.5 dioptres.",
        sources: [
          {
            page_number: 14,
            snippet: "4.4.12 REFRACTIVE ERROR (Code- Excl15)",
          },
        ],
      },
      {
        code: "Excl16",
        title: "UNPROVEN TREATMENTS",
        description:
          "Expenses related to any unproven treatment, services and supplies for or in connection with any treatment. Unproven treatments are treatments, procedures or supplies that lack significant medical documentation to support their effectiveness.",
        sources: [
          {
            page_number: 14,
            snippet: "4.4.13 UNPROVEN TREATMENTS (Code- Excl16)",
          },
        ],
      },
      {
        code: "Excl17",
        title: "STERILITY AND INFERTILITY",
        description:
          "Expenses related to sterility and infertility. This includes: a. Any type of contraception, sterilization b. Assisted Reproduction services including artificial insemination and advanced reproductive technologies such as IVF, ZIFT, GIFT, ICSI c. Gestational Surrogacy d. Reversal of sterilization",
        sources: [
          {
            page_number: 14,
            snippet: "4.4.14 STERILITY AND INFERTILITY (Code- Excl17)",
          },
        ],
      },
      {
        code: "Excl18",
        title: "MATERNITY EXPENSES",
        description:
          "a. Medical treatment expenses traceable to childbirth (including complicated deliveries and caesarean sections incurred during hospitalization) except ectopic pregnancy; b. Expenses towards miscarriage (unless due to an accident) and lawful medical termination of pregnancy during the policy period.",
        sources: [
          {
            page_number: 14,
            snippet: "4.4.15 MATERNITY EXPENSES (Code - Excl18)",
          },
        ],
      },
      {
        code: "4.4.16",
        title: "War",
        description:
          "War (whether declared or not) and war like occurrence or invasion, acts of foreign enemies, hostilities, civil war, rebellion, revolutions, insurrections, mutiny, military or usurped power, seizure, capture, arrest, restraints and detainment of all kinds.",
        sources: [
          {
            page_number: 14,
            snippet:
              "4.4.16 War (whether declared or not) and war like occurrence or invasion...",
          },
        ],
      },
      {
        code: "4.4.17",
        title: "Nuclear, chemical or biological attack or weapons",
        description:
          "Nuclear, chemical or biological attack or weapons, contributed to, caused by, resulting from or from any other cause or event contributing concurrently or in any other sequence to the loss, claim or expense. [Definitions of Nuclear, Chemical, Biological attack follow]",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.17 Nuclear, chemical or biological attack or weapons, contributed to, caused by, resulting from or from any other cause",
          },
        ],
      },
      {
        code: "4.4.18",
        title: "Circumcision",
        description: "Circumcision unless required to treat Injury or Illness.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.18 Circumcision unless required to treat Injury or Illness.",
          },
        ],
      },
      {
        code: "4.4.19",
        title: "Vaccination & Inoculation",
        description: "Vaccination & Inoculation.",
        sources: [
          {
            page_number: 15,
            snippet: "4.4.19 Vaccination & Inoculation.",
          },
        ],
      },
      {
        code: "4.4.20",
        title: "External prosthetic devices",
        description:
          "Cost of braces, equipment or external prosthetic devices, non-durable implants, eyeglasses, Cost of spectacles and contact lenses, hearing aids including cochlear implants, durable medical equipment.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.20 Cost of braces, equipment or external prosthetic devices, non-durable implants, eyeglasses...",
          },
        ],
      },
      {
        code: "4.4.21",
        title: "Dental treatments",
        description:
          "All types of Dental treatments except arising out of an Accident.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.21 All types of Dental treatments except arising out of an Accident.",
          },
        ],
      },
      {
        code: "4.4.22",
        title: "Convalescence, general debility",
        description: "Convalescence, general debility.",
        sources: [
          {
            page_number: 15,
            snippet: "4.4.22 Convalescence, general debility.",
          },
        ],
      },
      {
        code: "4.4.23",
        title: "Intentional self-inflicted injury",
        description:
          "Bodily injury or sickness due to wilful or deliberate exposure to danger (except in an attempt to save human life), intentional self-inflicted injury, suicide or attempt thereat. However, Failure to seek or follow medical advice or failure to follow treatment is not excluded. It is covered with a sub-limit of 10% of Sum Insured per policy period.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.23 Bodily injury or sickness due to wilful or deliberate exposure to danger... intentional self-inflicted injury, suicide or attempt thereat.",
          },
        ],
      },
      {
        code: "4.4.24",
        title: "Criminal act",
        description:
          "Treatment of any bodily injury sustained whilst or as a result of participating in any criminal act.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.24 Treatment of any bodily injury sustained whilst or as a result of participating in any criminal act.",
          },
        ],
      },
      {
        code: "4.4.25",
        title: "Naturopathy Treatment",
        description: "Naturopathy Treatment.",
        sources: [
          {
            page_number: 15,
            snippet: "4.4.25 Naturopathy Treatment.",
          },
        ],
      },
      {
        code: "4.4.26",
        title: "Sleep Apnoea / CPAD",
        description:
          "Instrument used in treatment of Sleep Apnoea Syndrome (C.P.A.P.) and continuous Peritoneal Ambulatory dialysis (C.P.A.D.) and Oxygen Concentrator for Bronchial Asthmatic condition.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.26 Instrument used in treatment of Sleep Apnoea Syndrome (C.P.A.P.) and continuous Peritoneal Ambulatory dialysis (C.P.A.D.)",
          },
        ],
      },
      {
        code: "4.4.27",
        title: "Stem cell",
        description:
          "Stem cell implantation / surgery for other than those treatments mentioned in clause 2.12.12.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.27 Stem cell implantation / surgery for other than those treatments mentioned in clause 2.12.12.",
          },
        ],
      },
      {
        code: "4.4.28",
        title: "Domiciliary treatment",
        description: "Domiciliary treatment.",
        sources: [
          {
            page_number: 15,
            snippet: "4.4.28 Domiciliary treatment.",
          },
        ],
      },
      {
        code: "4.4.29",
        title: "Treatment – taken outside India",
        description: "Treatment – taken outside India.",
        sources: [
          {
            page_number: 15,
            snippet: "4.4.29 Treatment – taken outside India.",
          },
        ],
      },
      {
        code: "4.4.30",
        title: "Change of treatment system",
        description:
          "Change of treatment from one system of medicine to another unless recommended by the Medical practitioner / Hospital under whom the treatment is taken.",
        sources: [
          {
            page_number: 15,
            snippet:
              "4.4.30 Change of treatment from one system of medicine to another unless recommended",
          },
        ],
      },
      {
        code: "4.4.31",
        title: "Service charges",
        description:
          "Service charges or any other charges levied by hospital, except registration/admission charges.",
        sources: [
          {
            page_number: 16,
            snippet:
              "4.4.31 Service charges or any other charges levied by hospital, except registration/admission charges.",
          },
        ],
      },
      {
        code: "4.4.32",
        title: "Specific Treatments (RFQMR, ECP, EECP, Hyperbaric Oxygen)",
        description:
          "Treatment such as Rotational Field Quantum Magnetic Resonance (RFQMR), External Counter Pulsation (ECP), Enhanced External Counter Pulsation (EECP), Hyperbaric Oxygen Therapy.",
        sources: [
          {
            page_number: 16,
            snippet:
              "4.4.32 Treatment such as Rotational Field Quantum Magnetic Resonance (RFQMR), External Counter Pulsation (ECP), Enhanced External Counter Pulsation (EECP), Hyperbaric Oxygen Therapy.",
          },
        ],
      },
    ],
  },
  claims_process: {
    notification_timelines: {
      emergency: {
        limit_type: "Days",
        value: 72,
        unit: "Hours",
        text_description:
          "Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
        sources: [
          {
            page_number: 16,
            snippet:
              "Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
          },
        ],
      },
      planned: {
        limit_type: "Days",
        value: 72,
        unit: "Hours",
        text_description:
          "Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
        sources: [
          {
            page_number: 16,
            snippet:
              "Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
          },
        ],
      },
      sources: [
        {
          page_number: 16,
          snippet:
            "5.3 NOTICE OF CLAIM: Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
        },
      ],
    },
    document_submission_timelines: {
      limit_type: "Days",
      value: 7,
      unit: "Days",
      text_description:
        "Final claim should be submitted to the Company / TPA not later than 7 days of discharge from the Hospital.",
      sources: [
        {
          page_number: 16,
          snippet:
            "Final claim should be submitted to the Company / TPA not later than 7 days of discharge from the Hospital.",
        },
      ],
    },
    documents_required: [
      "Duly Completed claim form",
      "Photo Identity proof of the patient",
      "Medical practitioner’s prescription advising admission",
      "Original bills with itemized break-up",
      "Payment receipts",
      "Discharge summary including complete medical history of the patient along with other details.",
      "Investigation / Diagnostic test reports etc. supported by the prescription from attending medical practitioner",
      "OT notes or Surgeon’s certificate giving details of the operation performed (for surgical cases).",
      "Sticker / Invoice of the Implants, wherever applicable.",
      "MLR (Medico Legal Report copy if carried out and FIR, if registered), where ever applicable.",
      "NEFT Details (to enable direct credit of claim amount in bank account) and cancelled cheque",
      "KYC (Identity proof with Address) of the proposer, where claim liability is above Rs 1 Lakh as per AML Guidelines",
      "Legal heir/succession certificate, wherever applicable",
      "Any other relevant document required by Company/TPA for assessment of the claim.",
    ],
    conditions: [
      {
        text: "The company shall only accept bills / invoices / medical treatment related documents only in the Insured Person’s name for whom the claim is submitted",
        type: "Procedural",
        sources: [
          {
            page_number: 16,
            snippet:
              "i. The company shall only accept bills / invoices / medical treatment related documents only in the Insured Person’s name for whom the claim is submitted",
          },
        ],
      },
      {
        text: "In the event of a claim lodged under the Policy and the original documents having been submitted to any other insurer, the Company shall accept the copy of the documents and claim settlement advice, duly certified by the other insurer subject to satisfaction of the Company.",
        type: "Procedural",
        sources: [
          {
            page_number: 16,
            snippet:
              "ii. In the event of a claim lodged under the Policy and the original documents having been submitted to any other insurer, the Company shall accept the copy of the documents and claim settlement advice",
          },
        ],
      },
      {
        text: "Any delay in notification or submission may be condoned on merit where delay is proved to be for reasons beyond the control of the Insured Person",
        type: "Procedural",
        sources: [
          {
            page_number: 16,
            snippet:
              "iii. Any delay in notification or submission may be condoned on merit where delay is proved to be for reasons beyond the control of the Insured Person",
          },
        ],
      },
      {
        text: "In case of any deficiency in submission of documents, the TPA shall issue a deficiency request.",
        type: "Procedural",
        sources: [
          {
            page_number: 19,
            snippet:
              "a. In case of any deficiency in submission of documents, the TPA shall issue a deficiency request.",
          },
        ],
      },
      {
        text: "In case of non-submission of documents requested in the deficiency request within seven days from the date of receipt of the deficiency request, three reminders shall be sent by the TPA at an interval of seven days each.",
        type: "Procedural",
        sources: [
          {
            page_number: 19,
            snippet:
              "b. In case of non-submission of documents requested in the deficiency request within seven days from the date of receipt of the deficiency request, three reminders shall be sent by the TPA at an interval of seven days each.",
          },
        ],
      },
      {
        text: "The claim shall stand repudiated if the documents, mandatory for taking the decision of admissibility of the Claim, are not submitted within seven days of the third reminder.",
        type: "Procedural",
        sources: [
          {
            page_number: 19,
            snippet:
              "c. The claim shall stand repudiated if the documents, mandatory for taking the decision of admissibility of the Claim, are not submitted within seven days of the third reminder.",
          },
        ],
      },
      {
        text: "In case of any delay, such claims shall be paid by Us with a penal interest as per Regulation 9(6) of IRDA (Protection of Policyholders’ Interests) Regulations, 2017 as modified from time to time.",
        type: "Financial",
        sources: [
          {
            page_number: 19,
            snippet:
              "In case of any delay, such claims shall be paid by Us with a penal interest as per Regulation 9(6) of IRDA (Protection of Policyholders’ Interests) Regulations, 2017 as modified from time to time.",
          },
        ],
      },
    ],
    sources: [
      {
        page_number: 16,
        snippet:
          "5.3 NOTICE OF CLAIM: Notice of claim should be given to the Company / TPA within 72 hours from the Hospitalization.",
      },
      {
        page_number: 19,
        snippet: "5.16 PAYMENT OF CLAIM:",
      },
    ],
  },
  renewal_portability_and_cancellation: {
    cancellation_terms: {
      notice_period: {
        limit_type: "Days",
        value: 30,
        unit: "Days",
        text_description:
          "Company may at any time cancel this Policy by sending the insured 30 days’ notice by registered letter",
        sources: [
          {
            page_number: 17,
            snippet:
              "Company may at any time cancel this Policy by sending the insured 30 days’ notice by registered letter",
          },
        ],
      },
      refund_table: {
        table_id: "refund_grid_short_period",
        title: "Refund of Premium - Short Period Rate",
        headers: ["PERIOD OF RISK", "RATE OF PREMIUM TO BE CHARGED"],
        rows: [
          {
            row_number: 1,
            cells: ["Up to one month", "1/4th of the annual rate"],
          },
          {
            row_number: 2,
            cells: ["Up to three months", "1/2 of the annual rate"],
          },
          {
            row_number: 3,
            cells: ["Up to six months", "3/4th of the annual rate"],
          },
          {
            row_number: 4,
            cells: ["Exceeding six months", "Full annual rate"],
          },
        ],
        sources: [
          {
            page_number: 17,
            snippet:
              "PERIOD OF RISK RATE OF PREMIUM TO BE CHARGED\nUp to one month 1/4th of the annual rate",
          },
        ],
      },
      sources: [
        {
          page_number: 17,
          snippet:
            "5.7 CANCELLATION CLAUSE: The policy may be renewed by mutual consent. The company shall not however be bound to give notice that it is due for renewal and the Company may at any time cancel this Policy",
        },
      ],
    },
    portability_conditions: [
      {
        text: "You will have the option to port the policy to other Insurers by applying to such Insurer to port the entire policy along with all the members of the family, if any, at-least 45 days before, but not earlier than 60 days from the policy renewal date as per IRDAI guidelines related to portability.",
        type: "Procedural",
        sources: [
          {
            page_number: 20,
            snippet:
              "You will have the option to port the policy to other Insurers by applying to such Insurer to port the entire policy... at-least 45 days before, but not earlier than 60 days from the policy renewal date",
          },
        ],
      },
      {
        text: "If such person is presently covered and has been continuously covered without any lapses under any Health Insurance policy with an Indian General/Health Insurer, the proposed Insured person will get the accrued continuity benefits in waiting periods as per IRDAI guidelines on portability.",
        type: "Eligibility",
        sources: [
          {
            page_number: 20,
            snippet:
              "If such person is presently covered and has been continuously covered without any lapses... the proposed Insured person will get the accrued continuity benefits in waiting periods",
          },
        ],
      },
    ],
    sources: [
      {
        page_number: 20,
        snippet:
          "PORTABILITY:\nYou will have the option to port the policy to other Insurers by applying to such Insurer",
      },
    ],
  },
  annexures_endorsements_and_schedules: [
    {
      document_type: "Annexure",
      document_name:
        "Annexure I - List I Items for which coverage is not available",
      tables: [
        {
          table_id: "Annexure_I_List_I",
          title:
            "List I – Items for which coverage is not available in the policy",
          headers: ["S No", "Item"],
          rows: [
            {
              row_number: 1,
              cells: ["1", "BABY FOOD"],
            },
            {
              row_number: 2,
              cells: ["2", "BABY UTILITIES CHARGES"],
            },
            {
              row_number: 3,
              cells: ["3", "BEAUTY SERVICES"],
            },
            {
              row_number: 4,
              cells: ["4", "BELTS/ BRACES"],
            },
            {
              row_number: 5,
              cells: ["5", "BUDS"],
            },
            {
              row_number: 6,
              cells: ["6", "COLD PACK/HOT PACK"],
            },
            {
              row_number: 7,
              cells: ["7", "CARRY BAGS"],
            },
            {
              row_number: 8,
              cells: ["8", "EMAIL / INTERNET CHARGES"],
            },
            {
              row_number: 9,
              cells: [
                "9",
                "FOOD CHARGES (OTHER THAN PATIENT's DIET PROVIDED BY HOSPITAL)",
              ],
            },
            {
              row_number: 10,
              cells: ["10", "LEGGINGS"],
            },
            {
              row_number: 11,
              cells: ["11", "LAUNDRY CHARGES"],
            },
            {
              row_number: 12,
              cells: ["12", "MINERAL WATER"],
            },
            {
              row_number: 13,
              cells: ["13", "SANITARY PAD"],
            },
            {
              row_number: 14,
              cells: ["14", "TELEPHONE CHARGES"],
            },
            {
              row_number: 15,
              cells: ["15", "GUEST SERVICES"],
            },
            {
              row_number: 16,
              cells: ["16", "CREPE BANDAGE"],
            },
            {
              row_number: 17,
              cells: ["17", "DIAPER OF ANY TYPE"],
            },
            {
              row_number: 18,
              cells: ["18", "EYELET COLLAR"],
            },
            {
              row_number: 19,
              cells: ["19", "SLINGS"],
            },
            {
              row_number: 20,
              cells: [
                "20",
                "BLOOD GROUPING AND CROSS MATCHING OF DONORS SAMPLES",
              ],
            },
            {
              row_number: 21,
              cells: [
                "21",
                "SERVICE CHARGES WHERE NURSING CHARGE ALSO CHARGED",
              ],
            },
            {
              row_number: 22,
              cells: ["22", "TELEVISION CHARGES"],
            },
            {
              row_number: 23,
              cells: ["23", "SURCHARGES"],
            },
            {
              row_number: 24,
              cells: ["24", "ATTENDANT CHARGES"],
            },
            {
              row_number: 25,
              cells: [
                "25",
                "EXTRA DIET OF PATIENT (OTHER THAN THAT WHICH FORMS PART OF BED CHARGE)",
              ],
            },
            {
              row_number: 26,
              cells: ["26", "BIRTH CERTIFICATE"],
            },
            {
              row_number: 27,
              cells: ["27", "CERTIFICATE CHARGES"],
            },
            {
              row_number: 28,
              cells: ["28", "COURIER CHARGES"],
            },
            {
              row_number: 29,
              cells: ["29", "CONVEYANCE CHARGES"],
            },
            {
              row_number: 30,
              cells: ["30", "MEDICAL CERTIFICATE"],
            },
            {
              row_number: 31,
              cells: ["31", "MEDICAL RECORDS"],
            },
            {
              row_number: 32,
              cells: ["32", "PHOTOCOPIES CHARGES"],
            },
            {
              row_number: 33,
              cells: ["33", "MORTUARY CHARGES"],
            },
            {
              row_number: 34,
              cells: ["34", "WALKING AIDS CHARGES"],
            },
            {
              row_number: 35,
              cells: ["35", "OXYGEN CYLINDER (FOR USAGE OUTSIDE THE HOSPITAL)"],
            },
            {
              row_number: 36,
              cells: ["36", "SPACER"],
            },
            {
              row_number: 37,
              cells: ["37", "SPIROMETRE"],
            },
            {
              row_number: 38,
              cells: ["38", "NEBULIZER KIT"],
            },
            {
              row_number: 39,
              cells: ["39", "STEAM INHALER"],
            },
            {
              row_number: 40,
              cells: ["40", "ARMSLING"],
            },
            {
              row_number: 41,
              cells: ["41", "THERMOMETER"],
            },
            {
              row_number: 42,
              cells: ["42", "CERVICAL COLLAR"],
            },
            {
              row_number: 43,
              cells: ["43", "SPLINT"],
            },
            {
              row_number: 44,
              cells: ["44", "DIABETIC FOOT WEAR"],
            },
            {
              row_number: 45,
              cells: ["45", "KNEE BRACES (LONG/ SHORT/ HINGED)"],
            },
            {
              row_number: 46,
              cells: ["46", "KNEE IMMOBILIZER/SHOULDER IMMOBILIZER"],
            },
            {
              row_number: 47,
              cells: ["47", "LUMBO SACRAL BELT"],
            },
            {
              row_number: 48,
              cells: ["48", "NIMBUS BED OR WATER OR AIR BED CHARGES"],
            },
            {
              row_number: 49,
              cells: ["49", "AMBULANCE COLLAR"],
            },
            {
              row_number: 50,
              cells: ["50", "AMBULANCE EQUIPMENT"],
            },
            {
              row_number: 51,
              cells: ["51", "ABDOMINAL BINDER"],
            },
            {
              row_number: 52,
              cells: ["52", "PRIVATE NURSES CHARGES- SPECIAL NURSING CHARGES"],
            },
            {
              row_number: 53,
              cells: ["53", "SUGAR FREE TABLETS"],
            },
            {
              row_number: 54,
              cells: [
                "54",
                "CREAMS POWDERS LOTIONS (Toiletries are not payable, only prescribed medical pharmaceuticals payable)",
              ],
            },
            {
              row_number: 55,
              cells: ["55", "ECG ELECTRODES"],
            },
            {
              row_number: 56,
              cells: ["56", "GLOVES"],
            },
            {
              row_number: 57,
              cells: ["57", "NEBULISATION KIT"],
            },
            {
              row_number: 58,
              cells: [
                "58",
                "ANY KIT WITH NO DETAILS MENTIONED [DELIVERY KIT, ORTHOKIT, RECOVERY KIT, ETC]",
              ],
            },
            {
              row_number: 59,
              cells: ["59", "KIDNEY TRAY"],
            },
            {
              row_number: 60,
              cells: ["60", "MASK"],
            },
            {
              row_number: 61,
              cells: ["61", "OUNCE GLASS"],
            },
            {
              row_number: 62,
              cells: ["62", "OXYGEN MASK"],
            },
            {
              row_number: 63,
              cells: ["63", "PELVIC TRACTION BELT"],
            },
            {
              row_number: 64,
              cells: ["64", "PAN CAN"],
            },
            {
              row_number: 65,
              cells: ["65", "TROLLY COVER"],
            },
            {
              row_number: 66,
              cells: ["66", "UROMETER, URINE JUG"],
            },
            {
              row_number: 67,
              cells: ["67", "AMBULANCE"],
            },
            {
              row_number: 68,
              cells: ["68", "VASOFIX SAFETY"],
            },
          ],
          sources: [
            {
              page_number: 21,
              snippet:
                "ANNEXURE I: List I – Items for which coverage is not available in the policy",
            },
          ],
        },
      ],
      full_text: "List of 68 items excluded from coverage.",
      sources: [
        {
          page_number: 21,
          snippet:
            "List I – Items for which coverage is not available in the policy",
        },
      ],
    },
    {
      document_type: "Annexure",
      document_name: "Annexure I - List II Items subsumed into Room Charges",
      tables: [
        {
          table_id: "Annexure_I_List_II",
          title: "List II – Items that are to be subsumed into Room Charges",
          headers: ["S No", "Item"],
          rows: [
            {
              row_number: 1,
              cells: ["1", "BABY CHARGES (UNLESS SPECIFIED/INDICATED)"],
            },
            {
              row_number: 2,
              cells: ["2", "HAND WASH"],
            },
            {
              row_number: 3,
              cells: ["3", "SHOE COVER"],
            },
            {
              row_number: 4,
              cells: ["4", "CAPS"],
            },
            {
              row_number: 5,
              cells: ["5", "CRADLE CHARGES"],
            },
            {
              row_number: 6,
              cells: ["6", "COMB"],
            },
            {
              row_number: 7,
              cells: ["7", "EAU-DE-COLOGNE / ROOM FRESHNERS"],
            },
            {
              row_number: 8,
              cells: ["8", "FOOT COVER"],
            },
            {
              row_number: 9,
              cells: ["9", "GOWN"],
            },
            {
              row_number: 10,
              cells: ["10", "SLIPPERS"],
            },
            {
              row_number: 11,
              cells: ["11", "TISSUE PAPER"],
            },
            {
              row_number: 12,
              cells: ["12", "TOOTH PASTE"],
            },
            {
              row_number: 13,
              cells: ["13", "TOOTH BRUSH"],
            },
            {
              row_number: 14,
              cells: ["14", "BED PAN"],
            },
            {
              row_number: 15,
              cells: ["15", "FACE MASK"],
            },
            {
              row_number: 16,
              cells: ["16", "FLEXI MASK"],
            },
            {
              row_number: 17,
              cells: ["17", "HAND HOLDER"],
            },
            {
              row_number: 18,
              cells: ["18", "SPUTUM CUP"],
            },
            {
              row_number: 19,
              cells: ["19", "DISINFECTANT LOTIONS"],
            },
            {
              row_number: 20,
              cells: ["20", "LUXURY TAX"],
            },
            {
              row_number: 21,
              cells: ["21", "HVAC"],
            },
            {
              row_number: 22,
              cells: ["22", "HOUSE KEEPING CHARGES"],
            },
            {
              row_number: 23,
              cells: ["23", "AIR CONDITIONER CHARGES"],
            },
            {
              row_number: 24,
              cells: ["24", "IM IV INJECTION CHARGES"],
            },
            {
              row_number: 25,
              cells: ["25", "CLEAN SHEET"],
            },
            {
              row_number: 26,
              cells: ["26", "BLANKET/WARMER BLANKET"],
            },
            {
              row_number: 27,
              cells: ["27", "ADMISSION KIT"],
            },
            {
              row_number: 28,
              cells: ["28", "DIABETIC CHART CHARGES"],
            },
            {
              row_number: 29,
              cells: ["29", "DOCUMENTATION CHARGES / ADMINISTRATIVE EXPENSES"],
            },
            {
              row_number: 30,
              cells: ["30", "DISCHARGE PROCEDURE CHARGES"],
            },
            {
              row_number: 31,
              cells: ["31", "DAILY CHART CHARGES"],
            },
            {
              row_number: 32,
              cells: ["32", "ENTRANCE PASS / VISITORS PASS CHARGES"],
            },
            {
              row_number: 33,
              cells: ["33", "EXPENSES RELATED TO PRESCRIPTION ON DISCHARGE"],
            },
            {
              row_number: 34,
              cells: ["34", "FILE OPENING CHARGES"],
            },
            {
              row_number: 35,
              cells: [
                "35",
                "INCIDENTAL EXPENSES / MISC. CHARGES (NOT EXPLAINED)",
              ],
            },
            {
              row_number: 36,
              cells: ["36", "PATIENT IDENTIFICATION BAND / NAME TAG"],
            },
            {
              row_number: 37,
              cells: ["37", "PULSEOXYMETER CHARGES"],
            },
          ],
          sources: [
            {
              page_number: 22,
              snippet:
                "List II – Items that are to be subsumed into Room Charges",
            },
          ],
        },
      ],
      full_text: "List of 37 items subsumed into Room Charges.",
      sources: [
        {
          page_number: 22,
          snippet: "List II – Items that are to be subsumed into Room Charges",
        },
      ],
    },
    {
      document_type: "Annexure",
      document_name:
        "Annexure I - List III Items subsumed into Procedure Charges",
      tables: [
        {
          table_id: "Annexure_I_List_III",
          title:
            "List III – Items that are to be subsumed into Procedure Charges",
          headers: ["S No", "Item"],
          rows: [
            {
              row_number: 1,
              cells: ["1", "HAIR REMOVAL CREAM"],
            },
            {
              row_number: 2,
              cells: [
                "2",
                "DISPOSABLES RAZORS CHARGES (for site preparations)",
              ],
            },
            {
              row_number: 3,
              cells: ["3", "EYE PAD"],
            },
            {
              row_number: 4,
              cells: ["4", "EYE SHEILD"],
            },
            {
              row_number: 5,
              cells: ["5", "CAMERA COVER"],
            },
            {
              row_number: 6,
              cells: ["6", "DVD, CD CHARGES"],
            },
            {
              row_number: 7,
              cells: ["7", "GAUSE SOFT"],
            },
            {
              row_number: 8,
              cells: ["8", "GAUZE"],
            },
            {
              row_number: 9,
              cells: ["9", "WARD AND THEATRE BOOKING CHARGES"],
            },
            {
              row_number: 10,
              cells: ["10", "ARTHROSCOPY AND ENDOSCOPY INSTRUMENTS"],
            },
            {
              row_number: 11,
              cells: ["11", "MICROSCOPE COVER"],
            },
            {
              row_number: 12,
              cells: ["12", "SURGICAL BLADES, HARMONICSCALPEL, SHAVER"],
            },
            {
              row_number: 13,
              cells: ["13", "SURGICAL DRILL"],
            },
            {
              row_number: 14,
              cells: ["14", "EYE KIT"],
            },
            {
              row_number: 15,
              cells: ["15", "EYE DRAPE"],
            },
            {
              row_number: 16,
              cells: ["16", "X-RAY FILM"],
            },
            {
              row_number: 17,
              cells: ["17", "BOYLES APPARATUS CHARGES"],
            },
            {
              row_number: 18,
              cells: ["18", "COTTON"],
            },
            {
              row_number: 19,
              cells: ["19", "COTTON BANDAGE"],
            },
            {
              row_number: 20,
              cells: ["20", "SURGICAL TAPE"],
            },
            {
              row_number: 21,
              cells: ["21", "APRON"],
            },
            {
              row_number: 22,
              cells: ["22", "TORNIQUET"],
            },
            {
              row_number: 23,
              cells: ["23", "ORTHOBUNDLE, GYNAEC BUNDLE"],
            },
          ],
          sources: [
            {
              page_number: 23,
              snippet:
                "List III – Items that are to be subsumed into Procedure Charges",
            },
          ],
        },
      ],
      full_text: "List of 23 items subsumed into Procedure Charges.",
      sources: [
        {
          page_number: 23,
          snippet:
            "List III – Items that are to be subsumed into Procedure Charges",
        },
      ],
    },
    {
      document_type: "Annexure",
      document_name:
        "Annexure I - List IV Items subsumed into costs of treatment",
      tables: [
        {
          table_id: "Annexure_I_List_IV",
          title:
            "List IV – Items that are to be subsumed into costs of treatment",
          headers: ["S No", "Item"],
          rows: [
            {
              row_number: 1,
              cells: ["1", "ADMISSION/REGISTRATION CHARGES"],
            },
            {
              row_number: 2,
              cells: [
                "2",
                "HOSPITALISATION FOR EVALUATION/ DIAGNOSTIC PURPOSE",
              ],
            },
            {
              row_number: 3,
              cells: ["3", "URINE CONTAINER"],
            },
            {
              row_number: 4,
              cells: [
                "4",
                "BLOOD RESERVATION CHARGES AND ANTE NATAL BOOKING CHARGES",
              ],
            },
            {
              row_number: 5,
              cells: ["5", "BIPAP MACHINE"],
            },
            {
              row_number: 6,
              cells: ["6", "CPAP/ CAPD EQUIPMENTS"],
            },
            {
              row_number: 7,
              cells: ["7", "INFUSION PUMP– COST"],
            },
            {
              row_number: 8,
              cells: ["8", "HYDROGEN PEROXIDE\\SPIRIT\\ DISINFECTANTS ETC"],
            },
            {
              row_number: 9,
              cells: [
                "9",
                "NUTRITION PLANNING CHARGES - DIETICIAN CHARGES- DIET CHARGES",
              ],
            },
            {
              row_number: 10,
              cells: ["10", "HIV KIT"],
            },
            {
              row_number: 11,
              cells: ["11", "ANTISEPTIC MOUTHWASH"],
            },
            {
              row_number: 12,
              cells: ["12", "LOZENGES"],
            },
            {
              row_number: 13,
              cells: ["13", "MOUTH PAINT"],
            },
            {
              row_number: 14,
              cells: ["14", "VACCINATION CHARGES"],
            },
            {
              row_number: 15,
              cells: ["15", "ALCOHOL SWABES"],
            },
            {
              row_number: 16,
              cells: ["16", "SCRUB SOLUTION/STERILLIUM"],
            },
            {
              row_number: 17,
              cells: ["17", "Glucometer& Strips"],
            },
            {
              row_number: 18,
              cells: ["18", "URINE BAG"],
            },
          ],
          sources: [
            {
              page_number: 23,
              snippet:
                "List IV – Items that are to be subsumed into costs of treatment",
            },
          ],
        },
      ],
      full_text: "List of 18 items subsumed into costs of treatment.",
      sources: [
        {
          page_number: 23,
          snippet:
            "List IV – Items that are to be subsumed into costs of treatment",
        },
      ],
    },
  ],
  tables: [
    {
      table_id: "payment_schedule_specified_diseases",
      title:
        "SCHEDULE OF PAYMENT FOR SPECIFIED DISEAES / Name of Illness / Operation - Maximum Charges",
      headers: [
        "Name of Illness / Operation",
        "Maximum Charges Inclusive of Room / ICU / OT Charges / Surgeons. Anesthetist, doctors fees, medicines, internal appliances and the charges incurred during hospitalization period. (Rs)",
      ],
      rows: [
        {
          row_number: 1,
          cells: ["Angiography", "12,000/-"],
        },
        {
          row_number: 2,
          cells: ["Appendicectomy", "16,200/-"],
        },
        {
          row_number: 3,
          cells: ["Arthroscopy", "10,800/-"],
        },
        {
          row_number: 4,
          cells: ["Cataract with imported foldable lens", "10,800/-"],
        },
        {
          row_number: 5,
          cells: ["Cheolecystectomy", "18,000/-"],
        },
        {
          row_number: 6,
          cells: ["Exploratory Laprotomy", "15,000/-"],
        },
        {
          row_number: 7,
          cells: ["Fissurectomy", "9,000/-"],
        },
        {
          row_number: 8,
          cells: ["Fistulectomy", "10,800/-"],
        },
        {
          row_number: 9,
          cells: ["Haemorrhoidectomy", "8,100/-"],
        },
        {
          row_number: 10,
          cells: ["Hernia-Inguinal", "16,200/-"],
        },
        {
          row_number: 11,
          cells: ["Hernia- Ventral/Incisional", "19,800/-"],
        },
        {
          row_number: 12,
          cells: ["Hysterectomy", "22,500/-"],
        },
        {
          row_number: 13,
          cells: ["Kidney stone/lithotripsy", "13,500/-"],
        },
        {
          row_number: 14,
          cells: ["Mastectomy (Radical)", "36,000/-"],
        },
        {
          row_number: 15,
          cells: ["PID-Disectomy", "31,500/-"],
        },
        {
          row_number: 16,
          cells: ["Septoplasty", "9,000/-"],
        },
        {
          row_number: 17,
          cells: ["Tonsillectomy", "7,200/-"],
        },
        {
          row_number: 18,
          cells: ["TURP", "18,000/-"],
        },
        {
          row_number: 19,
          cells: ["Tympanoplasty", "13,500/-"],
        },
      ],
      sources: [
        {
          page_number: 2,
          snippet:
            "Name of Illness / Operation Maximum Charges Inclusive of Room / ICU / OT Charges / Surgeons. Anesthetist, doctors fees, medicines, internal appliances and the charges incurred during hospitalization period. (Rs)",
        },
      ],
    },
    {
      table_id: "per_day_charges_limit",
      title:
        "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less",
      headers: [
        "PER DAY CHARGES",
        "FOR SI 50K",
        "FOR SI 75K",
        "FOR SI 100K",
        "FOR SI 200K",
      ],
      rows: [
        {
          row_number: 1,
          cells: [
            "Room rent (inclusive of nursing/treatment charges)",
            "450",
            "450",
            "1000",
            "2000",
          ],
        },
        {
          row_number: 2,
          cells: [
            "Minor surgery/Day care room rent per day",
            "450",
            "450",
            "1000",
            "2000",
          ],
        },
        {
          row_number: 3,
          cells: ["Operation Theatre Charges", "1260", "1260", "1600", "1800"],
        },
        {
          row_number: 4,
          cells: ["Anesthesia", "630", "630", "800", "950"],
        },
        {
          row_number: 5,
          cells: ["Anesthetist Fees", "945", "945", "1200", "1400"],
        },
        {
          row_number: 6,
          cells: ["Surgeon fees", "3150", "3150", "3500", "4300"],
        },
      ],
      sources: [
        {
          page_number: 2,
          snippet:
            "Actual expenses for Other Surgeries / Hospitalisation or given hereunder whichever is less:\nPER DAY CHARGES FOR SI 50K FOR SI 75K FOR SI 100K FOR SI 200K",
        },
      ],
    },
    {
      table_id: "intermediate_surgery_charges",
      title: "INTERMIDIATE SURGERY CHARGES",
      headers: [
        "INTERMIDIATE SURGERY",
        "FOR SI 50K",
        "FOR SI 75K",
        "FOR SI 100K",
        "FOR SI 200K",
      ],
      rows: [
        {
          row_number: 1,
          cells: ["Room rent", "450", "450", "1000", "2000"],
        },
        {
          row_number: 2,
          cells: ["Operation Theatre Charges", "1764", "1764", "2200", "2500"],
        },
        {
          row_number: 3,
          cells: ["Anesthesia", "882", "882", "1100", "1300"],
        },
        {
          row_number: 4,
          cells: ["Anesthetist Fees", "1323", "1323", "1600", "1900"],
        },
        {
          row_number: 5,
          cells: ["Surgeon fees", "4410", "4410", "5400", "6300"],
        },
      ],
      sources: [
        {
          page_number: 2,
          snippet: "INTERMIDIATE SURGERY\nRoom rent 450 450 1000 2000",
        },
      ],
    },
    {
      table_id: "major_surgery_charges",
      title: "MAJOR SURGERY CHARGES",
      headers: [
        "MAJOR SURGERY",
        "FOR SI 50K",
        "FOR SI 75K",
        "FOR SI 100K",
        "FOR SI 200K",
      ],
      rows: [
        {
          row_number: 1,
          cells: ["Room rent", "450", "450", "1000", "2000"],
        },
        {
          row_number: 2,
          cells: ["Operation Theatre Charges", "2520", "2520", "3200", "3700"],
        },
        {
          row_number: 3,
          cells: ["Anesthesia", "1260", "1260", "1600", "1900"],
        },
        {
          row_number: 4,
          cells: ["Anesthetist Fees", "1890", "1890", "2300", "2800"],
        },
        {
          row_number: 5,
          cells: ["Surgeon fees", "6300", "6300", "7500", "9000"],
        },
      ],
      sources: [
        {
          page_number: 2,
          snippet: "MAJOR SURGERY\nRoom rent 450 450 1000 2000",
        },
      ],
    },
    {
      table_id: "supra_major_surgery_charges",
      title: "SUPRA MAJOR SURGERY CHARGES",
      headers: [
        "SUPRA MAJOR SURGERY",
        "FOR SI 50K",
        "FOR SI 75K",
        "FOR SI 100K",
        "FOR SI 200K",
      ],
      rows: [
        {
          row_number: 1,
          cells: ["Room rent", "450", "450", "1000", "2000"],
        },
        {
          row_number: 2,
          cells: ["Operation Theatre Charges", "5040", "5040", "6300", "7500"],
        },
        {
          row_number: 3,
          cells: ["Anesthesia", "2520", "2520", "3100", "3700"],
        },
        {
          row_number: 4,
          cells: ["Anesthetist Fees", "3780", "3780", "4700", "5500"],
        },
        {
          row_number: 5,
          cells: ["Surgeon fees", "12600", "12600", "15000", "17000"],
        },
        {
          row_number: 6,
          cells: [
            "ICU Charges (per day with all intensive care infrastructure & facilities)",
            "1800",
            "1800",
            "2250",
            "2700",
          ],
        },
        {
          row_number: 7,
          cells: ["Ventilator Charges (Per day)", "450", "450", "600", "800"],
        },
        {
          row_number: 8,
          cells: [
            "Visit Charges (Per day irrespective of number of visits)",
            "360",
            "360",
            "500",
            "600",
          ],
        },
      ],
      sources: [
        {
          page_number: 2,
          snippet: "SUPRA MAJOR SURGERY\nRoom rent 450 450 1000 2000",
        },
      ],
    },
    {
      table_id: "refund_grid_short_period",
      title: "Refund of Premium - Short Period Rate",
      headers: ["PERIOD OF RISK", "RATE OF PREMIUM TO BE CHARGED"],
      rows: [
        {
          row_number: 1,
          cells: ["Up to one month", "1/4th of the annual rate"],
        },
        {
          row_number: 2,
          cells: ["Up to three months", "1/2 of the annual rate"],
        },
        {
          row_number: 3,
          cells: ["Up to six months", "3/4th of the annual rate"],
        },
        {
          row_number: 4,
          cells: ["Exceeding six months", "Full annual rate"],
        },
      ],
      sources: [
        {
          page_number: 17,
          snippet:
            "PERIOD OF RISK RATE OF PREMIUM TO BE CHARGED\nUp to one month 1/4th of the annual rate",
        },
      ],
    },
    {
      table_id: "Annexure_I_List_I",
      title: "List I – Items for which coverage is not available in the policy",
      headers: ["S No", "Item"],
      rows: [
        {
          row_number: 1,
          cells: ["1", "BABY FOOD"],
        },
        {
          row_number: 2,
          cells: ["2", "BABY UTILITIES CHARGES"],
        },
        {
          row_number: 3,
          cells: ["3", "BEAUTY SERVICES"],
        },
        {
          row_number: 4,
          cells: ["4", "BELTS/ BRACES"],
        },
        {
          row_number: 5,
          cells: ["5", "BUDS"],
        },
        {
          row_number: 6,
          cells: ["6", "COLD PACK/HOT PACK"],
        },
        {
          row_number: 7,
          cells: ["7", "CARRY BAGS"],
        },
        {
          row_number: 8,
          cells: ["8", "EMAIL / INTERNET CHARGES"],
        },
        {
          row_number: 9,
          cells: [
            "9",
            "FOOD CHARGES (OTHER THAN PATIENT's DIET PROVIDED BY HOSPITAL)",
          ],
        },
        {
          row_number: 10,
          cells: ["10", "LEGGINGS"],
        },
        {
          row_number: 11,
          cells: ["11", "LAUNDRY CHARGES"],
        },
        {
          row_number: 12,
          cells: ["12", "MINERAL WATER"],
        },
        {
          row_number: 13,
          cells: ["13", "SANITARY PAD"],
        },
        {
          row_number: 14,
          cells: ["14", "TELEPHONE CHARGES"],
        },
        {
          row_number: 15,
          cells: ["15", "GUEST SERVICES"],
        },
        {
          row_number: 16,
          cells: ["16", "CREPE BANDAGE"],
        },
        {
          row_number: 17,
          cells: ["17", "DIAPER OF ANY TYPE"],
        },
        {
          row_number: 18,
          cells: ["18", "EYELET COLLAR"],
        },
        {
          row_number: 19,
          cells: ["19", "SLINGS"],
        },
        {
          row_number: 20,
          cells: ["20", "BLOOD GROUPING AND CROSS MATCHING OF DONORS SAMPLES"],
        },
        {
          row_number: 21,
          cells: ["21", "SERVICE CHARGES WHERE NURSING CHARGE ALSO CHARGED"],
        },
        {
          row_number: 22,
          cells: ["22", "TELEVISION CHARGES"],
        },
        {
          row_number: 23,
          cells: ["23", "SURCHARGES"],
        },
        {
          row_number: 24,
          cells: ["24", "ATTENDANT CHARGES"],
        },
        {
          row_number: 25,
          cells: [
            "25",
            "EXTRA DIET OF PATIENT (OTHER THAN THAT WHICH FORMS PART OF BED CHARGE)",
          ],
        },
        {
          row_number: 26,
          cells: ["26", "BIRTH CERTIFICATE"],
        },
        {
          row_number: 27,
          cells: ["27", "CERTIFICATE CHARGES"],
        },
        {
          row_number: 28,
          cells: ["28", "COURIER CHARGES"],
        },
        {
          row_number: 29,
          cells: ["29", "CONVEYANCE CHARGES"],
        },
        {
          row_number: 30,
          cells: ["30", "MEDICAL CERTIFICATE"],
        },
        {
          row_number: 31,
          cells: ["31", "MEDICAL RECORDS"],
        },
        {
          row_number: 32,
          cells: ["32", "PHOTOCOPIES CHARGES"],
        },
        {
          row_number: 33,
          cells: ["33", "MORTUARY CHARGES"],
        },
        {
          row_number: 34,
          cells: ["34", "WALKING AIDS CHARGES"],
        },
        {
          row_number: 35,
          cells: ["35", "OXYGEN CYLINDER (FOR USAGE OUTSIDE THE HOSPITAL)"],
        },
        {
          row_number: 36,
          cells: ["36", "SPACER"],
        },
        {
          row_number: 37,
          cells: ["37", "SPIROMETRE"],
        },
        {
          row_number: 38,
          cells: ["38", "NEBULIZER KIT"],
        },
        {
          row_number: 39,
          cells: ["39", "STEAM INHALER"],
        },
        {
          row_number: 40,
          cells: ["40", "ARMSLING"],
        },
        {
          row_number: 41,
          cells: ["41", "THERMOMETER"],
        },
        {
          row_number: 42,
          cells: ["42", "CERVICAL COLLAR"],
        },
        {
          row_number: 43,
          cells: ["43", "SPLINT"],
        },
        {
          row_number: 44,
          cells: ["44", "DIABETIC FOOT WEAR"],
        },
        {
          row_number: 45,
          cells: ["45", "KNEE BRACES (LONG/ SHORT/ HINGED)"],
        },
        {
          row_number: 46,
          cells: ["46", "KNEE IMMOBILIZER/SHOULDER IMMOBILIZER"],
        },
        {
          row_number: 47,
          cells: ["47", "LUMBO SACRAL BELT"],
        },
        {
          row_number: 48,
          cells: ["48", "NIMBUS BED OR WATER OR AIR BED CHARGES"],
        },
        {
          row_number: 49,
          cells: ["49", "AMBULANCE COLLAR"],
        },
        {
          row_number: 50,
          cells: ["50", "AMBULANCE EQUIPMENT"],
        },
        {
          row_number: 51,
          cells: ["51", "ABDOMINAL BINDER"],
        },
        {
          row_number: 52,
          cells: ["52", "PRIVATE NURSES CHARGES- SPECIAL NURSING CHARGES"],
        },
        {
          row_number: 53,
          cells: ["53", "SUGAR FREE TABLETS"],
        },
        {
          row_number: 54,
          cells: [
            "54",
            "CREAMS POWDERS LOTIONS (Toiletries are not payable, only prescribed medical pharmaceuticals payable)",
          ],
        },
        {
          row_number: 55,
          cells: ["55", "ECG ELECTRODES"],
        },
        {
          row_number: 56,
          cells: ["56", "GLOVES"],
        },
        {
          row_number: 57,
          cells: ["57", "NEBULISATION KIT"],
        },
        {
          row_number: 58,
          cells: [
            "58",
            "ANY KIT WITH NO DETAILS MENTIONED [DELIVERY KIT, ORTHOKIT, RECOVERY KIT, ETC]",
          ],
        },
        {
          row_number: 59,
          cells: ["59", "KIDNEY TRAY"],
        },
        {
          row_number: 60,
          cells: ["60", "MASK"],
        },
        {
          row_number: 61,
          cells: ["61", "OUNCE GLASS"],
        },
        {
          row_number: 62,
          cells: ["62", "OXYGEN MASK"],
        },
        {
          row_number: 63,
          cells: ["63", "PELVIC TRACTION BELT"],
        },
        {
          row_number: 64,
          cells: ["64", "PAN CAN"],
        },
        {
          row_number: 65,
          cells: ["65", "TROLLY COVER"],
        },
        {
          row_number: 66,
          cells: ["66", "UROMETER, URINE JUG"],
        },
        {
          row_number: 67,
          cells: ["67", "AMBULANCE"],
        },
        {
          row_number: 68,
          cells: ["68", "VASOFIX SAFETY"],
        },
      ],
      sources: [
        {
          page_number: 21,
          snippet:
            "ANNEXURE I: List I – Items for which coverage is not available in the policy",
        },
      ],
    },
    {
      table_id: "Annexure_I_List_II",
      title: "List II – Items that are to be subsumed into Room Charges",
      headers: ["S No", "Item"],
      rows: [
        {
          row_number: 1,
          cells: ["1", "BABY CHARGES (UNLESS SPECIFIED/INDICATED)"],
        },
        {
          row_number: 2,
          cells: ["2", "HAND WASH"],
        },
        {
          row_number: 3,
          cells: ["3", "SHOE COVER"],
        },
        {
          row_number: 4,
          cells: ["4", "CAPS"],
        },
        {
          row_number: 5,
          cells: ["5", "CRADLE CHARGES"],
        },
        {
          row_number: 6,
          cells: ["6", "COMB"],
        },
        {
          row_number: 7,
          cells: ["7", "EAU-DE-COLOGNE / ROOM FRESHNERS"],
        },
        {
          row_number: 8,
          cells: ["8", "FOOT COVER"],
        },
        {
          row_number: 9,
          cells: ["9", "GOWN"],
        },
        {
          row_number: 10,
          cells: ["10", "SLIPPERS"],
        },
        {
          row_number: 11,
          cells: ["11", "TISSUE PAPER"],
        },
        {
          row_number: 12,
          cells: ["12", "TOOTH PASTE"],
        },
        {
          row_number: 13,
          cells: ["13", "TOOTH BRUSH"],
        },
        {
          row_number: 14,
          cells: ["14", "BED PAN"],
        },
        {
          row_number: 15,
          cells: ["15", "FACE MASK"],
        },
        {
          row_number: 16,
          cells: ["16", "FLEXI MASK"],
        },
        {
          row_number: 17,
          cells: ["17", "HAND HOLDER"],
        },
        {
          row_number: 18,
          cells: ["18", "SPUTUM CUP"],
        },
        {
          row_number: 19,
          cells: ["19", "DISINFECTANT LOTIONS"],
        },
        {
          row_number: 20,
          cells: ["20", "LUXURY TAX"],
        },
        {
          row_number: 21,
          cells: ["21", "HVAC"],
        },
        {
          row_number: 22,
          cells: ["22", "HOUSE KEEPING CHARGES"],
        },
        {
          row_number: 23,
          cells: ["23", "AIR CONDITIONER CHARGES"],
        },
        {
          row_number: 24,
          cells: ["24", "IM IV INJECTION CHARGES"],
        },
        {
          row_number: 25,
          cells: ["25", "CLEAN SHEET"],
        },
        {
          row_number: 26,
          cells: ["26", "BLANKET/WARMER BLANKET"],
        },
        {
          row_number: 27,
          cells: ["27", "ADMISSION KIT"],
        },
        {
          row_number: 28,
          cells: ["28", "DIABETIC CHART CHARGES"],
        },
        {
          row_number: 29,
          cells: ["29", "DOCUMENTATION CHARGES / ADMINISTRATIVE EXPENSES"],
        },
        {
          row_number: 30,
          cells: ["30", "DISCHARGE PROCEDURE CHARGES"],
        },
        {
          row_number: 31,
          cells: ["31", "DAILY CHART CHARGES"],
        },
        {
          row_number: 32,
          cells: ["32", "ENTRANCE PASS / VISITORS PASS CHARGES"],
        },
        {
          row_number: 33,
          cells: ["33", "EXPENSES RELATED TO PRESCRIPTION ON DISCHARGE"],
        },
        {
          row_number: 34,
          cells: ["34", "FILE OPENING CHARGES"],
        },
        {
          row_number: 35,
          cells: ["35", "INCIDENTAL EXPENSES / MISC. CHARGES (NOT EXPLAINED)"],
        },
        {
          row_number: 36,
          cells: ["36", "PATIENT IDENTIFICATION BAND / NAME TAG"],
        },
        {
          row_number: 37,
          cells: ["37", "PULSEOXYMETER CHARGES"],
        },
      ],
      sources: [
        {
          page_number: 22,
          snippet: "List II – Items that are to be subsumed into Room Charges",
        },
      ],
    },
    {
      table_id: "Annexure_I_List_III",
      title: "List III – Items that are to be subsumed into Procedure Charges",
      headers: ["S No", "Item"],
      rows: [
        {
          row_number: 1,
          cells: ["1", "HAIR REMOVAL CREAM"],
        },
        {
          row_number: 2,
          cells: ["2", "DISPOSABLES RAZORS CHARGES (for site preparations)"],
        },
        {
          row_number: 3,
          cells: ["3", "EYE PAD"],
        },
        {
          row_number: 4,
          cells: ["4", "EYE SHEILD"],
        },
        {
          row_number: 5,
          cells: ["5", "CAMERA COVER"],
        },
        {
          row_number: 6,
          cells: ["6", "DVD, CD CHARGES"],
        },
        {
          row_number: 7,
          cells: ["7", "GAUSE SOFT"],
        },
        {
          row_number: 8,
          cells: ["8", "GAUZE"],
        },
        {
          row_number: 9,
          cells: ["9", "WARD AND THEATRE BOOKING CHARGES"],
        },
        {
          row_number: 10,
          cells: ["10", "ARTHROSCOPY AND ENDOSCOPY INSTRUMENTS"],
        },
        {
          row_number: 11,
          cells: ["11", "MICROSCOPE COVER"],
        },
        {
          row_number: 12,
          cells: ["12", "SURGICAL BLADES, HARMONICSCALPEL, SHAVER"],
        },
        {
          row_number: 13,
          cells: ["13", "SURGICAL DRILL"],
        },
        {
          row_number: 14,
          cells: ["14", "EYE KIT"],
        },
        {
          row_number: 15,
          cells: ["15", "EYE DRAPE"],
        },
        {
          row_number: 16,
          cells: ["16", "X-RAY FILM"],
        },
        {
          row_number: 17,
          cells: ["17", "BOYLES APPARATUS CHARGES"],
        },
        {
          row_number: 18,
          cells: ["18", "COTTON"],
        },
        {
          row_number: 19,
          cells: ["19", "COTTON BANDAGE"],
        },
        {
          row_number: 20,
          cells: ["20", "SURGICAL TAPE"],
        },
        {
          row_number: 21,
          cells: ["21", "APRON"],
        },
        {
          row_number: 22,
          cells: ["22", "TORNIQUET"],
        },
        {
          row_number: 23,
          cells: ["23", "ORTHOBUNDLE, GYNAEC BUNDLE"],
        },
      ],
      sources: [
        {
          page_number: 23,
          snippet:
            "List III – Items that are to be subsumed into Procedure Charges",
        },
      ],
    },
    {
      table_id: "Annexure_I_List_IV",
      title: "List IV – Items that are to be subsumed into costs of treatment",
      headers: ["S No", "Item"],
      rows: [
        {
          row_number: 1,
          cells: ["1", "ADMISSION/REGISTRATION CHARGES"],
        },
        {
          row_number: 2,
          cells: ["2", "HOSPITALISATION FOR EVALUATION/ DIAGNOSTIC PURPOSE"],
        },
        {
          row_number: 3,
          cells: ["3", "URINE CONTAINER"],
        },
        {
          row_number: 4,
          cells: [
            "4",
            "BLOOD RESERVATION CHARGES AND ANTE NATAL BOOKING CHARGES",
          ],
        },
        {
          row_number: 5,
          cells: ["5", "BIPAP MACHINE"],
        },
        {
          row_number: 6,
          cells: ["6", "CPAP/ CAPD EQUIPMENTS"],
        },
        {
          row_number: 7,
          cells: ["7", "INFUSION PUMP– COST"],
        },
        {
          row_number: 8,
          cells: ["8", "HYDROGEN PEROXIDE\\SPIRIT\\ DISINFECTANTS ETC"],
        },
        {
          row_number: 9,
          cells: [
            "9",
            "NUTRITION PLANNING CHARGES - DIETICIAN CHARGES- DIET CHARGES",
          ],
        },
        {
          row_number: 10,
          cells: ["10", "HIV KIT"],
        },
        {
          row_number: 11,
          cells: ["11", "ANTISEPTIC MOUTHWASH"],
        },
        {
          row_number: 12,
          cells: ["12", "LOZENGES"],
        },
        {
          row_number: 13,
          cells: ["13", "MOUTH PAINT"],
        },
        {
          row_number: 14,
          cells: ["14", "VACCINATION CHARGES"],
        },
        {
          row_number: 15,
          cells: ["15", "ALCOHOL SWABES"],
        },
        {
          row_number: 16,
          cells: ["16", "SCRUB SOLUTION/STERILLIUM"],
        },
        {
          row_number: 17,
          cells: ["17", "Glucometer& Strips"],
        },
        {
          row_number: 18,
          cells: ["18", "URINE BAG"],
        },
      ],
      sources: [
        {
          page_number: 23,
          snippet:
            "List IV – Items that are to be subsumed into costs of treatment",
        },
      ],
    },
  ],
};
