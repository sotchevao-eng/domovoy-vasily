import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/appConfig';
import { syncVKBackBehavior } from './vkBridge';
import { useVK } from './useVK';

export function VKBackHandler() {
  const { isVK, isInitialized } = useVK();
  const location = useLocation();

  useEffect(() => {
    if (!isVK || !isInitialized) {
      return;
    }

    void syncVKBackBehavior(location.pathname === ROUTES.home);
  }, [isInitialized, isVK, location.pathname]);

  return null;
}
