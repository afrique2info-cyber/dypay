export interface DypayPaymentRequest {
  amount: number;
  phone?: string;
  phone_lock?: boolean;
  locale?: 'fr' | 'en';
  operator?: string;
  country?: string;
  currency?: string;
  item_ref?: string;
  payment_ref?: string;
  user?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  return_url?: string;
  notify_url?: string;
  logo?: string;
}

export interface DypayPaymentResponse {
  success: boolean;
  payment_url?: string;
  error?: string;
}

export const DYPAY_OPERATORS = {
  CAMEROON: [
    { name: 'MTN Mobile Money', code: 'CM_MTNMOBILEMONEY', currency: 'XAF' },
    { name: 'Orange Money', code: 'CM_ORANGEMONEY', currency: 'XAF' },
    { name: 'Express Union', code: 'CM_EUMM', currency: 'XAF' },
  ],
  SENEGAL: [
    { name: 'Orange Money', code: 'SN_ORANGEMONEY', currency: 'XOF' },
  ],
  'CONGO-KINSHASA': [
    { name: 'Orange Money', code: 'CD_ORANGEMONEY', currency: 'CDF' },
    { name: 'Airtel Money', code: 'CD_AIRTELMONEY', currency: 'CDF' },
    { name: 'Africell', code: 'CD_AFRICELL', currency: 'CDF' },
  ],
  LIBERIA: [
    { name: 'MTN Mobile Money', code: 'LR_MTNMOBILEMONEY', currency: 'LRD' },
  ],
  'CONGO-BRAZZAVILLE': [
    { name: 'MTN Mobile Money', code: 'CG_MTNMOBILEMONEY', currency: 'XAF' },
    { name: 'Airtel Money', code: 'CG_AIRTELMONEY', currency: 'XAF' },
  ],
  UGANDA: [
    { name: 'Airtel Money', code: 'UG_AIRTELMONEY', currency: 'UGX' },
    { name: 'MTN Mobile Money', code: 'UG_MTNMOBILEMONEY', currency: 'UGX' },
  ],
  BENIN: [
    { name: 'MTN Mobile Money', code: 'BJ_MTNMOBILEMONEY', currency: 'XOF' },
    { name: 'Moov Money', code: 'BJ_MOOVMONEY', currency: 'XOF' },
  ],
  'GUINEA-CONAKRY': [
    { name: 'MTN Mobile Money', code: 'GN_MTNMOBILEMONEY', currency: 'GNF' },
    { name: 'Orange Money', code: 'GN_ORANGEMONEY', currency: 'GNF' },
  ],
  GABON: [
    { name: 'Moov Money', code: 'GA_MOOVMONEY', currency: 'XAF' },
  ],
};

export const COUNTRY_CODES = {
  CAMEROON: 'CM',
  SENEGAL: 'SN',
  'CONGO-KINSHASA': 'CD',
  LIBERIA: 'LR',
  'CONGO-BRAZZAVILLE': 'CG',
  UGANDA: 'UG',
  BENIN: 'BJ',
  'GUINEA-CONAKRY': 'GN',
  GABON: 'GA',
};

export const COUNTRIES_WITH_CURRENCY = [
  { name: 'Cameroun', code: 'CM', currency: 'XAF', currencyName: 'Franc CFA (XAF)' },
  { name: 'Sénégal', code: 'SN', currency: 'XOF', currencyName: 'Franc CFA (XOF)' },
  { name: 'Congo-Kinshasa (RDC)', code: 'CD', currency: 'CDF', currencyName: 'Franc Congolais (CDF)' },
  { name: 'Liberia', code: 'LR', currency: 'LRD', currencyName: 'Dollar Libérien (LRD)' },
  { name: 'Congo-Brazzaville', code: 'CG', currency: 'XAF', currencyName: 'Franc CFA (XAF)' },
  { name: 'Ouganda', code: 'UG', currency: 'UGX', currencyName: 'Shilling Ougandais (UGX)' },
  { name: 'Bénin', code: 'BJ', currency: 'XOF', currencyName: 'Franc CFA (XOF)' },
  { name: 'Guinée-Conakry', code: 'GN', currency: 'GNF', currencyName: 'Franc Guinéen (GNF)' },
  { name: 'Gabon', code: 'GA', currency: 'XAF', currencyName: 'Franc CFA (XAF)' },
];

export const MOBILE_MONEY_OPERATORS = [
  { name: 'MTN Mobile Money', code: 'CM_MTNMOBILEMONEY', country: 'Cameroun', currency: 'XAF', color: '#FFCB05' },
  { name: 'Orange Money', code: 'CM_ORANGEMONEY', country: 'Cameroun', currency: 'XAF', color: '#FF6600' },
  { name: 'Express Union', code: 'CM_EUMM', country: 'Cameroun', currency: 'XAF', color: '#0066CC' },
  { name: 'Orange Money', code: 'SN_ORANGEMONEY', country: 'Sénégal', currency: 'XOF', color: '#FF6600' },
  { name: 'Orange Money', code: 'CD_ORANGEMONEY', country: 'Congo-Kinshasa', currency: 'CDF', color: '#FF6600' },
  { name: 'Airtel Money', code: 'CD_AIRTELMONEY', country: 'Congo-Kinshasa', currency: 'CDF', color: '#ED1C24' },
  { name: 'Africell', code: 'CD_AFRICELL', country: 'Congo-Kinshasa', currency: 'CDF', color: '#00A651' },
  { name: 'MTN Mobile Money', code: 'LR_MTNMOBILEMONEY', country: 'Liberia', currency: 'LRD', color: '#FFCB05' },
  { name: 'MTN Mobile Money', code: 'CG_MTNMOBILEMONEY', country: 'Congo-Brazzaville', currency: 'XAF', color: '#FFCB05' },
  { name: 'Airtel Money', code: 'CG_AIRTELMONEY', country: 'Congo-Brazzaville', currency: 'XAF', color: '#ED1C24' },
  { name: 'Airtel Money', code: 'UG_AIRTELMONEY', country: 'Ouganda', currency: 'UGX', color: '#ED1C24' },
  { name: 'MTN Mobile Money', code: 'UG_MTNMOBILEMONEY', country: 'Ouganda', currency: 'UGX', color: '#FFCB05' },
  { name: 'MTN Mobile Money', code: 'BJ_MTNMOBILEMONEY', country: 'Bénin', currency: 'XOF', color: '#FFCB05' },
  { name: 'Moov Money', code: 'BJ_MOOVMONEY', country: 'Bénin', currency: 'XOF', color: '#0099CC' },
  { name: 'MTN Mobile Money', code: 'GN_MTNMOBILEMONEY', country: 'Guinée-Conakry', currency: 'GNF', color: '#FFCB05' },
  { name: 'Orange Money', code: 'GN_ORANGEMONEY', country: 'Guinée-Conakry', currency: 'GNF', color: '#FF6600' },
  { name: 'Moov Money', code: 'GA_MOOVMONEY', country: 'Gabon', currency: 'XAF', color: '#0099CC' },
];

export const CURRENCIES = [
  { code: 'XAF', name: 'Franc CFA (XAF)', countries: ['CM', 'CG', 'GA'] },
  { code: 'XOF', name: 'Franc CFA (XOF)', countries: ['SN', 'BJ'] },
  { code: 'CDF', name: 'Franc Congolais (CDF)', countries: ['CD'] },
  { code: 'LRD', name: 'Dollar Libérien (LRD)', countries: ['LR'] },
  { code: 'UGX', name: 'Shilling Ougandais (UGX)', countries: ['UG'] },
  { code: 'GNF', name: 'Franc Guinéen (GNF)', countries: ['GN'] },
];

export function getCurrencyForCountry(countryCode: string): string {
  const country = COUNTRIES_WITH_CURRENCY.find(c => c.code === countryCode);
  return country?.currency || 'XAF';
}

export function getCountryForCurrency(currencyCode: string): string {
  const country = COUNTRIES_WITH_CURRENCY.find(c => c.currency === currencyCode);
  return country?.code || 'CM';
}

export function getOperatorsForCountry(countryCode: string) {
  const countryName = COUNTRIES_WITH_CURRENCY.find(c => c.code === countryCode)?.name;
  if (!countryName) return [];

  const key = Object.keys(DYPAY_OPERATORS).find(k => {
    const country = COUNTRIES_WITH_CURRENCY.find(c => c.code === countryCode);
    return k.toLowerCase().includes(country?.name.toLowerCase().split('-')[0] || '');
  });

  return key ? DYPAY_OPERATORS[key as keyof typeof DYPAY_OPERATORS] : [];
}

export function formatCurrency(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export async function createDypayPayment(
  paymentData: DypayPaymentRequest
): Promise<DypayPaymentResponse> {
  try {
    const serviceKey = import.meta.env.VITE_MONETBIL_SERVICE_KEY;

    if (!serviceKey || serviceKey === 'your_monetbil_service_key_here') {
      throw new Error('Dypay service key not configured');
    }

    const response = await fetch(
      `https://api.monetbil.com/widget/v2.1/${serviceKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error creating Dypay payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function initiateDypayPayment(
  amountOrData: number | (DypayPaymentRequest & { serviceKey?: string }),
  itemRef?: string,
  email?: string,
  returnUrl?: string,
  serviceKey?: string
): Promise<DypayPaymentResponse> {
  try {
    let key: string;
    let paymentData: DypayPaymentRequest;

    if (typeof amountOrData === 'object') {
      const { serviceKey: objServiceKey, currency, country, ...rest } = amountOrData;
      key = objServiceKey || import.meta.env.VITE_MONETBIL_SERVICE_KEY;

      const finalCountry = country || (currency ? getCountryForCurrency(currency) : 'CM');
      const finalCurrency = currency || getCurrencyForCountry(finalCountry);

      paymentData = {
        ...rest,
        country: finalCountry,
        currency: finalCurrency,
      };
    } else {
      key = serviceKey || import.meta.env.VITE_MONETBIL_SERVICE_KEY;
      paymentData = {
        amount: amountOrData,
        country: 'CM',
        item_ref: itemRef!,
        locale: 'fr',
        email,
        return_url: returnUrl,
      };
    }

    if (!key || key === 'your_monetbil_service_key_here') {
      throw new Error('Service key is required');
    }

    const response = await fetch(
      `https://api.monetbil.com/widget/v2.1/${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const data = await response.json();

    if (!data.success || !data.payment_url) {
      throw new Error(data.error || 'Failed to create payment');
    }

    return {
      success: true,
      payment_url: data.payment_url,
    };
  } catch (error) {
    console.error('Error initiating Dypay payment:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
}

export async function createMonetbilPaymentWithApiKey(
  apiKey: string,
  paymentData: DypayPaymentRequest
): Promise<DypayPaymentResponse> {
  try {
    const response = await fetch(
      `https://api.monetbil.com/widget/v2.1/${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur HTTP: ${response.status}`);
    }

    if (!data.success || !data.payment_url) {
      throw new Error(data.error || 'Échec de la création du paiement');
    }

    return {
      success: true,
      payment_url: data.payment_url,
    };
  } catch (error) {
    console.error('Erreur création paiement Monetbil:', error);
    throw error instanceof Error ? error : new Error('Erreur inconnue');
  }
}
