CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`status` text DEFAULT 'success',
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artikel` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`category_id` text,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `kategori`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hasil_tryout` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tryout_id` text NOT NULL,
	`total_soal` integer NOT NULL,
	`terjawab` integer NOT NULL,
	`benar` integer NOT NULL,
	`salah` integer NOT NULL,
	`kosong` integer NOT NULL,
	`skor` real NOT NULL,
	`persentase` real NOT NULL,
	`hasil_status` text,
	`waktu_mulai` integer NOT NULL,
	`waktu_selesai` integer,
	`waktu_tempuh` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tryout_id`) REFERENCES `tryout`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jawaban_soal` (
	`id` text PRIMARY KEY NOT NULL,
	`hasil_tryout_id` text NOT NULL,
	`soal_id` text NOT NULL,
	`jawaban_user` text,
	`jawaban_benar` text NOT NULL,
	`is_correct` integer NOT NULL,
	`waktu_tenjawab` integer,
	FOREIGN KEY (`hasil_tryout_id`) REFERENCES `hasil_tryout`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`soal_id`) REFERENCES `soal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kategori` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `materi` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category_id` text NOT NULL,
	`file_key` text NOT NULL,
	`file_size` integer,
	`file_type` text,
	`page_count` integer,
	`uploaded_by` text NOT NULL,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `kategori`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer NOT NULL,
	`refresh_expires_at` integer,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`data_type` text DEFAULT 'string',
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `soal` (
	`id` text PRIMARY KEY NOT NULL,
	`tryout_id` text NOT NULL,
	`question_number` integer NOT NULL,
	`pertanyaan` text NOT NULL,
	`tipe_jawaban` text DEFAULT 'pilihan_ganda' NOT NULL,
	`opsi_a` text,
	`opsi_b` text,
	`opsi_c` text,
	`opsi_d` text,
	`opsi_e` text,
	`jawaban_benar` text NOT NULL,
	`pembahasan` text,
	`kategori` text,
	`created_at` integer,
	FOREIGN KEY (`tryout_id`) REFERENCES `tryout`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tryout` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer DEFAULT 120 NOT NULL,
	`total_soal` integer NOT NULL,
	`passing_score` real DEFAULT 70,
	`categories` text,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'draft',
	`views` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`file_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`status` text DEFAULT 'active',
	`created_at` integer,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`full_name` text,
	`phone_number` text,
	`role_id` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activity_logs_user_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_action_idx` ON `activity_logs` (`action`);--> statement-breakpoint
CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `artikel_slug_unique` ON `artikel` (`slug`);--> statement-breakpoint
CREATE INDEX `hasil_tryout_user_idx` ON `hasil_tryout` (`user_id`);--> statement-breakpoint
CREATE INDEX `hasil_tryout_tryout_idx` ON `hasil_tryout` (`tryout_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `hasil_tryout_user_tryout_unique` ON `hasil_tryout` (`user_id`,`tryout_id`);--> statement-breakpoint
CREATE INDEX `jawaban_soal_hasil_idx` ON `jawaban_soal` (`hasil_tryout_id`);--> statement-breakpoint
CREATE INDEX `jawaban_soal_soal_idx` ON `jawaban_soal` (`soal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `kategori_name_unique` ON `kategori` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `kategori_slug_unique` ON `kategori` (`slug`);--> statement-breakpoint
CREATE INDEX `materi_category_idx` ON `materi` (`category_id`);--> statement-breakpoint
CREATE INDEX `materi_uploaded_by_idx` ON `materi` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `materi_status_idx` ON `materi` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_name_unique` ON `permissions` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `role_permission_unique` ON `role_permissions` (`role_id`,`permission_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_refresh_token_unique` ON `sessions` (`refresh_token`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `soal_tryout_idx` ON `soal` (`tryout_id`);--> statement-breakpoint
CREATE INDEX `soal_kategori_idx` ON `soal` (`kategori`);--> statement-breakpoint
CREATE INDEX `tryout_created_by_idx` ON `tryout` (`created_by`);--> statement-breakpoint
CREATE INDEX `tryout_status_idx` ON `tryout` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploads_file_key_unique` ON `uploads` (`file_key`);--> statement-breakpoint
CREATE INDEX `uploads_uploaded_by_idx` ON `uploads` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `uploads_entity_idx` ON `uploads` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role_id`);