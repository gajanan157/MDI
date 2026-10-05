import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export interface ContactInfo {
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  addressUse?: string;
  addressType?: string;
  label?: string;
}

interface ContactInfoCardProps {
  contactInfo?: ContactInfo[]; 
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  addressUse?: string;
  addressType?: string;
}

export function ContactInfoCard({
  contactInfo,
  phone,
  email,
  city,
  state,
  address,
  addressUse,
  addressType,
}: Readonly<ContactInfoCardProps>) {
  const [expanded, setExpanded] = useState(false);
    const contactInfoList: ContactInfo[] = contactInfo || (
    (phone || email || city || state || address) 
      ? [{ phone, email, city, state, address, addressUse, addressType }] 
      : []
  );

  const singleContactInfo = contactInfoList.length > 0 ? contactInfoList[0] : null;
  const addressText = singleContactInfo?.address || address || "";
  const isLong = typeof addressText === "string" && (addressText.length > 50 || addressText.includes("\n"));

  return (
    <div className="bg-linear-to-br from-muted/50 to-muted/30 rounded-md p-2 border border-border shadow-sm min-w-0 overflow-hidden h-full flex flex-col">
      <h4 className="text-xs font-semibold text-foreground mb-1.5 pb-0.5 border-b border-border">
        Contact Info
      </h4>
      <div className="space-y-1.5 text-xs mt-1.5 min-w-0">
        {singleContactInfo ? (
          <>
            {singleContactInfo.phone && (
              <div className="flex items-center gap-1.5 min-w-0">
                <PhoneIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <a
                  href={`tel:${singleContactInfo.phone}`}
                  className="text-foreground hover:text-primary transition-colors truncate text-xs font-medium min-w-0"
                >
                  {singleContactInfo.phone}
                </a>
              </div>
            )}
            {singleContactInfo.email && (
              <div className="flex items-start gap-1.5 min-w-0">
                <EnvelopeIcon className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <a
                  href={`mailto:${singleContactInfo.email}`}
                  className="text-foreground hover:text-primary transition-colors text-xs font-medium min-w-0 wrap-break-word break-all overflow-wrap-anywhere"
                  title={singleContactInfo.email}
                  style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {singleContactInfo.email}
                </a>
              </div>
            )}
            {addressText && (
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPinIcon className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div
                    className={`wrap-break-word whitespace-pre-wrap text-foreground text-xs min-w-0 ${
                      !expanded && isLong ? "line-clamp-1" : ""
                    }`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    {addressText}
                  </div>
                  {isLong && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => !prev);
                      }}
                      className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
                    >
                      {expanded ? "See less" : "See more"}
                    </button>
                  )}
                </div>
              </div>
            )}
            {(singleContactInfo.city || singleContactInfo.state) && (
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPinIcon className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground text-xs min-w-0 wrap-break-word break-all overflow-wrap-anywhere" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {singleContactInfo.city && singleContactInfo.state ? `${singleContactInfo.city}, ${singleContactInfo.state}` : singleContactInfo.city || singleContactInfo.state}
                </span>
              </div>
            )}
            {(singleContactInfo.addressUse || singleContactInfo.addressType) && (
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                {singleContactInfo.addressUse && (
                  <span className="text-muted-foreground text-[10px] font-medium">
                    Use: <span className="text-foreground capitalize">{singleContactInfo.addressUse}</span>
                  </span>
                )}
                {singleContactInfo.addressType && (
                  <span className="text-muted-foreground text-[10px] font-medium">
                    Type: <span className="text-foreground capitalize">{singleContactInfo.addressType}</span>
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">
            No contact info
          </div>
        )}
      </div>
    </div>
  );
}

