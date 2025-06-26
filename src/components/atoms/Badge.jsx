import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-surface-100 text-surface-800',
    primary: 'bg-primary text-white',
    accent: 'bg-accent text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    featured: 'bg-gradient-to-r from-accent to-orange-500 text-white',
    premium: 'bg-gradient-to-r from-primary to-purple-600 text-white'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  const badgeClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {icon && <ApperIcon name={icon} size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
      {children}
    </span>
  );
};

export default Badge;