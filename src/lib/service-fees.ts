export const SERVICE_FEE_PERCENTAGE = 2.5;

export function calculateServiceFee(price: number): number {
  return (price * SERVICE_FEE_PERCENTAGE) / 100;
}

export function calculateTotalWithFees(price: number): number {
  return price + calculateServiceFee(price);
}

export function calculateMerchantAmount(totalPaid: number): number {
  return totalPaid / (1 + SERVICE_FEE_PERCENTAGE / 100);
}

export function formatServiceFeeInfo(price: number, currency: string = 'XAF'): {
  basePrice: number;
  serviceFee: number;
  total: number;
  currency: string;
  feePercentage: number;
} {
  const serviceFee = calculateServiceFee(price);
  const total = price + serviceFee;

  return {
    basePrice: price,
    serviceFee,
    total,
    currency,
    feePercentage: SERVICE_FEE_PERCENTAGE,
  };
}
