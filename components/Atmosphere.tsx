/**
 * Fixed grain + grid + glow atmosphere layer (static markup, ported verbatim
 * from the prototype). Sits behind BG3D and all content.
 */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="grid-lines" />
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="grain" />
    </div>
  );
}
