/**
 * A text label that looks engraved on a four-sided rod. On hover or keyboard focus of the link
 * or button around it, the rod makes a full turn (see noir.css). Only the first face is read by
 * screen readers; the other three are copies for the animation.
 */
export function RotatingLabel({ children }: { children: string }) {
  return (
    <span className="rod">
      <span className="prism">
        <span className="face">{children}</span>
        <span className="face" aria-hidden="true">
          {children}
        </span>
        <span className="face" aria-hidden="true">
          {children}
        </span>
        <span className="face" aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  );
}
