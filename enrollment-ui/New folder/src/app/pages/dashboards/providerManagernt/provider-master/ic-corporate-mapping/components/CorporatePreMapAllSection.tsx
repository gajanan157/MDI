import { CorporateProviderCategoryCard } from "./CorporateProviderCategoryCard";
import { CorporateSocDiscountDocumentPanel } from "./CorporateSocDiscountDocumentPanel";
import {
  getCorporateGridLayout,
  type ProviderNameRow,
} from "./mappedCorporateTabHelpers";

type CorporatePreMapAllSectionProps = {
  hiddenCardsCorporate: Set<string>;
  alreadyMapped: ProviderNameRow[];
  existingNetwork: ProviderNameRow[];
  nonNetwork: ProviderNameRow[];
  newProvider: ProviderNameRow[];
  cardListMinHeight: number;
  providerListLimit: number;
  setSeeMoreDialog: (payload: {
    title: string;
    items: ProviderNameRow[];
    cardKey: string;
    tab: "corporate";
  }) => void;
  seeMoreLabel: (count: number) => string;
  control: unknown;
  socUploadedCorporate: boolean;
  socFileCorporate: File | null;
  setSocFileCorporate: (file: File | null) => void;
  handleSocUploadCorporate: () => void;
  socAppliedCorporate: boolean;
  socEffectiveFromCorporate: string;
  setSocEffectiveFromCorporate: (value: string) => void;
  socEffectiveToCorporate: string;
  setSocEffectiveToCorporate: (value: string) => void;
  setSocAppliedCorporate: (value: boolean) => void;
  discountUploadedCorporate: boolean;
  discountFileCorporate: File | null;
  setDiscountFileCorporate: (file: File | null) => void;
  handleDiscountUploadCorporate: () => void;
  discountTypeCorporate: string;
  selectedIcId: string;
  selectedCorporateId: string;
  discountAppliedToAllCorporate: boolean;
  setDiscountAppliedToAllCorporate: (value: boolean) => void;
};

const CATEGORY_CARDS = [
  { key: "alreadyMapped", title: "Already Mapped", themeKey: "gray" as const, listKey: "alreadyMapped" as const },
  { key: "existingNetwork", title: "Existing Network", themeKey: "blue" as const, listKey: "existingNetwork" as const },
  { key: "nonNetwork", title: "Non Network", themeKey: "amber" as const, listKey: "nonNetwork" as const },
  { key: "newProvider", title: "New Provider", themeKey: "primary" as const, listKey: "newProvider" as const },
];

export function CorporatePreMapAllSection(props: CorporatePreMapAllSectionProps) {
  const layout = getCorporateGridLayout(props.hiddenCardsCorporate);
  const lists: Record<string, ProviderNameRow[]> = {
    alreadyMapped: props.alreadyMapped,
    existingNetwork: props.existingNetwork,
    nonNetwork: props.nonNetwork,
    newProvider: props.newProvider,
  };

  return (
    <div className={layout.gridClassName}>
      <div className="min-w-0">
        <div className="grid gap-2" style={{ gridTemplateColumns: layout.gridTemplateColumns }}>
          {CATEGORY_CARDS.map((card) => {
            if (props.hiddenCardsCorporate.has(card.key)) return null;
            const items = lists[card.listKey];
            return (
              <CorporateProviderCategoryCard
                key={card.key}
                title={card.title}
                items={items}
                limit={props.providerListLimit}
                minHeight={props.cardListMinHeight}
                themeKey={card.themeKey}
                onSeeMore={() =>
                  props.setSeeMoreDialog({
                    title: card.title,
                    items,
                    cardKey: card.key,
                    tab: "corporate",
                  })
                }
                seeMoreText={props.seeMoreLabel(items.length)}
              />
            );
          })}
        </div>
      </div>

      {layout.showSocPanel ? (
        <div className="min-w-0">
          <CorporateSocDiscountDocumentPanel
            variant="standard"
            control={props.control}
            socUploadedCorporate={props.socUploadedCorporate}
            socFileCorporate={props.socFileCorporate}
            setSocFileCorporate={props.setSocFileCorporate}
            handleSocUploadCorporate={props.handleSocUploadCorporate}
            socAppliedCorporate={props.socAppliedCorporate}
            socEffectiveFromCorporate={props.socEffectiveFromCorporate}
            setSocEffectiveFromCorporate={props.setSocEffectiveFromCorporate}
            socEffectiveToCorporate={props.socEffectiveToCorporate}
            setSocEffectiveToCorporate={props.setSocEffectiveToCorporate}
            setSocAppliedCorporate={props.setSocAppliedCorporate}
            discountUploadedCorporate={props.discountUploadedCorporate}
            discountFileCorporate={props.discountFileCorporate}
            setDiscountFileCorporate={props.setDiscountFileCorporate}
            handleDiscountUploadCorporate={props.handleDiscountUploadCorporate}
            discountTypeCorporate={props.discountTypeCorporate}
            selectedIcId={props.selectedIcId}
            selectedCorporateId={props.selectedCorporateId}
            discountAppliedToAllCorporate={props.discountAppliedToAllCorporate}
            setDiscountAppliedToAllCorporate={props.setDiscountAppliedToAllCorporate}
          />
        </div>
      ) : null}
    </div>
  );
}
