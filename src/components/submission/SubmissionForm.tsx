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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["Praise", "Complaint", "Recommendation"]),
});

interface SubmissionFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  initialValues?: Partial<z.infer<typeof formSchema>>;
}

const defaultValues: z.infer<typeof formSchema> = {
  title: "",
  description: "",
  category: "Recommendation",
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const SubmissionForm = ({
  onSubmit: propOnSubmit,
  initialValues = defaultValues,
}: SubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogError, setDialogError] = React.useState<string | null>(null);
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
            username: username || "Anonymous",
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
                    variant="secondary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={async () => {
                      try {
                        console.log("Testing connection...");
                        console.log("Supabase URL:", supabaseUrl);
                        console.log("Anon Key exists:", !!supabaseAnonKey);

                        // First test the connection
                        const { error: pingError } = await supabase
                          .from("submissions")
                          .select("count")
                          .limit(1);

                        if (pingError) {
                          console.error("Connection test failed:", pingError);
                          throw pingError;
                        }

                        console.log(
                          "Connection test successful, attempting insert...",
                        );

                        const { data, error } = await supabase
                          .from("submissions")
                          .insert([
                            {
                              title: "Test Submission",
                              description: "This is a test submission",
                              category: "Recommendation",
                              likes: 0,
                              comments: 0,
                            },
                          ])
                          .select();

                        if (error) throw error;
                        console.log("Test successful:", data);
                        alert("Test successful! Check console for details.");
                      } catch (err) {
                        console.error("Test failed:", err);
                        const errorDetails = {
                          error: {
                            message: err.message,
                            name: err.name,
                            code: err.code,
                            details: err.details,
                          },
                          config: {
                            supabaseUrl,
                            hasAnonKey: !!supabaseAnonKey,
                            timestamp: new Date().toISOString(),
                          },
                          // Add any response details if available
                          response: err.response
                            ? {
                                status: err.response.status,
                                statusText: err.response.statusText,
                                data: err.response.data,
                              }
                            : undefined,
                        };
                        const errorMessage = JSON.stringify(
                          errorDetails,
                          null,
                          2,
                        );
                        setDialogError(errorMessage);
                      }
                    }}
                  >
                    🔍 Test Database Connection
                  </Button>
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

          <Dialog
            open={!!dialogError}
            onOpenChange={() => setDialogError(null)}
          >
            <DialogContent
              className="max-w-3xl"
              description="Details about the connection test error"
            >
              <DialogHeader>
                <DialogTitle>Connection Test Error</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  The connection to Supabase failed. Details below:
                </p>
              </DialogHeader>
              <div className="bg-muted p-4 rounded-md relative">
                <pre className="whitespace-pre-wrap overflow-auto max-h-[400px] text-sm">
                  {dialogError}
                </pre>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    if (dialogError) {
                      copyToClipboard(dialogError);
                      alert("Error details copied to clipboard!");
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionForm;
