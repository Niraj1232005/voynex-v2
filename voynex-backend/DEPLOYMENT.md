# Voynex Deployment & Environment Configuration Guide

This guide describes how to configure, bootstrap, and deploy the Voynex backend application in staging and production environments.

## Staging & Production Configuration

In staging/production environments, **never** set `DB_SYNCHRONIZE=true`. Running database synchronization in production is dangerous and can lead to accidental data loss or drift. Instead, manage database schemas using TypeORM migrations.

### Environment Variable Settings

Configure the following variables in your staging/production host environments:

| Variable | Staging Recommended | Production Recommended | Description |
| :--- | :--- | :--- | :--- |
| `DB_SYNCHRONIZE` | `false` | `false` | Disables automated schema synchronization. |
| `DB_MIGRATIONS_RUN` | `true` | `true` | Runs pending migrations on application start. |
| `NODE_ENV` | `production` | `production` | Enables production optimizations. |

---

## Deployment Bootstrapping Order

To deploy or release new versions of the application, follow this execution sequence:

### 1. Build the Application
Generate the production-ready JavaScript bundle:
```bash
npm run build
```

### 2. Execute Migrations
Apply any new schema alterations to your target database. If `DB_MIGRATIONS_RUN=true` is set in the environment variables, the NestJS application handles this step automatically on start. To run migrations manually instead:
```bash
npm run migration:run
```

### 3. Seed Realistic Staging Data (Optional / Staging Only)
To seed realistic organizations, user logins, and trips with complete itinerary details into staging or local verification environments:
```bash
npm run seed
```
> [!WARNING]
> Running `npm run seed` clears existing bookings, payments, reviews, and test trips. Do **not** run this command in production.

### 4. Start the Application
Launch the NestJS production server process:
```bash
npm run start:prod
```
