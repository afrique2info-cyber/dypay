import { ShieldCheck, Truck, Headphones, Star, Zap, Heart, Gift, Award } from 'lucide-react';

const iconMap = {
  ShieldCheck,
  Truck,
  Headphones,
  Star,
  Zap,
  Heart,
  Gift,
  Award,
};

interface Feature {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}

interface FeaturesBlockProps {
  content: {
    title?: string;
    features: Feature[];
  };
  style?: Record<string, any>;
}

export default function FeaturesBlock({ content, style }: FeaturesBlockProps) {
  const { title, features } = content;

  return (
    <div
      style={{
        backgroundColor: style?.backgroundColor,
        color: style?.textColor,
        padding: style?.padding || '60px 20px',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{title}</h2>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
