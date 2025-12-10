-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    `locale` VARCHAR(191) NULL,
    `collaborator` BOOLEAN NULL DEFAULT false,
    `emailVerified` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NULL,
    `feedback` TEXT NULL,
    `reviewed` ENUM('yes', 'delayed') NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charges` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT NOT NULL,
    `total_used_unit` BIGINT NULL,
    `price` DECIMAL(10, 2) NULL,
    `discount` DECIMAL(5, 2) NULL,
    `store_credit` DECIMAL(5, 2) NULL,
    `trial_ends_on` DATE NULL,
    `billing_on` DATE NOT NULL,
    `install_on` DATE NOT NULL,
    `uninstall_on` DATE NULL,
    `is_active` ENUM('0', '1', '2', '3', '4', '5') NOT NULL,
    `temp_billing_on` DATE NULL,
    `app_plan` ENUM('1', '2', '3', '4') NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emojis` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `festival_name` VARCHAR(191) NOT NULL,
    `emoji_code` JSON NOT NULL,
    `images` JSON NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_id` BIGINT UNSIGNED NOT NULL,
    `image_path` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(191) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `attempts` TINYINT UNSIGNED NOT NULL,
    `reserved_at` INTEGER UNSIGNED NULL,
    `available_at` INTEGER UNSIGNED NOT NULL,
    `created_at` INTEGER UNSIGNED NOT NULL,

    INDEX `jobs_queue_index`(`queue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(191) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `my_effects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT NOT NULL,
    `effect_name` VARCHAR(191) NOT NULL,
    `my_date` DATE NOT NULL,
    `is_every_year` BOOLEAN NOT NULL DEFAULT false,
    `is_mix` BOOLEAN NOT NULL DEFAULT false,
    `my_images` JSON NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `media_ids` JSON NULL,
    `my_images_local` JSON NULL,
    `slug` VARCHAR(191) NULL,

    UNIQUE INDEX `my_effects_slug_unique`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `password_resets_email_index`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(191) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `personal_access_tokens_token_unique`(`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seasonal_festivals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT NOT NULL,
    `festival_list` JSON NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT NOT NULL,
    `greeting_title` VARCHAR(191) NULL,
    `greeting_message` TEXT NULL,
    `background_color` VARCHAR(255) NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `timer` INTEGER NULL,
    `title_color` VARCHAR(255) NULL,
    `media_type` ENUM('color', 'image') NOT NULL DEFAULT 'color',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shop_users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shopify_id` BIGINT UNSIGNED NOT NULL,
    `shop` VARCHAR(255) NOT NULL,
    `myshopify_domain` VARCHAR(255) NOT NULL,
    `domain` VARCHAR(255) NOT NULL,
    `currency` VARCHAR(255) NULL,
    `shopify_token` VARCHAR(255) NULL,
    `store_name` VARCHAR(255) NOT NULL,
    `store_email` VARCHAR(255) NOT NULL,
    `shop_owner` VARCHAR(191) NULL,
    `plan_name` VARCHAR(255) NULL,
    `charge_id` VARCHAR(255) NULL,
    `billing_on` TIMESTAMP(0) NULL,
    `activated_on` TIMESTAMP(0) NULL,
    `trial_ends_on` TIMESTAMP(0) NULL,
    `is_install` ENUM('1', '0') NOT NULL DEFAULT '0',
    `is_charge_approve` ENUM('1', '0') NOT NULL DEFAULT '0',
    `is_enabled` ENUM('1', '0') NOT NULL DEFAULT '0',
    `app_plan` ENUM('1', '2', '3', '4') NULL,
    `install_date` TIMESTAMP(0) NULL,
    `uninstall_date` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `is_app_updated` ENUM('1', '0') NOT NULL DEFAULT '0',
    `app_open_counter` INTEGER UNSIGNED NULL DEFAULT 0,
    `show_popup` ENUM('true', 'false') NOT NULL DEFAULT 'false',

    UNIQUE INDEX `shop_users_shopify_id_key`(`shopify_id`),
    UNIQUE INDEX `shop_users_shop_key`(`shop`),
    UNIQUE INDEX `shop_users_myshopify_domain_key`(`myshopify_domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_emojis` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shop_user_id` BIGINT NOT NULL,
    `festival_name` VARCHAR(191) NOT NULL,
    `emoji_code` JSON NULL,
    `pre_built_images` JSON NULL,
    `custom_images` JSON NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `custom_local_images` JSON NULL,
    `media_ids` JSON NULL,
    `image_details` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
