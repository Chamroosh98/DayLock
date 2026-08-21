import React from 'react';
import { UnlockPasskeyForm, UnlockPasskeyFormProps } from './UnlockPasskeyForm';

export type PasswordProtectedCardProps = UnlockPasskeyFormProps;

export const PasswordProtectedCard: React.FC<PasswordProtectedCardProps> = (props) => {
  return <UnlockPasskeyForm {...props} />;
};
