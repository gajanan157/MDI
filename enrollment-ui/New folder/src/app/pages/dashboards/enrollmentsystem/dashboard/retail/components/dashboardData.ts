export const enrollmentSummary = [
  {
    process: "Soft Data Enrolment",
    NIC: { pol: 707, ip: 1480 },
    NIA: { pol: 1044, ip: 2428 },
    OIC: { pol: 3, ip: 4 },
    UIIC: { pol: 905, ip: 1904 },
    total: { pol: 2659, ip: 5816 },
  },
  {
    process: "Manual Enrolment",
    NIC: { pol: 0, ip: 0 },
    NIA: { pol: 1, ip: 1 },
    OIC: { pol: 2, ip: 5 },
    UIIC: { pol: 1, ip: 2 },
    total: { pol: 4, ip: 8 },
  },
  {
    process: "Endorsement",
    NIC: { pol: 707, ip: 1480 },
    NIA: { pol: 1044, ip: 2428 },
    OIC: { pol: 3, ip: 4 },
    UIIC: { pol: 905, ip: 1904 },
    total: { pol: 2659, ip: 5816 },
  },
  {
    process: "Cancellation",
    NIC: { pol: 0, ip: 0 },
    NIA: { pol: 1, ip: 1 },
    OIC: { pol: 2, ip: 5 },
    UIIC: { pol: 1, ip: 2 },
    total: { pol: 4, ip: 8 },
  },
];

export const priorityData = [
  {
    title: "Auth Docket",
    color: "bg-sky-700",
    stats: { opening: 0, inward: 0, outward: 0, pending: 0 },
  },
  {
    title: "WGT Docket",
    color: "bg-green-600",
    stats: { opening: 9, inward: 55, outward: 58, pending: 6 },
  },
  {
    title: "RB09",
    color: "bg-yellow-500",
    stats: { opening: 2, inward: 1, outward: 0, pending: 3 },
  },
  {
    title: "Total",
    color: "bg-red-500",
    stats: { opening: 11, inward: 56, outward: 58, pending: 9 },
  },
];