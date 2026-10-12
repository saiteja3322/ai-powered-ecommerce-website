// Indian Rupee (INR) Formatter utility following Indian numbering system (e.g. ₹1,499, ₹14,999, ₹1,29,999)
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
