import { useState } from "react";
import { Button } from "@/components/ui";
import { XMarkIcon, CloudArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useUploadDocument, DocumentType } from "@/hooks/useDocuments";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadDocumentModal = ({ isOpen, onClose }: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "addendum" as DocumentType,
    ic_name: "",
    policy_type: "",
    ro_name: "",
    uo_name: "",
    office_code: "",
  });

  const uploadMutation = useUploadDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    uploadMutation.mutate(
      { ...formData, file },
      {
        onSuccess: () => {
          onClose();
          setFile(null);
          setFormData({
            name: "",
            type: "addendum" as DocumentType,
            ic_name: "",
            policy_type: "",
            ro_name: "",
            uo_name: "",
            office_code: "",
          });
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Upload Document</h2>
              <p className="text-sm text-muted-foreground">Add a new document for review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Document File <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {file ? (
                  <>
                    <DocumentTextIcon className="w-12 h-12 text-primary" />
                    <span className="text-sm font-medium text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-12 h-12 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Click to upload</span>
                    <span className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 20MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Document Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter document name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Document Type <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DocumentType }))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              >
                <option value="addendum">Addendum</option>
                <option value="amendment">Amendment</option>
                <option value="renewal">Renewal</option>
                <option value="extension">Extension</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Office Code
              </label>
              <input
                type="text"
                value={formData.office_code}
                onChange={(e) => setFormData(prev => ({ ...prev, office_code: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter office code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                IC Name
              </label>
              <input
                type="text"
                value={formData.ic_name}
                onChange={(e) => setFormData(prev => ({ ...prev, ic_name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Insurance company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                RO Name
              </label>
              <input
                type="text"
                value={formData.ro_name}
                onChange={(e) => setFormData(prev => ({ ...prev, ro_name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Regional office name"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outlined"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || uploadMutation.isPending}
              className="min-w-[120px]"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};