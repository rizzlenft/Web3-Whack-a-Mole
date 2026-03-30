import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: "bg-primary text-primary-foreground border-b-4 border-r-4 border-primary/50 hover:bg-primary/90 hover:border-primary active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 box-shadow-neon",
    secondary: "bg-secondary text-secondary-foreground border-b-4 border-r-4 border-secondary/50 hover:bg-secondary/90 hover:border-secondary active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 box-shadow-cyan",
    accent: "bg-accent text-accent-foreground border-b-4 border-r-4 border-accent/50 hover:bg-accent/90 hover:border-accent active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1",
    ghost: "bg-transparent text-primary hover:text-secondary hover:bg-primary/10 border-2 border-transparent hover:border-primary transition-colors"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl md:text-2xl"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "font-display uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
