import { PageBlock } from '../../lib/page-builder';
import HeroBlock from './blocks/HeroBlock';
import ProductsGridBlock from './blocks/ProductsGridBlock';
import FeaturesBlock from './blocks/FeaturesBlock';
import TextContentBlock from './blocks/TextContentBlock';
import ImageBlock from './blocks/ImageBlock';
import CTABlock from './blocks/CTABlock';
import SpacerBlock from './blocks/SpacerBlock';

interface BlockRendererProps {
  block: PageBlock;
  shopSlug?: string;
}

export default function BlockRenderer({ block, shopSlug }: BlockRendererProps) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock content={block.content as any} style={block.style} shopSlug={shopSlug} />;
    case 'products-grid':
      return <ProductsGridBlock content={block.content as any} style={block.style} shopSlug={shopSlug} />;
    case 'features':
      return <FeaturesBlock content={block.content as any} style={block.style} />;
    case 'text-content':
      return <TextContentBlock content={block.content as any} style={block.style} />;
    case 'image':
      return <ImageBlock content={block.content as any} style={block.style} />;
    case 'cta':
      return <CTABlock content={block.content as any} style={block.style} />;
    case 'spacer':
      return <SpacerBlock content={block.content as any} style={block.style} />;
    default:
      return null;
  }
}
