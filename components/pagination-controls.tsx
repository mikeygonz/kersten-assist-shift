'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
}

export function PaginationControls({
  hasNextPage,
  hasPreviousPage,
  nextCursor,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNextPage = () => {
    if (nextCursor) {
      const params = new URLSearchParams(searchParams);
      params.set('cursor', nextCursor);
      router.push(`?${params.toString()}`);
    }
  };

  const handlePreviousPage = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('cursor');
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onNextPage={handleNextPage}
      onPreviousPage={handlePreviousPage}
    />
  );
}
