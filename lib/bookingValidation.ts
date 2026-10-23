import { booking } from "@/config/booking";

export type ContactDetails = { name: string; email: string; phone: string; age: string };
export type ContactErrors = Partial<Record<keyof ContactDetails, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strips spaces/brackets/dashes and turns a leading "00" into "+" */
export function normalisePhone(phone: string): string {
  return phone.trim().replace(/[\s().-]/g, "").replace(/^00/, "+");
}

export function validateContact(d: ContactDetails): ContactErrors {
  const e: ContactErrors = {};
  const name = d.name.trim();
  if (name.length < 2 || !/\p{L}/u.test(name)) e.name = "Please enter your full name.";
  else if (name.length > 100) e.name = "Please shorten your name.";

  const email = d.email.trim();
  if (!email) e.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 254) e.email = "Please enter a valid email address.";

  const phone = normalisePhone(d.phone);
  if (!phone) e.phone = "Please enter your phone number.";
  else if (!/^\+\d{7,15}$/.test(phone)) e.phone = "Please enter a valid phone number, including your country code (e.g. +44 or +1).";

  const ageStr = d.age.trim();
  const age = Number(ageStr);
  if (!ageStr) e.age = "Please enter your age.";
  else if (!/^\d{1,3}$/.test(ageStr) || !Number.isInteger(age)) e.age = "Please enter your age as a number.";
  else if (age < booking.minAge) e.age = `You must be at least ${booking.minAge} to book a call.`;
  else if (age > booking.maxAge) e.age = "Please enter a valid age.";

  return e;
}
