/**
 * Exemple complet d'utilisation du SDK Dypay JavaScript/Node.js
 *
 * Ce fichier montre comment intégrer Dypay dans votre application JavaScript
 */

import DypayClient from './dypay.js';

// Configuration - Obtenez vos clés depuis le tableau de bord Dypay
const DYPAY_API_KEY = 'votre_cle_api_ici';
const DYPAY_API_SECRET = 'votre_secret_api_ici';
const SUPABASE_URL = 'https://dstmejcntirvsoaknaja.supabase.co'; // URL de votre instance Dypay

// Initialiser le client
const dypay = new DypayClient(
  DYPAY_API_KEY,
  DYPAY_API_SECRET,
  SUPABASE_URL
);

console.log('=== Exemple d\'intégration Dypay JavaScript SDK ===\n');

// Fonction principale
async function main() {
  let paymentData;

  // Exemple 1: Créer un paiement
  console.log('1. Création d\'un paiement');
  console.log('-------------------------');

  try {
    const payment = await dypay.createPayment({
      amount: 5000,
      currency: 'XAF',
      phone: '+237600000000',
      operator: 'CM_ORANGEMONEY', // Optionnel
      country: 'CM', // Optionnel
      item_ref: `PROD-${Date.now()}`,
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@example.com',
      return_url: 'https://votresite.com/payment/success',
      notify_url: 'https://votresite.com/webhook',
      metadata: {
        order_id: '12345',
        customer_id: '67890',
        description: 'Achat de produit'
      }
    });

    console.log('✓ Paiement créé avec succès!');
    console.log(`  - Référence: ${payment.payment_ref}`);
    console.log(`  - ID: ${payment.payment_id}`);
    console.log(`  - URL de paiement: ${payment.payment_url}\n`);

    // Dans une vraie application web, redirigez l'utilisateur vers la page de paiement
    // window.location.href = payment.payment_url;

    paymentData = payment;

  } catch (error) {
    console.error(`✗ Erreur: ${error.message}\n`);
    process.exit(1);
  }

  // Exemple 2: Vérification de signature webhook (Node.js uniquement)
  console.log('2. Vérification de signature webhook');
  console.log('------------------------------------');

  try {
    // Simuler des données de webhook Monetbil
    const webhookPayload = JSON.stringify({
      status: 'success',
      payment_ref: paymentData.payment_ref,
      transaction_id: paymentData.payment_id,
      amount: 5000,
      currency: 'XAF'
    });

    // Note: Monetbil envoie les webhooks sans signature
    // La vérification de signature est optionnelle
    const webhookData = dypay.handleWebhook(webhookPayload);

    console.log('✓ Webhook traité avec succès');
    console.log(`  - Statut: ${webhookData.status}`);
    console.log(`  - Référence: ${webhookData.payment_ref}`);
    console.log(`  - Montant: ${webhookData.amount} ${webhookData.currency}`);
    console.log('');

  } catch (error) {
    console.error(`✗ Erreur: ${error.message}\n`);
  }

  // Exemple 3: Gestion des erreurs
  console.log('3. Gestion des erreurs');
  console.log('----------------------');

  try {
    await dypay.createPayment({
      amount: -100 // Montant invalide
    });

  } catch (error) {
    console.log(`✓ Erreur capturée correctement: ${error.message}\n`);
  }

  // Informations utiles
  console.log('=== Informations ===');
  console.log(`Version SDK: ${DypayClient.VERSION}`);
  console.log(`Devises supportées: ${DypayClient.SUPPORTED_CURRENCIES.join(', ')}\n`);

  console.log('Pour un exemple avec Express.js, voir ci-dessous:\n');
  console.log(`
import express from 'express';
import DypayClient from './dypay.js';

const app = express();
const dypay = new DypayClient(
  process.env.DYPAY_API_KEY,
  process.env.DYPAY_API_SECRET,
  process.env.SUPABASE_URL
);

// Route de paiement
app.post('/create-payment', express.json(), async (req, res) => {
  try {
    const payment = await dypay.createPayment({
      amount: req.body.amount,
      currency: 'XAF',
      phone: req.body.phone,
      operator: req.body.operator,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      return_url: 'https://votresite.com/payment/success',
      notify_url: 'https://votresite.com/webhook/dypay',
      metadata: {
        order_id: req.body.order_id
      }
    });

    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route webhook Monetbil
app.post('/webhook/dypay', express.json(), (req, res) => {
  try {
    const event = dypay.handleWebhook(req.body);

    if (event.status === 'success') {
      console.log('Paiement réussi:', event.payment_ref);
      // Débloquer le service/produit
    } else if (event.status === 'failed') {
      console.log('Paiement échoué:', event.payment_ref);
      // Annuler la commande
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send('Invalid webhook');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
  `);

  console.log('\n=== Fin de l\'exemple ===');
}

// Exécuter les exemples
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
