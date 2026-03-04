import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["client", "affiliate", "admin"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "enrolled", "active", "completed", "cancelled"]);
export const commissionStatusEnum = pgEnum("commission_status", ["pending", "approved", "paid", "rejected"]);

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerifyToken: text("email_verify_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  lastLoginAt: timestamp("last_login_at"),
  crcClientId: text("crc_client_id"),
  crcAffiliateId: text("crc_affiliate_id"),
  affiliateCode: text("affiliate_code").unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Refresh Tokens ──────────────────────────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// ─── Leads (Audit Intake) ────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  contactTime: text("contact_time").notNull(),
  goals: text("goals").array().notNull(),
  budget: text("budget").notNull(),
  source: text("source").notNull(),
  consent: boolean("consent").notNull().default(false),
  tempPassword: text("temp_password"),
  affiliateCode: text("affiliate_code"),
  convertedToUserId: varchar("converted_to_user_id"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Affiliate Referrals ─────────────────────────────────────────────────────
export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  leadId: varchar("lead_id"),
  clientId: varchar("client_id"),
  status: referralStatusEnum("status").notNull().default("pending"),
  programEnrolled: text("program_enrolled"),
  programValue: decimal("program_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  enrolledAt: timestamp("enrolled_at"),
  completedAt: timestamp("completed_at"),
});

// ─── Commissions ─────────────────────────────────────────────────────────────
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  referralId: varchar("referral_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 4 }).notNull(),
  status: commissionStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  paymentRef: text("payment_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Audit Log ───────────────────────────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  tempPassword: true,
  createdAt: true,
  convertedToUserId: true,
  convertedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
  affiliateCode: z.string().optional(),
  role: z.enum(["client", "affiliate"]).default("client"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Legacy compat
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
