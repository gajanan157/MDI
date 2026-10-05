// import { useState } from "react";
// import { Button } from "@/components/ui";
// import { 
//   DocumentTextIcon, 
//   PlusIcon, 
//   EyeIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   FunnelIcon
// } from "@heroicons/react/24/outline";
// import { useDocuments } from "@/hooks/useDocuments";
// import { UploadDocumentModal } from "./components/UploadDocumentModal";
// import { ReviewDocumentModal } from "./components/ReviewDocumentModal";
// // import { format } from "date-fns";

// const DocumentManagement = () => {
//   const { data: documents, isLoading } = useDocuments();
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>("all");
//   const [filterType, setFilterType] = useState<string>("all");

//   const getStatusBadge = (status: string) => {
//     const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
//       pending_operations_review: {
//         color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
//         icon: ClockIcon,
//         label: "Pending Review"
//       },
//       ready_for_compliance: {
//         color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//         icon: CheckCircleIcon,
//         label: "Ready for Compliance"
//       },
//       changes_requested: {
//         color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//         icon: XCircleIcon,
//         label: "Changes Requested"
//       },
//       approved: {
//         color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//         icon: CheckCircleIcon,
//         label: "Approved"
//       }
//     };

//     const config = statusConfig[status] || statusConfig.pending_operations_review;
//     const Icon = config.icon;

//     return (
//       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
//         <Icon className="w-4 h-4" />
//         {config.label}
//       </span>
//     );
//   };

//   const getTypeBadge = (type: string) => {
//     const colors: Record<string, string> = {
//       addendum: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
//       amendment: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
//       renewal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
//       extension: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
//     };

//     return (
//       <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${colors[type.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
//         {type}
//       </span>
//     );
//   };

//   const filteredDocuments = documents?.filter(doc => {
//     const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
//     const matchesType = filterType === "all" || doc.type.toLowerCase() === filterType.toLowerCase();
//     return matchesStatus && matchesType;
//   });

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
//           <p className="text-muted-foreground mt-1">Review and approve office documents</p>
//         </div>
//         <Button
//           onClick={() => setIsUploadModalOpen(true)}
//           className="flex items-center gap-2"
//         >
//           <PlusIcon className="w-5 h-5" />
//           Upload Document
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="bg-card rounded-xl border shadow-sm p-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <FunnelIcon className="w-5 h-5 text-muted-foreground" />
//             <span className="text-sm font-medium text-foreground">Filters:</span>
//           </div>
          
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
//           >
//             <option value="all">All Status</option>
//             <option value="pending_operations_review">Pending Review</option>
//             <option value="ready_for_compliance">Ready for Compliance</option>
//             <option value="changes_requested">Changes Requested</option>
//             <option value="approved">Approved</option>
//           </select>

//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
//           >
//             <option value="all">All Types</option>
//             <option value="addendum">Addendum</option>
//             <option value="amendment">Amendment</option>
//             <option value="renewal">Renewal</option>
//             <option value="extension">Extension</option>
//           </select>

//           <div className="ml-auto text-sm text-muted-foreground">
//             Showing {filteredDocuments?.length || 0} of {documents?.length || 0} documents
//           </div>
//         </div>
//       </div>

//       {/* Documents Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredDocuments?.map((doc) => (
//           <div
//             key={doc.id}
//             className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
//           >
//             <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 border-b">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-start gap-3 flex-1 min-w-0">
//                   <div className="bg-primary/20 p-2.5 rounded-lg flex-shrink-0">
//                     <DocumentTextIcon className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-semibold text-foreground truncate" title={doc.name}>
//                       {doc.name}
//                     </h3>
//                     <div className="flex items-center gap-2 mt-1">
//                       {getTypeBadge(doc.type)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 space-y-3">
//               <div className="space-y-2 text-sm">
//                 {doc.office_code && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-muted-foreground">Office Code:</span>
//                     <span className="font-medium text-foreground">{doc.office_code}</span>
//                   </div>
//                 )}
//                 {doc.ro_name && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-muted-foreground">RO Name:</span>
//                     <span className="font-medium text-foreground">{doc.ro_name}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Uploaded:</span>
//                   <span className="font-medium text-foreground">
//                     {format(new Date(doc.created_at), "MMM dd, yyyy")}
//                   </span>
//                 </div>
//               </div>

//               <div className="pt-2 border-t">
//                 {getStatusBadge(doc.status)}
//               </div>

//               <Button
//                 onClick={() => setSelectedDocumentId(doc.id)}
//                 variant="outlined"
//                 className="w-full flex items-center justify-center gap-2 mt-3"
//               >
//                 <EyeIcon className="w-4 h-4" />
//                 Review Document
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredDocuments?.length === 0 && (
//         <div className="text-center py-16">
//           <DocumentTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//           <h3 className="text-sm font-semibold text-foreground mb-2">No documents found</h3>
//           <p className="text-muted-foreground">
//             {filterStatus !== "all" || filterType !== "all"
//               ? "Try adjusting your filters"
//               : "Upload your first document to get started"}
//           </p>
//         </div>
//       )}

//       {/* Modals */}
//       <UploadDocumentModal
//         isOpen={isUploadModalOpen}
//         onClose={() => setIsUploadModalOpen(false)}
//       />

//       {selectedDocumentId && (
//         <ReviewDocumentModal
//           documentId={selectedDocumentId}
//           isOpen={!!selectedDocumentId}
//           onClose={() => setSelectedDocumentId(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default DocumentManagement;
