# Windows 11 Automatic Backup Setup

## Setup Instructions (3 Steps)

### Step 1: Run the Setup Script

1. **Navigate to scripts folder:**
   ```
   cd C:\Development\pratibha\scripts
   ```

2. **Right-click on `setup-backup-schedule.bat`**

3. **Select "Run as administrator"** (this is required to create the scheduled task)

4. You should see:
   ```
   ✅ Task created successfully!
   ```

### Step 2: Verify the Task

1. **Open Task Scheduler:**
   - Press `Win + R`
   - Type: `taskschd.msc`
   - Press Enter

2. **Find your task:**
   - Left panel: `Task Scheduler Library`
   - Search for: `Pratibha Database Backup Daily`
   - Status should show: **Ready**

3. **Verify trigger:**
   - Right-click the task → Properties
   - Go to **Triggers** tab
   - Should show: `Daily at 10:00 PM`

### Step 3: Test the Backup

Run the backup script manually to verify it works:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Development\pratibha\scripts\backup-db.ps1"
```

You should see:
```
[2026-05-27 13:00:00] Starting database backup...
[2026-05-27 13:00:00] Backup created: ...pratibha_backup_20260527_130000.sql (118 KB)
[2026-05-27 13:00:00] Backup completed successfully
```

---

## Scheduled Backup Details

| Setting | Value |
|---------|-------|
| **Task Name** | Pratibha Database Backup Daily |
| **Schedule** | Daily at 10:00 PM (22:00) |
| **Script** | `C:\Development\pratibha\scripts\backup-db.ps1` |
| **Retention** | Last 10 backups (auto-cleanup) |
| **Log File** | `C:\Development\pratibha\backups\backup.log` |

---

## Backup Management

### View Recent Backups
```
C:\Development\pratibha\backups\
```

### View Backup Logs
```
C:\Development\pratibha\backups\backup.log
```

### Manual Backup Anytime
```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Development\pratibha\scripts\backup-db.ps1"
```

### Restore from Backup
```bash
bash C:\Development\pratibha\scripts\restore-db.sh C:\Development\pratibha\backups\pratibha_backup_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting

### Task Didn't Create?

**If "Access Denied" error:**
- The script must run as Administrator
- Right-click setup-backup-schedule.bat and select "Run as administrator"

**If Docker not found:**
- Ensure Docker Desktop is running
- Test: `docker ps` in PowerShell

### Task Created But Not Running?

1. Open Task Scheduler (taskschd.msc)
2. Right-click the task
3. Click **Run** to test manually
4. Check history tab for errors

### Need to Delete the Task?

```powershell
Unregister-ScheduledTask -TaskName "Pratibha Database Backup Daily" -Confirm:$false
```

---

## What Gets Backed Up

- ✅ All PostgreSQL databases and tables
- ✅ Users, Students, Competitions, Registrations
- ✅ Judge Assignments, Scores, Certificates
- ✅ All metadata and relationships

---

## Next Steps

✅ Backups now automated at 10 PM daily  
✅ Last 10 backups kept automatically  
✅ Can restore anytime in seconds  

**Remember:** Backups are only useful if you test restoration! Run a test restore monthly to confirm everything works.
