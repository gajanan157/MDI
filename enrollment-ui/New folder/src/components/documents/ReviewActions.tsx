import { useState } from "react";
import { useCreateReview } from "@/hooks/useDocumentReviews";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";

interface ReviewActionsProps {
  documentId: string;
  currentStatus: string;
}

export function ReviewActions({ documentId, currentStatus }: ReviewActionsProps) {

  const createReview = useCreateReview();
  const [remarks, setRemarks] = useState("");

  

  if (currentStatus !== "pending_operations_review") {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span>This document has been reviewed</span>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    await createReview.mutateAsync({
      documentId,
      action: "approved",
      remarks: remarks || undefined,
    });
    setRemarks("");
  };

  // const handleRequestChanges = async () => {
  //   if (!remarks.trim()) {
  //     alert("Please provide remarks when requesting changes");
  //     return;
  //   }
  //   await createReview.mutateAsync({
  //     documentId,
  //     action: "changes_requested",
  //     remarks: remarks.trim(),
  //   });
  //   setRemarks("");
  // };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-500 shadow-md space-y-5">
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-6 h-6 text-green-600" />
        <h3 className="text-sm font-bold text-gray-900">Review Actions</h3>
      </div>

      {/* Optional Remarks */}
      {/* <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Remarks (Optional)
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks or notes..."
          rows={3}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div> */}

      {/* Approve Button - Primary Action */}
      <Button
        color="success"
        variant="filled"
        onClick={handleApprove}
        disabled={createReview.isPending}
        className="w-full w-8 h-8 py-3  font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        {/* <CheckCircleIcon className="w-6 h-6" /> */}
        ✓ Approve Document
      </Button>

      {/* Request Changes Button - Secondary Action */}
      {/* <Button
        color="warning"
        variant="outlined"
        onClick={handleRequestChanges}
        disabled={createReview.isPending || !remarks.trim()}
        className="w-full py-2"
      >
        Request Changes
      </Button> */}

      {createReview.isPending && (
        <div className="text-center text-sm text-gray-500 animate-pulse">
          Processing review...
        </div>
      )}
    </div>
  );
}
