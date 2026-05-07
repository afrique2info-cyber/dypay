# Dypay Python SDK

SDK Python officiel pour intégrer Dypay dans vos applications Python.

## Version

1.0.0

## Prérequis

- Python 3.7 ou supérieur
- pip (gestionnaire de paquets Python)

## Installation

### Installation via pip (bientôt disponible)

```bash
pip install dypay
```

### Installation manuelle

1. Téléchargez le SDK depuis votre tableau de bord Dypay
2. Extrayez le contenu dans votre projet
3. Installez les dépendances:

```bash
pip install -r requirements.txt
```

4. Importez le module:

```python
from dypay import DypayClient
```

## Configuration

### Obtenir vos clés API

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans "Clés API"
3. Créez une nouvelle clé API (Test ou Production)
4. Copiez votre clé API et votre secret

### Initialisation du client

```python
from dypay import DypayClient

# Mode test
dypay = DypayClient(
    api_key='votre_cle_api',
    api_secret='votre_secret_api',
    is_live=False  # False = mode test, True = mode production
)

# Mode production
dypay_live = DypayClient(
    api_key='votre_cle_api_live',
    api_secret='votre_secret_api_live',
    is_live=True
)
```

## Utilisation

### Créer un paiement

```python
from dypay import DypayClient, DypayException

dypay = DypayClient('api_key', 'api_secret')

try:
    payment = dypay.create_payment({
        'amount': 5000,
        'currency': 'XAF',
        'item_ref': 'PROD-123',
        'first_name': 'Jean',
        'last_name': 'Dupont',
        'email': 'jean.dupont@example.com',
        'phone': '+237600000000',
        'return_url': 'https://votresite.com/payment/success',
        'notify_url': 'https://votresite.com/payment/webhook',
        'metadata': {
            'order_id': '12345',
            'customer_id': '67890'
        }
    })

    print(f"Paiement créé: {payment['payment_ref']}")
    print(f"URL de paiement: {payment['payment_url']}")

    # Redirigez l'utilisateur vers payment_url

except DypayException as e:
    print(f"Erreur: {e}")
```

### Vérifier le statut d'un paiement

```python
try:
    payment = dypay.get_payment('DYPAY-REF-123456')

    print(f"Statut: {payment['status']}")
    print(f"Montant: {payment['amount']} {payment['currency']}")

    if payment['status'] == DypayClient.PaymentStatus.COMPLETED:
        print('Paiement réussi!')

except DypayException as e:
    print(f"Erreur: {e}")
```

### Lister tous les paiements

```python
try:
    # Sans filtres
    payments = dypay.list_payments()

    # Avec filtres
    payments = dypay.list_payments({
        'status': 'completed',
        'limit': 10,
        'offset': 0
    })

    print(f"Total: {payments['total']} paiements")
    for payment in payments['data']:
        print(f"{payment['payment_ref']}: {payment['status']}")

except DypayException as e:
    print(f"Erreur: {e}")
```

### Gérer les webhooks

**Flask:**

```python
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
            print(f"Paiement réussi: {event['payment_ref']}")
            # Débloquez le service/produit
            order_id = event['metadata']['order_id']
            # complete_order(order_id)

        elif event['status'] == DypayClient.PaymentStatus.FAILED:
            print(f"Paiement échoué: {event['payment_ref']}")
            # Annulez la commande

        return 'OK', 200

    except DypayException as e:
        print(f"Webhook error: {e}")
        return str(e), 400

if __name__ == '__main__':
    app.run(port=3000)
```

**Django:**

```python
# views.py
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from dypay import DypayClient, DypayException
import os

dypay = DypayClient(
    api_key=os.getenv('DYPAY_API_KEY'),
    api_secret=os.getenv('DYPAY_API_SECRET'),
    is_live=True
)

@csrf_exempt
@require_http_methods(["POST"])
def webhook_dypay(request):
    payload = request.body.decode('utf-8')
    signature = request.headers.get('X-Dypay-Signature', '')

    try:
        event = dypay.handle_webhook(payload, signature)

        if event['status'] == DypayClient.PaymentStatus.COMPLETED:
            # Traiter le paiement réussi
            order_id = event['metadata']['order_id']
            # complete_order(order_id)

        return HttpResponse('OK', status=200)

    except DypayException as e:
        return HttpResponse(str(e), status=400)
```

**FastAPI:**

```python
from fastapi import FastAPI, Request, HTTPException, Header
from dypay import DypayClient, DypayException
import os

app = FastAPI()

dypay = DypayClient(
    api_key=os.getenv('DYPAY_API_KEY'),
    api_secret=os.getenv('DYPAY_API_SECRET'),
    is_live=True
)

@app.post("/webhook/dypay")
async def webhook_dypay(
    request: Request,
    x_dypay_signature: str = Header(None)
):
    payload = await request.body()
    payload_str = payload.decode('utf-8')

    try:
        event = dypay.handle_webhook(payload_str, x_dypay_signature)

        if event['status'] == DypayClient.PaymentStatus.COMPLETED:
            # Traiter le paiement réussi
            print(f"Paiement réussi: {event['payment_ref']}")

        return {"status": "ok"}

    except DypayException as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## Devises supportées

- `XAF` - Franc CFA (Cameroun, etc.)
- `XOF` - Franc CFA (Sénégal, Côte d'Ivoire, etc.)
- `CDF` - Franc Congolais
- `UGX` - Shilling Ougandais
- `LRD` - Dollar Libérien
- `GNF` - Franc Guinéen

## Statuts de paiement

```python
DypayClient.PaymentStatus.PENDING     # 'pending'
DypayClient.PaymentStatus.COMPLETED   # 'completed'
DypayClient.PaymentStatus.FAILED      # 'failed'
DypayClient.PaymentStatus.CANCELLED   # 'cancelled'
```

## Gestion des erreurs

Toutes les méthodes peuvent lever une `DypayException`:

```python
from dypay import DypayClient, DypayException

try:
    payment = dypay.create_payment({...})
except DypayException as e:
    # Gérer l'erreur
    print(f"Erreur Dypay: {e}")
    # Afficher un message à l'utilisateur
```

## Sécurité

### Vérification des webhooks

Toujours vérifier la signature des webhooks:

```python
payload = request.body.decode('utf-8')
signature = request.headers.get('X-Dypay-Signature', '')

if not dypay.verify_webhook_signature(payload, signature):
    raise DypayException('Invalid signature')
```

### Protection des clés API

- Ne jamais exposer vos clés dans le code
- Utilisez des variables d'environnement
- Utilisez des clés de test pour le développement

**Variables d'environnement (.env):**
```env
DYPAY_API_KEY=your_api_key
DYPAY_API_SECRET=your_api_secret
DYPAY_MODE=test
```

**Utilisation avec python-dotenv:**
```python
import os
from dotenv import load_dotenv
from dypay import DypayClient

load_dotenv()

dypay = DypayClient(
    api_key=os.getenv('DYPAY_API_KEY'),
    api_secret=os.getenv('DYPAY_API_SECRET'),
    is_live=os.getenv('DYPAY_MODE') == 'live'
)
```

## Type Hints

Le SDK utilise les type hints Python pour une meilleure autocomplétion:

```python
from typing import Dict, Any
from dypay import DypayClient

def process_payment(amount: float, currency: str) -> Dict[str, Any]:
    dypay = DypayClient('api_key', 'api_secret')
    return dypay.create_payment({
        'amount': amount,
        'currency': currency,
        'item_ref': 'PROD-123'
    })
```

## Exemple complet

Voir le fichier `example.py` pour un exemple complet d'intégration.

## Support

Pour toute question ou problème:

- Documentation: https://docs.dypay.com
- Email: support@dypay.com
- Tableau de bord: https://dashboard.dypay.com

## Changelog

### Version 1.0.0 (2026-01-21)

- Version initiale du SDK
- Support Python 3.7+
- Type hints complets
- Gestion des paiements et webhooks
- Support de 6 devises africaines
- Compatible Flask, Django, FastAPI

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails
