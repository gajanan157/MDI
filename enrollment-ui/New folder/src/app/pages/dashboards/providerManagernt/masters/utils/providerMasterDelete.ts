import type { AppDispatch } from "@/store/store";
import {
  deleteInsurerProviderNetworkMode,
  deleteProviderDiscountTypeMaster,
  deleteProviderDiscountSubtypeMaster,
  deleteProviderDiscountInclusionExclusionMaster,
  deleteProviderIdentifierTypeMaster,
  deleteProviderTaxonomyMaster,
  fetchInsurerProviderNetworkMode,
  fetchProviderDiscountTypeMaster,
  fetchProviderDiscountSubtypeMaster,
  fetchProviderDiscountInclusionExclusionMaster,
  fetchProviderIdentifierTypeMaster,
  fetchProviderTaxonomyMaster,
} from "@/store/features/providerMasters/providerMastersSlice";
import { buildNetworkModeListParams } from "./insurerProviderNetworkModeFormConfig";
import { buildDiscountTypeListParams } from "./discountTypeFormConfig";
import { buildDiscountSubtypeListParams } from "./discountSubtypeFormConfig";
import { buildDiscountInclusionExclusionListParams } from "./discountInclusionExclusionFormConfig";
import { buildTaxonomyListParams } from "./taxonomyFormConfig";
import type { MasterTypeFlags } from "./providerMastersPageHelpers";

export async function deleteRemoteMasterRecord(
  dispatch: AppDispatch,
  recordId: string,
  flags: MasterTypeFlags,
  page: number,
  pageSize: number,
  filters: Record<string, unknown>,
): Promise<string | undefined> {
  if (flags.isIdentifierTypeMaster) {
    const result = await dispatch(deleteProviderIdentifierTypeMaster(recordId)).unwrap();
    dispatch(fetchProviderIdentifierTypeMaster({ page, size: pageSize }));
    return result.message;
  }

  if (flags.isTaxonomyMaster) {
    const result = await dispatch(deleteProviderTaxonomyMaster(recordId)).unwrap();
    dispatch(fetchProviderTaxonomyMaster(buildTaxonomyListParams(page, pageSize, filters)));
    return result.message;
  }

  if (flags.isNetworkModeMaster) {
    const result = await dispatch(deleteInsurerProviderNetworkMode(recordId)).unwrap();
    dispatch(fetchInsurerProviderNetworkMode(buildNetworkModeListParams(page, pageSize, filters)));
    return result.message;
  }

  if (flags.isDiscountTypeMaster) {
    const result = await dispatch(deleteProviderDiscountTypeMaster(recordId)).unwrap();
    dispatch(fetchProviderDiscountTypeMaster(buildDiscountTypeListParams(page, pageSize, filters)));
    return result.message;
  }

  if (flags.isDiscountSubtypeMaster) {
    const result = await dispatch(deleteProviderDiscountSubtypeMaster(recordId)).unwrap();
    dispatch(
      fetchProviderDiscountSubtypeMaster(buildDiscountSubtypeListParams(page, pageSize, filters)),
    );
    return result.message;
  }

  if (flags.isDiscountInclusionExclusionMaster) {
    const result = await dispatch(
      deleteProviderDiscountInclusionExclusionMaster(recordId),
    ).unwrap();
    dispatch(
      fetchProviderDiscountInclusionExclusionMaster(
        buildDiscountInclusionExclusionListParams(page, pageSize, filters),
      ),
    );
    return result.message;
  }

  return undefined;
}

export function isRemoteMaster(flags: MasterTypeFlags): boolean {
  return (
    flags.isIdentifierTypeMaster ||
    flags.isTaxonomyMaster ||
    flags.isNetworkModeMaster ||
    flags.isDiscountTypeMaster ||
    flags.isDiscountSubtypeMaster ||
    flags.isDiscountInclusionExclusionMaster
  );
}
