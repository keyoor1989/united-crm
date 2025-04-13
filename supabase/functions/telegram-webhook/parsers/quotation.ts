
/**
 * Parse a quotation command from a message
 */
export function parseQuotationCommand(text: string): any {
  const result: any = {
    mobile: '',
    model: '',
    price: '',
    gst: '',
    delivery: '',
    warranty: '',
    isValid: false
  };
  
  // Extract mobile
  const mobileMatch = text.match(/Mobile:?\s+(\d{10})/i);
  if (mobileMatch && mobileMatch[1]) {
    result.mobile = mobileMatch[1].trim();
  }
  
  // Extract model
  const modelMatch = text.match(/Model:?\s+([^,\n]+)/i);
  if (modelMatch && modelMatch[1]) {
    result.model = modelMatch[1].trim();
  }
  
  // Extract price
  const priceMatch = text.match(/Price:?\s+₹?([0-9,]+)/i);
  if (priceMatch && priceMatch[1]) {
    result.price = priceMatch[1].replace(/,/g, '').trim();
  }
  
  // Extract GST
  const gstMatch = text.match(/GST:?\s+(\d+)%?/i);
  if (gstMatch && gstMatch[1]) {
    result.gst = gstMatch[1].trim();
  }
  
  // Extract delivery
  const deliveryMatch = text.match(/Delivery:?\s+([^,\n]+)/i);
  if (deliveryMatch && deliveryMatch[1]) {
    result.delivery = deliveryMatch[1].trim();
  }
  
  // Extract warranty
  const warrantyMatch = text.match(/Warranty:?\s+([^,\n]+)/i);
  if (warrantyMatch && warrantyMatch[1]) {
    result.warranty = warrantyMatch[1].trim();
  }
  
  // Check if mandatory fields are present
  result.isValid = Boolean(result.mobile && result.model);
  
  return result;
}

/**
 * Calculate prices for a quotation
 */
export function calculateQuotationPrices(basePrice: number, gstRate: number = 18) {
  const gstAmount = (basePrice * gstRate) / 100;
  const totalPrice = basePrice + gstAmount;
  
  return {
    basePrice,
    gstRate,
    gstAmount,
    totalPrice
  };
}

/**
 * Format currency with Indian formatting
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN');
}
