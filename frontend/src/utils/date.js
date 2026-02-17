export const formatToInputDate = (date) => {
  if (!date) return '';
  const formattedDate = new Date(date);
  return !Number.isNaN(formattedDate.valueOf())
    ? formattedDate.toISOString().split('T')[0]
    : '';
};
