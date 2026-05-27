# Database Backup & Recovery Strategy

## What Happened

On **2026-05-27 12:57 UTC**, the development database was accidentally reset using `npx prisma db push --force-reset`, which dropped all tables and data. This was a **destructive operation that should have required explicit permission** and a backup beforehand.

**Root Cause**: Attempting to resolve a Prisma migration error without first backing up the database.

**Data Lost**: All manually-created data in competitions, registrations, judge assignments, scores, and related records.

---

## Recovery Approach

### Immediate Recovery ❌
- **Full recovery is not possible** without a prior backup
- The Docker volume `pgdata` was reset and cannot be recovered post-deletion

### Data Reconstruction ✅
1. **Seed data** (in `prisma/seed.ts`):
   - 50 test students
   - 2 test competitions
   - 5 test judges
   - 100+ test registrations with scores

2. Run: `npx ts-node prisma/seed.ts`

---

## Going Forward: Backup Strategy

### 1. **Automatic Daily Backups**

Create a cron job to back up daily:

```bash
# Add to your system cron (crontab -e on Linux/Mac, Task Scheduler on Windows)
# Every day at 2 AM local time
0 2 * * * cd /path/to/pratibha && bash scripts/backup-db.sh
```

**Windows Users**: Use Task Scheduler to run `scripts/backup-db.sh` daily.

### 2. **Manual Backup Before Destructive Operations**

**ALWAYS** create a backup before:
- Running `prisma migrate reset`
- Running `prisma db push --force-reset`
- Testing database operations
- Making large schema changes

```bash
# Create a backup
bash scripts/backup-db.sh

# Now run the risky operation
npx prisma migrate reset
```

### 3. **Pre-Commit Backups (Git Hook)**

Create `.git/hooks/pre-commit` to backup before commits:

```bash
#!/bin/bash
# Only backup if schema.prisma changed
if git diff --cached --name-only | grep -q "prisma/schema.prisma"; then
  bash scripts/backup-db.sh
fi
```

---

## Using Backup Scripts

### Create a Backup

```bash
# Creates backups/pratibha_backup_YYYYMMDD_HHMMSS.sql
bash scripts/backup-db.sh

# List available backups
ls -lh backups/pratibha_backup_*.sql
```

### Restore from Backup

```bash
# List available backups
bash scripts/restore-db.sh

# Restore specific backup
bash scripts/restore-db.sh backups/pratibha_backup_20260527_125712.sql

# Restore latest backup
bash scripts/restore-db.sh $(ls -t backups/pratibha_backup_*.sql | head -1)
```

### Backup Retention

- **Automatic cleanup**: Backups directory keeps only the **last 10 backups**
- **Manual cleanup**: Delete old backups manually if needed
  ```bash
  rm backups/pratibha_backup_20260520_*.sql  # Delete May 20th backups
  ```

---

## Docker Volume Backup (Alternative)

For deeper recovery, back up the entire Docker volume:

```bash
# Back up the pgdata volume
docker run --rm -v pgdata:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/pgdata_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restore the volume
docker volume rm pgdata
docker run --rm -v pgdata:/data -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/pgdata_YYYYMMDD_HHMMSS.tar.gz -C /data
```

---

## Best Practices

✅ **DO**:
- Back up before running `--force-reset`, `migrate reset`, or `db push --force-reset`
- Run `bash scripts/backup-db.sh` before schema changes
- Keep backups for at least 7 days
- Test restore procedures monthly
- Document any manual data changes

❌ **DON'T**:
- Run `prisma db push --force-reset` without permission
- Skip backups for "quick fixes"
- Delete backup files without verification
- Trust that Docker volumes persist safely without backups

---

## Current Backup Status

**Last Backup**: `backups/pratibha_backup_20260527_125712.sql` (116 KB)

**To Restore**: `bash scripts/restore-db.sh backups/pratibha_backup_20260527_125712.sql`

---

## Questions?

Contact the team if you need help recovering data or understanding the backup system.
