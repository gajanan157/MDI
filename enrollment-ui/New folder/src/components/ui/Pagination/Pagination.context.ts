import { createSafeContext } from '@/utils/createSafeContext';

export interface PaginationContextType {
  total: number;
  range: (number | string)[];
  active: number;
  disabled?: boolean;
  classNames?: Record<string, string>; 
  onChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFirst: () => void;
  onLast: () => void;
  getItemProps?: (page: number) => Record<string, unknown>;
}

export const [PaginationProvider, usePaginationContext] = createSafeContext<PaginationContextType>(
  'Pagination component was not found in tree'
);
