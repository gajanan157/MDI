import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderCard } from "../../../providerDetails/Cards";
import { SOC_DETAIL_BODY_PADDING } from "../utils/socDetailTheme";

type SocDiscountSectionProps = {
  isSocViewMode: boolean;
  canWrite: boolean;
  onOpenAddDiscount: () => void;
};

export function SocDiscountSection({
  isSocViewMode,
  canWrite,
  onOpenAddDiscount,
}: Readonly<SocDiscountSectionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  return (
    <div className={SOC_DETAIL_BODY_PADDING}>
      <ProviderCard
        title={t(`${D}.title`)}
        isEditMode={!isSocViewMode}
        bodyClassName="space-y-3 px-2.5 py-2"
      >
        <p className="text-[10px] text-slate-500">{t(`${D}.standaloneHint`)}</p>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              color="primary"
              className={PROVIDER_FORM_BUTTON_CLASS}
              onClick={onOpenAddDiscount}
            >
              {t("providerMaster.soc.toolbar.addDiscount")}
            </Button>
          </div>
        ) : null}
      </ProviderCard>
    </div>
  );
}
