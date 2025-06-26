import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label,
  type = 'text',
  error,
  icon,
  iconPosition = 'left',
  className = '',
  required = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(!!e.target.value);
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${error 
      ? 'border-error focus:border-error focus:ring-error/20' 
      : 'border-surface-300 focus:border-primary focus:ring-primary/20'
    }
    focus:outline-none focus:ring-2
    ${className}
  `;

  return (
    <div className="relative">
      {label && (
        <label className={`
          absolute left-3 transition-all duration-200 pointer-events-none z-10
          ${focused || hasValue 
            ? 'top-0 text-xs bg-white px-1 -translate-y-1/2' 
            : 'top-1/2 text-sm -translate-y-1/2'
          }
          ${error ? 'text-error' : focused ? 'text-primary' : 'text-surface-500'}
        `}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <ApperIcon name={icon} size={16} className="text-surface-400" />
          </div>
        )}
        
        <input
          type={type}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <ApperIcon name={icon} size={16} className="text-surface-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center gap-1">
          <ApperIcon name="AlertCircle" size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;