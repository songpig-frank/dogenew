import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import AnonymousToggle from "./AnonymousToggle";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["Praise", "Complaint", "Recommendation"]),
  is_anonymous: z.boolean().default(false),
});

interface SubmissionFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  initialValues?: Partial<z.infer<typeof formSchema>>;
}

const defaultValues: z.infer<typeof formSchema> = {
  title: "",
  description: "",
  category: "Recommendation",
  is_anonymous: false,
};

const SubmissionForm = ({
  onSubmit: propOnSubmit,
  initialValues = defaultValues,
}: SubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [useRandomData, setUseRandomData] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log("Starting Supabase insert...");
      console.log("Using Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      // Get username from user metadata or profile
      let username = user?.user_metadata?.username;
      if (!username && user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        username =
          profile?.username || user.email?.split("@")[0] || "Anonymous";
      }

      // If still no username, create one from email
      if (!username && user?.email) {
        username = user.email.split("@")[0];
        // Update user_profiles with this username
        await supabase.from("user_profiles").upsert({
          id: user.id,
          username: username,
          is_anonymous: false,
        });
      }

      // First update user profile with display name if needed
      if (user?.id && username) {
        // Get existing profile first
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("username, display_name, email")
          .eq("id", user.id)
          .single();

        await supabase.from("user_profiles").upsert({
          id: user.id,
          username: username,
          // Only update display_name if it doesn't exist or is the same as the old username
          display_name: existingProfile?.display_name || username,
          email: user.email,
        });
      }

      // Insert into Supabase
      const { data, error: supabaseError } = await supabase
        .from("submissions")
        .insert([
          {
            title: values.title,
            description: values.description,
            category: values.category,
            likes: 0,
            comments: 0,
            status: "pending",
            user_id: user?.id,
            username: values.is_anonymous
              ? "Anonymous"
              : username || "Anonymous",
            is_anonymous: values.is_anonymous,
          },
        ])
        .select();

      console.log("Insert completed");

      if (supabaseError) {
        console.error("Supabase error details:", supabaseError);
        throw supabaseError;
      }

      console.log("Saved to database:", data);

      // Show success message
      setSuccess(true);

      // Navigate home after 2 seconds
      setTimeout(() => {
        form.reset();
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Submit Your Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="random"
                  checked={useRandomData}
                  onCheckedChange={(checked) => {
                    setUseRandomData(checked === true);
                    if (checked) {
                      const categories = [
                        "Praise",
                        "Complaint",
                        "Recommendation",
                      ];
                      form.setValue(
                        "title",
                        `Random Feedback ${Math.floor(Math.random() * 1000)}`,
                      );
                      form.setValue(
                        "description",
                        `This is a randomly generated ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} about government efficiency. It includes various points about process improvements, cost savings, and citizen satisfaction.`,
                      );
                      form.setValue(
                        "category",
                        categories[
                          Math.floor(Math.random() * categories.length)
                        ] as "Praise" | "Complaint" | "Recommendation",
                      );
                    }
                  }}
                />
                <label
                  htmlFor="random"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use random data
                </label>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a clear title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a brief, descriptive title for your submission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Praise">Praise</SelectItem>
                        <SelectItem value="Complaint">Complaint</SelectItem>
                        <SelectItem value="Recommendation">
                          Recommendation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of feedback you're providing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain your feedback in detail
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <AnonymousToggle
                        isAnonymous={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="mt-0">
                      Your email will only be visible to administrators and
                      moderators.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Successfully submitted! Redirecting...
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionForm;
