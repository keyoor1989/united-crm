
// Helper function for number to words conversion
export const numberToWords = (num: number): string => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    
    let result = '';
    
    if (n < 10) {
      result = units[n];
    } else if (n < 20) {
      result = teens[n - 10];
    } else if (n < 100) {
      result = tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    } else {
      result = units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    }
    
    return result;
  };
  
  if (num === 0) return 'Zero';
  
  let result = '';
  let n = num;
  
  if (n < 0) {
    result = 'Negative ';
    n = Math.abs(n);
  }
  
  if (n < 1000) {
    result += convertLessThanOneThousand(n);
  } else if (n < 1000000) {
    result += convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand';
    if (n % 1000 !== 0) result += ' ' + convertLessThanOneThousand(n % 1000);
  } else {
    result += convertLessThanOneThousand(Math.floor(n / 1000000)) + ' Million';
    if ((n % 1000000) !== 0) result += ' ' + convertLessThanOneThousand(Math.floor((n % 1000000) / 1000)) + ' Thousand';
    if (n % 1000 !== 0) result += ' ' + convertLessThanOneThousand(n % 1000);
  }
  
  return result;
};
