# Test Suite Documentation

This directory contains a comprehensive test suite for the Clarity Done GTD productivity application. The test architecture is designed to ensure reliability, maintainability, and comprehensive coverage of all application functionality.

## 🏗️ Test Architecture

### Test Types and Structure

```
tests/
├── unit/                     # Unit tests (Vitest)
│   ├── hooks/               # Custom React hooks
│   ├── components/          # React components
│   └── utils/               # Utility functions
├── integration/             # Integration tests (Vitest)
│   ├── auth/               # Authentication flows
│   ├── data/               # Data synchronization
│   └── api/                # API endpoints
├── e2e/                    # End-to-end tests (Playwright)
│   ├── auth/               # Authentication workflows
│   ├── capture/            # Task capture flows
│   ├── organize/           # Task organization
│   ├── review/             # Review workflows
│   ├── engage/             # Task engagement
│   └── pages/              # Page Object Models
├── a11y/                   # Accessibility tests (Playwright + axe)
├── setup/                  # Test setup and configuration
├── fixtures/               # Test data and mocks
├── utils/                  # Test utilities and helpers
└── __mocks__/              # Mock implementations
```

## 🧪 Test Technologies

- **Unit/Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Accessibility Tests**: Playwright + axe-core
- **Visual Testing**: Playwright screenshots
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: Vitest coverage (v8)

## 🚀 Running Tests

### Prerequisites

```bash
npm install
```

### Test Commands

```bash
# All tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Unit tests with watch mode
npm run test:watch

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests in headed mode
npm run test:e2e:headed

# Accessibility tests
npm run test:a11y

# Mobile-specific tests
npm run test:mobile

# Performance tests
npm run test:performance
```

### Environment Setup

1. Copy environment variables:
```bash
cp .env.local.example .env.local
```

2. For E2E tests, ensure the application is running:
```bash
npm run dev
# or
npm run build && npm run start
```

## 📋 Test Coverage

### Current Coverage Targets

- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

### Coverage Areas

✅ **Authentication**
- Email/OTP login flow
- Session management
- Route protection
- Error handling

✅ **Task Management**
- Task creation and capture
- Task status transitions
- CRUD operations
- Real-time synchronization

✅ **GTD Workflows**
- Capture → Clarify → Organize
- Daily and weekly reviews
- Task engagement and filtering
- Project management

✅ **User Interface**
- Component rendering
- User interactions
- Form validation
- Error states

✅ **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast

✅ **Mobile Experience**
- Touch interactions
- Responsive layouts
- Performance on mobile
- PWA functionality

## 🎯 Testing Strategy

### Unit Tests
- **Scope**: Individual functions, components, and hooks
- **Focus**: Logic, state management, edge cases
- **Tools**: Vitest, React Testing Library
- **Mocking**: Supabase client, external dependencies

### Integration Tests
- **Scope**: Component interactions, data flows
- **Focus**: Authentication, API integration, real-time features
- **Tools**: Vitest, MSW for API mocking
- **Database**: Mock Supabase responses

### E2E Tests
- **Scope**: Complete user workflows
- **Focus**: Critical paths, cross-browser compatibility
- **Tools**: Playwright with multiple browsers
- **Data**: Seeded test data, isolated test environments

### Accessibility Tests
- **Scope**: WCAG compliance, keyboard navigation
- **Focus**: Screen reader support, color contrast
- **Tools**: Playwright + axe-core
- **Standards**: WCAG 2.1 AA

## 🛠️ Page Object Model

E2E tests use the Page Object Model pattern for maintainability:

```typescript
// Example usage
const loginPage = new LoginPage(page)
const dashboardPage = new DashboardPage(page)

await loginPage.goto()
await loginPage.completeLogin('test@example.com')
await dashboardPage.expectToBeLoaded()
await dashboardPage.captureTask('Test task')
```

### Base Page Class

All page objects extend `BasePage` which provides:
- Common navigation methods
- Wait helpers
- Assertion helpers
- Mobile-specific interactions
- Keyboard shortcuts
- Error handling

## 🔧 Test Configuration

### Vitest Configuration
- **Environment**: jsdom for DOM simulation
- **Setup**: Automatic mocking of Next.js and Supabase
- **Coverage**: v8 provider with HTML reports
- **Reporters**: Verbose console + JUnit XML

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: iPhone 12, Pixel 5, iPad Pro
- **Reporters**: HTML, JUnit, JSON
- **Retry**: 2 retries in CI, 0 locally
- **Parallel**: Full parallelization

## 📊 Test Data Management

### Fixtures
- Predefined test data for consistent testing
- Factory functions for generating test objects
- Mock Supabase responses
- Test user credentials

### Mocking Strategy
- **API Calls**: MSW for HTTP interception
- **Supabase**: Complete client mocking
- **External Services**: Stubbed responses
- **Time**: Fake timers for deterministic tests

## 🚨 Error Handling

### Test Reliability
- Automatic retries for flaky tests
- Wait strategies for async operations
- Proper cleanup and teardown
- Isolated test environments

### Debugging
- Screenshots on failure
- Video recordings for E2E tests
- Console error capturing
- Network request logging

## 📱 Mobile Testing

### Approach
- Device simulation with proper viewports
- Touch interaction testing
- Performance validation
- Responsive layout verification

### Devices Tested
- **Phones**: iPhone 12, Pixel 5
- **Tablets**: iPad Pro
- **Orientations**: Portrait and landscape

## ♿ Accessibility Testing

### Automated Checks
- **axe-core**: Comprehensive WCAG rule validation
- **Color Contrast**: AA compliance verification
- **Keyboard Navigation**: Tab order and focus management
- **ARIA**: Proper usage of ARIA attributes

### Manual Testing Areas
- Screen reader compatibility
- Voice control support
- High contrast mode
- Reduced motion preferences

## 🔄 CI/CD Integration

### GitHub Actions Workflow
- **Unit Tests**: Fast feedback on every commit
- **E2E Tests**: Multi-browser testing matrix
- **Accessibility**: Automated a11y validation
- **Mobile**: Device-specific test execution
- **Performance**: Benchmark validation

### Test Reports
- **Coverage**: Codecov integration
- **Results**: JUnit XML for CI systems
- **Artifacts**: Screenshots, videos, reports
- **Notifications**: Slack/email on failures

## 📈 Performance Testing

### Metrics Tracked
- **Task Capture**: < 5 seconds end-to-end
- **Page Load**: < 3 seconds initial load
- **Interaction**: < 100ms response time
- **Memory**: No significant leaks

### Tools
- Playwright performance APIs
- Web Vitals measurement
- Memory usage tracking
- Network performance analysis

## 🧹 Maintenance

### Best Practices
- **Selectors**: Use `data-testid` attributes
- **Waiting**: Explicit waits over implicit timeouts
- **Assertions**: Specific, meaningful assertions
- **Cleanup**: Proper test isolation and cleanup

### Code Quality
- **ESLint**: Consistent code style
- **TypeScript**: Type safety
- **Comments**: Clear test descriptions
- **Structure**: Logical test organization

## 🆘 Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Add explicit waits
   - Check for race conditions
   - Verify test isolation

2. **Slow Tests**
   - Optimize selectors
   - Reduce unnecessary waits
   - Parallelize test execution

3. **Mock Issues**
   - Verify mock setup
   - Check MSW handlers
   - Ensure proper cleanup

### Debugging Tips

1. **Run tests in headed mode**: `npm run test:e2e:headed`
2. **Use Playwright UI**: `npm run test:e2e:ui`
3. **Check test artifacts**: Review screenshots and videos
4. **Enable debug logs**: Set `DEBUG=pw:*` environment variable

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing patterns and structure
2. Add appropriate test data to fixtures
3. Update this documentation if needed
4. Ensure tests are reliable and fast
5. Include accessibility considerations
6. Test on mobile devices when relevant

For questions or issues, please refer to the project's contribution guidelines.