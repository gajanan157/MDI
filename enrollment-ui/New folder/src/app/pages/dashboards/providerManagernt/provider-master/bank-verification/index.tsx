import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { Page, PageContent } from "../../shared/providerShell";
import {
  BANK_VERIFICATION_UPLOAD_PATH,
  isBankVerificationUploadPathname,
} from "./config";
import BankVerificationLanding from "./Landing";
import { BankVerificationUploadPageContent } from "./UploadPageContent";

export default function BankVerificationPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const uploadRoute = isBankVerificationUploadPathname(pathname);

  const pageTitle = uploadRoute
    ? t("nav.dashboards.provider-masters-bank-verification-upload", {
        defaultValue: "Bulk Bank Verification",
      })
    : t("nav.dashboards.provider-masters-bank-verification");

  return (
    <Page title={pageTitle}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        {!uploadRoute ? (
          <BankVerificationLanding
            onOpenUpload={() => navigate(BANK_VERIFICATION_UPLOAD_PATH)}
          />
        ) : (
          <BankVerificationUploadPageContent />
        )}
      </div>
    </Page>
  );
}
