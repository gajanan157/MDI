import type { ReactNode } from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { ProviderTabEmptyState } from "../../shared/ProviderTabEmptyState";
import { ProviderTabLoadingState } from "../../shared/ProviderTabLoadingState";

export function renderContactPersonTabContent(params: {
  contactPersonOwnerNotFound: boolean;
  notFoundTitle: string;
  hasContactPersonApiList: boolean;
  hasContactPersonRows: boolean;
  isLoadingApiData: boolean;
  contactGroupsContent: ReactNode;
  emptyOnFileTitle: string;
}): ReactNode {
  if (params.contactPersonOwnerNotFound) {
    return (
      <ProviderTabEmptyState
        icon={UsersIcon}
        title={params.notFoundTitle}
        description=""
      />
    );
  }

  if (params.hasContactPersonApiList) {
    if (params.hasContactPersonRows) {
      return params.contactGroupsContent;
    }
    return (
      <ProviderTabEmptyState
        icon={UsersIcon}
        title={params.emptyOnFileTitle}
        description=""
      />
    );
  }

  if (params.isLoadingApiData) {
    return <ProviderTabLoadingState />;
  }

  return (
    <ProviderTabEmptyState
      icon={UsersIcon}
      title={params.emptyOnFileTitle}
      description=""
    />
  );
}
