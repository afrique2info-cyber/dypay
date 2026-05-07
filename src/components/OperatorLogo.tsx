interface OperatorLogoProps {
  operatorCode: string;
  operatorName: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const getLogoStyle = (code: string, color: string, name: string) => {
  const logoMap: Record<string, { gradient: string; text: string; textColor: string }> = {
    'CM_MTNMOBILEMONEY': {
      gradient: 'linear-gradient(135deg, #FFCB05 0%, #FFD700 100%)',
      text: 'MTN',
      textColor: '#000'
    },
    'CM_ORANGEMONEY': {
      gradient: 'linear-gradient(135deg, #FF6600 0%, #FF8C00 100%)',
      text: 'OM',
      textColor: '#FFF'
    },
    'CM_EUMM': {
      gradient: 'linear-gradient(135deg, #0066CC 0%, #0080FF 100%)',
      text: 'EU',
      textColor: '#FFF'
    },
    'CD_AIRTELMONEY': {
      gradient: 'linear-gradient(135deg, #ED1C24 0%, #FF3333 100%)',
      text: 'AM',
      textColor: '#FFF'
    },
    'CD_AFRICELL': {
      gradient: 'linear-gradient(135deg, #00A651 0%, #00CC66 100%)',
      text: 'AC',
      textColor: '#FFF'
    },
    'BJ_MOOVMONEY': {
      gradient: 'linear-gradient(135deg, #0099CC 0%, #00AAEE 100%)',
      text: 'MV',
      textColor: '#FFF'
    },
  };

  const baseStyle = {
    gradient: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
    text: code.includes('MTN') ? 'MTN' : code.includes('ORANGE') ? 'OM' : code.includes('AIRTEL') ? 'AM' : code.includes('MOOV') ? 'MV' : code.includes('EU') ? 'EU' : name.substring(0, 2).toUpperCase(),
    textColor: '#FFF'
  };

  return logoMap[code] || baseStyle;
};

export default function OperatorLogo({ operatorCode, operatorName, color, size = 'md' }: OperatorLogoProps) {
  const logoStyle = getLogoStyle(operatorCode, color, operatorName);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-32 h-32 text-4xl'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg font-bold relative overflow-hidden`}
      style={{
        background: logoStyle.gradient,
        color: logoStyle.textColor
      }}
    >
      <div className="absolute inset-0 bg-white opacity-10"></div>
      <span className="relative z-10 drop-shadow-md">{logoStyle.text}</span>
    </div>
  );
}
