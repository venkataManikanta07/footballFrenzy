import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    // default admin entry goes to seasons
    router.replace('/admin/seasons');
  }, [router]);

  return null;
}
