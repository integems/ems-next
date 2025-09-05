export function deriveFullName(
  firstName?: string,
  middleName?: string,
  lastName?: string,
): string {
  const parts: string[] = [];
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  return parts.filter(Boolean).join(" ");
}

export function deriveUserName(
  firstName?: string,
  middleName?: string,
  lastName?: string,
): string {
  const parts: string[] = [];
  if (firstName) parts.push(firstName.toLowerCase());
  if (middleName) parts.push(middleName.toLowerCase());
  if (lastName) parts.push(lastName.toLowerCase());
  return parts.filter(Boolean).join("");
}
