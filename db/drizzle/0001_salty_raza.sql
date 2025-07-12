CREATE TABLE `notification_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`subscriber_id` integer NOT NULL,
	`sms_id` integer NOT NULL,
	`sent_at` text NOT NULL,
	FOREIGN KEY (`subscriber_id`) REFERENCES `subscriber`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sms_id`) REFERENCES `disaster_sms`(`MD101_SN`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriber_keyword` (
	`id` integer PRIMARY KEY NOT NULL,
	`subscriber_id` integer NOT NULL,
	`keyword` text NOT NULL,
	FOREIGN KEY (`subscriber_id`) REFERENCES `subscriber`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriber` (
	`id` integer PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriber_p256dh_unique` ON `subscriber` (`p256dh`);