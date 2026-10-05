import { eCardService, postApi } from "@/app/api/apiService";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import PreviewFrame from "./PreviewFrame";


interface Props {
    onClose?: () => void;
    labelFields: any[];
    insurerId?: string | null;
    corporateId?: string | null;
    policyId?: string | null;
}

const ViewCard: React.FC<Props> = ({ labelFields, insurerId, corporateId, policyId }) => {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const fetchPreview = async () => {

        try {
            setPreviewLoading(true);
            const payload = {
                templateLabels: labelFields?.map((item: any) => ({
                    uuid: item.uuid,
                    value: item.value,
                    defaultValue: item.defaultValue,
                })),
            };


            const queryParams = new URLSearchParams();

            insurerId && queryParams.append("insurerId", insurerId);
            corporateId && queryParams.append("corporateId", corporateId);
            policyId && queryParams.append("policyId", policyId);

            const url = `v1/ecards/preview${queryParams.toString() ? `?${queryParams.toString()}` : ""
                }`;

            const res = await postApi(eCardService, url, payload, {
                responseType: "blob",
            });

            const blob = new Blob([(res as any).data], {
                type: "application/pdf",
            });

            setPreviewUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error(error);
            toast.error("Unable to load preview");
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (labelFields?.length > 0) {
            fetchPreview();
        }
    }, [labelFields, insurerId, corporateId, policyId]);
    return (
        <div className="w-full">
            <PreviewFrame
                previewLoading={previewLoading}
                previewUrl={previewUrl}
                newWidth="w-full"
                width="w-full"
            />
        </div>
    );
};

export default ViewCard;