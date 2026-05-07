interface HeroBlockProps {
  content: {
    title: string;
    subtitle: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
  };
  style?: Record<string, any>;
  shopSlug?: string;
}

export default function HeroBlock({ content, style }: HeroBlockProps) {
  const { title, subtitle, buttonText, buttonLink, backgroundImage } = content;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: style?.backgroundColor,
        color: style?.textColor,
        padding: style?.padding || '80px 20px',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      )}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
        {buttonText && buttonLink && (
          <a
            href={buttonLink}
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
