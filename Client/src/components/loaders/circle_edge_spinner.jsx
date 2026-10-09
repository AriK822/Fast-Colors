
import "./style/circle_edge_spinner.css";

function CicleEdgeSpinner({ size = "1em", className="", color = "var(--theme-accent)" }) {
  return (
    <span
      className={`circle-edge-spinner ${className}`}
      style={{ fontSize: size, color }}
    >
      <span className="circle-edge-spinner-circle" />
    </span>
  );
}

export default CicleEdgeSpinner;
