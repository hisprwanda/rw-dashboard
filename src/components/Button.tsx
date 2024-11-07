import React from 'react';
import { ButtonProps } from '../types/index';

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  variant = 'primary',
  icon,
  type = 'button',
  disabled = false,
}) => {
  const baseStyles = 'flex items-center p-1 rounded border-2 focus:outline-none';

  const variantStyles = {
    primary: 'bg-primary border-slate-300 text-white hover:bg-dhisDarkBlue hover:text-white focus:ring-2 focus:ring-blue-300',
    secondary: 'bg-gray-500 border-slate-300 text-white hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-gray-300',
    danger: 'bg-red-500 border-slate-300 text-white hover:bg-red-600 hover:text-white focus:ring-2 focus:ring-red-300',
    source: 'w-full bg-gray-100 border border-gray-300 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-200 flex justify-center items-center', // flex layout with centered content
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`${variant === 'source' ? variantStyles.source : baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ''}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
