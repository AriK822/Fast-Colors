import "./style/fullscreen_loader.css";


function FullScreen({ text, transparent = false }) {
  return (
    <div className={`loading-overlay ${transparent ? 'transparent' : ''}`}>
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
}


export default FullScreen
