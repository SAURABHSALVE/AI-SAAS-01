

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const  { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onError: () => {
          window.alert("Error signing up. Please try again.");
        },
        onSuccess: () => {
          window.alert(
            "Sign up successful! Please check your email to verify your account."
          );
        },
      }
    );
  };

  if (session) {
  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>Logged in as {session.user.name}</p>

      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.refresh();
              },
            },
          })
        }
      >
        Sign Out
      </Button>
    </div>
  );
}

const onLogin = () => {
  authClient.signIn.email(
    {
      email,
      password,
    },
    {
      onError: () => {
        window.alert("Error signing in. Please try again.");
      },
      onSuccess: () => {
        window.alert("Sign in successful!");
      },
    }
  );
};

  
    

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-sm text-muted-foreground">
            Create your Meeting AI account
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className="w-full" onClick={onSubmit}>
            Sign Up
          </Button>
          <Button className="w-full" variant="secondary" onClick={onLogin}>
  Sign In
</Button>
        </div>
      </div>
    </main>
  );
}