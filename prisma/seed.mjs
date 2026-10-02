import { PrismaClient } from '@prisma/client';
import { scryptSync } from 'node:crypto';

const db = new PrismaClient();

const hash = (password) => scryptSync(password, 'noor-salt', 64).toString('hex');

async function main() {
  await db.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', lessonPriceUsd: 15, currency: 'USD' },
  });

  const admin = await db.user.upsert({
    where: { email: 'admin@noor.com' },
    update: {},
    create: { email: 'admin@noor.com', passwordHash: hash('admin123'), name: 'Admin', role: 'ADMIN' },
  });
  console.log('Seeded admin:', admin.email);

  const teachers = [
    {
      email: 'mustafa@noor.com',
      name: 'Mustafa Hamdy',
      nameAr: 'مصطفى حمدي',
      bio: 'Qur’an teacher and reciter who makes tajweed feel close, clear, and possible for every learner.',
      tags: 'Tajweed,Recitation',
      initials: 'م',
      whatsapp: '201014546662',
    },
    {
      email: 'alaa@noor.com',
      name: 'Alaa Abdelaty',
      nameAr: 'آلاء عبد العاطي',
      bio: 'A warm guide for foundational learning, Islamic character, and the questions young hearts carry.',
      tags: 'Foundations,Sunnah',
      initials: 'آ',
      whatsapp: '201014546662',
    },
  ];

  for (const t of teachers) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, passwordHash: hash('teacher123'), name: t.name, role: 'TEACHER' },
    });

    await db.teacher.upsert({
      where: { userId: user.id },
      update: { 
        name: t.name, 
        nameAr: t.nameAr, 
        bio: t.bio, 
        tags: t.tags, 
        initials: t.initials, 
        whatsapp: t.whatsapp,
        isOnline: true // 👈 تحديث المدرسين الحاليين ليصبحوا أونلاين
      },
      create: { 
        userId: user.id, 
        name: t.name, 
        nameAr: t.nameAr, 
        bio: t.bio, 
        tags: t.tags, 
        initials: t.initials, 
        whatsapp: t.whatsapp, 
        isOnline: true // 👈 إنشاء المدرسين الجدد بحالة أونلاين
      },
    });
    console.log('Seeded teacher:', t.email);
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });