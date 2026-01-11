export const getInitials = (fullName: string) => {
  if (!fullName) return "";

  const nameParts = fullName.trim().split(" ");
  const firstInitial = nameParts[0]?.charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1]?.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
};
