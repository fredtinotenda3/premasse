// prisma/seed.ts
// Premasse Business Services — Database Seed
// Run with: npx prisma db seed

import { PrismaClient, Role, ServiceCategory } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEBUG = process.env.DEBUG === "true";

function log(level: "info" | "debug" | "warn" | "error", message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info:  "  ✓",
    debug: "  →",
    warn:  "  ⚠",
    error: "  ✗",
  }[level];

  if (level === "debug" && !DEBUG) return;

  console.log(`${prefix} [${timestamp}] ${message}`);
  if (data !== undefined && DEBUG) {
    console.log("    ", JSON.stringify(data, null, 2));
  }
}

async function main() {
  console.log("🌱 Seeding Premasse database...");
  console.log(`   ENV: ${process.env.NODE_ENV ?? "development"}`);
  console.log(`   DEBUG: ${DEBUG ? "on (set DEBUG=true to enable)" : "off"}`);
  console.log("");

  // ── Services ──────────────────────────────────────────────────────────────────

  console.log("── Services ────────────────────────────────────────────────────────");

  const services = [
    {
      name: "Registered Tax Accountant Consultation",
      slug: "tax-accountant-consultation",
      description:
        "One-on-one consultation with a registered tax accountant. We review your financial position, advise on tax obligations, and help you make informed decisions for your business or personal tax affairs.",
      category: ServiceCategory.TAX_ACCOUNTING,
      price: null,
      sortOrder: 1,
    },
    {
      name: "Company Registration",
      slug: "company-registration",
      description:
        "Full end-to-end company registration with ZIMRA and the Companies and Other Business Entities Act (COBE). Includes name reservation, certificate of incorporation, and CR14 documentation.",
      category: ServiceCategory.COMPANY_REG,
      price: null,
      sortOrder: 2,
    },
    {
      name: "ZIMRA / Tax Registration",
      slug: "zimra-tax-registration",
      description:
        "Register your business for tax purposes with ZIMRA. Covers BP number registration, VAT registration, and PAYE registration for businesses with employees.",
      category: ServiceCategory.ZIMRA_TAX_REG,
      price: null,
      sortOrder: 3,
    },
    {
      name: "Tax Clearance Certificate",
      slug: "tax-clearance",
      description:
        "Obtain your ZIMRA Tax Clearance Certificate (ITF263) quickly and correctly. Required for tendering, contract work, and business transactions in Zimbabwe.",
      category: ServiceCategory.TAX_CLEARANCE,
      price: null,
      sortOrder: 4,
    },
    {
      name: "Accounting Services for SMEs",
      slug: "sme-accounting",
      description:
        "Ongoing accounting support tailored for small and medium enterprises. Includes bookkeeping, monthly management accounts, payroll processing, and annual financial statements.",
      category: ServiceCategory.SME_ACCOUNTING,
      price: null,
      sortOrder: 5,
    },
    // ── Stock-Taking Services ─────────────────────────────────────────────────────
    {
      name: "Physical Stock Counting",
      slug: "physical-stock-counting",
      description:
        "Independent and accurate stock verification in warehouses, factories, and retail stores. Our team conducts thorough physical counts to give you a true picture of your inventory.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 6,
    },
    {
      name: "Stock Reconciliation",
      slug: "stock-reconciliation",
      description:
        "Comparing physical stock counts with your accounting or ERP records to identify and resolve discrepancies. We ensure your books reflect actual inventory on hand.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 7,
    },
    {
      name: "Stock Variance Investigation",
      slug: "stock-variance-investigation",
      description:
        "Identifying stock shortages, surpluses, and their possible causes. We investigate root causes of variances and provide actionable recommendations to prevent recurrence.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 8,
    },
    {
      name: "Warehouse Stock Audits",
      slug: "warehouse-stock-audits",
      description:
        "Full independent audits of warehouse inventory. We verify quantities, condition, and location of stock to ensure accurate records and optimal warehouse management.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 9,
    },
    {
      name: "Retail Store Stock Counts",
      slug: "retail-store-stock-counts",
      description:
        "Periodic and year-end stock verification for shops and supermarkets. Minimise disruption while ensuring accurate stock counts that satisfy audit and management requirements.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 10,
    },
    {
      name: "Inventory Control Assessments",
      slug: "inventory-control-assessments",
      description:
        "Reviewing stock management systems and internal controls. We assess your existing processes and recommend improvements to reduce losses and improve stock accuracy.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 11,
    },
    {
      name: "Shrinkage & Loss Investigations",
      slug: "shrinkage-loss-investigations",
      description:
        "Identifying theft, mismanagement, and system weaknesses that lead to stock shrinkage. We provide a detailed report with findings and recommendations to protect your inventory.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 12,
    },
    {
      name: "Year-End Stock Verification for Auditors",
      slug: "year-end-stock-verification",
      description:
        "Independent stock counts required for financial audits. We work alongside your auditors to provide credible, documented inventory verification at financial year-end.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 13,
    },
    {
      name: "Stock Reporting & Certification",
      slug: "stock-reporting-certification",
      description:
        "Detailed professional reports for management and auditors. We produce certified stock count reports that meet audit standards and give stakeholders confidence in your inventory figures.",
      category: ServiceCategory.STOCK_TAKING,
      price: null,
      sortOrder: 14,
    },
    // ── New Services: NSSA, PRAZ, ZIMDEF Compliance ─────────────────────────────
    {
      name: "NSSA Compliance",
      slug: "nssa-compliance",
      description:
        "National Social Security Authority registration and compliance. We ensure your business meets all NSSA requirements for employee contributions and reporting. Stay compliant with Zimbabwe's social security regulations.",
      category: ServiceCategory.TAX_COMPLIANCE,
      price: null,
      sortOrder: 15,
    },
    {
      name: "PRAZ Compliance",
      slug: "praz-compliance",
      description:
        "Procurement Regulatory Authority of Zimbabwe compliance. Get your business registered for government tenders and ensure procurement compliance. Essential for businesses seeking government contracts.",
      category: ServiceCategory.TAX_COMPLIANCE,
      price: null,
      sortOrder: 16,
    },
    {
      name: "ZIMDEF Compliance",
      slug: "zimdef-compliance",
      description:
        "Zimbabwe Manpower Development Fund compliance. We handle your ZIMDEF registration and levy submissions. Meet your training levy obligations without the hassle.",
      category: ServiceCategory.TAX_COMPLIANCE,
      price: null,
      sortOrder: 17,
    },
    // ── New Services: Accounting & Bookkeeping ───────────────────────────────────
    {
      name: "Accounting Services",
      slug: "accounting-services",
      description:
        "Professional accounting services including financial statements, management accounts, tax returns, and financial analysis for Zimbabwean businesses. Get clear visibility into your business finances.",
      category: ServiceCategory.SME_ACCOUNTING,
      price: null,
      sortOrder: 18,
    },
    {
      name: "Bookkeeping Services",
      slug: "bookkeeping-services",
      description:
        "Daily, weekly, or monthly bookkeeping to keep your financial records accurate and up to date. We help you track income, expenses, and manage cash flow effectively.",
      category: ServiceCategory.SME_ACCOUNTING,
      price: null,
      sortOrder: 19,
    },
    // ── New Service: Startup Business Acumen ─────────────────────────────────────
    {
      name: "Startup Business Acumen",
      slug: "startup-business-acumen",
      description:
        "We help startups gain simple business acumen knowledge to help them in their day-to-day operations. From business planning to financial management — WE HELP YOU GROW. Turn your startup vision into a thriving business.",
      category: ServiceCategory.BUSINESS_ADVISORY,
      price: null,
      sortOrder: 20,
    },
  ];

  log("debug", `Preparing to upsert ${services.length} services`);

  let servicesCreated = 0;
  let servicesUpdated = 0;

  for (const service of services) {
    const existing = await prisma.service.findUnique({
      where: { slug: service.slug },
    });

    const result = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name:        service.name,
        description: service.description,
        category:    service.category,
        price:       service.price,
        sortOrder:   service.sortOrder,
        isActive:    true,
      },
      create: {
        ...service,
        isActive: true,
      },
    });

    if (existing) {
      servicesUpdated++;
      log("info", `Updated service: "${result.name}" (id=${result.id})`);
    } else {
      servicesCreated++;
      log("info", `Created service: "${result.name}" (id=${result.id})`);
    }
  }

  console.log("");
  log("info", `Services done — created: ${servicesCreated}, updated: ${servicesUpdated}`);

  // ── Admin User ────────────────────────────────────────────────────────────────

  console.log("");
  console.log("── Admin user ──────────────────────────────────────────────────────");

  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? "admin@premasse.co.zw";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  if (!process.env.SEED_ADMIN_PASSWORD) {
    log("warn", "SEED_ADMIN_PASSWORD not set — using default. Set it in .env before production!");
  }

  const hashedPassword = await hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      // Keep the admin's password in sync with SEED_ADMIN_PASSWORD (or the
      // default) every time seed runs. Without this, re-running the seed
      // after the admin already exists silently leaves whatever password
      // hash was set the first time it was created — so if that first run
      // used a different value, "the credential in the seed file" quietly
      // stops matching what's actually in the database.
      accounts: {
        upsert: {
          where: {
            provider_providerAccountId: {
              provider: "credentials",
              providerAccountId: adminEmail,
            },
          },
          update: { access_token: hashedPassword },
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: adminEmail,
            access_token: hashedPassword,
          },
        },
      },
    },
    create: {
      name:  "Premasse Admin",
      email: adminEmail,
      role:  Role.ADMIN,
      accounts: {
        create: {
          type:              "credentials",
          provider:          "credentials",
          providerAccountId: adminEmail,
          access_token:      hashedPassword,
        },
      },
    },
  });

  log(
    "info",
    `${existingAdmin ? "Skipped (already exists)" : "Created"} admin: ${admin.email} (id=${admin.id})`
  );

  // ── Sample Request (dev only) ─────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    console.log("");
    console.log("── Sample request (dev only) ─────────────────────────────────────");

    const taxClearance = await prisma.service.findUnique({
      where: { slug: "tax-clearance" },
    });

    if (!taxClearance) {
      log("warn", 'Service "tax-clearance" not found — skipping sample request');
    } else {
      const existing = await prisma.serviceRequest.findFirst({
        where: { clientEmail: "testclient@example.com" },
      });

      if (existing) {
        log("info", `Sample request already exists (id=${existing.id}) — skipping`);
      } else {
        const sampleRequest = await prisma.serviceRequest.create({
          data: {
            serviceId:   taxClearance.id,
            clientName:  "Tatenda Moyo",
            clientEmail: "testclient@example.com",
            clientPhone: "+263 77 123 4567",
            notes:
              "I need a tax clearance certificate urgently for a government tender closing end of month. My BP number is 1234567.",
            status: "PENDING",
            auditLogs: {
              create: {
                changedBy:  admin.id,
                fromStatus: null,
                toStatus:   "PENDING",
                note:       "Request submitted via website",
              },
            },
          },
        });
        log("info", `Created sample request (id=${sampleRequest.id})`);
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────────

  console.log("");
  console.log("── Summary ─────────────────────────────────────────────────────────");

  const [totalServices, totalUsers, totalRequests] = await Promise.all([
    prisma.service.count(),
    prisma.user.count(),
    prisma.serviceRequest.count(),
  ]);

  log("info", `Services in DB:  ${totalServices}`);
  log("info", `Users in DB:     ${totalUsers}`);
  log("info", `Requests in DB:  ${totalRequests}`);

  console.log("");
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });