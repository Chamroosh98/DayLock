import React from 'react';
import { DecryptedPayloadRenderer, DecryptedPayloadRendererProps } from './DecryptedPayloadRenderer';

export type DecryptedViewContentProps = DecryptedPayloadRendererProps;

export const DecryptedViewContent: React.FC<DecryptedViewContentProps> = (props) => {
  return <DecryptedPayloadRenderer {...props} />;
};
