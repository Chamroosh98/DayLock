import React from 'react';
import { CreateTabHeader, CreateTabHeaderProps } from './CreateTabHeader';

export type ContentTypeSelectorProps = CreateTabHeaderProps;

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = (props) => {
  return <CreateTabHeader {...props} />;
};
