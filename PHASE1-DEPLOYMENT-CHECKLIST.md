# Phase 1 Deployment Checklist

**Use this checklist to deploy Phase 1 to production**

---

## Pre-Deployment

- [ ] Code reviewed by team lead
- [ ] All tests passing locally: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Verified in staging environment (if available)
- [ ] Stakeholders informed of deployment

---

## Deployment Day

### 1. Pre-Deployment Backup
- [ ] Backup PostgreSQL database
  ```bash
  pg_dump -h localhost -U postgres -d pratibhaparishad > backup_$(date +%Y%m%d).sql
  ```

### 2. Deploy Code
- [ ] Merge Phase 1 PR to main branch
- [ ] Deploy application to production
  ```bash
  # Typical deployment (depends on your infrastructure)
  git pull origin main
  npm install
  npm run build
  # Restart app service
  ```

### 3. Run Database Migration
- [ ] Apply Prisma migrations
  ```bash
  npx prisma migrate deploy
  ```
  
  **What it does:**
  - Creates DeliveryStatus enum
  - Creates DeliveryErrorType enum
  - Creates TelegramMessageDelivery table
  - Adds indexes for performance
  - Updates Notification model relation

- [ ] Verify migration success (check database logs)
- [ ] Confirm TelegramMessageDelivery table exists
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_name = 'TelegramMessageDelivery';
  ```

### 4. Verify Deployment
- [ ] Application starts without errors
  ```bash
  npm run dev
  ```
  Look for: "✓ Ready in XXXms"

- [ ] API endpoints accessible
  ```bash
  curl http://localhost:3000/api/admin/notifications/telegram/delivery-status
  # Should return 401 (not authenticated) or 403 (forbidden), not 404
  ```

- [ ] No error logs related to TelegramMessageDelivery

---

## Post-Deployment Configuration

### 1. Enable Automatic Retry (CRITICAL)
The cron job automatically retries failed messages. Schedule it to run every 5-10 minutes.

**Option A: Using External Cron Service**
- [ ] Set up in Vercel Cron (if using Vercel)
  ```
  Add to vercel.json:
  {
    "crons": [{
      "path": "/api/cron/telegram-retry",
      "schedule": "*/5 * * * *"
    }]
  }
  ```

- [ ] Or use external service (cron-job.org, AWS EventBridge, etc.)
  ```bash
  curl -X POST https://yourapp.com/api/cron/telegram-retry \
    -H "Authorization: Bearer $CRON_SECRET"
  ```

- [ ] Or add to system crontab
  ```bash
  */5 * * * * curl -X POST https://yourapp.com/api/cron/telegram-retry \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json"
  ```

### 2. Verify Cron Secret
- [ ] Ensure `CRON_SECRET` environment variable is set
  ```bash
  echo $CRON_SECRET
  # Should output your secret (don't commit this!)
  ```

- [ ] Test cron endpoint manually
  ```bash
  curl -X POST http://localhost:3000/api/cron/telegram-retry \
    -H "Authorization: Bearer test-secret"
  # Should return 401 (invalid token) or 200 (success)
  ```

### 3. Set Up Monitoring
- [ ] Add dashboard alert for delivery failures
- [ ] Set up log aggregation to track errors
- [ ] Configure notification for PERMANENTLY_FAILED > 50

---

## Testing Phase (First 24 Hours)

### Smoke Tests
- [ ] Send a test Telegram notification
  ```typescript
  await createAndDispatchNotification({
    userId: "test-user",
    type: NotificationType.CERTIFICATE_READY,
    title: "Test Certificate",
    body: "This is a test notification",
    recipientPhone: "YOUR_TELEGRAM_CHAT_ID"
  });
  ```

- [ ] Check delivery status API
  ```bash
  curl "http://localhost:3000/api/admin/notifications/telegram/delivery-status" \
    -H "Authorization: Bearer <admin-token>"
  # Should show your test message as SENT
  ```

- [ ] Verify message received on Telegram
  - You should receive the test message in Telegram

### Error Handling Tests
- [ ] Test with invalid chat ID
  - Should show PERMANENTLY_FAILED status
  - Error type should be INVALID_CHAT

- [ ] Test rate limiting (if applicable)
  - Send 100 messages rapidly
  - Should show mix of SENT and TEMPORARILY_FAILED
  - Cron job should retry TEMPORARILY_FAILED later

### Admin API Tests
- [ ] Test delivery-status API with filters
  ```bash
  # Get failed messages
  curl "http://localhost:3000/api/admin/notifications/telegram/delivery-status?status=PERMANENTLY_FAILED"
  
  # Get specific chat
  curl "http://localhost:3000/api/admin/notifications/telegram/delivery-status?chatId=YOUR_ID"
  
  # Get sent messages
  curl "http://localhost:3000/api/admin/notifications/telegram/delivery-status?status=SENT&limit=10"
  ```

- [ ] Test manual retry API
  ```bash
  curl -X POST "http://localhost:3000/api/admin/notifications/telegram/retry?limit=5"
  # Should show attempted/succeeded/failed counts
  ```

- [ ] Test cron retry endpoint
  ```bash
  curl -X POST "http://localhost:3000/api/cron/telegram-retry" \
    -H "Authorization: Bearer $CRON_SECRET"
  # Should return success with processing results
  ```

---

## Production Validation (First Week)

### Daily Checks
- [ ] **Day 1:** Verify at least 10 Telegram messages sent successfully
  - Check delivery rate: `GET /api/admin/notifications/telegram/delivery-status`
  - Delivery rate should be 100% (no failures yet)

- [ ] **Day 2-3:** Continue monitoring, no critical errors
  - Check PERMANENTLY_FAILED count: Should be 0 or very low
  - Check cron job logs: Should be retrying successfully

- [ ] **Day 4-7:** Monitor for issues
  - Watch for sustained PERMANENTLY_FAILED rate
  - Verify retry cron is running (check logs)
  - No orphaned messages stuck in QUEUED/SENDING

### Metrics to Track
```
Delivery Rate = SENT / (SENT + PERMANENTLY_FAILED) * 100%
Target: >= 98%

Queue Health:
- QUEUED: Should be <10 (being processed)
- SENDING: Should be 0 (transient state)
- TEMPORARILY_FAILED: Should decrease over time (being retried)

Retry Success:
- Check cron job output: succeeded / attempted ratio
- Target: >= 90%
```

### Issues to Watch For
| Issue | Sign | Resolution |
|-------|------|-----------|
| Cron not running | TEMPORARILY_FAILED count stays high | Check cron schedule, verify CRON_SECRET |
| High rate limiting | Many TEMPORARILY_FAILED with RATE_LIMITED | Reduce message volume or adjust backoff |
| Database growing large | TelegramMessageDelivery table > 100MB | Archive old records (implement cleanup) |
| Duplicate messages | User sees same message twice | Check for duplicate notifications (app bug) |

---

## Post-Deployment Documentation

- [ ] Update internal docs with new APIs
- [ ] Train admin team on delivery-status UI (Phase 2)
- [ ] Document manual retry process
- [ ] Add monitoring dashboard link to team wiki
- [ ] Create runbook for common issues

---

## Rollback Plan (if needed)

If critical issues arise:

1. **Immediate:** Disable cron job
   ```bash
   # Stop cron from retrying (temporarily)
   # But keep app running (don't roll back)
   ```

2. **Investigate:** Check logs and delivery records
   ```sql
   SELECT status, COUNT(*) FROM "TelegramMessageDelivery"
   GROUP BY status;
   ```

3. **If must rollback:**
   ```bash
   # Git rollback (lose delivery records, but stop issues)
   git revert <commit-hash>
   npm run build
   npx prisma migrate resolve --rolled-back add_telegram_delivery_tracking
   # Redeploy
   ```

⚠️ **Note:** Rollback loses delivery tracking data. Only do if absolutely necessary.

---

## Sign-Off

- [ ] **Deployed by:** _________________ **Date:** _________
- [ ] **Verified by:** _________________ **Date:** _________
- [ ] **Approved by:** _________________ **Date:** _________

**Deployment Status:** ☐ Complete ☐ Partial ☐ Rolled Back

**Notes:**
```
[Add any deployment notes here]
```

---

## Appendix: Quick Commands

### View Delivery Status
```bash
curl "https://yourapp.com/api/admin/notifications/telegram/delivery-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Retry Failed Messages
```bash
curl -X POST "https://yourapp.com/api/admin/notifications/telegram/retry?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Run Cron Manually
```bash
curl -X POST "https://yourapp.com/api/cron/telegram-retry" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Check Database
```sql
-- Delivery statistics
SELECT status, COUNT(*) as count FROM "TelegramMessageDelivery"
GROUP BY status ORDER BY count DESC;

-- Failed deliveries
SELECT * FROM "TelegramMessageDelivery"
WHERE status = 'PERMANENTLY_FAILED'
ORDER BY createdAt DESC LIMIT 10;

-- Pending retries
SELECT * FROM "TelegramMessageDelivery"
WHERE status = 'TEMPORARILY_FAILED'
AND "nextRetryAt" <= NOW()
ORDER BY "nextRetryAt" ASC LIMIT 20;
```

### View Logs
```bash
# Deployment logs
tail -f /var/log/app.log

# Search for Telegram errors
grep -i "telegram\|delivery" /var/log/app.log

# Search for cron job
grep -i "telegram-retry\|cron" /var/log/app.log
```

---

**For questions or issues, contact: [Support Contact]**
