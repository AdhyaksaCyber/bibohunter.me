import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob, index, unique } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Users & Auth
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  phoneNumber: text('phone_number'),
  roleId: text('role_id').notNull().references(() => roles.id),
  status: text('status').default('active'), // 'active' | 'inactive' | 'suspended'
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').$defaultFn(() => Date.now()),
}, (table) => ({
  usernameIdx: index('users_username_idx').on(table.username),
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.roleId),
}));

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(), // 'superadmin' | 'admin' | 'mentor' | 'user'
  description: text('description'),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
});

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(), // e.g., 'manage:users', 'upload:materi'
  description: text('description'),
});

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roleId: text('role_id').notNull().references(() => roles.id),
  permissionId: text('permission_id').notNull().references(() => permissions.id),
}, (table) => ({
  rolePermissionUnique: unique('role_permission_unique').on(table.roleId, table.permissionId),
}));

// Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  refreshToken: text('refresh_token').unique(),
  expiresAt: integer('expires_at').notNull(),
  refreshExpiresAt: integer('refresh_expires_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

// Materi & Kategori
export const kategori = sqliteTable('kategori', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
});

export const materi = sqliteTable('materi', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: text('category_id').notNull().references(() => kategori.id),
  fileKey: text('file_key').notNull(), // Path di R2
  fileSize: integer('file_size'), // in bytes
  fileType: text('file_type'), // 'pdf' | 'docx'
  pageCount: integer('page_count'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  status: text('status').default('draft'), // 'draft' | 'published' | 'archived'
  views: integer('views').default(0),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').$defaultFn(() => Date.now()),
}, (table) => ({
  categoryIdx: index('materi_category_idx').on(table.categoryId),
  uploadedByIdx: index('materi_uploaded_by_idx').on(table.uploadedBy),
  statusIdx: index('materi_status_idx').on(table.status),
}));

// Artikel
export const artikel = sqliteTable('artikel', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  categoryId: text('category_id').references(() => kategori.id),
  createdBy: text('created_by').notNull().references(() => users.id),
  status: text('status').default('draft'), // 'draft' | 'published'
  views: integer('views').default(0),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').$defaultFn(() => Date.now()),
});

// Tryout System
export const tryout = sqliteTable('tryout', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull().default(120),
  totalSoal: integer('total_soal').notNull(),
  passingScore: real('passing_score').default(70), // percentage
  categories: text('categories'), // JSON array of category IDs
  createdBy: text('created_by').notNull().references(() => users.id),
  status: text('status').default('draft'), // 'draft' | 'published' | 'archived'
  views: integer('views').default(0),
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').$defaultFn(() => Date.now()),
}, (table) => ({
  createdByIdx: index('tryout_created_by_idx').on(table.createdBy),
  statusIdx: index('tryout_status_idx').on(table.status),
}));

export const soal = sqliteTable('soal', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tryoutId: text('tryout_id').notNull().references(() => tryout.id),
  questionNumber: integer('question_number').notNull(),
  pertanyaan: text('pertanyaan').notNull(),
  tipeJawaban: text('tipe_jawaban').notNull().default('pilihan_ganda'), // 'pilihan_ganda' | 'essay'
  opsiA: text('opsi_a'),
  opsiB: text('opsi_b'),
  opsiC: text('opsi_c'),
  opsiD: text('opsi_d'),
  opsiE: text('opsi_e'),
  jawabanBenar: text('jawaban_benar').notNull(), // 'A' | 'B' | 'C' | 'D' | 'E'
  pembahasan: text('pembahasan'),
  kategori: text('kategori'), // e.g., 'TWK', 'TIU', 'TKP'
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
}, (table) => ({
  tryoutIdx: index('soal_tryout_idx').on(table.tryoutId),
  kategoriIdx: index('soal_kategori_idx').on(table.kategori),
}));

// Tryout Results
export const hasilTryout = sqliteTable('hasil_tryout', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  tryoutId: text('tryout_id').notNull().references(() => tryout.id),
  totalSoal: integer('total_soal').notNull(),
  terjawab: integer('terjawab').notNull(),
  benar: integer('benar').notNull(),
  salah: integer('salah').notNull(),
  kosong: integer('kosong').notNull(),
  skor: real('skor').notNull(),
  persentase: real('persentase').notNull(),
  hasilStatus: text('hasil_status'), // 'lulus' | 'tidak_lulus'
  waktuMulai: integer('waktu_mulai').notNull(),
  waktuSelesai: integer('waktu_selesai'),
  waktuTempuh: integer('waktu_tempuh'), // in seconds
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
}, (table) => ({
  userIdx: index('hasil_tryout_user_idx').on(table.userId),
  tryoutIdx: index('hasil_tryout_tryout_idx').on(table.tryoutId),
  userTryoutIdx: unique('hasil_tryout_user_tryout_unique').on(table.userId, table.tryoutId),
}));

// Jawaban User (detail per soal)
export const jawabanSoal = sqliteTable('jawaban_soal', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  hasilTryoutId: text('hasil_tryout_id').notNull().references(() => hasilTryout.id),
  soalId: text('soal_id').notNull().references(() => soal.id),
  jawabanUser: text('jawaban_user'), // 'A' | 'B' | 'C' | 'D' | 'E' | null
  jawabanBenar: text('jawaban_benar').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  waktuTenjawab: integer('waktu_tenjawab'), // in seconds
}, (table) => ({
  hasilIdx: index('jawaban_soal_hasil_idx').on(table.hasilTryoutId),
  soalIdx: index('jawaban_soal_soal_idx').on(table.soalId),
}));

// Uploads & Files
export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  fileKey: text('file_key').notNull().unique(), // Path di R2
  originalFilename: text('original_filename').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  entityType: text('entity_type'), // 'materi' | 'tryout_soal' | 'avatar'
  entityId: text('entity_id'),
  status: text('status').default('active'), // 'active' | 'deleted'
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
}, (table) => ({
  uploadedByIdx: index('uploads_uploaded_by_idx').on(table.uploadedBy),
  entityIdx: index('uploads_entity_idx').on(table.entityType, table.entityId),
}));

// Activity Logs (audit trail)
export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(), // e.g., 'login', 'upload_materi', 'submit_tryout'
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details'), // JSON
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status').default('success'), // 'success' | 'failed'
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
}, (table) => ({
  userIdx: index('activity_logs_user_idx').on(table.userId),
  actionIdx: index('activity_logs_action_idx').on(table.action),
  createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
}));

// Settings
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  dataType: text('data_type').default('string'), // 'string' | 'number' | 'boolean' | 'json'
  updatedAt: integer('updated_at').$defaultFn(() => Date.now()),
});
