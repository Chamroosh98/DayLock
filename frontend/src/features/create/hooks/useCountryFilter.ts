import { useState, useMemo } from 'react';
import { COUNTRIES } from '../../../data/countries';

export const useCountryFilter = () => {
  const [countrySearch, setCountrySearch] = useState('');

  const countryResults = useMemo(() => {
    const term = countrySearch.trim().toLowerCase();
    if (!term) return [];
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.fa.includes(countrySearch.trim())
    ).slice(0, 5);
  }, [countrySearch]);

  return {
    countrySearch,
    setCountrySearch,
    countryResults
  };
};
