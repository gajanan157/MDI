import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { Button, Input } from "@/components/ui";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchMemberServiceForExceptionsMembers } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { approveMemberExceptions, uploadDocument } from "../../../../../../store/features/Broker/BrokerSlice";
import { formatCategory } from "./MemberData";


const ExceptionDetails = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category");
    const policyId = searchParams.get("policyId");
    const inwardNo = searchParams.get("inwardNo");  
    const dummyPolicyNumber = searchParams.get("dummyPolicyNumber");  
    const navigate = useNavigate();

    const { memberDataForExceptionMember, totalRecordsForExceptionMember } = useAppSelector((state) => state.broker);

    const Maincategory = category ? formatCategory(category) : "";
    const breadcrumbs = [
        { title: "Enrolment System", path: `/enrolment-system/member-data?policyId=${policyId}&inwardNo=${inwardNo}&tab=EXCEPTION&&dummyPolicyNumber=${dummyPolicyNumber}`},
      ];
      useBreadcrumb(breadcrumbs);
    const [page, setPage] = useState(1); 
    const [pageSize, setPageSize] = useState(20);

    const dispatch = useAppDispatch()
    useEffect(() => {
        if (!category || !policyId) {
            return;
        }

        const payload = {
            page,
            size: pageSize,
            category,
        };

        dispatch(
            fetchMemberServiceForExceptionsMembers({
                payload: payload,
                policyId: policyId,
            })
        );
    }, [category, policyId, page, pageSize, dispatch]);




    /*
     * Pagination
     */
    const handlePageChange = (p: number) => {
        setPage(p);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const isSelected = (row: any) => {
        return selectedMembers.some(
            (item) =>
                item.stagingMemberEnrollmentId ===
                row.stagingMemberEnrollmentId
        );
    };

    const handleSelectMember = (row: any) => {
        setSelectedMembers((prev) => {
            const alreadySelected = prev.some(
                (item) =>
                    item.stagingMemberEnrollmentId ===
                    row.stagingMemberEnrollmentId
            );

            if (alreadySelected) {
                return prev.filter(
                    (item) =>
                        item.stagingMemberEnrollmentId !==
                        row.stagingMemberEnrollmentId
                );
            }

            return [...prev, row];
        });
    };

    const handleSelectAll = () => {
        setSelectedMembers(memberDataForExceptionMember);
    };

    const handleDeselectAll = () => {
        setSelectedMembers([]);
    };

    const exceptionColumns = [
        {
            field: "actions",
            headerName: "Action",
            width: 80,
            pinned: "left",
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                const checked = isSelected(params.data);

                return (
                    <div className="flex h-full items-center justify-center">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleSelectMember(params.data);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                        />
                    </div>
                );
            },
        },
        {
            field: "corporateEmployeeCode",
            headerName: "Employee ID",
            width: 110,
        },
        {
            field: "insuredMemberName",
            headerName: "Member Name",
            width: 220,
        },
        {
            field: "insuredMemberDateOfBirth",
            headerName: "DOB",
            width: 120,
            valueFormatter: (params: any) =>
                params.value
                    ? format(new Date(params.value), "dd MMM yyyy")
                    : "-",
        },
        {
            field: "insuredMemberAge",
            headerName: "Age",
            width: 70,
        },
        {
            field: "insuredMemberGender",
            headerName: "Gender",
            width: 90,
        },
        {
            field: "insuredMemberRelationshipWithSubscriber",
            headerName: "Relationship",
            width: 140,
        },
        {
            field: "insuredMemberUniqueHealthIdentificationNumber",
            headerName: "UHID",
            width: 150,
        },
        {
            field: "insuredMemberEmailId",
            headerName: "Email",
            width: 230,
        },
        {
            field: "corporateEmployeeDateOfJoining",
            headerName: "Joining Date",
            width: 130,
            valueFormatter: (params: any) =>
                params.value
                    ? format(new Date(params.value), "dd MMM yyyy")
                    : "-",
        },

        {
            field: "comment",
            headerName: "Exception Reason",
            width: 400,
            cellRenderer: (params: any) => (
                <span
                    className="text-red-600"
                    title={params.value || ""}
                >
                    {params.value || "-"}
                </span>
            ),
        },
    ];

    const [remark, setRemark] = useState("");
    const [remarkError, setRemarkError] = useState("");
    const { depertment } = useAppSelector((state) => state.matrix);
    const [enrollmentDepartmentId, setEnrollmentDepartmentId] = useState("");


    useEffect(() => {
        if (depertment?.length) {
            const enrollmentDept = depertment?.find((item: any) => item.departmentName?.toLowerCase() === "enrollment");

            if (enrollmentDept) {
                setEnrollmentDepartmentId(enrollmentDept.departmentId);
            }
        }
    }, [depertment]);
    const selectedInward = {
        inwardNo: inwardNo,
        s3BucketName: "enrollment",
        s3SubBucketName: "ENROLLMENT",
        departmentId: enrollmentDepartmentId
    }


    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors },
    } = useForm();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const selectedFile = event.target.files?.[0];
      
        if (!selectedFile) return;
      
        const maxSize = 50 * 1024 * 1024; // 50 MB
      
        if (selectedFile.size > maxSize) {
          setFile(null);
          setFileError("File size must not exceed 50 MB.");
      
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
      
          return;
        }
      
        setFileError("");
        setFile(selectedFile);
      };
      
      // Remove selected file
      const handleRemoveFile = () => {
        setFile(null);
        setFileError("");
      
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

        // Open file browser
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
      const handleApprove = async (data: any) => {
        try {
          // ============================================
          // 1. FILE REQUIRED VALIDATION
          // ============================================
      
          if (!file) {
            setFileError("Please upload document");
            return;
          }
      
          setFileError("");
      
          // ============================================
          // 2. GET SELECTED MEMBER IDS
          // ============================================
      
          const stagingMemberEnrollmentIds = selectedMembers
            ?.map(
              (item: any) =>
                item.stagingMemberEnrollmentId
            )
            .filter(Boolean);
      
          if (!stagingMemberEnrollmentIds?.length) {
            toast.error("Please select at least one member", {
              position: "top-right",
              duration: 5000,
            });
      
            return;
          }
      
        //   ============================================
        //   3. FIRST API - UPLOAD DOCUMENT
        //   ============================================
      
          const uploadResponse = await dispatch(
            uploadDocument({
              file: file,
              inwardNo: inwardNo,
              documentType: 'UNDERWRITING_EXCEPTION'
            })
          ).unwrap();
      
        //   if (uploadResponse?.success) {
        //     handleRemoveFile();
        //   }
        //   ============================================
        //   4. CHECK UPLOAD SUCCESS
        //   ============================================
      
          if (!uploadResponse?.success) {
            toast.error(
              uploadResponse?.message ||
                "Document upload failed",
              {
                position: "top-right",
                duration: 5000,
              }
            );
      
            return;
          }
      
          if (uploadResponse?.success) {
            setFile(null);
            setFileError("");
          
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          
           
          }
          // ============================================
          // 5. SECOND API - APPROVE MEMBER EXCEPTION
          // ============================================
      
          const payload = {
            stagingMemberEnrollmentIds,
            exceptionApprovalRemark: data.Remark,
          };
      
          const response = await dispatch(
            approveMemberExceptions(payload)
          ).unwrap();
      
      
          // ============================================
          // 6. SHOW API MESSAGE
          // ============================================
        
          if (uploadResponse?.success && response?.success) {
            resetField("Remark");
            toast.success(
              response?.message ||
                "Enrollment processing completed",
              {
                position: "top-right",
                duration: 5000,
              }
            );
            navigate(`/enrolment-system/member-data?policyId=${policyId}&inwardNo=${inwardNo}&dummyPolicyNumber=${dummyPolicyNumber}`);
          } else {
            toast.error(
              response?.message ||
                "Failed to approve member exceptions",
              {
                position: "top-right",
                duration: 5000,
              }
            );
          }
        } catch (error: any) {
          console.error("Approve error:", error);
      
          toast.error(
            error?.message ||
              error ||
              "Something went wrong",
            {
              position: "top-right",
              duration: 5000,
            }
          );
        }
      };
  
    return (
        <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
            <CompactPageHeader
                title="Exception Details"
                totalRecords={totalRecordsForExceptionMember}
                recordLabel="Exceptions"
                statusBadge={Maincategory}
                onRefresh={() => {
                    if (category && policyId) {
                        dispatch(
                            fetchMemberServiceForExceptionsMembers({
                                payload: { page, size: pageSize, category },
                                policyId,
                            })
                        );
                    }
                }}
            >
                {inwardNo && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs">
                        <span className="text-slate-500 font-medium">Inward:</span>
                        <span className="font-mono font-bold text-slate-800">{inwardNo}</span>
                    </div>
                )}
                <Button
                    color="neutral"
                    className="h-7 text-xs px-2 flex items-center gap-1 shadow-2xs"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>Back</span>
                </Button>
            </CompactPageHeader>

            {/* Main Content Card */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
                {/* Selection Toolbar */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-2 py-1 mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                            {selectedMembers.length}{" "}
                            {selectedMembers.length === 1 ? "member" : "members"} selected
                        </span>
                        {selectedMembers.length > 0 && (
                            <button
                                type="button"
                                onClick={handleDeselectAll}
                                className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                    <Button
                        size="xs"
                        color="primary"
                        type="button"
                        onClick={handleSelectAll}
                        disabled={!memberDataForExceptionMember.length}
                        className="h-6 text-[11px] px-2"
                    >
                        Select All
                    </Button>
                </div>

                <div className="min-h-0 flex-1 flex flex-col">
                    <AgGridSuperWrapper
                        rowData={memberDataForExceptionMember}
                        columnDefs={exceptionColumns}
                        onRowClick={() => { }}
                        pageSize={pageSize}
                        height="100%"
                        pagination={false}
                    />
                </div>
            </div>

            <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                totalItems={totalRecordsForExceptionMember}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[20, 30, 50, 100]}
            />

            {selectedMembers.length > 0 && (
                <div className="shrink-0 rounded-xl border border-blue-200 bg-blue-50/50 p-2 shadow-2xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        {/* Left: Remark Input & Approve Button */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter approval remark..."
                                    className="h-7 text-xs"
                                    isRequired
                                    {...register("Remark", {
                                        required: "Remark is required",
                                    })}
                                    error={errors?.Remark?.message}
                                />
                            </div>
                            <Button
                                color="primary"
                                className="h-7 text-xs px-3 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                                onClick={handleSubmit(handleApprove)}
                            >
                                Approve
                            </Button>
                        </div>

                        {/* Right: Upload Documents */}
                        <div className="flex items-center gap-2">
                            <div
                                onClick={handleUploadClick}
                                className="h-7 px-3 flex-1 cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-between transition-colors relative"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={handleFileChange}
                                />
                                {!file ? (
                                    <span className="text-[11px] font-medium text-slate-500">
                                        Click to upload document (PDF, Excel, Word)
                                    </span>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[11px] font-medium text-slate-800 truncate max-w-[200px]">
                                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile();
                                            }}
                                            className="ml-2 text-slate-400 hover:text-red-500 text-xs"
                                            title="Remove file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            {fileError && (
                                <p className="text-[10px] text-red-500">{fileError}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExceptionDetails;