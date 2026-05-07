import { supabase } from './supabase';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  last_updated: string;
}

export async function getSupportedCurrencies(): Promise<Currency[]> {
  const { data, error } = await supabase
    .from('supported_currencies')
    .select('*')
    .eq('is_active', true)
    .order('code');

  if (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }

  return data || [];
}

export async function getExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number | null> {
  if (baseCurrency === targetCurrency) {
    return 1.0;
  }

  const { data, error } = await supabase
    .from('currency_exchange_rates')
    .select('rate')
    .eq('base_currency', baseCurrency)
    .eq('target_currency', targetCurrency)
    .maybeSingle();

  if (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }

  if (!data) {
    const { data: reverseData } = await supabase
      .from('currency_exchange_rates')
      .select('rate')
      .eq('base_currency', targetCurrency)
      .eq('target_currency', baseCurrency)
      .maybeSingle();

    if (reverseData && reverseData.rate > 0) {
      return 1 / reverseData.rate;
    }

    return null;
  }

  return data.rate;
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);

  if (rate === null) {
    return null;
  }

  return amount * rate;
}

export function formatCurrency(
  amount: number,
  currencyCode: string,
  currencySymbol?: string
): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currencySymbol) {
    return `${formatted} ${currencySymbol}`;
  }

  return `${formatted} ${currencyCode}`;
}

export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  const { data, error } = await supabase
    .from('currency_exchange_rates')
    .select('*')
    .order('base_currency');

  if (error) {
    console.error('Error fetching exchange rates:', error);
    return [];
  }

  return data || [];
}

export async function updateExchangeRate(
  baseCurrency: string,
  targetCurrency: string,
  rate: number
): Promise<boolean> {
  const { error } = await supabase
    .from('currency_exchange_rates')
    .upsert({
      base_currency: baseCurrency,
      target_currency: targetCurrency,
      rate,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'base_currency,target_currency'
    });

  if (error) {
    console.error('Error updating exchange rate:', error);
    return false;
  }

  return true;
}

export function getCurrencyByCountry(countryCode: string, currencies: Currency[]): Currency | undefined {
  return currencies.find(currency =>
    currency.countries.includes(countryCode)
  );
}
