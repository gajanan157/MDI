import React from "react";

interface PreviewFrameProps { previewLoading: boolean; previewUrl?: string | null;loadingText?: string; emptyText?: string; width?: string; newWidth?: string;height?: string;}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ previewLoading, previewUrl, loadingText = "Loading Preview...", emptyText = "E-Card Preview Here", width = "w-[700px]", newWidth = "w-[690px]", height = "h-[320px]" }) => {
    return (
        <div className={`${height} ${width} flex items-center justify-center`}>
            {previewLoading ? (
                <span className="text-gray-400">{loadingText}</span>
            ) : previewUrl ? (
                <div className={`${height} ${newWidth} `}>
                    <iframe
                        src={previewUrl}
                        title="E-Card Preview"
                        className="w-full h-full rounded-xl"
                    />
                </div>
            ) : (
                <span className="text-gray-400 text-lg">{emptyText}</span>
            )}
        </div>
    );
};
export default PreviewFrame;