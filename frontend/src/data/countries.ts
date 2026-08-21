import React from 'react';
import { Country } from '../types';

export const COUNTRIES: Country[] = [
  {code:'IR',name:'Iran',fa:'ایران',flag:'🦁☀️'},
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
  emoji?: string;
  className?: string;
}

export const Flag: React.FC<FlagProps> = ({ code, emoji, className = "" }) => {
  if (code === 'IR') {
    return (
      React.createElement('svg', {
        viewBox: "0 0 1264 843",
        className: `w-5 h-3.5 object-cover rounded-sm inline-block align-middle shrink-0 border border-black/10 ${className}`,
        xmlns: "http://www.w3.org/2000/svg"
      }, 
        React.createElement('rect', { width: "1264", height: "281", fill: "#239f40" }),
        React.createElement('rect', { y: "281", width: "1264", height: "281", fill: "#ffffff" }),
        React.createElement('rect', { y: "562", width: "1264", height: "281", fill: "#da251d" }),
        React.createElement('image', { href: "/ls.svg", x: "0", y: "0", width: "1264", height: "843" })
      )
    );
  }

  if (code === 'US') {
    return (
      React.createElement('svg', {
        viewBox: "0 0 1235 650",
        className: `w-5 h-3.5 object-cover rounded-sm inline-block align-middle shrink-0 border border-black/10 ${className}`,
        xmlns: "http://www.w3.org/2000/svg"
      },
        React.createElement('rect', { width: "1235", height: "650", fill: "#b22234" }),
        React.createElement('path', { d: "M0,50H1235M0,150H1235M0,250H1235M0,350H1235M0,450H1235M0,550H1235", stroke: "#fff", strokeWidth: "50" }),
        React.createElement('rect', { width: "494", height: "350", fill: "#3c3b6e" }),
        React.createElement('circle', { cx: "247", cy: "175", r: "35", fill: "#fff" })
      )
    );
  }

  if (code === 'RU') {
    return (
      React.createElement('svg', {
        viewBox: "0 0 900 600",
        className: `w-5 h-3.5 object-cover rounded-sm inline-block align-middle shrink-0 border border-black/10 ${className}`,
        xmlns: "http://www.w3.org/2000/svg"
      },
        React.createElement('rect', { width: "900", height: "200", fill: "#ffffff" }),
        React.createElement('rect', { y: "200", width: "900", height: "200", fill: "#0039a6" }),
        React.createElement('rect', { y: "400", width: "900", height: "200", fill: "#d52b1e" })
      )
    );
  }

  if (code === 'CN') {
    return (
      React.createElement('svg', {
        viewBox: "0 0 900 600",
        className: `w-5 h-3.5 object-cover rounded-sm inline-block align-middle shrink-0 border border-black/10 ${className}`,
        xmlns: "http://www.w3.org/2000/svg"
      },
        React.createElement('rect', { width: "900", height: "600", fill: "#de2910" }),
        React.createElement('polygon', { points: "150,90 162,126 200,126 169,148 181,184 150,162 119,184 131,148 100,126 138,126", fill: "#ffde00" }),
        React.createElement('circle', { cx: "250", cy: "60", r: "10", fill: "#ffde00" }),
        React.createElement('circle', { cx: "280", cy: "110", r: "10", fill: "#ffde00" }),
        React.createElement('circle', { cx: "280", cy: "170", r: "10", fill: "#ffde00" }),
        React.createElement('circle', { cx: "250", cy: "220", r: "10", fill: "#ffde00" })
      )
    );
  }

  return React.createElement('span', { className: `inline-flex items-center justify-center w-5 h-3.5 leading-none select-none text-xs ${className}` }, emoji);
};
