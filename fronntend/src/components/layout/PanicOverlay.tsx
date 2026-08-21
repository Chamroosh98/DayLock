import React from 'react';
import { SelfDestructOverlay } from '../modals/SelfDestructOverlay';
import { Language } from '../../types';

interface PanicOverlayProps {
  isSelfDestructed: boolean;
  viewData: any;
  hidesCount: number;
  language: Language;
  t: {
    selfDestructTriggered: string;
    selfDestructMessage: string;
    terminateSession: string;
    hidesRemaining: string;
  };
}

export const PanicOverlay: React.FC<PanicOverlayProps> = (props) => {
  return <SelfDestructOverlay {...props} />;
};
