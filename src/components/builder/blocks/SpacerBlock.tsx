interface SpacerBlockProps {
  content: {
    height?: string;
  };
  style?: Record<string, any>;
}

export default function SpacerBlock({ content }: SpacerBlockProps) {
  const { height = '40px' } = content;

  return <div style={{ height }} />;
}
