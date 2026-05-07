interface TextContentBlockProps {
  content: {
    title?: string;
    text: string;
    alignment?: 'left' | 'center' | 'right';
  };
  style?: Record<string, any>;
}

export default function TextContentBlock({ content, style }: TextContentBlockProps) {
  const { title, text, alignment = 'left' } = content;

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[alignment];

  return (
    <div
      style={{
        backgroundColor: style?.backgroundColor,
        color: style?.textColor,
        padding: style?.padding || '60px 20px',
      }}
    >
      <div className={`max-w-4xl mx-auto ${alignmentClass}`}>
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        )}
        <div
          className="text-lg leading-relaxed prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  );
}
