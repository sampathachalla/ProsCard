// components/profileComponents/Utils/initials.ts
export function getInitials(username?: string): string {
  return (username ?? 'U').slice(0, 2).toUpperCase();
}
