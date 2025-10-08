CREATE TABLE `channels` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`created_by` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channel_members` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`channel_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`role` varchar(20) DEFAULT 'member',
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `channel_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`contact_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`uploader_id` bigint unsigned NOT NULL,
	`file_type` varchar(20) NOT NULL,
	`file_path` varchar(255) NOT NULL,
	`file_size` bigint unsigned,
	`mime_type` varchar(100),
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`created_by` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`role` varchar(20) DEFAULT 'member',
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`sender_id` bigint unsigned NOT NULL,
	`chat_type` varchar(20) NOT NULL,
	`chat_id` bigint unsigned NOT NULL,
	`content` text,
	`message_type` varchar(20) DEFAULT 'text',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `private_chats` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user1_id` bigint unsigned NOT NULL,
	`user2_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unread_messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`message_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`read_at` timestamp,
	CONSTRAINT `unread_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`phone` varchar(15) NOT NULL,
	`username` varchar(50),
	`display_name` varchar(100),
	`bio` text,
	`profile_image` varchar(255),
	`password_hash` varchar(255) NOT NULL,
	`refresh_token` varchar(512),
	`is_active` boolean DEFAULT true,
	`last_seen` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `channels` ADD CONSTRAINT `channels_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `channel_members` ADD CONSTRAINT `channel_members_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `channel_members` ADD CONSTRAINT `channel_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_contact_id_users_id_fk` FOREIGN KEY (`contact_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groups` ADD CONSTRAINT `groups_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `private_chats` ADD CONSTRAINT `private_chats_user1_id_users_id_fk` FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `private_chats` ADD CONSTRAINT `private_chats_user2_id_users_id_fk` FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `unread_messages` ADD CONSTRAINT `unread_messages_message_id_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `unread_messages` ADD CONSTRAINT `unread_messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;