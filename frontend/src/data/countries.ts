import React from 'react';
import { Country } from '../types';

export const COUNTRIES: Country[] = [
  {code:'IR',name:'Iran',fa:'ایران',flag:'🇮🇷'},
  {code:'US',name:'United States',fa:'آمریکا',flag:'🇺🇸'},
  {code:'DE',name:'Germany',fa:'آلمان',flag:'🇩🇪'},
  {code:'GB',name:'United Kingdom',fa:'انگلستان',flag:'🇬🇧'},
  {code:'FR',name:'France',fa:'فرانسه',flag:'🇫🇷'},
  {code:'NL',name:'Netherlands',fa:'هلند',flag:'🇳🇱'},
  {code:'SE',name:'Sweden',fa:'سوئد',flag:'🇸🇪'},
  {code:'NO',name:'Norway',fa:'نروژ',flag:'🇳🇴'},
  {code:'CH',name:'Switzerland',fa:'سوئیس',flag:'🇨🇭'},
  {code:'CA',name:'Canada',fa:'کانادا',flag:'🇨🇦'},
  {code:'AU',name:'Australia',fa:'استرالیا',flag:'🇦🇺'},
  {code:'JP',name:'Japan',fa:'ژاپن',flag:'🇯🇵'},
  {code:'TR',name:'Turkey',fa:'ترکیه',flag:'🇹🇷'},
  {code:'RU',name:'Russia',fa:'روسیه',flag:'🇷🇺'},
  {code:'CN',name:'China',fa:'چین',flag:'🇨🇳'},
  {code:'IN',name:'India',fa:'هند',flag:'🇮🇳'},
  {code:'BR',name:'Brazil',fa:'برزیل',flag:'🇧🇷'},
  {code:'IT',name:'Italy',fa:'ایتالیا',flag:'🇮🇹'},
  {code:'ES',name:'Spain',fa:'اسپانیا',flag:'🇪🇸'},
  {code:'PL',name:'Poland',fa:'لهستان',flag:'🇵🇱'},
  {code:'UA',name:'Ukraine',fa:'اوکراین',flag:'🇺🇦'},
  {code:'SG',name:'Singapore',fa:'سنگاپور',flag:'🇸🇬'},
  {code:'AE',name:'UAE',fa:'امارات',flag:'🇦🇪'},
  {code:'SA',name:'Saudi Arabia',fa:'عربستان',flag:'🇸🇦'},
  {code:'IQ',name:'Iraq',fa:'عراق',flag:'🇮🇶'},
  {code:'AF',name:'Afghanistan',fa:'افغانستان',flag:'🇦🇫'},
];

interface FlagProps {
  code: string;
  emoji: string;
  className?: string;
}

export const Flag: React.FC<FlagProps> = ({ code, emoji, className = "" }) => {
  if (code === 'IR') {
    return (
      React.createElement('svg', {
        viewBox: "0 0 1200 800",
        className: `w-5 h-3.5 object-cover rounded-sm inline-block align-middle ${className}`,
        xmlns: "http://www.w3.org/2000/svg"
      }, 
        React.createElement('rect', { width: "1200", height: "266.67", fill: "#239f40" }),
        React.createElement('rect', { y: "266.67", width: "1200", height: "266.67", fill: "#fff" }),
        React.createElement('rect', { y: "533.33", width: "1200", height: "266.67", fill: "#da251d" }),
        React.createElement('g', { transform: "translate(600, 400) scale(0.7)", fill: "#f9d306", stroke: "#000", strokeWidth: "2" },
          React.createElement('path', { d: "M-100,60 C-150,60 -180,0 -140,-40 C-100,-80 0,-80 40,-40 C80,0 100,60 50,90 C0,120 -50,120 -100,60" }),
          React.createElement('circle', { cx: "0", cy: "-50", r: "45" }),
          React.createElement('path', { d: "M-30,30 L80,-80", strokeWidth: "12", strokeLinecap: "round" })
        )
      )
    );
  }
  return React.createElement('span', { className }, emoji);
};
