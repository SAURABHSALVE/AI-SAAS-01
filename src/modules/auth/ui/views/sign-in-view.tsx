"use client";

import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {FaGoogle , FaGithub} from "react-icons/fa";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { OctagonAlertIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    }),
});

export const SignInView = () => {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setError(null);
    setPending(true);

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (
    provider: "google" | "github" | "twitter"
  ) => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <Card className="overflow-hidden w-full max-w-5xl p-0 rounded-3xl shadow-2xl border border-slate-200">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
  onSubmit={form.handleSubmit(onSubmit)}
  className="bg-white p-8 md:p-10"
>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    Welcome Back
                  </h1>

                  <p className="text-base text-slate-500 mt-2">
                    Sign in to your account
                  </p>
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button
                  disabled={pending}
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                >
                  Sign In
                </Button>
                <div className = "grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                    onClick={() => onSocial("google")}
                  >
                    <FaGoogle />
                  </Button>
                  <Button
                    disabled = {pending}
                    variant = "outline"
                    className="w-full h-12 rounded-xl"
                    onClick = {() => onSocial("github") }>
                        <FaGithub/>
                    </Button>
                </div>
                <div className="text-center text-sm text-slate-600">
  Don&apos;t have an account?{" "}
  <Link
    href="/sign-up"
    className="underline underline-offset-4"
  >
    Sign up
  </Link>
</div>  
              </div>
            </form>
          </Form>
          <div className="relative hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white overflow-hidden">

  <div className="absolute inset-0 bg-black/10" />

  <img
    src="/logo.svg"
    alt="Logo"
    className="relative z-10 h-28 w-28 drop-shadow-2xl"
  />

  <h2 className="relative z-10 mt-6 text-4xl font-bold tracking-tight">
    Meet.AI
  </h2>

  <p className="relative z-10 mt-2 text-white/80 text-center px-10">
    Smarter meetings powered by AI
  </p>

</div>
        </CardContent>
      </Card>
      
    </div>
  );
};