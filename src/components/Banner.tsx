/**
 * Persistent status banner (T011, FR-003-007, VD-4). DESIGN.md rule 4:
 * persistent banners, not toasts. Surfaces the backend `request_id` so an
 * operator can quote it to support. Never auto-dismisses.
 */
import "./banner.css";

export type BannerVariant = "danger" | "warning" | "success" | "info";

export interface BannerProps {
  variant: BannerVariant;
  message: string;
  /** Backend request_id from a 4xx response (VD-4). Rendered when present. */
  requestId?: string;
}

export function Banner({ variant, message, requestId }: BannerProps): React.JSX.Element {
  return (
    <div className={`rtc-alert rtc-alert--${variant}`} role="alert">
      <span className="rtc-alert__msg">{message}</span>
      {requestId ? <span className="rtc-alert__req">request_id: {requestId}</span> : null}
    </div>
  );
}
