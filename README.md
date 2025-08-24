# PowerSync OPFS Disk I/O Error Reproduction

This repository contains a minimal reproduction case for a PowerSync OPFS Disk I/O error.

## Setup and Reproduction Steps

### 1. Spin up docker containers

```bash
docker compose up -d
```

### 2. Run Database Migration

Ensure a .env file is present with DATABASE_URL ( cp .env.example .env )

Apply the database migrations:

```bash
npm run db:migrate
```

### 3. Seed the Database

Populate the database with test data:

```bash
npm run db:generate
npm run db:seed
```

### 4. Wait for PowerSync Replication

Wait for PowerSync to complete its initial replication with the PostgreSQL database.

### 5. Run the Test

Execute the test script to reproduce the issue:

```bash
npm test
```

## Test Details

The test (`src/powersync-connection.test.ts`) performs the following:

1. Creates a PowerSync database instance with OPFSCoopSyncVFS
2. Initializes raw tables
3. Connects to the PowerSync service using a test token
4. Waits for the initial sync to complete
5. Verifies the connection and sync status

## Authentication

The test uses a dev token generated using the `test-client` for authentication with the PowerSync service. The token is hardcoded in the test file.

## Expected Issue

The test should demonstrate the "Error: disk I/O error" during initial sync, provided by
`status.dataFlowStatus?.downloadError`
