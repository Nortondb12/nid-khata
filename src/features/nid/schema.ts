import { z } from "zod";

const today = () => new Date().toISOString().slice(0, 10);

const nameField = (label: string) =>
  z
    .string({ required_error: `${label} লিখুন।`, invalid_type_error: `${label} লিখুন।` })
    .trim()
    .min(1, { message: `${label} লিখুন।` })
    .min(2, { message: `${label} কমপক্ষে ২ অক্ষরের হতে হবে।` })
    .max(100, { message: `${label} ১০০ অক্ষরের বেশি হতে পারবে না।` })
    .regex(/^[\p{L}\p{M}.'\-\s]+$/u, {
      message: `${label}-এ শুধু বাংলা বা ইংরেজি অক্ষর, স্পেস, হাইফেন (-), অ্যাপোস্ট্রফি (') এবং ডট (.) ব্যবহার করা যাবে।`,
    })
    .refine((v) => !/\s{2,}/.test(v), {
      message: `${label}-এ পরপর একাধিক স্পেস ব্যবহার করা যাবে না।`,
    });


export const nidLookupSchema = z.object({
  nid_number: z
    .string()
    .trim()
    .regex(/^\d+$/, { message: "শুধু সংখ্যা ব্যবহার করুন।" })
    .refine((v) => [10, 13, 17].includes(v.length), {
      message: "NID নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে।",
    }),
  date_of_birth: z
    .string()
    .min(1, { message: "জন্ম তারিখ দিন।" })
    .refine((v) => !isNaN(Date.parse(v)), { message: "সঠিক তারিখ দিন।" })
    .refine((v) => v <= today(), { message: "ভবিষ্যৎ তারিখ গ্রহণযোগ্য নয়।" })
    .refine((v) => v >= "1900-01-01", { message: "সঠিক জন্ম সাল দিন।" }),
  full_name: nameField("পূর্ণ নাম"),
  father_name: nameField("পিতার নাম"),
});

export type NidLookupInput = z.infer<typeof nidLookupSchema>;

export const nidDataSchema = z.object({
  name_bn: z.string(),
  name_en: z.string(),
  father_name: z.string(),
  mother_name: z.string(),
  date_of_birth: z.string(),
  nid_number: z.string(),
  address: z.string(),
  photo: z.string().url().optional(),
});
