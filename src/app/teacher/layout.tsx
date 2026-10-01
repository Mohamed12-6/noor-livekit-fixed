import { requireRole } from '@/lib/guard';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole('TEACHER', '/teacher');
  return <>{children}</>;
}