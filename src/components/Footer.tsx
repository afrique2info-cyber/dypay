import { Link } from 'react-router-dom';
import { CreditCard, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Dypay</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              La solution de paiement moderne pour l'Afrique. Acceptez les paiements mobiles et créez des cartes virtuelles en toute simplicité.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-white transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-white transition">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Carrières
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-sm hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Statut du service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">contact@dypay.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">Douala, Cameroun</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Dypay. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm hover:text-white transition">
                Politique de confidentialité
              </a>
              <a href="#" className="text-sm hover:text-white transition">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-sm hover:text-white transition">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
