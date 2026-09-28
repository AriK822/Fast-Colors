import "./style/inside_spinner.css";

function Spinner({ size = "1em", color = "currentColor" }) {
  return (
    <span className="spinner" style={{ fontSize: size, color }}>
      <span className="spinner-dot"></span>
      <span className="spinner-dot"></span>
      <span className="spinner-dot"></span>
    </span>
  );
}

export default Spinner;

