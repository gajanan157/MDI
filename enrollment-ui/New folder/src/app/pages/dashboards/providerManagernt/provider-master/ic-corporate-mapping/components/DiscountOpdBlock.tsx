import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import {
  IPD_LIST_OPTIONS,
  NOT_COVERED_LIST_OPTIONS,
  OPD_LIST_OPTIONS,
} from "../discountOptions";
import { DiscountToggleListColumn } from "./DiscountToggleListColumn";
import {
  getDiscountOpdLayout,
  syncPercentRecordWithList,
  type PercentRecord,
} from "./discountOpdBlockHelpers";

export type DiscountOpdAdditionalFields = {
  ipdEnabled: boolean;
  ipdList: string[];
  opdEnabled: boolean;
  opdList: string[];
  additionalDiscountEnabled: boolean;
  additionalDiscountList: string[];
};

export type DiscountOpdAdditionalPercentMaps = {
  ipd?: [PercentRecord, Dispatch<SetStateAction<PercentRecord>>];
  opd: [PercentRecord, Dispatch<SetStateAction<PercentRecord>>];
  additional: [PercentRecord, Dispatch<SetStateAction<PercentRecord>>];
};

export function DiscountOpdAdditionalBlock<TFieldValues extends DiscountOpdAdditionalFields>({
  control,
  setValue,
  ipdEnabled,
  opdEnabled,
  additionalDiscountEnabled,
  size,
  selectClassName = "",
  compactLabels = false,
  singleRow = false,
  includeNotCovered = true,
  embeddedTop = false,
  percentMaps,
}: Readonly<{
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  ipdEnabled: boolean;
  opdEnabled: boolean;
  additionalDiscountEnabled: boolean;
  size: "sm" | "md";
  selectClassName?: string;
  compactLabels?: boolean;
  singleRow?: boolean;
  includeNotCovered?: boolean;
  embeddedTop?: boolean;
  percentMaps?: DiscountOpdAdditionalPercentMaps;
}>) {
  const [internalIpdPercents, setInternalIpdPercents] = useState<PercentRecord>({});
  const [internalOpdPercents, setInternalOpdPercents] = useState<PercentRecord>({});
  const [internalAdditionalPercents, setInternalAdditionalPercents] = useState<PercentRecord>({});

  const ipdPercents = percentMaps?.ipd?.[0] ?? internalIpdPercents;
  const setIpdPercents = percentMaps?.ipd?.[1] ?? setInternalIpdPercents;
  const opdPercents = percentMaps?.opd[0] ?? internalOpdPercents;
  const setOpdPercents = percentMaps?.opd[1] ?? setInternalOpdPercents;
  const additionalPercents = percentMaps?.additional[0] ?? internalAdditionalPercents;
  const setAdditionalPercents = percentMaps?.additional[1] ?? setInternalAdditionalPercents;

  const ipdListRaw = useWatch({ control, name: "ipdList" as never }) as string[] | undefined;
  const ipdList = useMemo(() => ipdListRaw ?? [], [ipdListRaw]);
  const opdListRaw = useWatch({ control, name: "opdList" as never }) as string[] | undefined;
  const opdList = useMemo(() => opdListRaw ?? [], [opdListRaw]);
  const additionalListRaw = useWatch({
    control,
    name: "additionalDiscountList" as never,
  }) as string[] | undefined;
  const additionalList = useMemo(() => additionalListRaw ?? [], [additionalListRaw]);

  useEffect(() => {
    if (!ipdEnabled) setIpdPercents({});
  }, [ipdEnabled, setIpdPercents]);

  useEffect(() => {
    if (!ipdEnabled) return;
    setIpdPercents((prev) => syncPercentRecordWithList(prev, ipdList));
  }, [ipdEnabled, ipdList, setIpdPercents]);

  useEffect(() => {
    if (!opdEnabled) setOpdPercents({});
  }, [opdEnabled, setOpdPercents]);

  useEffect(() => {
    if (!opdEnabled) return;
    setOpdPercents((prev) => syncPercentRecordWithList(prev, opdList));
  }, [opdEnabled, opdList, setOpdPercents]);

  useEffect(() => {
    if (!additionalDiscountEnabled) setAdditionalPercents({});
  }, [additionalDiscountEnabled, setAdditionalPercents]);

  useEffect(() => {
    if (!additionalDiscountEnabled) return;
    setAdditionalPercents((prev) => syncPercentRecordWithList(prev, additionalList));
  }, [additionalDiscountEnabled, additionalList, setAdditionalPercents]);

  const layout = getDiscountOpdLayout(compactLabels, singleRow, includeNotCovered);
  const percentControlSize = size === "md" ? "md" : "sm";
  const columnLayout = singleRow || compactLabels ? "stacked" : "inline";
  const hideListLabel = singleRow;

  return (
    <div
      className={
        embeddedTop
          ? ""
          : singleRow
            ? "border-t border-gray-100 pt-1"
            : compactLabels
              ? "space-y-1.5 border-t border-gray-100 pt-1.5"
              : "space-y-3 border-t border-gray-100 pt-3"
      }
    >
      <div className={layout.rowGrid}>
        <DiscountToggleListColumn
          control={control}
          setValue={setValue}
          enabledFieldName="ipdEnabled"
          listFieldName="ipdList"
          enabled={ipdEnabled}
          checkboxLabel="IPD"
          listLabel="IPD list"
          listPlaceholder="Search IPD..."
          options={IPD_LIST_OPTIONS}
          selectedList={ipdList}
          percents={ipdPercents}
          setPercents={setIpdPercents}
          size={size}
          selectClassName={selectClassName}
          labelTextCls={layout.labelText}
          cardCls={layout.card}
          percentPanelCls={layout.percentPanel}
          percentControlSize={percentControlSize}
          percentInputClass={layout.percentInputClass}
          columnLayout={columnLayout}
          hideListLabel={hideListLabel}
        />

        <DiscountToggleListColumn
          control={control}
          setValue={setValue}
          enabledFieldName="opdEnabled"
          listFieldName="opdList"
          enabled={opdEnabled}
          checkboxLabel="OPD"
          listLabel="OPD list"
          listPlaceholder="Search OPD..."
          options={OPD_LIST_OPTIONS}
          selectedList={opdList}
          percents={opdPercents}
          setPercents={setOpdPercents}
          size={size}
          selectClassName={selectClassName}
          labelTextCls={layout.labelText}
          cardCls={layout.card}
          percentPanelCls={layout.percentPanel}
          percentControlSize={percentControlSize}
          percentInputClass={layout.percentInputClass}
          columnLayout={columnLayout}
          hideListLabel={hideListLabel}
        />

        {includeNotCovered ? (
        <DiscountToggleListColumn
          control={control}
          setValue={setValue}
          enabledFieldName="additionalDiscountEnabled"
          listFieldName="additionalDiscountList"
          enabled={additionalDiscountEnabled}
          checkboxLabel="NOT COVERED"
          listLabel="Not covered list"
          listPlaceholder="Search not covered..."
          options={NOT_COVERED_LIST_OPTIONS}
          selectedList={additionalList}
          percents={additionalPercents}
          setPercents={setAdditionalPercents}
          size={size}
          selectClassName={selectClassName}
          labelTextCls={layout.labelText}
          cardCls={layout.card}
          percentPanelCls={layout.percentPanel}
          percentControlSize={percentControlSize}
          percentInputClass={layout.percentInputClass}
          columnLayout={columnLayout}
          hideListLabel={hideListLabel}
        />
        ) : null}
      </div>
    </div>
  );
}
