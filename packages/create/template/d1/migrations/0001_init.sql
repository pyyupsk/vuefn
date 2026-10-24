CREATE TABLE `notes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `body` text NOT NULL,
  `created_at` integer NOT NULL
);

INSERT INTO `notes` (`body`, `created_at`) VALUES ('Hello from D1', 0);
