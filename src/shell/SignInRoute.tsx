/**
 * SF-1 route wrapper. Owns the post-sign-in navigation: on auto-select it
 * drives the SF-3 tenant switch then enters the shell; on chooser/no-access it
 * enters the protected area (which renders the gate or no-access from context).
 */
import { useNavigate } from "react-router";
import { SignIn } from "@/auth/SignIn";
import { useActiveContextValue } from "@/context/ActiveContextProvider";
import type { SignInResolution } from "@/auth/signin-flow";

export function SignInRoute(): React.JSX.Element {
  const navigate = useNavigate();
  const { switchTenant } = useActiveContextValue();

  async function onResolved(resolution: SignInResolution): Promise<void> {
    if (resolution.kind === "auto-select") {
      await switchTenant(resolution.tenantId);
    }
    // choose / no-access / auto-select all land in the protected area, which
    // renders the correct surface from the re-fetched context.
    navigate("/", { replace: true });
  }

  return <SignIn onResolved={onResolved} />;
}
