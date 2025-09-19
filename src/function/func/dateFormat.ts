export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
