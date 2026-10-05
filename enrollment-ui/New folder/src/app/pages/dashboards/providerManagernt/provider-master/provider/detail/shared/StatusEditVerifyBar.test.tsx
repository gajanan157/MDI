import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusEditVerifyBar } from "./StatusEditVerifyBar";

vi.mock("../../../shared/providerShell", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    title,
  }: Readonly<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
  }>) => (
    <button type="button" onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui", () => ({
  Spinner: () => <span data-testid="save-spinner" />,
}));

vi.mock("./ProviderAuditLogButton", () => ({
  ProviderAuditLogButton: () => <button type="button">Audit Log</button>,
}));

const defaultProps = {
  providerStatus: "Active",
  blacklistedByIcs: ["No IC information available"],
  canWrite: true,
  isEditMode: false,
  onEdit: vi.fn(),
  onCancel: vi.fn(),
  onSave: vi.fn(),
  onVerify: vi.fn(),
};

describe("StatusEditVerifyBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Edit and Verify in read mode", () => {
    render(<StatusEditVerifyBar {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("renders Cancel and Save in edit mode", () => {
    render(<StatusEditVerifyBar {...defaultProps} isEditMode />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("disables Save when saveDisabled is true", () => {
    render(
      <StatusEditVerifyBar
        {...defaultProps}
        isEditMode
        saveDisabled
        saveDisabledTitle="No changes"
      />,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "title",
      "No changes",
    );
  });

  it("hides Edit when user lacks write permission", () => {
    render(<StatusEditVerifyBar {...defaultProps} canWrite={false} />);

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Verify" })).not.toBeInTheDocument();
  });

  it("hides Edit when hideEdit is true", () => {
    render(<StatusEditVerifyBar {...defaultProps} hideEdit />);

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
  });

  it("renders Cancel in view mode when showCancelInViewMode is true", () => {
    render(<StatusEditVerifyBar {...defaultProps} showCancelInViewMode />);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls action handlers from toolbar buttons", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onVerify = vi.fn();
    const onCancel = vi.fn();
    const onSave = vi.fn();

    const { rerender } = render(
      <StatusEditVerifyBar
        {...defaultProps}
        onEdit={onEdit}
        onVerify={onVerify}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Verify" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onVerify).toHaveBeenCalledTimes(1);

    rerender(
      <StatusEditVerifyBar
        {...defaultProps}
        isEditMode
        onEdit={onEdit}
        onVerify={onVerify}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows a loading spinner on Save while saving", () => {
    render(<StatusEditVerifyBar {...defaultProps} isEditMode saving />);

    expect(screen.getByTestId("save-spinner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("shows audit log button when auditLog context is provided", () => {
    render(
      <StatusEditVerifyBar
        {...defaultProps}
        auditLog={{ providerId: "p-1", tabId: "hospital-details" }}
      />,
    );

    expect(screen.getByRole("button", { name: "Audit Log" })).toBeInTheDocument();
  });
});
