import React, { useEffect, useRef } from 'react';

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
          size?: 'normal' | 'compact' | 'flexible';
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
  // Use refs for callbacks so the effect doesn't re-run when they change
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

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
        size: 'normal',
        callback: (token: string) => {
          console.log('[Turnstile] Token received');
          onTokenRef.current(token);
        },
        'expired-callback': () => {
          console.log('[Turnstile] Token expired');
          onExpireRef.current?.();
        },
        'error-callback': () => {
          console.warn('[Turnstile] Error — widget will auto-retry');
        },
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
  }, []); // Empty deps — only run once on mount

  if (!SITE_KEY) return null;

  return <div ref={containerRef} />;
};

export default TurnstileWidget;
