import type { AuthContextType, AuthResponse, UserContext } from "@/types";

export const CONTEXT_SELECTION_ROUTE = "/context-selection";

const isManagerContext = (contextType: AuthContextType | undefined) =>
  contextType === "MANAGER";

const isManagerRole = (roles: readonly string[] | undefined) =>
  roles?.some((role) => role.includes("MANAGER") || role.includes("HEAD_COACH"));

const resolvePersonalRoute = (userCode?: string | null) =>
  userCode?.trim() ? `/${userCode.trim()}` : "/utilities";

export const resolveHomeRoute = ({
  roles,
  activeContext,
  userCode,
}: {
  roles?: readonly string[];
  activeContext: UserContext | null;
  userCode?: string | null;
}) => {
  const contextType = activeContext?.contextType as AuthContextType | undefined;

  if (!contextType) {
    return CONTEXT_SELECTION_ROUTE;
  }

  if (isManagerContext(contextType) || isManagerRole(roles)) {
    return "/";
  }

  return resolvePersonalRoute(userCode ?? activeContext?.userCode);
};

export const routeAfterAuthResponse = (
  response: AuthResponse,
  options: { userCode?: string | null } = {},
) =>
  response.requiresContextSelection
    ? CONTEXT_SELECTION_ROUTE
    : resolveHomeRoute({
        roles: response.user.roles,
        activeContext: response.activeContext,
        userCode: options.userCode,
      });
