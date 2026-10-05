import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import type { TFunction } from "i18next";
import { getMappingSubTabLabel, getProviderTabLabel } from "../../../../shared/providerMasterI18n";
import { PROVIDERS_LIST_PATH } from "../../utils/providersPaths";
import {
  buildMappingSubTabPath,
  buildRestrictionListPath,
  MappingSubTab,
  parseMappingDetailFromPath,
  parseRestrictionCreateFromPath,
  parseRestrictionDetailFromPath,
  parseRestrictionListFromPath,
} from "./icMappingSubTabPaths";

export type ViewHospitalBreadcrumbInput = {
  t: TFunction;
  activeTabId: string;
  activeTabLabel: string;
  mappingSubTab: MappingSubTab;
  icMappingCreateMode: boolean;
  restrictionCreateMode: boolean;
  providerBasePath: string;
  agreementUrlKey: string | undefined;
  agreementUrlSuffix: "view" | "edit" | undefined;
  socUrlKey: string | undefined;
  socUrlSuffix: "view" | "edit" | undefined;
  discountUrlKey?: string | undefined;
  discountUrlSuffix?: "view" | "edit" | undefined;
  ownerUrlKey: string | undefined;
  ownerUrlSuffix: "edit" | undefined;
  pathname: string;
  restrictionContextEntityId?: string;
};

type ResolvedContext = ViewHospitalBreadcrumbInput & {
  mappingDetailFromPath: ReturnType<typeof parseMappingDetailFromPath>;
  restrictionDetailFromPath: ReturnType<typeof parseRestrictionDetailFromPath>;
  restrictionListFromPath: ReturnType<typeof parseRestrictionListFromPath>;
  restrictionCreateFromPath: ReturnType<typeof parseRestrictionCreateFromPath>;
  mappingUrlKey: string | undefined;
  mappingUrlSuffix: "view" | "edit" | undefined;
  mappingDetailSubTab: MappingSubTab;
  restrictionUrlKey: string | undefined;
  restrictionUrlSuffix: "view" | "edit" | undefined;
  restrictionSubTab: MappingSubTab;
  icCorporateNavFromSubFlow: boolean;
  isMappingDetailDeepRoute: boolean;
  isRestrictionDetailDeepRoute: boolean;
  isRestrictionListDeepRoute: boolean;
  isRestrictionCreateDeepRoute: boolean;
  isInsurerListBreadcrumb: boolean;
  isCorporateListBreadcrumb: boolean;
  isIcMappingCreateBreadcrumb: boolean;
  isCorporateMappingCreateBreadcrumb: boolean;
  isLegacyRestrictionCreateBreadcrumb: boolean;
  isMappingListSubTabBreadcrumb: boolean;
  isNewAgreementDeepRoute: boolean;
  isAgreementDeepRoute: boolean;
  isSocDeepRoute: boolean;
  isDiscountDeepRoute: boolean;
  isOwnerDeepRoute: boolean;
  restrictionContextEntityId: string;
};

function resolveContext(input: ViewHospitalBreadcrumbInput): ResolvedContext {
  const mappingDetailFromPath = parseMappingDetailFromPath(input.pathname);
  const restrictionDetailFromPath = parseRestrictionDetailFromPath(input.pathname);
  const restrictionListFromPath = parseRestrictionListFromPath(input.pathname);
  const restrictionCreateFromPath = parseRestrictionCreateFromPath(input.pathname);

  const mappingUrlKey = mappingDetailFromPath?.mappingId;
  const mappingUrlSuffix = mappingDetailFromPath?.mode;
  const mappingDetailSubTab = mappingDetailFromPath?.subTab ?? input.mappingSubTab;
  const restrictionUrlKey = restrictionDetailFromPath?.restrictionId;
  const restrictionUrlSuffix = restrictionDetailFromPath?.mode;
  const restrictionSubTab =
    restrictionDetailFromPath?.subTab ??
    restrictionListFromPath?.subTab ??
    restrictionCreateFromPath?.subTab ??
    input.mappingSubTab;

  const icCorporateNavFromSubFlow =
    input.activeTabId === "ic-corporate" &&
    input.mappingSubTab === "ic" &&
    (input.icMappingCreateMode || input.restrictionCreateMode);

  const isMappingDetailDeepRoute =
    input.activeTabId === "ic-corporate" &&
    Boolean(mappingUrlKey) &&
    (mappingUrlSuffix === "view" || mappingUrlSuffix === "edit");

  const isRestrictionDetailDeepRoute =
    input.activeTabId === "ic-corporate" &&
    Boolean(restrictionUrlKey) &&
    (restrictionUrlSuffix === "view" || restrictionUrlSuffix === "edit");

  const isRestrictionListDeepRoute =
    input.activeTabId === "ic-corporate" && Boolean(restrictionListFromPath);

  const isRestrictionCreateDeepRoute =
    input.activeTabId === "ic-corporate" && Boolean(restrictionCreateFromPath);

  const isInsurerListBreadcrumb =
    input.activeTabId === "ic-corporate" &&
    input.mappingSubTab === "ic" &&
    !input.icMappingCreateMode &&
    !input.restrictionCreateMode &&
    !isMappingDetailDeepRoute &&
    !isRestrictionDetailDeepRoute &&
    !isRestrictionListDeepRoute &&
    !isRestrictionCreateDeepRoute &&
    !icCorporateNavFromSubFlow;

  const isCorporateListBreadcrumb =
    input.activeTabId === "ic-corporate" &&
    input.mappingSubTab === "corporate" &&
    !input.icMappingCreateMode &&
    !input.restrictionCreateMode &&
    !isMappingDetailDeepRoute &&
    !isRestrictionDetailDeepRoute &&
    !isRestrictionListDeepRoute &&
    !isRestrictionCreateDeepRoute &&
    !icCorporateNavFromSubFlow;

  return {
    ...input,
    mappingDetailFromPath,
    restrictionDetailFromPath,
    restrictionListFromPath,
    restrictionCreateFromPath,
    mappingUrlKey,
    mappingUrlSuffix,
    mappingDetailSubTab,
    restrictionUrlKey,
    restrictionUrlSuffix,
    restrictionSubTab,
    icCorporateNavFromSubFlow,
    isMappingDetailDeepRoute,
    isRestrictionDetailDeepRoute,
    isRestrictionListDeepRoute,
    isRestrictionCreateDeepRoute,
    isInsurerListBreadcrumb,
    isCorporateListBreadcrumb,
    isIcMappingCreateBreadcrumb:
      input.activeTabId === "ic-corporate" &&
      input.mappingSubTab === "ic" &&
      input.icMappingCreateMode,
    isCorporateMappingCreateBreadcrumb:
      input.activeTabId === "ic-corporate" &&
      input.mappingSubTab === "corporate" &&
      input.icMappingCreateMode,
    isLegacyRestrictionCreateBreadcrumb:
      input.activeTabId === "ic-corporate" &&
      input.restrictionCreateMode &&
      !isRestrictionCreateDeepRoute,
    isMappingListSubTabBreadcrumb: isInsurerListBreadcrumb || isCorporateListBreadcrumb,
    isNewAgreementDeepRoute:
      input.activeTabId === "agreement" &&
      /\/agreement\/new-agreement(?:\/?$)/.test(input.pathname),
    isAgreementDeepRoute:
      input.activeTabId === "agreement" &&
      Boolean(input.agreementUrlKey) &&
      (input.agreementUrlSuffix === "view" || input.agreementUrlSuffix === "edit"),
    isSocDeepRoute:
      input.activeTabId === "soc" &&
      Boolean(input.socUrlKey) &&
      (input.socUrlSuffix === "view" || input.socUrlSuffix === "edit"),
    isDiscountDeepRoute:
      input.activeTabId === "hospital-discount" &&
      Boolean(input.discountUrlKey) &&
      (input.discountUrlSuffix === "view" || input.discountUrlSuffix === "edit"),
    isOwnerDeepRoute:
      input.activeTabId === "provider-owner" &&
      Boolean(input.ownerUrlKey) &&
      (input.ownerUrlKey === "new" || input.ownerUrlSuffix === "edit"),
    restrictionContextEntityId: input.restrictionContextEntityId ?? "",
  };
}

function baseTrail(t: TFunction): BreadcrumbItem[] {
  return [
    { title: t("providerMaster.moduleName") },
    { title: t("providerMaster.providerMasterLabel") },
    { title: t("providerMaster.breadcrumb.providers"), path: PROVIDERS_LIST_PATH },
  ];
}

function icCorporateTabLink(
  providerBasePath: string,
  subTab: MappingSubTab,
  t: TFunction,
): BreadcrumbItem {
  return {
    title: getProviderTabLabel("ic-corporate", t),
    path: buildMappingSubTabPath(providerBasePath, subTab),
  };
}

function resolveActiveTabCrumb(ctx: ResolvedContext): BreadcrumbItem {
  const { t } = ctx;
  if (ctx.isAgreementDeepRoute || ctx.isNewAgreementDeepRoute) {
    return { title: getProviderTabLabel("agreement", t), path: `${ctx.providerBasePath}/agreement` };
  }
  if (ctx.isSocDeepRoute) {
    return { title: getProviderTabLabel("soc", t), path: `${ctx.providerBasePath}/soc` };
  }
  if (ctx.isDiscountDeepRoute) {
    return {
      title: getProviderTabLabel("hospital-discount", t),
      path: `${ctx.providerBasePath}/discount`,
    };
  }
  if (ctx.isOwnerDeepRoute) {
    return { title: getProviderTabLabel("provider-owner", t), path: `${ctx.providerBasePath}/owner` };
  }
  if (
    ctx.isMappingDetailDeepRoute ||
    ctx.isRestrictionDetailDeepRoute ||
    ctx.isRestrictionListDeepRoute ||
    ctx.isRestrictionCreateDeepRoute
  ) {
    const subTab =
      ctx.isMappingDetailDeepRoute
        ? ctx.mappingDetailSubTab
        : ctx.restrictionSubTab;
    return icCorporateTabLink(ctx.providerBasePath, subTab, t);
  }
  return { title: ctx.activeTabLabel };
}

function usesIcCorporateFourthCrumb(ctx: ResolvedContext): boolean {
  return (
    ctx.icCorporateNavFromSubFlow ||
    ctx.isMappingListSubTabBreadcrumb ||
    ctx.isMappingDetailDeepRoute ||
    ctx.isRestrictionDetailDeepRoute ||
    ctx.isRestrictionListDeepRoute ||
    ctx.isRestrictionCreateDeepRoute
  );
}

function appendAgreementCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  const { t } = ctx;
  if (ctx.isAgreementDeepRoute) {
    crumbs.push({
      title:
        ctx.agreementUrlSuffix === "edit"
          ? t("providerMaster.breadcrumbTrail.editAgreement")
          : t("providerMaster.breadcrumbTrail.viewAgreement"),
    });
    return;
  }
  if (ctx.isNewAgreementDeepRoute) {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.newAgreement") });
  }
}

function resolveSocDeepCrumbTitle(ctx: ResolvedContext, t: TFunction): string {
  if (ctx.socUrlKey?.toLowerCase() === "new") {
    return t("providerMaster.breadcrumbTrail.addSoc");
  }
  if (ctx.socUrlSuffix === "edit") {
    return t("providerMaster.breadcrumbTrail.editSoc");
  }
  return t("providerMaster.breadcrumbTrail.viewSoc");
}

function resolveDiscountDeepCrumbTitle(ctx: ResolvedContext, t: TFunction): string {
  if (ctx.discountUrlKey?.toLowerCase() === "new") {
    return t("providerMaster.breadcrumbTrail.addDiscount");
  }
  if (ctx.discountUrlSuffix === "edit") {
    return t("providerMaster.breadcrumbTrail.editDiscount");
  }
  return t("providerMaster.breadcrumbTrail.viewDiscount");
}

function resolveMappingDetailCrumbTitle(ctx: ResolvedContext, t: TFunction): string {
  const isCorporate = ctx.mappingDetailSubTab === "corporate";
  if (ctx.mappingUrlSuffix === "edit") {
    return isCorporate
      ? t("providerMaster.breadcrumbTrail.editCorporateMapping")
      : t("providerMaster.breadcrumbTrail.editIcMapping");
  }
  return isCorporate
    ? t("providerMaster.breadcrumbTrail.viewCorporateMapping")
    : t("providerMaster.breadcrumbTrail.viewIcMapping");
}

function appendSocCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (ctx.isDiscountDeepRoute) {
    crumbs.push({ title: resolveDiscountDeepCrumbTitle(ctx, ctx.t) });
    return;
  }
  if (!ctx.isSocDeepRoute) return;
  const { t } = ctx;
  crumbs.push({ title: resolveSocDeepCrumbTitle(ctx, t) });
}

function appendOwnerCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (!ctx.isOwnerDeepRoute) return;
  const { t } = ctx;
  crumbs.push({
    title:
      ctx.ownerUrlKey === "new"
        ? t("providerMaster.breadcrumbTrail.addOwner")
        : t("providerMaster.breadcrumbTrail.editOwner"),
  });
}

function appendMappingListCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  const { t } = ctx;
  if (ctx.isInsurerListBreadcrumb) {
    crumbs.push({ title: getMappingSubTabLabel("ic", t) });
  }
  if (ctx.isCorporateListBreadcrumb) {
    crumbs.push({ title: getMappingSubTabLabel("corporate", t) });
  }
}

function appendMappingDetailCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (!ctx.isMappingDetailDeepRoute) return;
  const { t } = ctx;

  // Sub-tab label only — Network Management crumb owns the list link.
  if (ctx.mappingDetailSubTab === "ic") {
    crumbs.push({ title: getMappingSubTabLabel("ic", t) });
  }
  if (ctx.mappingDetailSubTab === "corporate") {
    crumbs.push({ title: getMappingSubTabLabel("corporate", t) });
  }

  crumbs.push({ title: resolveMappingDetailCrumbTitle(ctx, t) });
}

function appendRestrictionDetailCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (!ctx.isRestrictionDetailDeepRoute) return;
  const { t } = ctx;

  if (ctx.restrictionSubTab === "ic") {
    crumbs.push({ title: getMappingSubTabLabel("ic", t) });
  }
  if (ctx.restrictionSubTab === "corporate") {
    crumbs.push({ title: getMappingSubTabLabel("corporate", t) });
  }

  const entityId = ctx.restrictionContextEntityId.trim();
  if (entityId) {
    crumbs.push({
      title: t("providerMaster.breadcrumbTrail.providerRestrictions"),
      path: buildRestrictionListPath(ctx.providerBasePath, ctx.restrictionSubTab, entityId),
    });
  } else {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.providerRestrictions") });
  }

  crumbs.push({
    title:
      ctx.restrictionUrlSuffix === "edit"
        ? t("providerMaster.breadcrumbTrail.editRestriction")
        : t("providerMaster.breadcrumbTrail.viewRestriction"),
  });
}

function appendRestrictionListCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (!ctx.isRestrictionListDeepRoute) return;
  const { t } = ctx;

  if (ctx.restrictionSubTab === "ic") {
    crumbs.push({ title: getMappingSubTabLabel("ic", t) });
  }
  if (ctx.restrictionSubTab === "corporate") {
    crumbs.push({ title: getMappingSubTabLabel("corporate", t) });
  }
  crumbs.push({ title: t("providerMaster.breadcrumbTrail.providerRestrictions") });
}

function appendRestrictionCreateCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  if (!ctx.isRestrictionCreateDeepRoute) return;
  const { t } = ctx;

  if (ctx.restrictionSubTab === "ic") {
    crumbs.push({ title: getMappingSubTabLabel("ic", t) });
  }
  if (ctx.restrictionSubTab === "corporate") {
    crumbs.push({ title: getMappingSubTabLabel("corporate", t) });
  }

  if (ctx.restrictionCreateFromPath) {
    crumbs.push({
      title: t("providerMaster.breadcrumbTrail.providerRestrictions"),
      path: buildRestrictionListPath(
        ctx.providerBasePath,
        ctx.restrictionSubTab,
        ctx.restrictionCreateFromPath.entityId,
      ),
    });
  } else {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.providerRestrictions") });
  }

  crumbs.push({ title: t("providerMaster.breadcrumbTrail.addRestriction") });
}

function appendCreateModeCrumbs(ctx: ResolvedContext, crumbs: BreadcrumbItem[]): void {
  const { t } = ctx;
  if (ctx.isIcMappingCreateBreadcrumb) {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.newIcMapping") });
  }
  if (ctx.isCorporateMappingCreateBreadcrumb) {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.newCorporateMapping") });
  }
  if (ctx.isLegacyRestrictionCreateBreadcrumb) {
    crumbs.push({ title: t("providerMaster.breadcrumbTrail.addRestriction") });
  }
}

function resolveFourthCrumb(ctx: ResolvedContext, t: TFunction): BreadcrumbItem {
  if (!usesIcCorporateFourthCrumb(ctx)) {
    return resolveActiveTabCrumb(ctx);
  }
  // List page: Network Management is current section — no link (same URL as list).
  if (ctx.isMappingListSubTabBreadcrumb) {
    return { title: getProviderTabLabel("ic-corporate", t) };
  }
  // Detail / restriction flows: Network Management links back to the IC/Corporate list.
  if (
    ctx.isMappingDetailDeepRoute ||
    ctx.isRestrictionDetailDeepRoute ||
    ctx.isRestrictionListDeepRoute ||
    ctx.isRestrictionCreateDeepRoute
  ) {
    const subTab = ctx.isMappingDetailDeepRoute
      ? ctx.mappingDetailSubTab
      : ctx.restrictionSubTab;
    return icCorporateTabLink(ctx.providerBasePath, subTab, t);
  }
  return icCorporateTabLink(ctx.providerBasePath, ctx.mappingSubTab, t);
}

/** Builds the provider hospital detail breadcrumb trail from URL + tab state. */
export function buildViewHospitalBreadcrumbs(
  input: ViewHospitalBreadcrumbInput,
): BreadcrumbItem[] {
  const ctx = resolveContext(input);
  const crumbs = baseTrail(input.t);

  crumbs.push(resolveFourthCrumb(ctx, input.t));

  appendAgreementCrumbs(ctx, crumbs);
  appendSocCrumbs(ctx, crumbs);
  appendOwnerCrumbs(ctx, crumbs);
  appendMappingListCrumbs(ctx, crumbs);
  appendMappingDetailCrumbs(ctx, crumbs);
  appendRestrictionDetailCrumbs(ctx, crumbs);
  appendRestrictionListCrumbs(ctx, crumbs);
  appendRestrictionCreateCrumbs(ctx, crumbs);
  appendCreateModeCrumbs(ctx, crumbs);

  return crumbs;
}
