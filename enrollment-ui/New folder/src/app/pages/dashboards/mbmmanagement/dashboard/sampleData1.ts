export type BranchTableRow = {
  branchName: string;
  branchPendency: number;
  branchPendency2: number;
  cbfInward: number;
  authUnderProcess: number;
  authApproved: number;
  authQueryRaised: number;
  claimUnderProcess: number;
  claimApproved: number;
  claimQueryRaised: number;
  approved: number;
  pendingForAppend: number;
  totalCbfAppend: number;
};

type BranchMetrics = readonly [
  branchPendency: number,
  branchPendency2: number,
  cbfInward: number,
  authUnderProcess: number,
  authApproved: number,
  authQueryRaised: number,
  claimUnderProcess: number,
  claimApproved: number,
  claimQueryRaised: number,
  approved: number,
  pendingForAppend: number,
  totalCbfAppend: number,
];

function branchRow(branchName: string, metrics: BranchMetrics): BranchTableRow {
  const [
    branchPendency,
    branchPendency2,
    cbfInward,
    authUnderProcess,
    authApproved,
    authQueryRaised,
    claimUnderProcess,
    claimApproved,
    claimQueryRaised,
    approved,
    pendingForAppend,
    totalCbfAppend,
  ] = metrics;

  return {
    branchName,
    branchPendency,
    branchPendency2,
    cbfInward,
    authUnderProcess,
    authApproved,
    authQueryRaised,
    claimUnderProcess,
    claimApproved,
    claimQueryRaised,
    approved,
    pendingForAppend,
    totalCbfAppend,
  };
}

const STATIC_BRANCH_ROW_DEFS = [
  ["Ahmedabad", [0, 2, 413, 0, 413, 0, 0, 413, 0, 413, 0, 413]],
  ["Bangalore", [1, 4, 586, 2, 581, 3, 2, 580, 4, 580, 0, 580]],
  ["Baroda", [1, 5, 331, 0, 331, 0, 0, 331, 0, 331, 0, 331]],
  ["Bhopal", [0, 7, 211, 1, 210, 0, 0, 210, 1, 210, 0, 210]],
  ["Chennai", [8, 6, 830, 4, 822, 4, 4, 818, 8, 818, 0, 818]],
  ["Coimbatore", [0, 21, 491, 0, 491, 0, 0, 491, 0, 491, 0, 491]],
  ["CRM", [50, 21, 1727, 24, 1653, 50, 23, 1653, 51, 1644, 0, 1644]],
  ["Delhi", [3, 20, 2294, 9, 2251, 34, 8, 2260, 26, 2246, 0, 2246]],
  ["Goa", [1, 94, 309, 0, 309, 0, 0, 309, 0, 309, 1, 308]],
  ["Hubli", [0, 43, 5, 0, 4, 1, 0, 5, 0, 4, 0, 4]],
  ["Hyderabad", [2, 10, 644, 0, 641, 3, 0, 641, 3, 641, 0, 641]],
  ["Indore", [0, 10, 66, 0, 66, 0, 0, 66, 0, 66, 0, 66]],
  ["Kochi", [2, 30, 353, 0, 353, 0, 0, 353, 0, 353, 0, 353]],
  ["Kolhapur", [1, 21, 4, 0, 4, 0, 0, 4, 0, 4, 0, 4]],
  ["Kolkata", [0, 21, 255, 0, 255, 0, 0, 255, 0, 255, 0, 255]],
] as const satisfies ReadonlyArray<readonly [string, BranchMetrics]>;

const STATIC_BRANCH_ROWS: BranchTableRow[] = STATIC_BRANCH_ROW_DEFS.map(
  ([branchName, metrics]) => branchRow(branchName, metrics),
);

const GENERATED_BRANCH_ROWS: BranchTableRow[] = Array.from({ length: 15 }, (_, i) =>
  branchRow(`Branch-${i + 16}`, [
    i % 5,
    i % 10,
    300 + i * 10,
    i % 3,
    290 + i * 10,
    i % 4,
    i % 2,
    288 + i * 10,
    i % 5,
    285 + i * 10,
    i % 2,
    285 + i * 10,
  ]),
);

export const tableData: BranchTableRow[] = [
  ...STATIC_BRANCH_ROWS,
  ...GENERATED_BRANCH_ROWS,
];

const WORKFLOW_STATUS_TITLES = ["UnderProcess", "Approved", "QueryRaised"] as const;

function statusColumnGroup(
  title: string,
  headerBg: string,
  cellBg: string,
  columnTitles: readonly string[],
) {
  return {
    title,
    colSpan: columnTitles.length,
    bg: headerBg,
    children: columnTitles.map((colTitle) => ({ title: colTitle, bg: cellBg })),
  };
}

export const tableHeaders = [
  {
    title: "Branch Name",
    rowSpan: 3,
    bg: "bg-blue-600",
  },
  {
    title: "Branch Pendency",
    colSpan: 9,
    bg: "bg-blue-600",
    children: [
      statusColumnGroup("Maker 1", "bg-red-500", "bg-red-100", WORKFLOW_STATUS_TITLES),
      statusColumnGroup("Maker 2", "bg-red-500", "bg-red-100", WORKFLOW_STATUS_TITLES),
      statusColumnGroup("Checker", "bg-red-500", "bg-red-100", WORKFLOW_STATUS_TITLES),
    ],
  },
  statusColumnGroup("PBF Inward", "bg-purple-600", "bg-purple-100", WORKFLOW_STATUS_TITLES),
  statusColumnGroup("Summary", "bg-indigo-600", "bg-indigo-100", [
    "Approved",
    "Pending For Append",
    "Total PBF Append",
  ]),
];
