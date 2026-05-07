import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerStyle: string;
    productCardStyle: string;
    spacing: string;
    borderRadius: string;
  };
  components: {
    buttonStyle: string;
    cardShadow: string;
    imageStyle: string;
  };
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  config: ThemeConfig;
}

interface ThemedShopWrapperProps {
  themeId?: string | null;
  children: ReactNode;
}

export default function ThemedShopWrapper({ themeId, children }: ThemedShopWrapperProps) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (themeId) {
      loadTheme();
    }
  }, [themeId]);

  const loadTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_themes')
        .select('*')
        .eq('id', themeId)
        .single();

      if (error) throw error;
      setTheme(data);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  useEffect(() => {
    if (theme) {
      applyTheme(theme.config);
    }

    return () => {
      removeTheme();
    };
  }, [theme]);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;

    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-background', config.colors.background);
    root.style.setProperty('--color-surface', config.colors.surface);
    root.style.setProperty('--color-text', config.colors.text);
    root.style.setProperty('--color-text-secondary', config.colors.textSecondary);
    root.style.setProperty('--color-border', config.colors.border);

    root.style.setProperty('--font-heading', config.fonts.heading);
    root.style.setProperty('--font-body', config.fonts.body);

    root.setAttribute('data-theme-spacing', config.layout.spacing);
    root.setAttribute('data-theme-border-radius', config.layout.borderRadius);
    root.setAttribute('data-theme-card-style', config.layout.productCardStyle);
  };

  const removeTheme = () => {
    const root = document.documentElement;
    const props = [
      '--color-primary',
      '--color-secondary',
      '--color-accent',
      '--color-background',
      '--color-surface',
      '--color-text',
      '--color-text-secondary',
      '--color-border',
      '--font-heading',
      '--font-body',
    ];

    props.forEach((prop) => root.style.removeProperty(prop));
    root.removeAttribute('data-theme-spacing');
    root.removeAttribute('data-theme-border-radius');
    root.removeAttribute('data-theme-card-style');
  };

  return <div className={theme ? `theme-${theme.slug}` : ''}>{children}</div>;
}
