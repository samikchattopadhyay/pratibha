#!/bin/bash

# Database Restore Script
# Restores the database from a backup file

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lh "$(dirname "$0")/../backups"/pratibha_backup_*.sql 2>/dev/null | tail -10 || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "Backup file: $BACKUP_FILE"
echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
read -p "Continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

echo "🔄 Restoring database from backup..."

# Drop and recreate the database
docker exec -e PGPASSWORD=password123 pratibha_postgres psql -U pratibha -c "DROP DATABASE IF EXISTS pratibhaparishad WITH (FORCE);"
docker exec -e PGPASSWORD=password123 pratibha_postgres psql -U pratibha -c "CREATE DATABASE pratibhaparishad;"

# Restore the backup
docker exec -i -e PGPASSWORD=password123 pratibha_postgres psql -U pratibha -d pratibhaparishad < "$BACKUP_FILE"

echo "✅ Database restored successfully"
echo "📌 Don't forget to restart the dev server: npm run dev"
