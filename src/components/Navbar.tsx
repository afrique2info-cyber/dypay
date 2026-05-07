import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  supabase.auth.onAuthStateChange((_event, session) => {
    setIsAuthenticated(!!session);
  });

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dypay
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Accueil
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition font-medium">
              À propos
            </Link>
            <Link to="/documentation" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Documentation
            </Link>
            <Link to="/api-documentation" className="text-gray-700 hover:text-blue-600 transition font-medium">
              API
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Tarifs
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Contact
            </Link>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? 'Tableau de bord' : 'Commencer'}
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              Accueil
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              À propos
            </Link>
            <Link
              to="/documentation"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              Documentation
            </Link>
            <Link
              to="/api-documentation"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              API
            </Link>
            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              Tarifs
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
            >
              Contact
            </Link>
            <button
              onClick={() => {
                handleGetStarted();
                setIsOpen(false);
              }}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              {isAuthenticated ? 'Tableau de bord' : 'Commencer'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
