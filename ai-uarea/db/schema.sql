-- ─────────────────────────────────────────────────────────────────────────────
-- AI UAREAnizer · schema for MariaDB 10.6+ / MySQL 8
-- ai.uarea.in — zero-touch multi-agent UAT orchestration
-- Apply with: npm run db:migrate
-- ─────────────────────────────────────────────────────────────────────────────

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `projects` (
  `id`          VARCHAR(64)  NOT NULL PRIMARY KEY,
  `key`         VARCHAR(48)  NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `baseUrl`     VARCHAR(255) NULL,
  `repoUrl`     VARCHAR(255) NULL,
  `driveFolder` VARCHAR(255) NULL,
  `env`         VARCHAR(32)  NOT NULL DEFAULT 'demo',
  `color`       VARCHAR(16)  NOT NULL DEFAULT '#22d3ee',
  `status`      VARCHAR(32)  NOT NULL DEFAULT 'active',
  `menus`       INT          NOT NULL DEFAULT 0,
  `owner`       VARCHAR(191) NULL,
  `createdAt`   DATETIME     NOT NULL,
  UNIQUE KEY `uq_project_key` (`key`),
  KEY `idx_project_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_models` (
  `id`            VARCHAR(64)  NOT NULL PRIMARY KEY,
  `name`          VARCHAR(191) NOT NULL,
  `vendor`        VARCHAR(96)  NOT NULL,
  `provider`      VARCHAR(32)  NOT NULL,
  `modelId`       VARCHAR(191) NOT NULL,
  `baseUrl`       VARCHAR(255) NULL,
  `keyEnv`        VARCHAR(96)  NULL,
  `contextK`      INT          NOT NULL DEFAULT 128,
  `costInPerM`    DECIMAL(10,4) NOT NULL DEFAULT 0,
  `costOutPerM`   DECIMAL(10,4) NOT NULL DEFAULT 0,
  `strengths`     JSON         NULL,
  `status`        VARCHAR(32)  NOT NULL DEFAULT 'active',
  `keyConfigured` TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agents` (
  `id`           VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId`    VARCHAR(64)  NULL,
  `name`         VARCHAR(191) NOT NULL,
  `role`         VARCHAR(48)  NOT NULL,
  `modelId`      VARCHAR(64)  NOT NULL,
  `avatar`       VARCHAR(16)  NOT NULL DEFAULT '🤖',
  `systemPrompt` TEXT         NULL,
  `tools`        JSON         NULL,
  `autonomy`     VARCHAR(32)  NOT NULL DEFAULT 'semi',
  `status`       VARCHAR(32)  NOT NULL DEFAULT 'active',
  `runsTotal`    INT          NOT NULL DEFAULT 0,
  `passRate`     INT          NOT NULL DEFAULT 0,
  `lastActiveAt` DATETIME     NULL,
  KEY `idx_agent_project` (`projectId`),
  KEY `idx_agent_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flows` (
  `id`           VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId`    VARCHAR(64)  NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `module`       VARCHAR(96)  NULL,
  `description`  TEXT         NULL,
  `steps`        JSON         NULL,
  `tags`         JSON         NULL,
  `browsers`     JSON         NULL,
  `version`      INT          NOT NULL DEFAULT 1,
  `status`       VARCHAR(32)  NOT NULL DEFAULT 'draft',
  `updatedAt`    DATETIME     NOT NULL,
  `lastPassRate` INT          NULL,
  `createdBy`    VARCHAR(191) NULL,
  KEY `idx_flow_project` (`projectId`),
  KEY `idx_flow_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `runs` (
  `id`            VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId`     VARCHAR(64)  NOT NULL,
  `flowId`        VARCHAR(64)  NOT NULL,
  `agentId`       VARCHAR(64)  NULL,
  `modelId`       VARCHAR(64)  NULL,
  `trigger`       VARCHAR(32)  NOT NULL DEFAULT 'manual',
  `status`        VARCHAR(32)  NOT NULL DEFAULT 'queued',
  `browser`       VARCHAR(48)  NULL,
  `env`           VARCHAR(32)  NULL,
  `startedAt`     DATETIME     NULL,
  `finishedAt`    DATETIME     NULL,
  `durationMs`    INT          NOT NULL DEFAULT 0,
  `passed`        INT          NOT NULL DEFAULT 0,
  `failed`        INT          NOT NULL DEFAULT 0,
  `skipped`       INT          NOT NULL DEFAULT 0,
  `total`         INT          NOT NULL DEFAULT 0,
  `verdict`       VARCHAR(255) NULL,
  `summary`       TEXT         NULL,
  `aiAnalysis`    TEXT         NULL,
  `evidenceCount` INT          NOT NULL DEFAULT 0,
  `commit`        VARCHAR(64)  NULL,
  `createdAt`     DATETIME     NOT NULL,
  KEY `idx_run_project` (`projectId`),
  KEY `idx_run_flow` (`flowId`),
  KEY `idx_run_status` (`status`),
  KEY `idx_run_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `run_steps` (
  `id`         VARCHAR(96)  NOT NULL PRIMARY KEY,
  `runId`      VARCHAR(64)  NOT NULL,
  `idx`        INT          NOT NULL DEFAULT 0,
  `kind`       VARCHAR(48)  NOT NULL,
  `name`       VARCHAR(255) NOT NULL,
  `status`     VARCHAR(32)  NOT NULL DEFAULT 'pending',
  `startedAt`  DATETIME     NULL,
  `durationMs` INT          NOT NULL DEFAULT 0,
  `detail`     TEXT         NULL,
  `evidence`   VARCHAR(255) NULL,
  `aiNote`     TEXT         NULL,
  KEY `idx_step_run` (`runId`, `idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `issues` (
  `id`           VARCHAR(64)  NOT NULL PRIMARY KEY,
  `key`          VARCHAR(64)  NOT NULL,
  `projectId`    VARCHAR(64)  NOT NULL,
  `runId`        VARCHAR(64)  NULL,
  `flowId`       VARCHAR(64)  NULL,
  `title`        VARCHAR(255) NOT NULL,
  `description`  TEXT         NULL,
  `severity`     VARCHAR(8)   NOT NULL DEFAULT 'S3',
  `status`       VARCHAR(32)  NOT NULL DEFAULT 'open',
  `source`       VARCHAR(32)  NOT NULL DEFAULT 'uat',
  `assignee`     VARCHAR(191) NULL,
  `agentId`      VARCHAR(64)  NULL,
  `githubUrl`    VARCHAR(255) NULL,
  `fixBranch`    VARCHAR(191) NULL,
  `fixPrUrl`     VARCHAR(255) NULL,
  `recheckRunId` VARCHAR(64)  NULL,
  `labels`       JSON         NULL,
  `createdAt`    DATETIME     NOT NULL,
  `updatedAt`    DATETIME     NOT NULL,
  `closedAt`     DATETIME     NULL,
  UNIQUE KEY `uq_issue_key` (`key`),
  KEY `idx_issue_project` (`projectId`),
  KEY `idx_issue_status` (`status`),
  KEY `idx_issue_sev` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `schedules` (
  `id`         VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId`  VARCHAR(64)  NOT NULL,
  `flowId`     VARCHAR(64)  NOT NULL,
  `name`       VARCHAR(191) NOT NULL,
  `cadence`    VARCHAR(32)  NOT NULL DEFAULT 'daily',
  `timeOfDay`  VARCHAR(8)   NOT NULL DEFAULT '09:00',
  `timezone`   VARCHAR(64)  NOT NULL DEFAULT 'Asia/Bangkok',
  `agentId`    VARCHAR(64)  NULL,
  `env`        VARCHAR(32)  NULL,
  `nextRunAt`  DATETIME     NULL,
  `lastRunAt`  DATETIME     NULL,
  `lastStatus` VARCHAR(32)  NULL,
  `status`     VARCHAR(32)  NOT NULL DEFAULT 'active',
  `notify`     JSON         NULL,
  KEY `idx_schedule_project` (`projectId`),
  KEY `idx_schedule_next` (`nextRunAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `id`        VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId` VARCHAR(64)  NULL,
  `runId`     VARCHAR(64)  NULL,
  `issueId`   VARCHAR(64)  NULL,
  `actor`     VARCHAR(191) NOT NULL,
  `kind`      VARCHAR(64)  NOT NULL,
  `level`     VARCHAR(16)  NOT NULL DEFAULT 'info',
  `message`   TEXT         NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  KEY `idx_event_created` (`createdAt`),
  KEY `idx_event_project` (`projectId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `docs` (
  `id`        VARCHAR(64)  NOT NULL PRIMARY KEY,
  `projectId` VARCHAR(64)  NOT NULL,
  `kind`      VARCHAR(48)  NOT NULL,
  `title`     VARCHAR(255) NOT NULL,
  `status`    VARCHAR(32)  NOT NULL DEFAULT 'draft',
  `language`  VARCHAR(16)  NOT NULL DEFAULT 'th',
  `words`     INT          NOT NULL DEFAULT 0,
  `content`   LONGTEXT     NULL,
  `updatedAt` DATETIME     NOT NULL,
  KEY `idx_doc_project` (`projectId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `integrations` (
  `id`          VARCHAR(64)  NOT NULL PRIMARY KEY,
  `kind`        VARCHAR(48)  NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `status`      VARCHAR(32)  NOT NULL DEFAULT 'disconnected',
  `account`     VARCHAR(255) NULL,
  `config`      JSON         NULL,
  `lastSyncAt`  DATETIME     NULL,
  `health`      INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `policies` (
  `id`          VARCHAR(64)  NOT NULL PRIMARY KEY,
  `name`        VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `value`       JSON         NULL,
  `kind`        VARCHAR(32)  NOT NULL DEFAULT 'text',
  `options`     JSON         NULL,
  `group`       VARCHAR(32)  NOT NULL DEFAULT 'quality'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id`          VARCHAR(64)  NOT NULL PRIMARY KEY,
  `email`       VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `role`        VARCHAR(32)  NOT NULL DEFAULT 'viewer',
  `avatar`      VARCHAR(16)  NULL,
  `lastLoginAt` DATETIME     NULL,
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mcp_tokens` (
  `id`         VARCHAR(64)  NOT NULL PRIMARY KEY,
  `name`       VARCHAR(191) NOT NULL,
  `tokenHash`  VARCHAR(128) NOT NULL,
  `scopes`     JSON         NULL,
  `createdAt`  DATETIME     NOT NULL,
  `lastUsedAt` DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
