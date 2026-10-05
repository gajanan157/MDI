import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  documentAnalysisSchema,
  DocumentAnalysisFormValues,
  DOCUMENT_TYPES,
  DEPARTMENTS,
  REPORT_CATEGORIES,
  REPORT_TYPES,
  FREQUENCIES,
  DATA_SOURCES,
  PRIORITIES,
  RECIPIENTS,
} from "./schema";
import { toast } from "sonner";

const DocumentAnalysisForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<DocumentAnalysisFormValues>({
    resolver: yupResolver(documentAnalysisSchema) as any,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const selectedCategory = watch("report_category");
  const [filteredReportTypes, setFilteredReportTypes] = useState(REPORT_TYPES);

  // Filter report types based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = REPORT_TYPES.filter(
        (type) => type.category === selectedCategory
      );
      setFilteredReportTypes(filtered);
    } else {
      setFilteredReportTypes(REPORT_TYPES);
    }
  }, [selectedCategory]);

  const onSubmit = () => {
    
    toast.success("Document analysis submitted successfully!", { duration: 5000 });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }
      setSelectedFile(file);
      
      // Create preview URL
      if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setDocumentPreview(url);
      }
      
      toast.success(`File "${file.name}" selected`,{duration:5000,position:"top-right"});
    }
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      toast.error("Please select a document first");
      return;
    }

    setIsProcessing(true);
    toast.info("Processing document...");

    // Simulate document processing with AI/OCR
    setTimeout(() => {
      // Mock extracted data based on the reference document
      const mockData = {
        ic_name: "HDFC ERGO General Insurance",
        policy_type: "Health Insurance",
        ro_name: "Mumbai Regional Office",
        uo_name: "Andheri Branch",
        office_code: "HDFC001",
        contacts: [
          {
            name: "Rajesh Kumar",
            designation: "Branch Manager",
            mobile: "+91 98765 43210",
            email: "rajesh.kumar@hdfcergo.com",
          },
        ],
        address: "123 Main Street, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        pin: "400058",
        std_code: "022",
        phone: "12345678",
      };

      setExtractedData(mockData);
      setIsProcessing(false);
      toast.success("Document processed successfully!");
    }, 2000);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Operations Review", path: "/dashboards/insurer-management/office" },
    { title: "Document Analysis", path: "/dashboards/insurer-management/office/document-analysis" },
  ];

  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
    >
      <div className="min-w-0">
        <Breadcrumbs items={breadcrumbs} className="max-sm:hidden mb-4" />

        {/* Document Control Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-blue-500" />
          Document Control
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <DropdownSelect
            label="Document Type"
            name_key="document_type"
            defaultValue="Select Type"
            options={DOCUMENT_TYPES}
            control={control}
            rules={{ required: "Document type is required" }}
            name="document_type"
            errors={errors.document_type}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />

          <DropdownSelect
            label="Department"
            name_key="department"
            defaultValue="Select Department"
            options={DEPARTMENTS}
            control={control}
            rules={{ required: "Department is required" }}
            name="department"
            errors={errors.department}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />

          <Input
            label="Document Title"
            placeholder="Enter document title"
            prefix={
              <DocumentCheckIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
            }
            {...register("document_title")}
            error={errors?.document_title?.message}
          />

          <Input
            label="Version"
            placeholder="e.g., 1.0"
            prefix={
              <ChartBarIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
            }
            {...register("version")}
            error={errors?.version?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Input
            label="Created By"
            placeholder="Enter creator name"
            prefix={
              <UserIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
            }
            {...register("created_by")}
            error={errors?.created_by?.message}
          />

          <Input
            label="Reviewed By"
            placeholder="Enter reviewer name"
            prefix={
              <UserIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
            }
            {...register("reviewed_by")}
            error={errors?.reviewed_by?.message}
          />

          <Input
            label="Approved By"
            placeholder="Enter approver name"
            prefix={
              <UserIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
            }
            {...register("approved_by")}
            error={errors?.approved_by?.message}
          />
        </div>

        {/* Report Classification Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 mt-8">
          <ChartBarIcon className="w-5 h-5 text-green-500" />
          Report Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <DropdownSelect
            label="Report Category"
            name_key="report_category"
            defaultValue="Select Category"
            options={REPORT_CATEGORIES}
            control={control}
            rules={{ required: "Report category is required" }}
            name="report_category"
            errors={errors.report_category}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />

          <DropdownSelect
            label="Report Type"
            name_key="report_type"
            defaultValue="Select Type"
            options={filteredReportTypes}
            control={control}
            rules={{ required: "Report type is required" }}
            name="report_type"
            errors={errors.report_type}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />

          <DropdownSelect
            label="Frequency"
            name_key="frequency"
            defaultValue="Select Frequency"
            options={FREQUENCIES}
            control={control}
            rules={{ required: "Frequency is required" }}
            name="frequency"
            errors={errors.frequency}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />

          <DropdownSelect
            label="Data Source"
            name_key="data_source"
            defaultValue="Select Data Source"
            options={DATA_SOURCES}
            control={control}
            rules={{ required: "Data source is required" }}
            name="data_source"
            errors={errors.data_source}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />
        </div>

        {/* Recipients & Priority Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 mt-8">
          <UserGroupIcon className="w-5 h-5 text-indigo-500" />
          Recipients & Priority
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <DropdownSelect
            label="Recipients"
            name_key="recipients"
            defaultValue="Select Recipients"
            options={RECIPIENTS}
            control={control}
            rules={{ required: "At least one recipient is required" }}
            name="recipients"
            errors={errors.recipients}
            formClassName="mb-2"
            isRequired
            multiselect
            className="h-[38px] rounded-[10px]"
          />

          <DropdownSelect
            label="Priority"
            name_key="priority"
            defaultValue="Select Priority"
            options={PRIORITIES}
            control={control}
            rules={{ required: "Priority is required" }}
            name="priority"
            errors={errors.priority}
            formClassName="mb-2"
            isRequired
            className="h-[38px] rounded-[10px]"
          />
        </div>

        {/* Additional Information Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 mt-8">
          <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />
          Additional Information
        </h3>

        <div className="grid grid-cols-1 gap-4 mt-2">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Enter detailed description..."
              rows={4}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              {...register("special_requirements")}
              placeholder="Enter any special requirements or notes..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline Date
            </label>
            <Input
              type="date"
              prefix={
                <CalendarIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
              }
              {...register("deadline_date")}
              error={errors?.deadline_date?.message}
            />
          </div>
        </div>

        {/* File Upload Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 mt-8">
          <CloudArrowUpIcon className="w-5 h-5 text-purple-500" />
          Document Upload & Analysis
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, XLS, XLSX (Max 20MB)
                </p>
              </label>
              {selectedFile && (
                <div className="mt-4 p-3 bg-white rounded border border-green-200">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="text-sm text-gray-700 block">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleProcessDocument}
                      disabled={isProcessing}
                      className="text-sm"
                      color="primary"
                    >
                      {isProcessing ? "Processing..." : "Analyze"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview */}
            {documentPreview && (
              <div className="mt-4 border rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-700">Document Preview</p>
                </div>
                <div className="h-96 overflow-auto">
                  <iframe
                    src={documentPreview}
                    className="w-full h-full"
                    title="Document Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Extracted Data */}
          {extractedData && (
            <div className="border rounded-lg bg-white p-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DocumentCheckIcon className="w-5 h-5 text-blue-600" />
                Extracted Information
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">IC Name</label>
                    <p className="text-sm text-gray-800 mt-1">{extractedData.ic_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Policy Type</label>
                    <p className="text-sm text-gray-800 mt-1">{extractedData.policy_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">RO Name</label>
                    <p className="text-sm text-gray-800 mt-1">{extractedData.ro_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">UO Name</label>
                    <p className="text-sm text-gray-800 mt-1">{extractedData.uo_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Office Code</label>
                    <p className="text-sm text-gray-800 mt-1 font-mono">{extractedData.office_code}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-600">Address</label>
                      <p className="text-sm text-gray-800 mt-1">{extractedData.address}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">City</label>
                      <p className="text-sm text-gray-800 mt-1">{extractedData.city}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">State</label>
                      <p className="text-sm text-gray-800 mt-1">{extractedData.state}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">PIN</label>
                      <p className="text-sm text-gray-800 mt-1">{extractedData.pin}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-800 mt-1">{extractedData.std_code} - {extractedData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h5>
                  {extractedData.contacts?.map((contact: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.designation}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">📱 {contact.mobile}</p>
                        <p className="text-xs text-gray-600">✉️ {contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    toast.success("Data applied to form fields");
                    // Here you would populate the form fields with extracted data
                  }}
                  className="w-full"
                  color="primary"
                >
                  Use Extracted Data
                </Button>
              </div>
            </div>
          )}

          {!extractedData && selectedFile && !isProcessing && (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Click "Analyze" to extract data from the document</p>
              <p className="text-xs text-gray-400 mt-2">AI will automatically extract relevant information</p>
            </div>
          )}

          {isProcessing && (
            <div className="border border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-600">Processing document...</p>
              <p className="text-xs text-gray-500 mt-1">Extracting data using AI</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-end items-center mb-4 mt-6">
          <Button type="submit" className="px-8" color="primary">
            Submit Analysis
          </Button>
        </div>
      </div>
    </FormLayout>
  );
};

export default DocumentAnalysisForm;
