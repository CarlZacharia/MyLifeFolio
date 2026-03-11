import React, { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          size?: 'normal' | 'compact' | 'invisible';
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onToken, onExpire }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      // Clean up any existing widget
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        size: 'invisible',
        callback: onToken,
        'expired-callback': handleExpire,
        'error-callback': handleExpire,
      });
    };

    // If turnstile script is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
    } else {
      // Load the script
      const existing = document.querySelector('script[src*="turnstile"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        // Script exists but not loaded yet — wait for it
        existing.addEventListener('load', renderWidget);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken, handleExpire]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} />;
};

/** Hook to reset the Turnstile widget (call after failed submission) */
export const useTurnstileReset = () => {
  const widgetIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return { widgetIdRef, reset };
};

export default TurnstileWidget;
