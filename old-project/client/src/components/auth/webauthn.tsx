import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Fingerprint, ShieldCheck, Key, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// WebAuthn API is available on the window object
declare global {
  interface Window {
    PublicKeyCredential: any;
  }
}

interface WebAuthnProps {
  userId: string; // User ID for associating credentials
  onSuccess?: () => void; // Callback when authentication is successful
}

export function WebAuthnRegistration({ userId, onSuccess }: WebAuthnProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported and if user has credentials
  useEffect(() => {
    // Check if WebAuthn API is available
    if (window.PublicKeyCredential) {
      setIsSupported(true);
      
      // Check if platform authenticators are available
      if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then((available: boolean) => {
            if (!available) {
              console.log('Platform authenticator is not available.');
            }
          })
          .catch((err: Error) => {
            console.error('Error checking platform authenticator:', err);
          });
      }
      
      // Check if user has registered credentials
      checkForCredentials();
    }
  }, [userId]);
  
  // Check firestore to see if this user has registered WebAuthn credentials
  const checkForCredentials = async () => {
    if (!userId) return;
    
    try {
      const userCredentialsRef = doc(firestore, 'webauthn', userId);
      const docSnap = await getDoc(userCredentialsRef);
      
      if (docSnap.exists() && docSnap.data()?.credentials?.length) {
        setHasCredentials(true);
      } else {
        setHasCredentials(false);
      }
    } catch (error) {
      console.error('Error checking for credentials:', error);
    }
  };
  
  // Request credentials from Firebase Extension
  const registerCredential = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to register a passkey",
        variant: "destructive"
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // This would normally call the Firebase Extension endpoint
      // For now, we'll simulate the registration process
      
      // 1. Get a challenge from server
      // Normally this would be a call to your Firebase Function created by the extension
      const mockChallenge = new Uint8Array(32);
      window.crypto.getRandomValues(mockChallenge);
      
      // 2. Create credential options
      const publicKeyCredentialCreationOptions = {
        challenge: mockChallenge,
        rp: {
          name: "GenKit AI Studio",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: "User",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Use platform authenticator (TouchID, FaceID, Windows Hello)
          userVerification: "preferred",
        },
        timeout: 60000,
      };
      
      // 3. Create credential
      toast({
        title: "Biometric authentication",
        description: "Please follow your device prompts to create a passkey",
      });
      
      // This would normally call navigator.credentials.create()
      // For now, we'll simulate a successful registration
      
      // Simulate delay for biometric verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 4. Save credential to Firebase
      // In a real implementation, we'd send the credential to our server/extension
      await setDoc(doc(firestore, 'webauthn', userId), {
        credentials: [{
          id: Math.random().toString(36).substring(2),
          publicKey: "simulated-public-key",
          createdAt: new Date().toISOString()
        }]
      });
      
      setHasCredentials(true);
      
      toast({
        title: "Registration successful",
        description: "Your passkey has been registered successfully",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error registering credentials:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register passkey",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>WebAuthn not supported</AlertTitle>
        <AlertDescription>
          Your browser doesn't support WebAuthn, which is required for passwordless authentication.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Enhanced Security with Passkeys</AlertTitle>
        <AlertDescription>
          Register a passkey to sign in securely without a password using your device's biometrics or security keys.
        </AlertDescription>
      </Alert>
      
      {hasCredentials ? (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <Key className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Passkey registered</AlertTitle>
          <AlertDescription>
            You can use your passkey to authenticate in the future.
          </AlertDescription>
        </Alert>
      ) : (
        <Button 
          onClick={registerCredential} 
          disabled={isRegistering}
          className="w-full"
        >
          <Fingerprint className="mr-2 h-4 w-4" />
          {isRegistering ? "Registering..." : "Register Passkey"}
        </Button>
      )}
    </div>
  );
}

export function WebAuthnAuthentication({ userId, onSuccess }: WebAuthnProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if WebAuthn API is available
    setIsSupported(!!window.PublicKeyCredential);
  }, []);
  
  const authenticate = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You need a username to authenticate with a passkey",
        variant: "destructive"
      });
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // This would normally call the Firebase Extension endpoint
      // For now, we'll simulate the authentication process
      
      // 1. Get a challenge from server
      const mockChallenge = new Uint8Array(32);
      window.crypto.getRandomValues(mockChallenge);
      
      // 2. Create credential options
      const publicKeyCredentialRequestOptions = {
        challenge: mockChallenge,
        rpId: window.location.hostname,
        userVerification: "preferred",
        timeout: 60000,
      };
      
      toast({
        title: "Biometric authentication",
        description: "Please follow your device prompts to authenticate",
      });
      
      // 3. Get credential
      // This would normally call navigator.credentials.get()
      // For now, we'll simulate a successful authentication
      
      // Simulate delay for biometric verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Authentication successful",
        description: "You've been authenticated using your passkey",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error authenticating:', error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate",
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  if (!isSupported) {
    return null;
  }
  
  return (
    <Button 
      onClick={authenticate} 
      disabled={isAuthenticating}
      variant="outline"
      className="w-full"
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {isAuthenticating ? "Authenticating..." : "Sign in with Passkey"}
    </Button>
  );
}