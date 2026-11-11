/**
 * Decorative background of the dark theme: soft pools of warm and cool light on the "wall",
 * faint stone veining and the filter used by the slate cards. Fixed to the screen, behind all
 * content, invisible to assistive technology and ignored by the mouse.
 */
export function BackdropFx() {
  return (
    <div aria-hidden="true" className="backdrop-fx">
      <svg className="backdrop-fx__stone" width="100%" height="100%">
        <filter id="stone" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.009" numOctaves="4" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 .82  0 0 0 0 .86  0 0 0 0 .93  1 0 0 0 0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0 0 0 .12 1 .12 0 0 0 0" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#stone)" />
      </svg>
      <svg width="0" height="0" className="absolute">
        <filter id="cardstone" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 .8  0 0 0 0 .82  0 0 0 0 .86  .09 0 0 0 -.02"
          />
        </filter>
      </svg>
    </div>
  );
}
