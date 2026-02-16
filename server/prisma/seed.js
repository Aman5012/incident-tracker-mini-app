import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db",
    },
  },
});

const services = ['Auth', 'Payments', 'Backend', 'Frontend', 'Database', 'Search', 'notifications'];
const severities = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
const statuses = ['OPEN', 'MITIGATED', 'RESOLVED'];
const owners = ['jason@team.com', 'amy@team.com', 'dev@team.com', 'ops@team.com', null];

async function main() {
  console.log('Start seeding ...');

  // Clear existing data
  await prisma.incident.deleteMany();

  const incidents = [];

  for (let i = 0; i < 200; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    incidents.push({
      title: `${service} Issue: ${Math.random().toString(36).substring(7)}`,
      service,
      severity,
      status,
      owner,
      summary: `Detailed summary for incident involving ${service} with severity ${severity}.`,
      createdAt,
    });
  }

  for (const incident of incidents) {
    await prisma.incident.create({
      data: incident,
    });
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
