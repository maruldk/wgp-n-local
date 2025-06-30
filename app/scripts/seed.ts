
import { PrismaClient, CustomerStatus, LeadStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'wegroup' },
    update: {},
    create: {
      name: 'weGROUP',
      slug: 'wegroup',
      description: 'Default weGROUP tenant',
      isActive: true,
    },
  });

  console.log('✅ Created default tenant');

  // Create demo users
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: defaultTenant.id,
      isActive: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@wegroup.com' },
    update: {},
    create: {
      name: 'Maria Manager',
      email: 'manager@wegroup.com',
      password: await bcrypt.hash('manager123', 12),
      role: 'MANAGER',
      tenantId: defaultTenant.id,
      isActive: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@wegroup.com' },
    update: {},
    create: {
      name: 'Max User',
      email: 'user@wegroup.com',
      password: await bcrypt.hash('user123', 12),
      role: 'USER',
      tenantId: defaultTenant.id,
      isActive: true,
    },
  });

  console.log('✅ Created demo users');

  // Create demo customers
  const customers = [
    {
      companyName: 'Tech Solutions GmbH',
      contactPerson: 'Hans Müller',
      email: 'h.mueller@techsolutions.de',
      phone: '+49 89 123456',
      address: 'Maximilianstraße 1',
      city: 'München',
      postalCode: '80331',
      country: 'Deutschland',
      status: CustomerStatus.ACTIVE,
      notes: 'Langjähriger Kunde mit hohem Potenzial',
    },
    {
      companyName: 'Digital Innovations AG',
      contactPerson: 'Sarah Weber',
      email: 's.weber@digital-innovations.com',
      phone: '+49 30 987654',
      address: 'Unter den Linden 77',
      city: 'Berlin',
      postalCode: '10117',
      country: 'Deutschland',
      status: CustomerStatus.PROSPECT,
      notes: 'Interessiert an KI-Lösungen',
    },
    {
      companyName: 'AutoParts International',
      contactPerson: 'Michael Schmidt',
      email: 'm.schmidt@autoparts.com',
      phone: '+49 711 555777',
      address: 'Industriestraße 45',
      city: 'Stuttgart',
      postalCode: '70565',
      country: 'Deutschland',
      status: CustomerStatus.ACTIVE,
      notes: 'Großkunde für Logistiklösungen',
    },
  ];

  for (const customerData of customers) {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        companyName: customerData.companyName,
        tenantId: defaultTenant.id,
      },
    });

    if (!existingCustomer) {
      await prisma.customer.create({
        data: {
          ...customerData,
          tenantId: defaultTenant.id,
        },
      });
    }
  }

  console.log('✅ Created demo customers');

  // Create demo leads
  const leads = [
    {
      companyName: 'StartUp Ventures',
      contactPerson: 'Lisa Frank',
      email: 'l.frank@startup-ventures.com',
      phone: '+49 40 111222',
      status: LeadStatus.QUALIFIED,
      source: 'Website',
      notes: 'Interessiert an CRM-Lösung',
      estimatedValue: 15000,
      assignedUserId: managerUser.id,
    },
    {
      companyName: 'Global Retail Chain',
      contactPerson: 'Robert Johnson',
      email: 'r.johnson@globalretail.com',
      phone: '+49 221 333444',
      status: LeadStatus.PROPOSAL,
      source: 'Referral',
      notes: 'Großprojekt - Multi-Tenant Setup',
      estimatedValue: 50000,
      assignedUserId: adminUser.id,
    },
    {
      companyName: 'Local Services Ltd',
      contactPerson: 'Anna Klein',
      email: 'a.klein@localservices.de',
      phone: '+49 69 666777',
      status: LeadStatus.NEW,
      source: 'Cold Call',
      notes: 'Erstkontakt hergestellt',
      estimatedValue: 8000,
      assignedUserId: regularUser.id,
    },
  ];

  for (const leadData of leads) {
    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        companyName: leadData.companyName,
        tenantId: defaultTenant.id,
      },
    });

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          ...leadData,
          tenantId: defaultTenant.id,
        },
      });
    }
  }

  console.log('✅ Created demo leads');

  // Create some contact history
  const customer = await prisma.customer.findFirst({
    where: { companyName: 'Tech Solutions GmbH' },
  });

  if (customer) {
    await prisma.contactHistory.create({
      data: {
        customerId: customer.id,
        userId: adminUser.id,
        type: 'CALL',
        description: 'Erstes Beratungsgespräch über KI-Integration',
      },
    });

    await prisma.contactHistory.create({
      data: {
        customerId: customer.id,
        userId: managerUser.id,
        type: 'EMAIL',
        description: 'Angebot für DeepAgent Plattform gesendet',
      },
    });
  }

  console.log('✅ Created demo contact history');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
