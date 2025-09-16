'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        // In a real app, you'd validate credentials here
        toast({
          title: 'Success!',
          description: "You've been signed in.",
        });
        router.push('/onboarding');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please enter both email and password.',
        });
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
         <div className="flex justify-center mb-6">
            <div className="group flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-12 md:w-12 md:text-base">
                <Zap className="h-6 w-6 transition-all group-hover:scale-110" />
                <span className="sr-only">EcoQuest</span>
            </div>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to EcoQuest</CardTitle>
            <CardDescription>Sign in to continue your energy-saving journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="warrior@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
         <p className="px-8 text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Sign Up
            </a>
          </p>
      </div>
    </main>
  );
}
