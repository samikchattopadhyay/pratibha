interface ParentProfile {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  preferredState?: string | null;
}

export function calculateProfileCompletion(parent: ParentProfile): number {
  const totalFields = 5; // address, city, state, postalCode, preferredState
  const filledFields = [
    parent.address,
    parent.city,
    parent.state,
    parent.postalCode,
    parent.preferredState,
  ].filter((field) => field && field.trim() !== "").length;

  return Math.round((filledFields / totalFields) * 100);
}

export function isProfileCompletionRequired(parent: ParentProfile): boolean {
  return calculateProfileCompletion(parent) < 100;
}

export function getMissingProfileFields(parent: ParentProfile): string[] {
  const missing: string[] = [];
  if (!parent.address || parent.address.trim() === "") missing.push("Street Address");
  if (!parent.city || parent.city.trim() === "") missing.push("City");
  if (!parent.state || parent.state.trim() === "") missing.push("State");
  if (!parent.postalCode || parent.postalCode.trim() === "") missing.push("PIN Code");
  if (!parent.preferredState || parent.preferredState.trim() === "") missing.push("Preferred State");
  return missing;
}
