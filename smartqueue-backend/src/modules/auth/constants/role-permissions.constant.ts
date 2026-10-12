import { Permission } from "@/modules/auth/enums/permission.enum";
import { UserRole } from "@/modules/auth/enums/user-role.enum";

const customer = [
  Permission.PROFILE_READ,
  Permission.PROFILE_UPDATE,
  Permission.TICKET_PURCHASE,
  Permission.TICKET_READ_OWN,
];
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.CUSTOMER]: customer,
  [UserRole.BOX_OFFICE]: [
    Permission.PROFILE_READ,
    Permission.TICKET_SELL,
    Permission.TICKET_REFUND,
    Permission.QUEUE_MONITOR,
  ],
  [UserRole.USHER]: [
    Permission.PROFILE_READ,
    Permission.TICKET_VALIDATE,
    Permission.QUEUE_MONITOR,
  ],
  [UserRole.CINEMA_MANAGER]: [
    Permission.PROFILE_READ,
    Permission.TICKET_SELL,
    Permission.TICKET_REFUND,
    Permission.TICKET_VALIDATE,
    Permission.SHOWTIME_MANAGE,
    Permission.CINEMA_MANAGE,
    Permission.QUEUE_MONITOR,
    Permission.QUEUE_CONTROL,
    Permission.METRICS_READ,
  ],
  [UserRole.OPERATIONS_ANALYST]: [
    Permission.PROFILE_READ,
    Permission.QUEUE_MONITOR,
    Permission.METRICS_READ,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};

export function permissionsFor(roles: readonly UserRole[]): Permission[] {
  return [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role]))];
}
