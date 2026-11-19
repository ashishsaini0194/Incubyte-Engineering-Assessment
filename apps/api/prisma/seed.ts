import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import {
  DEPARTMENTS,
  COUNTRIES,
  DESIGNATIONS,
  SALARY_RANGES,
  getCurrencyForCountry,
} from '@salary-sight/shared';

const prisma = new PrismaClient();

const TOTAL_EMPLOYEES = 10_000;

async function main() {
  console.log('🌱 Seeding database...');
  const startTime = Date.now();

  // Clear existing data
  await prisma.salary.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create departments
  console.log('  Creating departments...');
  const departments = await Promise.all(
    DEPARTMENTS.map((name) => prisma.department.create({ data: { name } })),
  );
  const deptMap = new Map(departments.map((d) => [d.name, d.id]));

  // 2. Generate employees in batches
  console.log(`  Generating ${TOTAL_EMPLOYEES} employees...`);
  const BATCH_SIZE = 500;
  const usedEmails = new Set<string>();

  for (let batch = 0; batch < TOTAL_EMPLOYEES / BATCH_SIZE; batch++) {
    const employeeDataBatch: any[] = [];
    const salaryDataBatch: any[] = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const globalIndex = batch * BATCH_SIZE + i + 1;
      const employeeCode = `EMP-${String(globalIndex).padStart(5, '0')}`;

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Generate unique email
      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`;
      let emailSuffix = 1;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailSuffix}@acme.com`;
        emailSuffix++;
      }
      usedEmails.add(email);

      // Pick random department and country
      const deptName = faker.helpers.arrayElement([...DEPARTMENTS]);
      const country = faker.helpers.arrayElement([...COUNTRIES]);
      const designationList = DESIGNATIONS[deptName] || ['Associate'];
      const designation = faker.helpers.arrayElement(designationList);

      // Status: 90% active, 7% inactive, 3% terminated
      const statusRoll = Math.random();
      const status = statusRoll < 0.9 ? 'ACTIVE' : statusRoll < 0.97 ? 'INACTIVE' : 'TERMINATED';

      const gender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER'] as const);
      const dateOfBirth = faker.date.between({ from: '1965-01-01', to: '2000-12-31' });
      const dateOfJoining = faker.date.between({ from: '2015-01-01', to: '2026-06-01' });

      // Country-appropriate salary
      const salaryRange = SALARY_RANGES[country] || { min: 30000, max: 100000 };
      const baseSalary = parseFloat(
        faker.number.float({ min: salaryRange.min, max: salaryRange.max, fractionDigits: 2 }).toFixed(2),
      );
      const bonus = parseFloat((baseSalary * faker.number.float({ min: 0, max: 0.2, fractionDigits: 2 })).toFixed(2));
      const deductions = parseFloat((baseSalary * faker.number.float({ min: 0, max: 0.05, fractionDigits: 2 })).toFixed(2));
      const netSalary = parseFloat((baseSalary + bonus - deductions).toFixed(2));
      const currency = getCurrencyForCountry(country);

      employeeDataBatch.push({
        employeeCode,
        firstName,
        lastName,
        email,
        phone: faker.phone.number(),
        dateOfBirth,
        dateOfJoining,
        gender,
        status,
        departmentId: deptMap.get(deptName)!,
        designation,
        country,
        city: faker.location.city(),
      });

      salaryDataBatch.push({
        baseSalary,
        bonus,
        deductions,
        netSalary,
        currency,
        effectiveDate: dateOfJoining,
      });
    }

    // Insert batch of employees
    await prisma.employee.createMany({ data: employeeDataBatch });

    // Fetch created employee IDs for this batch
    const startCode = `EMP-${String(batch * BATCH_SIZE + 1).padStart(5, '0')}`;
    const endCode = `EMP-${String((batch + 1) * BATCH_SIZE).padStart(5, '0')}`;
    const createdEmployees = await prisma.employee.findMany({
      where: {
        employeeCode: { gte: startCode, lte: endCode },
      },
      select: { id: true, employeeCode: true },
      orderBy: { employeeCode: 'asc' },
    });

    // Map salaries to employee IDs
    const salaryRecords = createdEmployees.map((emp, idx) => ({
      employeeId: emp.id,
      ...salaryDataBatch[idx],
    }));

    await prisma.salary.createMany({ data: salaryRecords });

    const progress = Math.round(((batch + 1) * BATCH_SIZE / TOTAL_EMPLOYEES) * 100);
    process.stdout.write(`\r  Progress: ${progress}% (${(batch + 1) * BATCH_SIZE}/${TOTAL_EMPLOYEES})`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Seeding complete! ${TOTAL_EMPLOYEES} employees created in ${elapsed}s`);

  // Print summary
  const deptCounts = await prisma.employee.groupBy({
    by: ['departmentId'],
    _count: true,
  });
  const countryCounts = await prisma.employee.groupBy({
    by: ['country'],
    _count: true,
  });

  console.log('\n📊 Summary:');
  console.log(`   Departments: ${departments.length}`);
  console.log(`   Countries: ${countryCounts.length}`);
  console.log(`   Employees: ${TOTAL_EMPLOYEES}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
