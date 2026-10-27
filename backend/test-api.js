import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('=== StaffSync Comprehensive API Integration Tests ===\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
      failed++;
    }
  }

  // 1. Health check
  const health = await request('/health');
  assert('GET /api/health returns online status', health.status === 200 && health.data.status === 'online');

  // 2. Login with valid HR credentials
  const hrLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'hr@staffsync.com', password: 'Password123!' },
  });
  assert('POST /api/auth/login (HR) succeeds with JWT', hrLogin.status === 200 && !!hrLogin.data.token);
  const hrToken = hrLogin.data.token;

  // 3. Login with invalid password
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'hr@staffsync.com', password: 'WrongPassword!' },
  });
  assert('POST /api/auth/login with wrong password returns 401', badLogin.status === 401);

  // 4. Login as Employee
  const empLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'employee@staffsync.com', password: 'Password123!' },
  });
  assert('POST /api/auth/login (Employee) succeeds', empLogin.status === 200 && empLogin.data.user.role === 'employee');
  const empToken = empLogin.data.token;

  // 5. Login as Manager
  const mgrLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'manager@staffsync.com', password: 'Password123!' },
  });
  assert('POST /api/auth/login (Manager) succeeds', mgrLogin.status === 200 && mgrLogin.data.user.role === 'manager');
  const mgrToken = mgrLogin.data.token;

  // 6. RBAC test: Employee accessing HR-only endpoint
  const empDenied = await request('/reports/hr', {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert('Employee access to /api/reports/hr is blocked (403)', empDenied.status === 403);

  // 7. HR accessing HR reports
  const hrReports = await request('/reports/hr', {
    headers: { Authorization: `Bearer ${hrToken}` },
  });
  assert('HR access to /api/reports/hr succeeds (200)', hrReports.status === 200 && hrReports.data.success);

  // 8. Attendance test: Employee check-in or duplicate prevention
  const checkInRes = await request('/attendance/check-in', {
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  // Alex Rivera was already checked in today by the seeder, so this should return 400 (duplicate check-in prevention)
  assert('Duplicate check-in prevention test (returns 400)', checkInRes.status === 400 && checkInRes.data.message.includes('already checked in'));

  // 9. Leave test: Apply for leave as employee
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthEnd = new Date(nextMonth);
  nextMonthEnd.setDate(nextMonthEnd.getDate() + 2);

  const leaveRes = await request('/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
    body: {
      leaveType: 'annual',
      startDate: nextMonth.toISOString().split('T')[0],
      endDate: nextMonthEnd.toISOString().split('T')[0],
      reason: 'Automated test annual leave application',
    },
  });
  assert('Employee submits valid leave request (201)', leaveRes.status === 201 && leaveRes.data.success);

  // 10. Manager pending leaves
  const pendingLeaves = await request('/leaves/pending', {
    headers: { Authorization: `Bearer ${mgrToken}` },
  });
  assert('Manager retrieves pending team leaves', pendingLeaves.status === 200 && Array.isArray(pendingLeaves.data.leaves));

  // 11. Announcements endpoint
  const announcements = await request('/announcements', {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert('GET /api/announcements returns active broadcasts', announcements.status === 200 && announcements.data.count > 0);

  // 12. Trainings endpoint
  const trainings = await request('/trainings', {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert('GET /api/trainings returns course catalog', trainings.status === 200 && trainings.data.count > 0);

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();

