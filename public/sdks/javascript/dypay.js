/**
 * Dypay JavaScript/Node.js SDK
 *
 * SDK officiel pour intégrer Dypay dans vos applications JavaScript
 *
 * @version 2.0.0
 * @author Dypay
 */

class DypayClient {
  static VERSION = '2.0.0';
  static SUPPORTED_CURRENCIES = ['XAF', 'XOF', 'CDF', 'UGX', 'LRD', 'GNF'];

  static PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  };

  /**
   * Initialise le client Dypay
   * @param {string} apiKey - Votre clé API Dypay
   * @param {string} apiSecret - Votre secret API Dypay
   * @param {string} baseUrl - URL Supabase (par défaut: https://dstmejcntirvsoaknaja.supabase.co)
   */
  constructor(apiKey, apiSecret, baseUrl = 'https://dstmejcntirvsoaknaja.supabase.co') {
    if (!apiKey || !apiSecret) {
      throw new Error('API key and secret are required');
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.endpoint = `${this.baseUrl}/functions/v1/dypay-process-payment`;
  }

  /**
   * Crée une nouvelle demande de paiement
   * @param {Object} params - Paramètres du paiement
   * @param {number} params.amount - Montant du paiement (requis)
   * @param {string} params.currency - Devise (défaut: XAF)
   * @param {string} params.phone - Numéro de téléphone
   * @param {string} params.operator - Opérateur mobile (CM_ORANGEMONEY, CM_MTNMOBILEMONEY, etc.)
   * @param {string} params.country - Code pays ISO (CM, SN, etc.)
   * @param {string} params.email - Email du client
   * @param {string} params.first_name - Prénom du client
   * @param {string} params.last_name - Nom du client
   * @param {string} params.item_ref - Référence produit/commande
   * @param {string} params.return_url - URL de redirection après paiement
   * @param {string} params.notify_url - URL webhook pour notifications
   * @param {Object} params.metadata - Données personnalisées
   * @returns {Promise<Object>} { success, payment_url, payment_ref, payment_id }
   */
  async createPayment(params) {
    if (!params.amount || params.amount <= 0) {
      throw new Error('Amount is required and must be greater than 0');
    }

    const payload = {
      amount: params.amount,
      currency: params.currency || 'XAF',
      phone: params.phone,
      operator: params.operator,
      country: params.country,
      email: params.email,
      first_name: params.first_name,
      last_name: params.last_name,
      item_ref: params.item_ref,
      return_url: params.return_url,
      notify_url: params.notify_url,
      metadata: params.metadata || {}
    };

    const payloadString = JSON.stringify(payload);
    const signature = await this.generateSignature(payloadString);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Signature': signature,
        },
        body: payloadString,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async generateSignature(payload) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const key = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(this.apiSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );

      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      const crypto = require('crypto');
      return crypto
        .createHmac('sha256', this.apiSecret)
        .update(payload)
        .digest('hex');
    }
  }

  /**
   * Vérifie la signature d'un webhook Monetbil
   * Note: Les webhooks proviennent de Monetbil, pas de Dypay
   * @param {string} payload - Corps de la requête webhook
   * @param {string} signature - Signature reçue (si applicable)
   * @returns {boolean} True si la signature est valide
   */
  verifyWebhookSignature(payload, signature) {
    if (typeof window !== 'undefined') {
      throw new Error('Webhook verification is only available in Node.js environment');
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Traite les données d'un webhook Monetbil
   * @param {string|Object} payload - Corps de la requête webhook
   * @param {string} signature - Signature reçue dans les headers (optionnel)
   * @returns {Object} Données du webhook décodées
   */
  handleWebhook(payload, signature = null) {
    if (typeof payload !== 'string') {
      payload = JSON.stringify(payload);
    }

    if (signature && !this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    try {
      return typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }
  }
}

// Export pour Node.js et ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DypayClient;
}

if (typeof window !== 'undefined') {
  window.DypayClient = DypayClient;
}

export default DypayClient;
