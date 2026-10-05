// import { useState } from "react";
// import { Button } from "@/components/ui";
// import { 
//   XMarkIcon, 
//   DocumentTextIcon, 
//   CheckCircleIcon, 
//   XCircleIcon,
//   ChatBubbleLeftIcon,
//   ClockIcon,
//   UserIcon
// } from "@heroicons/react/24/outline";
// import { 
//   useDocument, 
//   useDocumentReviews, 
//   useDocumentComments,
//   useAddReview,
//   useAddComment,
//   DocumentReview,
//   DocumentComment
// } from "@/hooks/useDocuments";
// import { format } from "date-fns";

// interface ReviewDocumentModalProps {
//   documentId: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const ReviewDocumentModal = ({ documentId, isOpen, onClose }: ReviewDocumentModalProps) => {
//   const { data: document } = useDocument(documentId);
//   const { data: reviews } = useDocumentReviews(documentId);
//   const { data: comments } = useDocumentComments(documentId);
//   const addReviewMutation = useAddReview();
//   const addCommentMutation = useAddComment();

//   const [newComment, setNewComment] = useState("");
//   const [reviewRemarks, setReviewRemarks] = useState("");
//   const [activeTab, setActiveTab] = useState<"preview" | "comments" | "history">("preview");

//   const handleApprove = () => {
//     addReviewMutation.mutate(
//       {
//         document_id: documentId,
//         action: "approved",
//         remarks: reviewRemarks,
//       },
//       {
//         onSuccess: () => {
//           setReviewRemarks("");
//         },
//       }
//     );
//   };

//   const handleRequestChanges = () => {
//     if (!reviewRemarks.trim()) {
//       return;
//     }
//     addReviewMutation.mutate(
//       {
//         document_id: documentId,
//         action: "changes_requested",
//         remarks: reviewRemarks,
//       },
//       {
//         onSuccess: () => {
//           setReviewRemarks("");
//         },
//       }
//     );
//   };

//   const handleAddComment = () => {
//     if (!newComment.trim()) return;
//     addCommentMutation.mutate(
//       {
//         document_id: documentId,
//         comment: newComment,
//       },
//       {
//         onSuccess: () => {
//           setNewComment("");
//         },
//       }
//     );
//   };

//   if (!isOpen || !document) return null;

//   const canReview = document.status === "pending_operations_review";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="bg-card rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
//           <div className="flex items-center gap-3 flex-1 min-w-0">
//             <div className="bg-primary/20 p-2.5 rounded-lg flex-shrink-0">
//               <DocumentTextIcon className="w-6 h-6 text-primary" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h2 className="text-xl font-bold text-foreground truncate">{document.name}</h2>
//               <div className="flex items-center gap-3 mt-1">
//                 <span className="text-sm text-muted-foreground">
//                   Type: <span className="font-medium text-foreground">{document.type}</span>
//                 </span>
//                 {document.office_code && (
//                   <span className="text-sm text-muted-foreground">
//                     Office: <span className="font-medium text-foreground">{document.office_code}</span>
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
//           >
//             <XMarkIcon className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="border-b flex-shrink-0">
//           <div className="flex px-6">
//             {[
//               { id: "preview", label: "Document Preview", icon: DocumentTextIcon },
//               { id: "comments", label: "Comments", icon: ChatBubbleLeftIcon },
//               { id: "history", label: "Review History", icon: ClockIcon },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as any)}
//                 className={`
//                   flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all
//                   ${
//                     activeTab === tab.id
//                       ? "border-primary text-primary"
//                       : "border-transparent text-muted-foreground hover:text-foreground"
//                   }
//                 `}
//               >
//                 <tab.icon className="w-4 h-4" />
//                 {tab.label}
//                 {tab.id === "comments" && comments && comments.length > 0 && (
//                   <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
//                     {comments.length}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {activeTab === "preview" && (
//             <div className="space-y-4">
//               <div className="bg-muted/30 rounded-lg p-6 text-center">
//                 <DocumentTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">
//                   Document preview will be displayed here
//                 </p>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   File: {document.name}
//                 </p>
//               </div>

//               {/* Document Details */}
//               <div className="grid grid-cols-2 gap-4 bg-muted/20 rounded-lg p-4">
//                 <div>
//                   <span className="text-sm text-muted-foreground">Uploaded On</span>
//                   <p className="font-medium">{format(new Date(document.created_at), "PPP")}</p>
//                 </div>
//                 <div>
//                   <span className="text-sm text-muted-foreground">Last Updated</span>
//                   <p className="font-medium">{format(new Date(document.updated_at), "PPP")}</p>
//                 </div>
//                 {document.ic_name && (
//                   <div>
//                     <span className="text-sm text-muted-foreground">IC Name</span>
//                     <p className="font-medium">{document.ic_name}</p>
//                   </div>
//                 )}
//                 {document.ro_name && (
//                   <div>
//                     <span className="text-sm text-muted-foreground">RO Name</span>
//                     <p className="font-medium">{document.ro_name}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "comments" && (
//             <div className="space-y-4">
//               {/* Add Comment */}
//               <div className="bg-muted/20 rounded-lg p-4">
//                 <label className="block text-sm font-medium text-foreground mb-2">
//                   Add Comment
//                 </label>
//                 <textarea
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   placeholder="Write your comment here..."
//                   className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
//                   rows={3}
//                 />
//                 <div className="mt-3 flex justify-end">
//                 <Button
//                   onClick={handleAddComment}
//                   disabled={!newComment.trim() || addCommentMutation.isPending}
//                   className="text-sm"
//                 >
//                   {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
//                 </Button>
//                 </div>
//               </div>

//               {/* Comments List */}
//               <div className="space-y-3">
//               {comments && comments.length > 0 ? (
//                 comments.map((comment: DocumentComment) => (
//                     <div key={comment.id} className="bg-card border rounded-lg p-4">
//                       <div className="flex items-start gap-3">
//                         <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
//                           <UserIcon className="w-5 h-5 text-primary" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="text-sm font-medium text-foreground">
//                               User {comment.user_id.slice(0, 8)}
//                             </span>
//                             <span className="text-xs text-muted-foreground">
//                               {format(new Date(comment.created_at), "PPP 'at' p")}
//                             </span>
//                           </div>
//                           <p className="text-sm text-foreground">{comment.comment}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-8">
//                     <ChatBubbleLeftIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
//                     <p className="text-muted-foreground">No comments yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "history" && (
//             <div className="space-y-3">
//               {reviews && reviews.length > 0 ? (
//                 reviews.map((review: DocumentReview) => (
//                   <div key={review.id} className="bg-card border rounded-lg p-4">
//                     <div className="flex items-start gap-3">
//                       <div
//                         className={`p-2 rounded-full flex-shrink-0 ${
//                           review.action === "approved"
//                             ? "bg-green-100 dark:bg-green-900/30"
//                             : "bg-red-100 dark:bg-red-900/30"
//                         }`}
//                       >
//                         {review.action === "approved" ? (
//                           <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
//                         ) : (
//                           <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-sm font-medium text-foreground">
//                             {review.action === "approved" ? "Approved" : "Changes Requested"}
//                           </span>
//                           <span className="text-xs text-muted-foreground">
//                             {format(new Date(review.created_at), "PPP 'at' p")}
//                           </span>
//                         </div>
//                         {review.remarks && (
//                           <p className="text-sm text-muted-foreground mt-1">{review.remarks}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
//                   <p className="text-muted-foreground">No review history</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Actions */}
//         {canReview && (
//           <div className="border-t p-6 flex-shrink-0 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">
//                 Review Remarks {!reviewRemarks.trim() && "(Required for changes)"}
//               </label>
//               <textarea
//                 value={reviewRemarks}
//                 onChange={(e) => setReviewRemarks(e.target.value)}
//                 placeholder="Add your remarks or reasons for the decision..."
//                 className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
//                 rows={2}
//               />
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <Button
//                 onClick={onClose}
//                 variant="outlined"
//                 disabled={addReviewMutation.isPending}
//               >
//                 Close
//               </Button>
//               <Button
//                 onClick={handleRequestChanges}
//                 variant="outlined"
//                 disabled={!reviewRemarks.trim() || addReviewMutation.isPending}
//                 className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
//               >
//                 <XCircleIcon className="w-5 h-5" />
//                 Request Changes
//               </Button>
//               <Button
//                 onClick={handleApprove}
//                 disabled={addReviewMutation.isPending}
//                 className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
//               >
//                 <CheckCircleIcon className="w-5 h-5" />
//                 {addReviewMutation.isPending ? "Processing..." : "Approve"}
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
