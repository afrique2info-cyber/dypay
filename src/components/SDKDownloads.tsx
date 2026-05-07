import { Download, Code2, FileCode, Book, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SDK {
  name: string;
  language: string;
  version: string;
  description: string;
  icon: string;
  features: string[];
  downloadPath: string;
  status: 'available' | 'coming-soon';
}

export function SDKDownloads() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const sdks: SDK[] = [
    {
      name: 'PHP SDK',
      language: 'PHP',
      version: '1.0.0',
      description: 'SDK officiel pour intégrer Dypay dans vos applications PHP',
      icon: '🐘',
      features: [
        'Support PHP 7.4+',
        'Création de paiements',
        'Vérification de statut',
        'Gestion des webhooks',
        'Support de 6 devises africaines',
        'Documentation complète',
        'Exemples inclus'
      ],
      downloadPath: '/sdks/php',
      status: 'available'
    },
    {
      name: 'JavaScript/Node.js SDK',
      language: 'JavaScript',
      version: '1.0.0',
      description: 'SDK pour Node.js et navigateurs',
      icon: '📦',
      features: [
        'Support Node.js 14+ et navigateurs',
        'TypeScript inclus',
        'Promise-based API',
        'Isomorphic (Node + Browser)',
        'Gestion des webhooks',
        'Documentation complète',
        'Exemples Express, Next.js inclus'
      ],
      downloadPath: '/sdks/javascript',
      status: 'available'
    },
    {
      name: 'Python SDK',
      language: 'Python',
      version: '1.0.0',
      description: 'SDK pour applications Python',
      icon: '🐍',
      features: [
        'Support Python 3.7+',
        'Type hints complets',
        'Compatible Flask, Django, FastAPI',
        'Gestion des webhooks',
        'Support de 6 devises africaines',
        'Documentation complète',
        'Exemples inclus'
      ],
      downloadPath: '/sdks/python',
      status: 'available'
    },
    {
      name: 'Java SDK',
      language: 'Java',
      version: '1.0.0',
      description: 'SDK pour applications Java/Android',
      icon: '☕',
      features: [
        'Support Java 8+',
        'Android compatible',
        'Maven/Gradle support',
        'Thread-safe',
        'Compatible Spring Boot',
        'Documentation complète',
        'Exemples inclus'
      ],
      downloadPath: '/sdks/java',
      status: 'available'
    }
  ];

  const handleDownload = async (sdk: SDK) => {
    if (sdk.status === 'coming-soon') return;

    setDownloading(sdk.language);

    try {
      const response = await fetch(`${sdk.downloadPath}.zip`);

      if (!response.ok) {
        await downloadAsZip(sdk);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dypay-${sdk.language.toLowerCase()}-sdk-v${sdk.version}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      alert('Erreur lors du téléchargement. Veuillez réessayer.');
    } finally {
      setDownloading(null);
    }
  };

  const downloadAsZip = async (sdk: SDK) => {
    const files = await fetchSDKFiles(sdk.downloadPath);

    const links = files.map(file => {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      return a;
    });

    links.forEach((a, index) => {
      setTimeout(() => {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 100);
    });
  };

  const fetchSDKFiles = async (basePath: string) => {
    const fileNames = ['DypayClient.php', 'README.md', 'example.php', 'composer.json'];

    return fileNames.map(name => ({
      name,
      url: `${basePath}/${name}`
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">SDKs et Bibliothèques</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Téléchargez nos SDKs officiels pour intégrer facilement Dypay dans votre application
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Book className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Guide d'utilisation des SDKs</h3>
            <p className="text-xs sm:text-sm text-blue-800 mb-2">
              Chaque SDK inclut une documentation complète, des exemples d'utilisation, et tout le nécessaire pour démarrer rapidement.
            </p>
            <a
              href="/sdks/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Consulter le guide complet →
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {sdks.map((sdk) => (
          <div
            key={sdk.language}
            className={`border rounded-lg p-4 sm:p-6 transition ${
              sdk.status === 'available'
                ? 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-3xl sm:text-4xl">{sdk.icon}</div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{sdk.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-500">
                      Version {sdk.version}
                    </span>
                    {sdk.status === 'available' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Disponible
                      </span>
                    )}
                    {sdk.status === 'coming-soon' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                        Bientôt disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Code2 className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-gray-600 text-sm mb-4">{sdk.description}</p>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Fonctionnalités:</h4>
              <ul className="space-y-1">
                {sdk.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(sdk)}
                disabled={sdk.status === 'coming-soon' || downloading === sdk.language}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
                  sdk.status === 'available'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloading === sdk.language ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger
                  </>
                )}
              </button>
              {sdk.status === 'available' && (
                <button
                  onClick={() => window.open(`${sdk.downloadPath}/README.md`, '_blank')}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Voir la documentation"
                >
                  <Book className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FileCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Besoin d'aide pour l'intégration?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Consultez notre documentation complète ou contactez notre équipe de support pour obtenir de l'aide.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={(e) => {
                  e.preventDefault();
                  const docsTab = document.querySelector('[data-tab="docs"]') as HTMLButtonElement;
                  if (docsTab) docsTab.click();
                }}
              >
                Voir la documentation →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
