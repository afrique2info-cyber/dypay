"""
Dypay Python SDK

SDK Python officiel pour intégrer Dypay dans vos applications

@version 1.0.0
@author Dypay
"""

import hashlib
import hmac
import json
from typing import Dict, List, Optional, Any
from urllib.parse import urlencode
import requests


class DypayClient:
    """Client Dypay pour l'intégration de paiements"""

    VERSION = '1.0.0'
    SUPPORTED_CURRENCIES = ['XAF', 'XOF', 'CDF', 'UGX', 'LRD', 'GNF']

    class PaymentStatus:
        """Constantes pour les statuts de paiement"""
        PENDING = 'pending'
        COMPLETED = 'completed'
        FAILED = 'failed'
        CANCELLED = 'cancelled'

    def __init__(self, api_key: str, api_secret: str, is_live: bool = False):
        """
        Initialise le client Dypay

        Args:
            api_key: Votre clé API Dypay
            api_secret: Votre secret API Dypay
            is_live: Mode production (True) ou test (False)

        Raises:
            ValueError: Si api_key ou api_secret est manquant
        """
        if not api_key or not api_secret:
            raise ValueError("API key and secret are required")

        self.api_key = api_key
        self.api_secret = api_secret
        self.is_live = is_live
        self.base_url = 'https://your-dypay-domain.com/api'

    def create_payment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crée une nouvelle demande de paiement

        Args:
            params: Paramètres du paiement
                - amount (float): Montant du paiement
                - currency (str): Code devise (XAF, XOF, etc.)
                - item_ref (str): Référence de l'article
                - first_name (str, optional): Prénom
                - last_name (str, optional): Nom
                - email (str, optional): Email
                - phone (str, optional): Téléphone
                - return_url (str, optional): URL de retour
                - notify_url (str, optional): URL de notification
                - metadata (dict, optional): Métadonnées

        Returns:
            Dict contenant les informations du paiement créé

        Raises:
            DypayException: En cas d'erreur
        """
        required_fields = ['amount', 'currency', 'item_ref']

        for field in required_fields:
            if field not in params:
                raise DypayException(f"Field '{field}' is required")

        if params['currency'] not in self.SUPPORTED_CURRENCIES:
            raise DypayException(
                f"Unsupported currency. Supported currencies: {', '.join(self.SUPPORTED_CURRENCIES)}"
            )

        if params['amount'] <= 0:
            raise DypayException("Amount must be greater than 0")

        data = {
            'amount': params['amount'],
            'currency': params['currency'],
            'item_ref': params['item_ref'],
            'first_name': params.get('first_name', ''),
            'last_name': params.get('last_name', ''),
            'email': params.get('email', ''),
            'phone': params.get('phone', ''),
            'return_url': params.get('return_url', ''),
            'notify_url': params.get('notify_url', ''),
            'metadata': params.get('metadata', {})
        }

        return self._request('POST', '/payments', data)

    def get_payment(self, payment_ref: str) -> Dict[str, Any]:
        """
        Récupère le statut d'un paiement

        Args:
            payment_ref: Référence du paiement

        Returns:
            Dict contenant les informations du paiement

        Raises:
            DypayException: En cas d'erreur
        """
        if not payment_ref:
            raise DypayException("Payment reference is required")

        return self._request('GET', f'/payments/{payment_ref}')

    def list_payments(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Liste tous les paiements du marchand

        Args:
            filters: Filtres optionnels
                - status (str): Filtrer par statut
                - limit (int): Nombre de résultats
                - offset (int): Décalage

        Returns:
            Dict contenant la liste des paiements

        Raises:
            DypayException: En cas d'erreur
        """
        filters = filters or {}
        query_params = urlencode(filters)
        endpoint = f'/payments?{query_params}' if query_params else '/payments'

        return self._request('GET', endpoint)

    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """
        Vérifie la signature d'un webhook

        Args:
            payload: Corps de la requête webhook
            signature: Signature reçue dans les headers

        Returns:
            True si la signature est valide, False sinon
        """
        expected_signature = hmac.new(
            self.api_secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)

    def handle_webhook(self, payload: str, signature: str) -> Dict[str, Any]:
        """
        Traite les données d'un webhook

        Args:
            payload: Corps de la requête webhook
            signature: Signature reçue dans les headers

        Returns:
            Dict contenant les données du webhook

        Raises:
            DypayException: Si la signature est invalide ou le payload incorrect
        """
        if not self.verify_webhook_signature(payload, signature):
            raise DypayException("Invalid webhook signature")

        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            raise DypayException("Invalid webhook payload")

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Effectue une requête HTTP vers l'API Dypay

        Args:
            method: Méthode HTTP (GET, POST, etc.)
            endpoint: Point de terminaison de l'API
            data: Données à envoyer (optional)

        Returns:
            Dict contenant la réponse de l'API

        Raises:
            DypayException: En cas d'erreur
        """
        url = self.base_url + endpoint

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'X-API-Secret': self.api_secret,
            'Content-Type': 'application/json',
            'User-Agent': f'Dypay-Python-SDK/{self.VERSION}',
            'X-API-Mode': 'live' if self.is_live else 'test'
        }

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise DypayException(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.json()

        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json()
                error_message = error_data.get('error') or error_data.get('message') or 'Unknown error'
            except (ValueError, AttributeError):
                error_message = str(e)

            raise DypayException(f"API Error ({e.response.status_code}): {error_message}")

        except requests.exceptions.RequestException as e:
            raise DypayException(f"Request failed: {str(e)}")

        except json.JSONDecodeError:
            raise DypayException("Invalid API response")

    def set_base_url(self, base_url: str) -> None:
        """
        Définit l'URL de base de l'API

        Args:
            base_url: Nouvelle URL de base
        """
        self.base_url = base_url.rstrip('/')

    @property
    def live(self) -> bool:
        """Retourne si le client est en mode production"""
        return self.is_live


class DypayException(Exception):
    """Exception levée pour les erreurs Dypay"""
    pass
