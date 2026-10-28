import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import Training from '../models/Training.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany();
    await Employee.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Announcement.deleteMany();
    await Training.deleteMany();
    await TrainingEnrollment.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();

    console.log('[Seeder] Cleared previous data...');

    // 1. Create HR User & Employee
    const hrUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@staffsync.com',
      password: 'Password123!',
      role: 'hr',
      status: 'active',
    });

    const hrEmployee = await Employee.create({
      userId: hrUser._id,
      employeeId: 'EMP-1001',
      department: 'Human Resources',
      designation: 'VP of Human Resources',
      phone: '+1 (555) 234-5678',
      address: { street: '100 Executive Way', city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA' },
      salary: 125000,
      joiningDate: new Date('2023-01-15'),
    });

    // 2. Create Manager User & Employee
    const managerUser = await User.create({
      name: 'Michael Chang',
      email: 'manager@staffsync.com',
      password: 'Password123!',
      role: 'manager',
      status: 'active',
    });

    const managerEmployee = await Employee.create({
      userId: managerUser._id,
      employeeId: 'EMP-1002',
      department: 'Engineering',
      designation: 'Engineering Manager',
      phone: '+1 (555) 345-6789',
      address: { street: '240 Tech Blvd', city: 'San Francisco', state: 'CA', zip: '94107', country: 'USA' },
      managerId: hrUser._id,
      salary: 140000,
      joiningDate: new Date('2023-03-01'),
    });

    // 3. Create Employees
    const emp1User = await User.create({
      name: 'Alex Rivera',
      email: 'employee@staffsync.com',
      password: 'Password123!',
      role: 'employee',
      status: 'active',
    });

    const emp1Employee = await Employee.create({
      userId: emp1User._id,
      employeeId: 'EMP-1003',
      department: 'Engineering',
      designation: 'Full Stack Engineer',
      phone: '+1 (555) 456-7890',
      address: { street: '45 Mission St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'USA' },
      managerId: managerUser._id,
      salary: 95000,
      joiningDate: new Date('2024-02-10'),
      leaveBalance: {
        annual: { total: 15, used: 2 },
        sick: { total: 10, used: 1 },
        casual: { total: 5, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
    });

    const emp2User = await User.create({
      name: 'Emily Watson',
      email: 'emily@staffsync.com',
      password: 'Password123!',
      role: 'employee',
      status: 'active',
    });

    const emp2Employee = await Employee.create({
      userId: emp2User._id,
      employeeId: 'EMP-1004',
      department: 'Design',
      designation: 'Senior Product Designer',
      phone: '+1 (555) 567-8901',
      address: { street: '78 Pine St', city: 'San Francisco', state: 'CA', zip: '94111', country: 'USA' },
      managerId: managerUser._id,
      salary: 98000,
      joiningDate: new Date('2024-04-01'),
    });

    const emp3User = await User.create({
      name: 'David Kim',
      email: 'david@staffsync.com',
      password: 'Password123!',
      role: 'employee',
      status: 'active',
    });

    const emp3Employee = await Employee.create({
      userId: emp3User._id,
      employeeId: 'EMP-1005',
      department: 'Marketing',
      designation: 'Marketing Specialist',
      phone: '+1 (555) 678-9012',
      address: { street: '12 Montgomery St', city: 'San Francisco', state: 'CA', zip: '94104', country: 'USA' },
      managerId: hrUser._id,
      salary: 78000,
      joiningDate: new Date('2024-05-15'),
    });

    console.log('[Seeder] Created Users and Employees...');

    // 4. Seed Attendance Records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Today's attendance for Alex
    const now = new Date();
    const checkInTime = new Date(today);
    checkInTime.setHours(9, 15, 0, 0);

    await Attendance.create([
      {
        employeeId: emp1Employee._id,
        userId: emp1User._id,
        date: today,
        checkIn: checkInTime,
        status: 'present',
        remarks: 'On-time check-in',
      },
      {
        employeeId: managerEmployee._id,
        userId: managerUser._id,
        date: today,
        checkIn: new Date(today.getTime() + 9 * 3600000 + 40 * 60000), // 9:40 AM
        status: 'late',
        remarks: 'Traffic delay',
      },
      {
        employeeId: emp1Employee._id,
        userId: emp1User._id,
        date: yesterday,
        checkIn: new Date(yesterday.getTime() + 9 * 3600000 + 10 * 60000),
        checkOut: new Date(yesterday.getTime() + 17 * 3600000 + 30 * 60000),
        totalWorkMinutes: 500,
        status: 'present',
        remarks: 'Completed sprints',
      },
      {
        employeeId: emp1Employee._id,
        userId: emp1User._id,
        date: twoDaysAgo,
        checkIn: new Date(twoDaysAgo.getTime() + 9 * 3600000 + 5 * 60000),
        checkOut: new Date(twoDaysAgo.getTime() + 18 * 3600000),
        totalWorkMinutes: 535,
        status: 'present',
        remarks: 'Feature release deployment',
      },
    ]);

    console.log('[Seeder] Seeded Attendance Records...');

    // 5. Seed Leave Requests
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

    await Leave.create([
      {
        employeeId: emp1Employee._id,
        userId: emp1User._id,
        leaveType: 'annual',
        startDate: nextWeek,
        endDate: nextWeekEnd,
        daysCount: 3,
        reason: 'Family annual vacation trip',
        status: 'pending',
      },
      {
        employeeId: emp2Employee._id,
        userId: emp2User._id,
        leaveType: 'sick',
        startDate: yesterday,
        endDate: yesterday,
        daysCount: 1,
        reason: 'Doctor appointment and fever',
        status: 'approved',
        reviewedBy: managerUser._id,
        reviewComment: 'Approved. Get well soon!',
        reviewedAt: yesterday,
      },
      {
        employeeId: emp3Employee._id,
        userId: emp3User._id,
        leaveType: 'casual',
        startDate: twoDaysAgo,
        endDate: twoDaysAgo,
        daysCount: 1,
        reason: 'Personal urgent errand',
        status: 'approved',
        reviewedBy: hrUser._id,
        reviewComment: 'Approved by HR',
        reviewedAt: twoDaysAgo,
      },
    ]);

    console.log('[Seeder] Seeded Leave Requests...');

    // 6. Seed Announcements
    await Announcement.create([
      {
        title: 'StaffSync 2.0 HRMS Platform Launch',
        content: 'Welcome to the brand new StaffSync portal! Explore your dashboard, mark attendance, submit leave applications, and view company updates all in one place.',
        category: 'Company News',
        priority: 'high',
        targetAudience: 'all',
        department: 'All',
        publishedBy: hrUser._id,
      },
      {
        title: 'Upcoming Public Holiday: Memorial Observance',
        content: 'Our offices will remain closed next Monday in observance of the statutory public holiday. Please plan sprint deadlines accordingly.',
        category: 'Holidays',
        priority: 'medium',
        targetAudience: 'all',
        department: 'All',
        publishedBy: hrUser._id,
      },
      {
        title: 'Updated Health & Wellness Reimbursement Policy',
        content: 'HR is pleased to announce an increased annual health and fitness reimbursement allowance starting this quarter. Submit receipts via the HR helpdesk.',
        category: 'Policy Updates',
        priority: 'medium',
        targetAudience: 'all',
        department: 'Human Resources',
        publishedBy: hrUser._id,
      },
    ]);

    console.log('[Seeder] Seeded Announcements...');

    // 7. Seed Trainings & Enrollments
    const training1 = await Training.create({
      title: 'Advanced React 19 & Full-Stack Performance',
      description: 'Master server-side rendering, concurrent features, suspense boundaries, and client-side optimization patterns.',
      trainer: 'Dr. Kimberly Adams (Staff Frontend Architect)',
      category: 'Technical Skills',
      startDate: new Date(today.getTime() + 5 * 86400000),
      endDate: new Date(today.getTime() + 15 * 86400000),
      maxCapacity: 20,
      enrolledCount: 2,
      location: 'Virtual Classroom (Zoom)',
      createdBy: hrUser._id,
    });

    const training2 = await Training.create({
      title: 'Leadership & High-Impact Management',
      description: 'Developing high performing agile teams, emotional intelligence, constructive feedback, and conflict resolution.',
      trainer: 'Marcus Vance (Executive Coach)',
      category: 'Leadership & Soft Skills',
      startDate: new Date(today.getTime() + 10 * 86400000),
      endDate: new Date(today.getTime() + 20 * 86400000),
      maxCapacity: 15,
      enrolledCount: 1,
      location: 'Main Auditorium & Online',
      createdBy: hrUser._id,
    });

    await TrainingEnrollment.create([
      {
        trainingId: training1._id,
        userId: emp1User._id,
        employeeId: emp1Employee._id,
        status: 'in-progress',
        progress: 45,
      },
      {
        trainingId: training2._id,
        userId: managerUser._id,
        employeeId: managerEmployee._id,
        status: 'enrolled',
        progress: 10,
      },
    ]);

    console.log('[Seeder] Seeded Trainings and Enrollments...');

    // 8. Seed Notifications
    await Notification.create([
      {
        recipient: managerUser._id,
        title: 'Pending Leave Request',
        message: 'Alex Rivera submitted an annual leave request for review.',
        type: 'leave',
        link: '/leaves',
      },
      {
        recipient: emp1User._id,
        title: 'Welcome to StaffSync',
        message: 'Your employee profile is active. Check out upcoming trainings and announcements.',
        type: 'system',
        link: '/dashboard',
      },
    ]);

    console.log('[Seeder] Seeded Notifications...');
    console.log('[Seeder] Database successfully seeded with full demo dataset!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();

