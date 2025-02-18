import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(6),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});

const LoginForm = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const navigate = useNavigate();
  const [error, setError] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { emailOrUsername, password, username } = values;
    setError("");
    try {
      if (isSignUp) {
        if (!username) {
          setError("Username is required");
          return;
        }
        await signUp(emailOrUsername, password, username);
        setError("Account created! You can now sign in.");
        setIsSignUp(false);
        return;
      }
      await signIn(emailOrUsername, password);
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during authentication",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Sign Up" : "Login"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isSignUp ? "Email" : "Email or Username"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={isSignUp ? "email" : "text"}
                        placeholder={
                          isSignUp
                            ? "Enter your email"
                            : "Enter your email or username"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Need an account? Sign Up"}
                </Button>
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={async () => {
                      const email = form.getValues("emailOrUsername");
                      if (!email) {
                        setError("Please enter your email address");
                        return;
                      }
                      try {
                        const { error } =
                          await supabase.auth.resetPasswordForEmail(email, {
                            redirectTo:
                              "https://dreamy-jennings4-r4fuc.dev.tempolabs.ai/reset-password",
                            siteDomain:
                              "dreamy-jennings4-r4fuc.dev.tempolabs.ai",
                          });
                        if (error) throw error;
                        setError(
                          "Success! Check your email for password reset instructions",
                        );
                      } catch (err) {
                        console.error("Reset password error:", err);
                        setError(
                          "Error sending reset email. Please check your email address and try again.",
                        );
                      }
                    }}
                  >
                    Forgot Password?
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
