import Input from '@/components/atoms/Input';

const FormField = ({ 
  label,
  name,
  type = 'text',
  required = false,
  error,
  value,
  onChange,
  placeholder,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <Input
        label={label}
        name={name}
        type={type}
        required={required}
        error={error}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon={icon}
        {...props}
      />
    </div>
  );
};

export default FormField;