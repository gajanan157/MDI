import { Navigate } from 'react-router';
import { isMockAuthEnabled } from '@/utils/mockAuth';
import DynamicRedirect from '@/app/router/DynamicRedirect';

export default function PreviewIndex() {
  return isMockAuthEnabled() ? <Navigate to="/enrolment-system/dashboard" replace /> : <DynamicRedirect />;
}