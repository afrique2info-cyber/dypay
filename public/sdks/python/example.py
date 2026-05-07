"""
Exemple complet d'utilisation du SDK Dypay Python

Ce fichier montre comment intégrer Dypay dans votre application Python
"""

from dypay import DypayClient, DypayException
import time

# Configuration
DYPAY_API_KEY = 'votre_cle_api_ici'
DYPAY_API_SECRET = 'votre_secret_api_ici'
DYPAY_MODE = 'test'  # 'test' ou 'live'

# Initialiser le client
dypay = DypayClient(
    api_key=DYPAY_API_KEY,
    api_secret=DYPAY_API_SECRET,
    is_live=(DYPAY_MODE == 'live')
)

print("=== Exemple d'intégration Dypay Python SDK ===\n")


def main():
    payment_ref = None

    # Exemple 1: Créer un paiement
    print("1. Création d'un paiement")
    print("-------------------------")

    try:
        payment = dypay.create_payment({
            'amount': 5000,
            'currency': 'XAF',
            'item_ref': f'PROD-{int(time.time())}',
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'email': 'jean.dupont@example.com',
            'phone': '+237600000000',
            'return_url': 'https://votresite.com/payment/success',
            'notify_url': 'https://votresite.com/payment/webhook',
            'metadata': {
                'order_id': '12345',
                'customer_id': '67890',
                'description': 'Achat de produit'
            }
        })

        print("✓ Paiement créé avec succès!")
        print(f"  - Référence: {payment['payment_ref']}")
        print(f"  - Montant: {payment['amount']} {payment['currency']}")
        print(f"  - Statut: {payment['status']}")
        print(f"  - URL de paiement: {payment['payment_url']}\n")

        payment_ref = payment['payment_ref']

    except DypayException as e:
        print(f"✗ Erreur: {e}\n")
        return

    # Exemple 2: Vérifier le statut d'un paiement
    print("2. Vérification du statut d'un paiement")
    print("---------------------------------------")

    try:
        payment = dypay.get_payment(payment_ref)

        print("✓ Paiement trouvé!")
        print(f"  - Référence: {payment['payment_ref']}")
        print(f"  - Statut: {payment['status']}")
        print(f"  - Montant: {payment['amount']} {payment['currency']}")

        if payment['status'] == DypayClient.PaymentStatus.PENDING:
            print("  - ⏳ Paiement en attente")
        elif payment['status'] == DypayClient.PaymentStatus.COMPLETED:
            print("  - ✓ Paiement réussi")
        elif payment['status'] == DypayClient.PaymentStatus.FAILED:
            print("  - ✗ Paiement échoué")
        elif payment['status'] == DypayClient.PaymentStatus.CANCELLED:
            print("  - ✗ Paiement annulé")

        print()

    except DypayException as e:
        print(f"✗ Erreur: {e}\n")

    # Exemple 3: Lister les paiements
    print("3. Liste des paiements récents")
    print("------------------------------")

    try:
        payments = dypay.list_payments({'limit': 5})

        print(f"✓ {payments['total']} paiements trouvés")

        if payments.get('data'):
            for p in payments['data']:
                print(f"  - {p['payment_ref']}: {p['amount']} {p['currency']} ({p['status']})")

        print()

    except DypayException as e:
        print(f"✗ Erreur: {e}\n")

    # Exemple 4: Vérification de signature webhook
    print("4. Vérification de signature webhook")
    print("------------------------------------")

    try:
        import json
        import hmac
        import hashlib

        # Simuler des données de webhook
        webhook_payload = json.dumps({
            'event': 'payment.completed',
            'payment_ref': payment_ref,
            'status': 'completed',
            'amount': 5000,
            'currency': 'XAF',
            'metadata': {
                'order_id': '12345'
            }
        })

        # Génération de la signature (normalement fait par Dypay)
        webhook_signature = hmac.new(
            DYPAY_API_SECRET.encode('utf-8'),
            webhook_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        is_valid = dypay.verify_webhook_signature(webhook_payload, webhook_signature)

        if is_valid:
            print("✓ Signature webhook valide")

            webhook_data = dypay.handle_webhook(webhook_payload, webhook_signature)
            print(f"  - Événement: {webhook_data['event']}")
            print(f"  - Paiement: {webhook_data['payment_ref']}")
            print(f"  - Statut: {webhook_data['status']}")
        else:
            print("✗ Signature webhook invalide")

        print()

    except DypayException as e:
        print(f"✗ Erreur: {e}\n")

    # Exemple 5: Gestion des erreurs
    print("5. Gestion des erreurs")
    print("----------------------")

    try:
        # Tentative de création d'un paiement avec des données invalides
        dypay.create_payment({
            'amount': -100,  # Montant invalide
            'currency': 'USD',  # Devise non supportée
            'item_ref': ''
        })

    except DypayException as e:
        print(f"✓ Erreur capturée correctement: {e}\n")

    # Informations utiles
    print("=== Informations ===")
    print(f"Mode: {'Production' if DYPAY_MODE == 'live' else 'Test'}")
    print(f"Version SDK: {DypayClient.VERSION}")
    print(f"Devises supportées: {', '.join(DypayClient.SUPPORTED_CURRENCIES)}\n")

    print("Pour un exemple avec Flask, voir ci-dessous:\n")
    print("""
from flask import Flask, request
from dypay import DypayClient, DypayException
import os

app = Flask(__name__)

dypay = DypayClient(
    api_key=os.getenv('DYPAY_API_KEY'),
    api_secret=os.getenv('DYPAY_API_SECRET'),
    is_live=True
)

@app.route('/webhook/dypay', methods=['POST'])
def webhook_dypay():
    payload = request.get_data(as_text=True)
    signature = request.headers.get('X-Dypay-Signature', '')

    try:
        event = dypay.handle_webhook(payload, signature)

        if event['status'] == DypayClient.PaymentStatus.COMPLETED:
            # Traiter le paiement réussi
            print(f"Paiement réussi: {event['payment_ref']}")
            order_id = event['metadata']['order_id']
            # complete_order(order_id)

        return 'OK', 200

    except DypayException as e:
        print(f"Webhook error: {e}")
        return str(e), 400

if __name__ == '__main__':
    app.run(port=3000)
    """)

    print("\n=== Fin de l'exemple ===")


if __name__ == '__main__':
    main()
