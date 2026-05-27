#!/bin/bash

# Database Backup Script
# Creates a timestamped SQL dump of the PostgreSQL database

set -e

BACKUP_DIR="$(dirname "$0")/../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pratibha_backup_${TIMESTAMP}.sql"

# Ensure backups directory exists
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating database backup..."
docker exec pratibha_postgres pg_dump -U pratibha -d pratibhaparishad > "$BACKUP_FILE"

if [ -s "$BACKUP_FILE" ]; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created: $BACKUP_FILE ($FILE_SIZE)"

  # Keep only the last 10 backups
  echo "🧹 Cleaning old backups (keeping last 10)..."
  ls -t "$BACKUP_DIR"/pratibha_backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm

  echo "📊 Current backups:"
  ls -lh "$BACKUP_DIR"/pratibha_backup_*.sql | tail -5
else
  echo "❌ Backup failed - file is empty"
  exit 1
fi
