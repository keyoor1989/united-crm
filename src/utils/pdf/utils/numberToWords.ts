
export function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  // Handle special cases
  if (num === 0) return 'Zero Rupees Only';
  if (isNaN(num)) return 'Invalid Number';
  
  // Extract rupees and paise
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return '';
    else if (n < 10) return units[n];
    else if (n < 20) return teens[n - 10];
    else if (n < 100) {
      const unit = n % 10;
      return tens[Math.floor(n / 10)] + (unit !== 0 ? ' ' + units[unit] : '');
    } else {
      const rem = n % 100;
      return units[Math.floor(n / 100)] + ' Hundred' + (rem !== 0 ? ' ' + convertLessThanOneThousand(rem) : '');
    }
  }
  
  function convert(n: number): string {
    if (n === 0) return '';
    
    let result = '';
    
    // Handle Crores (10 million)
    if (n >= 10000000) {
      result += convertLessThanOneThousand(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    
    // Handle Lakhs (100 thousand)
    if (n >= 100000) {
      result += convertLessThanOneThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    
    // Handle Thousands
    if (n >= 1000) {
      result += convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Handle Hundreds and below
    if (n > 0) {
      result += convertLessThanOneThousand(n);
    }
    
    return result.trim();
  }
  
  let result = '';
  
  if (rupees > 0) {
    result += convert(rupees) + ' Rupees';
  }
  
  if (paise > 0) {
    result += (rupees > 0 ? ' and ' : '') + convert(paise) + ' Paise';
  }
  
  return result + ' Only';
}
