import { useState, useEffect } from 'react';
import { CreditCard, Plus, Eye, EyeOff, Lock, Unlock, Trash2, DollarSign } from 'lucide-react';
import {
  VirtualCard,
  getVirtualCards,
  createVirtualCard,
  updateCardStatus,
  addFundsToCard,
  deleteVirtualCard,
  maskCardNumber,
  formatCardNumber
} from '../lib/virtual-cards';

export function VirtualCardManager() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await getVirtualCards();
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (formData: any) => {
    try {
      await createVirtualCard(
        formData.cardHolderName,
        formData.cardType,
        parseFloat(formData.initialBalance) || 0,
        formData.currency,
        formData.spendingLimit ? parseFloat(formData.spendingLimit) : undefined
      );
      await loadCards();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Erreur lors de la création de la carte');
    }
  };

  const handleToggleCardStatus = async (card: VirtualCard) => {
    try {
      const newStatus = card.status === 'active' ? 'blocked' : 'active';
      await updateCardStatus(card.id, newStatus);
      await loadCards();
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  const handleAddFunds = async (amount: number) => {
    if (!selectedCard) return;
    try {
      await addFundsToCard(selectedCard.id, amount);
      await loadCards();
      setShowAddFundsModal(false);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Erreur lors de l\'ajout de fonds');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte?')) return;
    try {
      await deleteVirtualCard(cardId);
      await loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const toggleRevealCard = (cardId: string) => {
    const newRevealed = new Set(revealedCards);
    if (newRevealed.has(cardId)) {
      newRevealed.delete(cardId);
    } else {
      newRevealed.add(cardId);
    }
    setRevealedCards(newRevealed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cartes Virtuelles</h2>
          <p className="text-gray-600 mt-1">Gérez vos cartes Visa et Mastercard virtuelles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvelle carte
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune carte virtuelle</h3>
          <p className="text-gray-600 mb-6">Créez votre première carte virtuelle pour commencer</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Créer une carte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="group relative">
              <div className={`relative h-56 rounded-2xl p-6 text-white shadow-xl transition-all transform group-hover:scale-105 ${
                card.card_type === 'VISA'
                  ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900'
                  : 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-700'
              }`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="text-sm font-semibold opacity-90">
                    {card.card_type}
                  </div>
                  <div className="flex gap-2">
                    {card.status === 'active' ? (
                      <Unlock className="w-5 h-5 opacity-75" />
                    ) : (
                      <Lock className="w-5 h-5 opacity-75" />
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-lg font-mono tracking-wider">
                    {revealedCards.has(card.id)
                      ? formatCardNumber(card.card_number)
                      : maskCardNumber(card.card_number)}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-75 mb-1">Titulaire</div>
                    <div className="text-sm font-semibold uppercase">
                      {card.card_holder_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75 mb-1">Expire</div>
                    <div className="text-sm font-semibold font-mono">
                      {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                    </div>
                  </div>
                  {revealedCards.has(card.id) && (
                    <div>
                      <div className="text-xs opacity-75 mb-1">CVV</div>
                      <div className="text-sm font-semibold font-mono">{card.cvv}</div>
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <div className="text-3xl font-bold opacity-20">
                    {card.card_type === 'VISA' ? '💳' : '💳'}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-xl shadow-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solde disponible</span>
                  <span className="text-lg font-bold text-gray-900">
                    {card.balance.toLocaleString()} {card.currency}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRevealCard(card.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
                  >
                    {revealedCards.has(card.id) ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Afficher
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setShowAddFundsModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    Recharger
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleCardStatus(card)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
                      card.status === 'active'
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {card.status === 'active' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Bloquer
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Débloquer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCard}
        />
      )}

      {showAddFundsModal && selectedCard && (
        <AddFundsModal
          card={selectedCard}
          onClose={() => {
            setShowAddFundsModal(false);
            setSelectedCard(null);
          }}
          onAddFunds={handleAddFunds}
        />
      )}
    </div>
  );
}

function CreateCardModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardType: 'VISA' as 'VISA' | 'MASTERCARD',
    initialBalance: '',
    currency: 'XAF',
    spendingLimit: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Créer une carte virtuelle</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du titulaire *
            </label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de carte *
            </label>
            <select
              value={formData.cardType}
              onChange={(e) => setFormData({ ...formData, cardType: e.target.value as 'VISA' | 'MASTERCARD' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MASTERCARD</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solde initial
              </label>
              <input
                type="number"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de dépense (optionnel)
            </label>
            <input
              type="number"
              value={formData.spendingLimit}
              onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              Créer la carte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddFundsModal({ card, onClose, onAddFunds }: any) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFunds(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Recharger la carte</h3>
        <p className="text-gray-600 mb-6">
          Carte: {maskCardNumber(card.card_number)}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à ajouter *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10000"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Solde actuel: {card.balance.toLocaleString()} {card.currency}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Recharger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
