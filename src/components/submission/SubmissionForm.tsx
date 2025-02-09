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

const SubmissionForm = ({
  onSubmit: propOnSubmit,
  initialValues = defaultValues,
}: SubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Insert into Supabase
      const { error: supabaseError } = await supabase
        .from("submissions")
        .insert([
          {
            title: values.title,
            description: values.description,
            category: values.category,
            likes: 0,
            comments: 0,
          },
        ]);

      if (supabaseError) throw supabaseError;

      // Reset form and navigate home
      form.reset();
      navigate("/");
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
                <div className="flex justify-end space-x-4">
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
