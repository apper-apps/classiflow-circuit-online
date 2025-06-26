import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600 focus:ring-primary/50 shadow-sm',
    secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 focus:ring-surface-400 border border-surface-300',
    accent: 'bg-accent text-white hover:bg-amber-600 focus:ring-accent/50 shadow-sm',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    ghost: 'text-surface-700 hover:bg-surface-100 focus:ring-surface-400',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error/50 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const renderIcon = () => {
    if (loading) {
      return <ApperIcon name="Loader2" size={16} className="animate-spin" />;
    }
    if (icon) {
      return <ApperIcon name={icon} size={16} />;
    }
    return null;
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </motion.button>
  );
};

export default Button;