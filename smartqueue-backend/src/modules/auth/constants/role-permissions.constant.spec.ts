import { permissionsFor } from "@/modules/auth/constants/role-permissions.constant";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { UserRole } from "@/modules/auth/enums/user-role.enum";

describe("Cinema RBAC", () => {
  it("un cliente no controla cola ni ve métricas internas", () => {
    const permissions = permissionsFor([UserRole.CUSTOMER]);
    expect(permissions).toContain(Permission.TICKET_PURCHASE);
    expect(permissions).not.toContain(Permission.QUEUE_CONTROL);
    expect(permissions).not.toContain(Permission.METRICS_READ);
  });
  it("analista consulta métricas sin poder operar admisión", () => {
    const permissions = permissionsFor([UserRole.OPERATIONS_ANALYST]);
    expect(permissions).toContain(Permission.METRICS_READ);
    expect(permissions).not.toContain(Permission.QUEUE_CONTROL);
  });
  it("administrador tiene la matriz completa", () => {
    expect(permissionsFor([UserRole.ADMIN])).toHaveLength(
      Object.values(Permission).length,
    );
  });
});
