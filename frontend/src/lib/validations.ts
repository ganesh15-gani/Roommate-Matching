import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain 1 uppercase, 1 lowercase, 1 number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms")
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
  }
});

export const completeProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  age: z.string().min(1, "Age is required"),
  occupation: z.enum(["Student", "Employee", "Business", "Freelancer"], { required_error: "Occupation is required" }),
  companyOrCollege: z.string().optional(),
  
  stayType: z.enum(["PG", "Flat", "Hotel"], { required_error: "Stay type is required" }).or(z.literal("")),
  sharingType: z.string().optional(),
  flatType: z.string().optional(),
  
  lookingFor: z.enum(["Roommate", "Room", "Both"], { required_error: "This field is required" }).or(z.literal("")),
  preferredGender: z.enum(["Male", "Female", "Any"], { required_error: "Preferred gender is required" }).or(z.literal("")),
  
  smoking: z.enum(["Yes", "No"]).or(z.literal("")),
  drinking: z.enum(["Yes", "No"]).or(z.literal("")),
  foodPreference: z.enum(["Veg", "Non Veg", "Both"]).or(z.literal("")),
  sleepingHabit: z.enum(["Early Sleeper", "Night Owl"]).or(z.literal("")),
  
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  
  area: z.string().min(2, "Area is required"),
  
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  profilePhotoUrl: z.string().optional()
}).superRefine((data, ctx) => {
  // @ts-ignore
  if (!data.stayType || data.stayType === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stay type is required", path: ["stayType"] });
  }
  // @ts-ignore
  if (!data.lookingFor || data.lookingFor === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required", path: ["lookingFor"] });
  }
  // @ts-ignore
  if (!data.preferredGender || data.preferredGender === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Preferred gender is required", path: ["preferredGender"] });
  }

  if (data.stayType === "PG" && (!data.sharingType || data.sharingType === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sharing Type is required for PG", path: ["sharingType"] });
  }
  if (data.stayType === "Flat" && (!data.flatType || data.flatType === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Flat Type is required for Flat", path: ["flatType"] });
  }

  // Step 3 checks
  // @ts-ignore
  if (!data.smoking || data.smoking === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["smoking"] });
  }
  // @ts-ignore
  if (!data.drinking || data.drinking === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["drinking"] });
  }
  // @ts-ignore
  if (!data.foodPreference || data.foodPreference === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["foodPreference"] });
  }
  // @ts-ignore
  if (!data.sleepingHabit || data.sleepingHabit === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["sleepingHabit"] });
  }
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
