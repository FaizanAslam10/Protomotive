export default function Preloader() {
  return (
    <div id="de-loader">
      <div className="loader-content">
        <img src="/assets/images/center-logo-shield.png" alt="Logo" width="321" height="275" />
        <div className="lds-roller">
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    </div>
  );
}