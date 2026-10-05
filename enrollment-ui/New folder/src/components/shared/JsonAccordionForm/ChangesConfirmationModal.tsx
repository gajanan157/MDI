import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { Button } from "@/components/ui";

interface ChangesConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldData: Record<string, any>;
  newData: Record<string, any>;
  isLoading?: boolean;
}

import { findDifferences } from "./findDifferencesHelpers";

/**
 * Converts a technical path (e.g. definitions.definitions[0].term) into a user-friendly label.
 * Examples: family_count → "Family count"; definitions[0].term → "Definitions » Item 1 » Term"
 */
function formatPathForDisplay(path: string): string {
  if (!path || path === "root") return "Value";
  const parts: string[] = [];
  const tokens = path.split(/[.[\]]/).filter(Boolean);
  for (const token of tokens) {
    const num = parseInt(token, 10);
    if (!Number.isNaN(num) && String(num) === token) {
      parts.push(`Item ${num + 1}`);
    } else {
      const label = token
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (parts[parts.length - 1] !== label) parts.push(label);
    }
  }
  return parts.join(" » ");
}

/**
 * Formats a value for display. For objects/arrays, show a short summary to avoid dumping full JSON.
 */
function formatValue(value: any, maxJsonLength = 200): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) {
    const preview = JSON.stringify(value);
    if (preview.length <= maxJsonLength) return preview;
    return `[Array, ${value.length} items]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    const preview = JSON.stringify(value);
    if (preview.length <= maxJsonLength) return preview;
    return `{Object, ${keys.length} keys}`;
  }
  return String(value);
}

function renderDifferenceBody(
  diff: { oldValue?: unknown; newValue?: unknown },
  displayLabel: string,
) {
  const isNewField = diff.oldValue === undefined;
  const isRemoved = diff.newValue === undefined;

  if (isNewField) {
    return (
      <div>
        <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
          New field: {displayLabel.split(" » ").pop()}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Value:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatValue(diff.newValue)}
          </span>
        </div>
      </div>
    );
  }

  if (isRemoved) {
    return (
      <div>
        <div className="mb-1 text-xs font-medium text-red-600 dark:text-red-400">
          Removed
        </div>
        <div className="rounded-md bg-white p-2 font-mono text-xs text-gray-800 dark:bg-dark-900 dark:text-gray-200">
          <pre className="whitespace-pre-wrap break-words">
            {formatValue(diff.oldValue)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="mb-1 text-xs font-medium text-red-600 dark:text-red-400">
          Old
        </div>
        <div className="rounded-md bg-white p-2 font-mono text-xs text-gray-800 dark:bg-dark-900 dark:text-gray-200">
          <pre className="whitespace-pre-wrap break-words">
            {formatValue(diff.oldValue)}
          </pre>
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
          New
        </div>
        <div className="rounded-md bg-white p-2 font-mono text-xs text-gray-800 dark:bg-dark-900 dark:text-gray-200">
          <pre className="whitespace-pre-wrap break-words">
            {formatValue(diff.newValue)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ChangesConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  oldData,
  newData,
  isLoading = false,
}: ChangesConfirmationModalProps) {
  const focusRef = useRef<HTMLButtonElement>(null);

  // Find all differences
  const differences = findDifferences(oldData, newData);

  const dialogProps = isLoading
    ? {
        onClose: () => {},
        static: true,
      }
    : {
        onClose,
      };

  return (
    <Transition
      appear
      show={isOpen}
      as={Dialog}
      initialFocus={focusRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
      {...dialogProps}
    >
      <TransitionChild
        as="div"
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
        onClick={onClose}
      />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-dark-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-600">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Changes
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              disabled={isLoading}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[60vh]">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Please review the changes below before applying. Click "OK" to confirm and apply changes.
            </p>

            {differences.length === 0 ? (
              <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                No changes detected.
              </div>
            ) : (
              <div className="space-y-4">
                {differences.map((diff, index) => {
                  const displayLabel = formatPathForDisplay(diff.path || "root");

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-800"
                    >
                      <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {displayLabel}
                      </div>
                      {renderDifferenceBody(diff, displayLabel)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-dark-600">
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={isLoading}
              className="h-9 min-w-28"
            >
              Cancel
            </Button>
            <Button
              ref={focusRef}
              onClick={onConfirm}
              color="primary"
              disabled={isLoading || differences.length === 0}
              className="h-9 min-w-28"
            >
              {isLoading ? "Applying..." : "OK"}
            </Button>
          </div>
        </TransitionChild>
    </Transition>
  );
}
