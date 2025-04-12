import React from 'react';

export const clerkAppearance = {
  // Customize the look and feel of Clerk components
  elements: {
    formButtonPrimary: 'bg-primary hover:bg-primary-dark',
    card: 'rounded-md shadow-md',
    formField: 'mb-6',
    formFieldInput: 'w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
    formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
    footerActionLink: 'text-primary hover:text-primary-dark'
  },
  variables: {
    colorPrimary: 'var(--color-primary)',
    borderRadius: 'var(--border-radius)'
  }
};

export const clerkPaths = {
  // Define routing paths for Clerk components
  signIn: '/auth/login',
  signUp: '/auth/register',
  verifyEmail: '/auth/register/verify-email-address',
  forgotPassword: '/auth/reset-password',
};

export const clerkOptions = {
  // Other Clerk options
  signInUrl: '/auth/login',
  signUpUrl: '/auth/register',
  afterSignInUrl: '/',
  afterSignUpUrl: '/auth/register/verify-email-address',
};
