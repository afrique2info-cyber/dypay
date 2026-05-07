interface ImageBlockProps {
  content: {
    imageUrl: string;
    alt?: string;
    caption?: string;
    link?: string;
  };
  style?: Record<string, any>;
}

export default function ImageBlock({ content, style }: ImageBlockProps) {
  const { imageUrl, alt = '', caption, link } = content;

  const imageElement = (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-auto rounded-lg shadow-lg"
    />
  );

  return (
    <div
      style={{
        backgroundColor: style?.backgroundColor,
        padding: style?.padding || '40px 20px',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
        {caption && (
          <p className="text-center text-gray-600 mt-4 italic">{caption}</p>
        )}
      </div>
    </div>
  );
}
