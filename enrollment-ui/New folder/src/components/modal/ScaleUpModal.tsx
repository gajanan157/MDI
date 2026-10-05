import { Button } from "@/components/ui";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";
import { SubmitHandler, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";

// -----------------------------
// Props Interface
// -----------------------------
interface ScaleUpModalProps {
  title: string;
  isOpen: boolean;
  onOk: SubmitHandler<any>;
  onClose: () => void;
  handleSubmit: UseFormHandleSubmit<any>;
  children?: React.ReactNode;
  loading?: boolean;
}

// -----------------------------
// Component
// -----------------------------
export const ScaleUpModal: React.FC<ScaleUpModalProps> = ({
  title,
  isOpen,
  onOk,
  handleSubmit,
  onClose,
  children,
  loading
}) => {
  const saveRef = useRef(null);
  const {t}  = useTranslation()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
        initialFocus={saveRef}
      >
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        {/* Modal Content */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col justify-between overflow-hidden rounded-lg bg-white transition-all duration-300">
            <form onSubmit={handleSubmit(onOk)} className="dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col justify-between overflow-hidden rounded-lg bg-white transition-all duration-300">

              <div className="dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-base font-medium text-gray-800"
                >
                  {title}
                </DialogTitle>
                <Button
                  onClick={onClose}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>
              <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                {children}
                <div className="mt-4 space-x-3 text-end rtl:space-x-reverse">                      
                  <Button onClick={onClose} variant="outlined" className="min-w-28 rounded-full">{t("branchForm.buttons.cancel")}</Button>
                  <Button type="submit" color="primary" ref={saveRef} disabled={loading} className="min-w-28 rounded-full">{t("branchForm.buttons.save")}</Button>
                </div>
              </div>
            </form>
            {/* Header */}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};
