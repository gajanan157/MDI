import { getMultipleRandom } from "@/utils/getMultipleRandom";

export interface SimpleDataItem {
  uid: string;
  name: string;
  job: string;
  favColor: string;
}

export interface FakeDataItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  address: string;
}

export interface SubRowItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  address: string;
  subRows?: SubRowItem[];
}

export interface SubComponentItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  address: string;
  subComponentData: SimpleDataItem[];
}

export const simpleData: SimpleDataItem[] = [
  {
    uid: "1",
    name: "Cy Ganderton",
    job: "Quality Control Specialist",
    favColor: "Blue",
  },
  {
    uid: "2",
    name: "Hart Hagerty",
    job: "Desktop Support Technician",
    favColor: "Purple",
  },
  {
    uid: "3",
    name: "Brice Swyre",
    job: "Tax Accountant",
    favColor: "Red",
  },
  {
    uid: "4",
    name: "Marjy Ferencz",
    job: "Office Assistant I",
    favColor: "Crimson",
  },
];

export const fakeData: FakeDataItem[] = [
  {
    id: "1",
    firstName: "Tera",
    lastName: "Bygreaves",
    email: "tbygreaves0@jiathis.com",
    state: "Nevada",
    address: "23804 Randy Court",
  },
  {
    id: "2",
    firstName: "Blair",
    lastName: "Dabbes",
    email: "bdabbes1@twitter.com",
    state: "Connecticut",
    address: "4 Pond Court",
  },
  {
    id: "3",
    firstName: "Case",
    lastName: "Davydzenko",
    email: "cdavydzenko2@sphinn.com",
    state: "District of Columbia",
    address: "98 Summit Drive",
  },
  {
    id: "4",
    firstName: "Noe",
    lastName: "Worshall",
    email: "nworshall3@usnews.com",
    state: "Tennessee",
    address: "10636 Corry Street",
  },
];

export const subRowData: SubRowItem[] = [
  {
    id: "1",
    firstName: "Tera",
    lastName: "Bygreaves",
    email: "tbygreaves0@jiathis.com",
    state: "Nevada",
    address: "23804 Randy Court",
    subRows: [
      {
        id: "11",
        firstName: "Karlik",
        lastName: "Cushelly",
        email: "kcushelly3f@cornell.edu",
        state: "Colorado",
        address: "727 Cardinal Hill",
      },
      {
        id: "12",
        firstName: "Katharina",
        lastName: "Barton",
        email: "kbarton@example.com",
        state: "California",
        address: "8 Vahlen Parkway",
      },
    ],
  },
  {
    id: "2",
    firstName: "Blair",
    lastName: "Dabbes",
    email: "bdabbes1@twitter.com",
    state: "Connecticut",
    address: "4 Pond Court",
  },
  {
    id: "3",
    firstName: "Case",
    lastName: "Davydzenko",
    email: "cdavydzenko2@sphinn.com",
    state: "District of Columbia",
    address: "98 Summit Drive",
  },
  {
    id: "4",
    firstName: "Noe",
    lastName: "Worshall",
    email: "nworshall3@usnews.com",
    state: "Tennessee",
    address: "10636 Corry Street",
  },
];

export const subComponent: SubComponentItem[] = [
  {
    id: "1",
    firstName: "Tera",
    lastName: "Bygreaves",
    email: "tbygreaves0@jiathis.com",
    state: "Nevada",
    address: "23804 Randy Court",
    subComponentData: [...getMultipleRandom(simpleData, 2)],
  },
  {
    id: "2",
    firstName: "Blair",
    lastName: "Dabbes",
    email: "bdabbes1@twitter.com",
    state: "Connecticut",
    address: "4 Pond Court",
    subComponentData: [...getMultipleRandom(simpleData, 3)],
  },
  {
    id: "3",
    firstName: "Case",
    lastName: "Davydzenko",
    email: "cdavydzenko2@sphinn.com",
    state: "District of Columbia",
    address: "98 Summit Drive",
    subComponentData: [...getMultipleRandom(simpleData, 1)],
  },
  {
    id: "4",
    firstName: "Noe",
    lastName: "Worshall",
    email: "nworshall3@usnews.com",
    state: "Tennessee",
    address: "10636 Corry Street",
    subComponentData: [...getMultipleRandom(simpleData, 2)],
  },
];
