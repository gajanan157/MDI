import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";

type TranslateFn = (key: string) => string;

type BreadcrumbOverrideContext = {
  pathname: string;
  mapped: BreadcrumbItem[];
  t?: TranslateFn;
};

type BreadcrumbRouteOverride = {
  match: (pathname: string) => boolean;
  build: (context: BreadcrumbOverrideContext) => BreadcrumbItem[] | null;
};

const PROVIDERS_LIST_PATH = "/provider-masters/providers";
const IC_MAPPING_PATH = "/provider-masters/ic-corporate-mapping";
const IC_MAPPING_ADD_PATH = `${IC_MAPPING_PATH}/add-new-network`;

function translate(t: TranslateFn | undefined, key: string, fallback: string) {
  return t ? t(key) : fallback;
}

function appendProviderAgreementTrail(
  mapped: BreadcrumbItem[],
  providerId: string,
  leafTitle: string,
  t?: TranslateFn,
): BreadcrumbItem[] | null {
  if (mapped.length === 0) return null;

  const agreementTabPath = `${PROVIDERS_LIST_PATH}/${providerId}/agreement`;
  const agreementSegmentTitle = translate(
    t,
    "nav.dashboards.provider-masters-providers-agreement-tab",
    "Agreement",
  );

  return [
    ...mapped.slice(0, -1),
    { title: mapped[mapped.length - 1].title, path: undefined },
    { title: "Providers", path: PROVIDERS_LIST_PATH },
    { title: agreementSegmentTitle, path: agreementTabPath },
    { title: leafTitle, path: undefined },
  ];
}

const BREADCRUMB_ROUTE_OVERRIDES: BreadcrumbRouteOverride[] = [
  {
    match: (pathname) =>
      /^\/provider-masters\/providers\/([^/]+)\/agreement\/new-agreement$/.test(
        pathname,
      ),
    build: ({ mapped, pathname, t }) => {
      const providerId =
        pathname.match(
          /^\/provider-masters\/providers\/([^/]+)\/agreement\/new-agreement$/,
        )?.[1] ?? "";
      return appendProviderAgreementTrail(
        mapped,
        providerId,
        translate(t, "nav.dashboards.provider-masters-agreement-new", "New agreement"),
        t,
      );
    },
  },
  {
    match: (pathname) =>
      /^\/provider-masters\/providers\/([^/]+)\/agreement\/([^/]+)\/view$/.test(
        pathname,
      ),
    build: ({ mapped, pathname, t }) => {
      const providerId =
        pathname.match(
          /^\/provider-masters\/providers\/([^/]+)\/agreement\/([^/]+)\/view$/,
        )?.[1] ?? "";
      return appendProviderAgreementTrail(
        mapped,
        providerId,
        translate(
          t,
          "nav.dashboards.provider-masters-agreement-detail",
          "View agreement",
        ),
        t,
      );
    },
  },
  {
    match: (pathname) =>
      /^\/provider-masters\/providers\/([^/]+)\/agreement\/([^/]+)\/edit$/.test(
        pathname,
      ),
    build: ({ mapped, pathname, t }) => {
      const providerId =
        pathname.match(
          /^\/provider-masters\/providers\/([^/]+)\/agreement\/([^/]+)\/edit$/,
        )?.[1] ?? "";
      return appendProviderAgreementTrail(
        mapped,
        providerId,
        translate(
          t,
          "nav.dashboards.provider-masters-agreement-edit",
          "Edit agreement",
        ),
        t,
      );
    },
  },
  {
    match: (pathname) =>
      pathname.startsWith(`${IC_MAPPING_ADD_PATH}/inward/`),
    build: ({ pathname, mapped, t }) => {
      if (mapped.length === 0) return null;

      const inwardNo = pathname.slice(`${IC_MAPPING_ADD_PATH}/inward/`.length).split("/")[0];
      const decodedInwardNo = inwardNo ? decodeURIComponent(inwardNo) : "";
      const addTitle = translate(
        t,
        "nav.dashboards.provider-masters-ic-corporate-mapping-add-new-network",
        "Bulk IC Mapping",
      );

      return [
        ...mapped.slice(0, -1),
        { title: mapped[mapped.length - 1]?.title ?? "IC & Corp Provider Mapping", path: IC_MAPPING_PATH },
        { title: addTitle, path: IC_MAPPING_ADD_PATH },
        ...(decodedInwardNo ? [{ title: decodedInwardNo, path: undefined }] : []),
      ];
    },
  },
  {
    match: (pathname) =>
      pathname === IC_MAPPING_ADD_PATH ||
      pathname.startsWith(`${IC_MAPPING_ADD_PATH}/`),
    build: ({ mapped, t }) => {
      if (mapped.length === 0) return null;

      const last = mapped[mapped.length - 1];
      const addTitle = translate(
        t,
        "nav.dashboards.provider-masters-ic-corporate-mapping-add-new-network",
        "Bulk IC Mapping",
      );

      return [
        ...mapped.slice(0, -1),
        { title: last.title, path: IC_MAPPING_PATH },
        { title: addTitle, path: undefined },
      ];
    },
  },
];

export function applyBreadcrumbRouteOverride(
  pathname: string,
  mapped: BreadcrumbItem[],
  t?: TranslateFn,
): BreadcrumbItem[] | null {
  for (const override of BREADCRUMB_ROUTE_OVERRIDES) {
    if (!override.match(pathname)) continue;
    return override.build({ pathname, mapped, t });
  }

  return null;
}
