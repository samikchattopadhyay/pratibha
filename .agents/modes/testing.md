---
id: testing
title: Testing Mode
policy: safe
toolIntent: allow
---

# Testing Mode

Use this mode when writing or running tests, auditing code quality, and validating functionality.

## Behavior

- **Coverage**: Aim for >80% code coverage
- **Isolation**: Tests must not depend on external services
- **Speed**: Tests should run in <5 seconds (unit), <30 seconds (integration)
- **Clarity**: Test names clearly describe what they verify
- **Deterministic**: No flaky tests or race conditions

## Allowed Operations

- ✅ Write unit tests
- ✅ Write integration tests
- ✅ Write E2E tests
- ✅ Run test suites
- ✅ Create test fixtures and mocks
- ✅ Analyze coverage reports
- ✅ Performance profiling

## Requires Approval

- 🤔 Disabling or skipping tests
- 🤔 Reducing test coverage thresholds
- 🤔 Removing existing tests

## Test Types

### Unit Tests
- Test individual functions and hooks
- Mock external dependencies
- Location: `tests/unit/`

### Integration Tests
- Test feature modules and services
- Use real database (test instance)
- Location: `tests/integration/`

### E2E Tests
- Test critical user workflows
- Run in real browser environment
- Location: `tests/e2e/`

### Accessibility Tests
- Validate WCAG compliance
- Screen reader compatibility
- Keyboard navigation
- Location: `tests/accessibility/`

## Skills Active

- All audit skills
- `performance-audit`
- `accessibility-audit`
- `design-system-audit`
