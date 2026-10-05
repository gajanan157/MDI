// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { StatusEditVerifyBarProps } from "../../../shared/StatusEditVerifyBar";
import { ProviderDetailsTab } from "../Tab";
import {
  PROVIDER_DETAILS_AUDIT_TAB_ID,
  PROVIDER_DETAILS_SAVE_DISABLED_TITLE,
} from "../helpers";
import { createProviderDetailsFromApi } from "./fixtures";

const mocks = vi.hoisted(() => ({
  hasProviderDetailsChanges: false,
  resetProviderForms: vi.fn(),
  handlePageSave: vi.fn(),
  lastBarProps: null as StatusEditVerifyBarProps | null,
}));

vi.mock("../useTab", () => ({
  useCertificateOptions: () => [],
  useProviderDetailsForms: () => ({
    generalInfoForm: { watch: vi.fn(() => []) },
    contactForm: {},
    certDynamicForm: {},
    identifierForm: { watch: vi.fn(() => ({ items: [] })) },
    certEditFields: [],
    appendCertificateRow: vi.fn(),
    removeCertificateRow: vi.fn(),
    removeIdentifierRow: vi.fn(),
    resetProviderForms: mocks.resetProviderForms,
    hasProviderDetailsChanges: mocks.hasProviderDetailsChanges,
    providerTypeOptions: [{ value: "HOSPITAL", label: "Hospital" }],
    isProviderTypeLocked: true,
    defaultProviderType: "HOSPITAL",
    providerClassOptions: [{ value: "", label: "Select" }],
    clinicalSpecialtyOptions: [],
    providerClassOptionsLoading: false,
    clinicalSpecialtyOptionsLoading: false,
    systemOfMedicineOptions: [{ value: "", label: "Select" }],
    tpaBranchOptions: [{ value: "", label: "Select" }],
  }),
  useProviderDetailsSave: () => ({
    handlePageSave: mocks.handlePageSave,
    saving: false,
  }),
}));

vi.mock("../Cards", () => ({
  ProviderInformationCard: ({ isEditMode }: Readonly<{ isEditMode: boolean }>) =>
    isEditMode ? (
      <div data-testid="edit-view">Edit view</div>
    ) : (
      <div data-testid="readonly-view">Readonly view</div>
    ),
  ProviderAddressCard: () => null,
  ProviderContactCard: () => null,
  ProviderCertificatesCard: () => null,
  appendEmptyCertificateRow: vi.fn(),
}));

vi.mock("../IdentifierSection", () => ({
  ProviderIdentifierCard: () => null,
}));

vi.mock("../../../shared/StatusEditVerifyBar", () => ({
  StatusEditVerifyBar: (props: StatusEditVerifyBarProps) => {
    mocks.lastBarProps = props;
    return (
      <div data-testid="status-bar">
        <span data-testid="bar-status">{props.providerStatus}</span>
        <span data-testid="bar-save-disabled">{String(props.saveDisabled)}</span>
        <span data-testid="bar-verify-disabled">{String(props.verifyDisabled)}</span>
        {!props.isEditMode && props.canWrite ? (
          <button type="button" onClick={props.onEdit}>
            Edit
          </button>
        ) : null}
        {props.isEditMode ? (
          <>
            <button type="button" onClick={props.onCancel}>
              Cancel
            </button>
            <button
              type="button"
              onClick={props.onSave}
              disabled={props.saveDisabled}
            >
              Save
            </button>
          </>
        ) : null}
      </div>
    );
  },
}));

describe("Tab — StatusEditVerifyBar wiring", () => {
  const providerDetails = createProviderDetailsFromApi({
    providerId: "provider-42",
    recordStatus: "Active",
    blacklistedByIcNames: ["ICICI Lombard"],
  });

  beforeEach(() => {
    mocks.hasProviderDetailsChanges = false;
    mocks.resetProviderForms.mockClear();
    mocks.handlePageSave.mockClear();
    mocks.lastBarProps = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("passes status bar config from hospital and permissions", () => {
    render(
      <ProviderDetailsTab
        providerDetails={providerDetails}
        canWrite
        canVerify={false}
        verifyDisabled
        verifyDisabledTitle="Unable to verify"
      />,
    );

    expect(mocks.lastBarProps).toMatchObject({
      providerStatus: "Active",
      blacklistedByIcs: ["ICICI Lombard"],
      canWrite: true,
      canVerify: false,
      isEditMode: false,
      saveDisabled: true,
      saveDisabledTitle: PROVIDER_DETAILS_SAVE_DISABLED_TITLE,
      verifyDisabled: true,
      verifyDisabledTitle: "Unable to verify",
      auditLog: {
        providerId: "provider-42",
        tabId: PROVIDER_DETAILS_AUDIT_TAB_ID,
      },
    });
    expect(screen.getByTestId("readonly-view")).toBeInTheDocument();
  });

  it("disables save until provider details form has changes", () => {
    mocks.hasProviderDetailsChanges = true;

    render(<ProviderDetailsTab providerDetails={providerDetails} canWrite />);

    expect(mocks.lastBarProps?.saveDisabled).toBe(false);
    expect(screen.getByTestId("bar-save-disabled")).toHaveTextContent("false");
  });

  it("enters edit mode and shows edit view when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<ProviderDetailsTab providerDetails={providerDetails} canWrite />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(mocks.lastBarProps?.isEditMode).toBe(true);
    expect(screen.getByTestId("edit-view")).toBeInTheDocument();
    expect(screen.queryByTestId("readonly-view")).not.toBeInTheDocument();
  });

  it("resets forms and exits edit mode when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<ProviderDetailsTab providerDetails={providerDetails} canWrite />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mocks.resetProviderForms).toHaveBeenCalledTimes(1);
    expect(mocks.lastBarProps?.isEditMode).toBe(false);
    expect(screen.getByTestId("readonly-view")).toBeInTheDocument();
  });

  it("calls save handler from the status bar", async () => {
    mocks.hasProviderDetailsChanges = true;
    const user = userEvent.setup();
    render(<ProviderDetailsTab providerDetails={providerDetails} canWrite />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mocks.handlePageSave).toHaveBeenCalledTimes(1);
  });
});
