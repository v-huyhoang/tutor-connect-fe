import * as z from "zod";

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  is_active: z.boolean(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
