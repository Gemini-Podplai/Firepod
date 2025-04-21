import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { LogIn, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from "firebase/auth";
import Recaptcha from "./recaptcha";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = {
        name: result.user.displayName || result.user.email?.split("@")[0] || "User",
        email: result.user.email || "",
      };
      login(userData);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        name: email.split("@")[0],
        email: result.user.email || "",
      };
      login(userData);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account' // Always show account selector
      });
      const result = await signInWithPopup(auth, provider);
      const userData = {
        name: result.user.displayName || "Google User",
        email: result.user.email || "",
        photoURL: result.user.photoURL || "",
      };
      await login(userData);
      toast({
        title: "Welcome!",
        description: `Signed in as ${userData.name}`,
      });
      navigate("/");
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      toast({
        title: "Google Login Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userData = {
        name: result.user.displayName || "GitHub User",
        email: result.user.email || "",
      };
      login(userData);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "GitHub Login Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome to GenKit AI Studio</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to start your AI conversation
            </p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>

              <Button
                type="button"
                className="w-full"
                onClick={handleEmailRegister}
                disabled={!email || !password || !recaptchaToken}
              >
                Register New Account
              </Button>
            </div>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGithubSignIn}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="mt-4">
            <Recaptcha
              onVerify={setRecaptchaToken}
              onError={(error) => {
                console.error("reCAPTCHA error:", error);
                toast({
                  title: "reCAPTCHA Error",
                  description: "Verification failed. Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}