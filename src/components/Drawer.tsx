/**
 * Side-panel drawer (RF-5 SF5-2/SF5-3). A new shared primitive: invite + edit
 * mount over the member list as a right-side panel (`--shadow-pane`, DESIGN.md
 * rule 8). Not a modal-as-first-thought — it is the intent-driven editing
 * surface for a row/action, with the list still visible behind it.
 *
 * Accessibility: labelled dialog, Escape closes, focus moves in on open. No
 * nested cards (rule 5); internal grouping uses surface-raised sections.
 */
import { useEffect, useRef } from "react";
import "./drawer.css";

export interface DrawerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ title, onClose, children }: DrawerProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className="drawer-scrim" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <header className="drawer__head">
          <h2 className="drawer__title">{title}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="drawer__body">{children}</div>
      </div>
    </div>
  );
}
