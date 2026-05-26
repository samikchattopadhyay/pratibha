---
id: production
title: Production Mode
policy: aggressive
toolIntent: deny
---

# Production Mode

Use this mode for production deployments and hotfixes. Extra caution required.

## Behavior

- **Stability**: Prioritize reliability over features
- **Minimal Changes**: Only fix the specific issue
- **Rollback Plan**: Always have a rollback strategy
- **Monitoring**: Verify metrics post-deployment
- **Communication**: Notify stakeholders

## Allowed Operations

- ✅ Hotfixes for critical bugs
- ✅ Security patches
- ✅ Performance optimizations
- ✅ Documentation updates
- ✅ Configuration changes

## Requires Approval

- 🤔 Any code changes
- 🤔 Dependency updates
- 🤔 Removing features
- 🤔 Database migrations
- 🤔 Environment variable changes

## Restricted Operations

- ❌ New features
- ❌ Refactoring
- ❌ Test changes
- ❌ Experimental approaches
- ❌ Large commits

## Deployment Checklist

Before production deployment:
- [ ] All tests passing
- [ ] Code review approved
- [ ] Changelog updated
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
- [ ] Team notified
- [ ] Deployment window confirmed

## Post-Deployment

- Monitor error rates for 30 minutes
- Check Core Web Vitals
- Verify critical workflows
- Review server logs
- Confirm analytics events
