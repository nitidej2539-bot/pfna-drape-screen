// จุดกะพริบบนอุปกรณ์ + เส้นเชื่อม + การ์ด glass เรืองแสง
export default function Hotspot({ data, onOpen }) {
  const { dot, card, title, subtitle } = data;
  return (
    <div className="hotspot" data-id={data.id}>
      <svg className="hotspot-line" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1={dot.x}
          y1={dot.y}
          x2={card.x}
          y2={card.y}
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="hotspot-dot" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} />
      <button
        type="button"
        className="hotspot-card"
        style={{ left: `${card.x}%`, top: `${card.y}%` }}
        onClick={() => onOpen(data)}
      >
        <span className="hotspot-plus" aria-hidden="true">+</span>
        <span className="hotspot-text">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
      </button>
    </div>
  );
}
