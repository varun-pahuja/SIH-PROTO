export const STATE_NAMES: Record<string, string> = {
  AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar',
  CG: 'Chhattisgarh', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana',
  HP: 'Himachal Pradesh', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala',
  MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya',
  MZ: 'Mizoram', NL: 'Nagaland', OD: 'Odisha', PB: 'Punjab',
  RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana',
  TR: 'Tripura', UP: 'Uttar Pradesh', UK: 'Uttarakhand', WB: 'West Bengal',
  AN: 'Andaman & Nicobar', CH: 'Chandigarh', DH: 'Dadra & Nagar Haveli',
  DL: 'Delhi', JK: 'Jammu & Kashmir', LA: 'Ladakh', LD: 'Lakshadweep',
  PY: 'Puducherry',
};

export function maskAadhaar(last4: string): string {
  return `XXXX-XXXX-${last4}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreZone(score: number): { color: string; label: string } {
  if (score >= 80) return { color: '#DB372D', label: 'Critical' };
  if (score >= 60) return { color: '#C47D00', label: 'High' };
  if (score >= 40) return { color: '#13C2C2', label: 'Medium' };
  return { color: '#128937', label: 'Low' };
}
