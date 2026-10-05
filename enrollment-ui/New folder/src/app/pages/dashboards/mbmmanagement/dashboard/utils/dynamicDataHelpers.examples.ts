/**
 * Test examples for dynamic data helpers
 * These demonstrate how to use the helpers in real scenarios
 */

import {
  makeExtensible,
  addFieldSafely,
  addSource,
  convertToObjectArray,
  ensureObjectArray,
  makeAllExtensible,
  mergeSafely,
  getAllFieldPaths,
} from './dynamicDataHelpers';

// Example 1: Making an object extensible
export function example1_MakeExtensible() {
  const simpleObject = {
    name: "Room Rent",
    limit: "1% of SI",
  };

  const extensible = makeExtensible(simpleObject);
  // Now extensible has: sources, references, limits, conditions, notes, _field_metadata, _section_metadata

  return extensible;
}

// Example 2: Adding a field safely
export function example2_AddFieldSafely() {
  const data = {
    policy_metadata: {
      uin: "NIAHLGP21236V022021",
    },
  };

  // Add new field
  const updated = addFieldSafely(data, 'policy_metadata.policy_holder_email', 'holder@example.com');
  
  // Add nested field
  const updated2 = addFieldSafely(updated, 'policy_metadata.contact.phone', '+91-9876543210');

  return updated2;
}

// Example 3: Adding source reference
export function example3_AddSource() {
  const data = {
    base_covers: {
      room_rent: {
        limit_value: "1% of SI",
      },
    },
  };

  const updated = addSource(data, 'base_covers.room_rent', {
    snippet: "Room Rent, boarding and nursing expenses not exceeding 1% of Sum Insured per day",
    page_number: 12,
    document_id: "New-India-Flexi-Floater-GMP.pdf",
    clause_reference: "Clause 3.1 (a)",
  });

  return updated;
}

// Example 4: Converting string array to object array
export function example4_ConvertToObjectArray() {
  const diseases = [
    "Benign prostate hypertrophy",
    "Hernia of all types",
    "Hydrocele",
  ];

  const objects = convertToObjectArray(diseases, {
    idField: 'disease_id',
    valueField: 'disease_name',
    additionalFields: {
      category: 'specific_disease',
      waiting_period: '24 months',
    },
  });

  return objects;
}

// Example 5: Ensuring array contains objects
export function example5_EnsureObjectArray() {
  const mixedArray = [
    "Item 1",
    "Item 2",
    { name: "Item 3", value: 100 },
  ];

  const objectArray = ensureObjectArray(mixedArray);

  return objectArray;
}

// Example 6: Making entire data structure extensible
export function example6_MakeAllExtensible() {
  const complexData = {
    section1: {
      field1: "value1",
      array1: ["item1", "item2"],
      nested: {
        field2: "value2",
      },
    },
  };

  const extensible = makeAllExtensible(complexData);

  return extensible;
}

// Example 7: Merging data safely
export function example7_MergeSafely() {
  const existing = {
    policy_metadata: {
      uin: "NIAHLGP21236V022021",
      product_name: "GOOD HEALTH",
    },
    exclusions: {
      permanent_exclusions: [
        { title: "Exclusion 1" },
      ],
    },
  };

  const newData = {
    policy_metadata: {
      product_name: "GOOD HEALTH UPDATED",
      new_field: "new value",
    },
    exclusions: {
      permanent_exclusions: [
        { title: "Exclusion 2" },
      ],
    },
    new_section: {
      new_field: "value",
    },
  };

  const merged = mergeSafely(existing, newData, {
    deep: true,
    preserveArrays: true, // Will append to arrays instead of replacing
  });

  return merged;
}

// Example 8: Getting all field paths
export function example8_GetAllFieldPaths() {
  const data = {
    policy_metadata: {
      uin: "NIAHLGP21236V022021",
      contact: {
        email: "test@example.com",
        phone: "+91-1234567890",
      },
    },
    exclusions: {
      permanent_exclusions: [
        { title: "Exclusion 1" },
        { title: "Exclusion 2" },
      ],
    },
  };

  const paths = getAllFieldPaths(data);
  // Returns: [
  //   "policy_metadata.uin",
  //   "policy_metadata.contact.email",
  //   "policy_metadata.contact.phone",
  //   "exclusions.permanent_exclusions[0].title",
  //   "exclusions.permanent_exclusions[1].title",
  // ]

  return paths;
}

// Example 9: Complete workflow - adding new section with all extensibility features
export function example9_CompleteWorkflow() {
  let data: any = {
    policy_metadata: {
      uin: "NIAHLGP21236V022021",
    },
  };

  // 1. Add new section
  data = addFieldSafely(data, 'network_hospitals', {
    hospitals: [],
    summary: {},
  });

  // 2. Add hospital with extensibility
  const hospital = makeExtensible({
    hospital_id: "H001",
    name: "Apollo Hospital",
    city: "Mumbai",
  });

  // 3. Add source reference
  hospital.sources?.push({
    snippet: "Listed in network provider directory",
    page_number: 45,
    document_id: "network-directory.pdf",
  });

  // 4. Add reference
  hospital.references?.push({
    type: 'external',
    value: 'NABH-12345',
    description: 'NABH Accreditation Number',
  });

  // 5. Add limit
  hospital.limits = {
    max: 100,
    unit: 'beds',
    description: 'Maximum number of beds',
  };

  // 6. Add condition
  hospital.conditions?.push({
    condition_text: 'Cashless facility available',
    applies_when: 'Pre-authorization approved',
    exceptions: ['Emergency cases'],
  });

  // 7. Add note
  hospital.notes?.push({
    note_type: 'important',
    content: 'Preferred provider for cardiac procedures',
    created_by: 'admin',
    created_at: new Date().toISOString(),
  });

  // 8. Add to data
  data.network_hospitals.hospitals.push(hospital);

  return data;
}

