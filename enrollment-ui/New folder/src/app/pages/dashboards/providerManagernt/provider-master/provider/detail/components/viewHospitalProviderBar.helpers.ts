export function resolveProviderAgreementTypes(
  agreementForm: Record<string, string>,
  agreementTypeLabels: string[] = [],
): string[] {
  if (agreementTypeLabels.length > 0) {
    return agreementTypeLabels;
  }

  const formAgreementTypeName = agreementForm.agreementTypeName?.trim();
  return formAgreementTypeName ? [formAgreementTypeName] : [];
}
