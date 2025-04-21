import { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface RecaptchaProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: Error) => void;
  size?: 'normal' | 'compact' | 'invisible';
}

export function Recaptcha({
  siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // This is Google's test key
  onVerify,
  onExpire,
  onError,
  size = 'normal'
}: RecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      renderRecaptcha();
      return;
    }

    // Define callback for when the reCAPTCHA script loads
    window.onRecaptchaLoad = () => {
      setIsLoaded(true);
      renderRecaptcha();
    };

    // Load the reCAPTCHA script if it's not already loaded
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setIsError(true);
      if (onError) onError(new Error('Failed to load reCAPTCHA script'));
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script and reset reCAPTCHA
      if (widgetIdRef.current !== null && window.grecaptcha && window.grecaptcha.reset) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      document.body.removeChild(script);
      delete window.onRecaptchaLoad;
    };
  }, [siteKey]);

  const renderRecaptcha = () => {
    if (!recaptchaRef.current || !window.grecaptcha || !window.grecaptcha.render) return;

    try {
      widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        'error-callback': (error: Error) => {
          if (onError) onError(error);
        },
        size: size
      });
    } catch (error) {
      console.error('Error rendering reCAPTCHA:', error);
      setIsError(true);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error rendering reCAPTCHA'));
    }
  };

  // Method to programmatically execute reCAPTCHA (useful for invisible reCAPTCHA)
  const execute = () => {
    if (widgetIdRef.current !== null && window.grecaptcha && window.grecaptcha.execute) {
      window.grecaptcha.execute(widgetIdRef.current);
    }
  };

  // Method to reset reCAPTCHA
  const reset = () => {
    if (widgetIdRef.current !== null && window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Failed to load reCAPTCHA. Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // For invisible reCAPTCHA, we still need a div but it doesn't show anything
  return <div ref={recaptchaRef} data-size={size} className="recaptcha-container" />;
}

// Component for invisible reCAPTCHA that can be triggered programmatically
export function InvisibleRecaptcha(props: Omit<RecaptchaProps, 'size'>) {
  const recaptchaRef = useRef<any>(null);

  const handleVerify = (token: string) => {
    props.onVerify(token);
  };

  return (
    <Recaptcha
      {...props}
      size="invisible"
      onVerify={handleVerify}
      ref={recaptchaRef}
    />
  );
}

export default Recaptcha;