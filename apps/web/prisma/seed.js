const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create school
  const school = await prisma.school.create({
    data: {
      name: 'Springfield Academy',
      code: 'SA001',
      address: '123 Education Street, Springfield',
      phone: '+1-555-0100',
      email: 'info@springfieldacademy.edu',
      website: 'https://springfieldacademy.edu',
      timezone: 'America/New_York',
    },
  })
  console.log('✅ Created school:', school.name)

  // Create super admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@schoolacademy.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      schoolId: school.id,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          gender: 'MALE',
        },
      },
    },
  })
  console.log('✅ Created super admin:', superAdmin.email)

  // Create principal
  const principal = await prisma.user.create({
    data: {
      email: 'principal@springfieldacademy.edu',
      password: hashedPassword,
      role: 'PRINCIPAL',
      schoolId: school.id,
      profile: {
        create: {
          firstName: 'Margaret',
          lastName: 'Chen',
          phone: '+1-555-0101',
          gender: 'FEMALE',
        },
      },
    },
  })
  console.log('✅ Created principal:', principal.email)

  // Create teachers
  const teacherData = [
    { email: 'john.smith@springfieldacademy.edu', firstName: 'John', lastName: 'Smith', spec: 'Mathematics' },
    { email: 'sarah.johnson@springfieldacademy.edu', firstName: 'Sarah', lastName: 'Johnson', spec: 'Science' },
    { email: 'michael.williams@springfieldacademy.edu', firstName: 'Michael', lastName: 'Williams', spec: 'English' },
    { email: 'emily.brown@springfieldacademy.edu', firstName: 'Emily', lastName: 'Brown', spec: 'History' },
  ]

  const teachers = []
  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i]
    const teacher = await prisma.user.create({
      data: {
        email: t.email,
        password: hashedPassword,
        role: 'TEACHER',
        schoolId: school.id,
        profile: {
          create: {
            firstName: t.firstName,
            lastName: t.lastName,
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          },
        },
        teacher: {
          create: {
            employeeId: `T${String(i + 1).padStart(3, '0')}`,
            qualification: ['M.Sc', 'M.A', 'M.Ed', 'Ph.D'][i % 4],
            specialization: t.spec,
            experience: Math.floor(Math.random() * 15) + 5,
            joiningDate: new Date('2020-01-15'),
            salary: 45000 + i * 5000,
            schoolId: school.id,
          },
        },
      },
    })
    teachers.push(teacher)
  }
  console.log('✅ Created', teachers.length, 'teachers')

  // Create academic year
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: '2024-2025',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
    },
  })
  console.log('✅ Created academic year:', academicYear.name)

  // Create classes
  const classNames = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
  const classes = []
  for (let i = 0; i < classNames.length; i++) {
    const classObj = await prisma.class.create({
      data: {
        schoolId: school.id,
        name: classNames[i],
        level: i + 1,
        description: `Class for ${classNames[i]} students`,
      },
    })
    classes.push(classObj)
  }
  console.log('✅ Created', classes.length, 'classes')

  // Create sections for each class
  const sections = []
  for (const classObj of classes) {
    for (const sectionName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          classId: classObj.id,
          name: sectionName,
          capacity: 40,
        },
      })
      sections.push(section)
    }
  }
  console.log('✅ Created', sections.length, 'sections')

  // Create subjects
  const subjectNames = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education']
  const subjects = []
  for (let i = 0; i < subjectNames.length; i++) {
    const subject = await prisma.subject.create({
      data: {
        schoolId: school.id,
        name: subjectNames[i],
        code: subjectNames[i].substring(0, 3).toUpperCase(),
        description: `${subjectNames[i]} subject`,
        credits: 1,
      },
    })
    subjects.push(subject)
  }
  console.log('✅ Created', subjects.length, 'subjects')

  // Create guardians
  const guardianData = [
    { email: 'robert.johnson@email.com', firstName: 'Robert', lastName: 'Johnson' },
    { email: 'linda.williams@email.com', firstName: 'Linda', lastName: 'Williams' },
    { email: 'james.brown@email.com', firstName: 'James', lastName: 'Brown' },
    { email: 'patricia.davis@email.com', firstName: 'Patricia', lastName: 'Davis' },
  ]

  const guardians = []
  for (let i = 0; i < guardianData.length; i++) {
    const g = guardianData[i]
    const guardian = await prisma.user.create({
      data: {
        email: g.email,
        password: hashedPassword,
        role: 'GUARDIAN',
        profile: {
          create: {
            firstName: g.firstName,
            lastName: g.lastName,
            phone: `+1-555-01${String(i + 10).padStart(2, '0')}`,
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          },
        },
        guardian: {
          create: {
            occupation: ['Engineer', 'Doctor', 'Teacher', 'Business'][i % 4],
            relationship: ['Father', 'Mother', 'Father', 'Mother'][i % 4],
            schoolId: school.id,
          },
        },
      },
    })
    guardians.push(guardian)
  }
  console.log('✅ Created', guardians.length, 'guardians')

  // Create students
  const studentData = [
    { email: 'emma.johnson@student.springfieldacademy.edu', firstName: 'Emma', lastName: 'Johnson' },
    { email: 'noah.williams@student.springfieldacademy.edu', firstName: 'Noah', lastName: 'Williams' },
    { email: 'olivia.brown@student.springfieldacademy.edu', firstName: 'Olivia', lastName: 'Brown' },
    { email: 'liam.davis@student.springfieldacademy.edu', firstName: 'Liam', lastName: 'Davis' },
  ]

  const students = []
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i]
    const student = await prisma.user.create({
      data: {
        email: s.email,
        password: hashedPassword,
        role: 'STUDENT',
        schoolId: school.id,
        profile: {
          create: {
            firstName: s.firstName,
            lastName: s.lastName,
            dateOfBirth: new Date(2010 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            address: '123 Student Street, Springfield',
          },
        },
        student: {
          create: {
            admissionNumber: `SA${String(i + 1).padStart(4, '0')}`,
            admissionDate: new Date('2024-08-01'),
            rollNumber: String(i + 1),
            bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
            schoolId: school.id,
          },
        },
      },
    })
    students.push(student)

    // Link student to guardian
    const studentRecord = await prisma.student.findUnique({
      where: { userId: student.id },
    })
    const guardianRecord = await prisma.guardian.findUnique({
      where: { userId: guardians[i % guardians.length].id },
    })

    if (studentRecord && guardianRecord) {
      await prisma.userGuardian.create({
        data: {
          userId: student.id,
          guardianId: guardianRecord.id,
          relationship: i % 2 === 0 ? 'Father' : 'Mother',
          isPrimary: true,
        },
      })
    }
  }
  console.log('✅ Created', students.length, 'students')

  // Create enrollments
  for (let i = 0; i < students.length; i++) {
    const student = await prisma.student.findUnique({
      where: { userId: students[i].id },
    })
    if (student) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          sectionId: sections[i % sections.length].id,
          academicYearId: academicYear.id,
          status: 'ACTIVE',
        },
      })
    }
  }
  console.log('✅ Created enrollments')

  // Create fee structures
  await prisma.feeStructure.createMany({
    data: [
      { schoolId: school.id, name: 'Tuition Fee', description: 'Annual tuition fee', amount: 5000, frequency: 'ANNUAL' },
      { schoolId: school.id, name: 'Lab Fee', description: 'Science lab fee', amount: 200, frequency: 'ANNUAL' },
      { schoolId: school.id, name: 'Library Fee', description: 'Library access fee', amount: 50, frequency: 'ANNUAL' },
    ],
  })
  console.log('✅ Created fee structures')

  // Create sample exam
  await prisma.exam.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Mid-Term Examination',
      type: 'MIDTERM',
      startDate: new Date('2024-10-15'),
      endDate: new Date('2024-10-25'),
    },
  })
  console.log('✅ Created exam')

  // Create announcement
  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: 'Welcome to New Academic Year',
      content: 'We welcome all students and staff to the new academic year 2024-2025. Let us make this year productive and successful!',
      priority: 'HIGH',
      targetRoles: 'STUDENT,GUARDIAN,TEACHER,STAFF',
      isPublished: true,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Created announcement')

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📋 Login credentials:')
  console.log('Super Admin: admin@schoolacademy.com / Admin@123')
  console.log('Principal: principal@springfieldacademy.edu / Admin@123')
  console.log('Teachers: Use respective email / Admin@123')
  console.log('Students: Use respective email / Admin@123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
