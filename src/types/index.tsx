// Button.tsx
import React from 'react';

export interface ButtonProps {
  onClick?: () => void;
  type?: 'submit' | 'reset' | 'button';
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'source';
  icon?: React.ReactNode;
  disabled?: boolean;
}