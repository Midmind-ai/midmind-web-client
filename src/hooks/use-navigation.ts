import { useEffect } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';

export let navigate: NavigateFunction;

export const useInitializeNavigation = () => {
  const originalNavigate = useNavigate();

  useEffect(() => {
    navigate = originalNavigate;
  }, [originalNavigate]);
};
