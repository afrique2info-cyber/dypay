interface CTABlockProps {
  content: {
    title: string;
    description?: string;
    buttonText: string;
    buttonLink: string;
  };
  style?: Record<string, any>;
}

export default function CTABlock({ content, style }: CTABlockProps) {
  const { title, description, buttonText, buttonLink } = content;

  return (
    <div
      style={{
        backgroundColor: style?.backgroundColor,
        color: style?.textColor,
        padding: style?.padding || '60px 20px',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
        {description && (
          <p className="text-xl mb-8 opacity-90">{description}</p>
        )}
        <a
          href={buttonLink}
          className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}
