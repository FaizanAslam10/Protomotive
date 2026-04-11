export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row gx-5">
          <div className="col-lg-3 col-sm-6 text-center">
            <img src="/images/footlogo.png" className="logo-footer" alt="" />
            <div className="spacer-20"></div>
            <div className="social-icons mb-sm-30">
              <a href="https://www.facebook.com/people/Protomotive/61588229888849/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/protomotive.pk/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="widget">
              <h5 className="subtitle-line">Contact Us</h5>
              <div className="fw-bold text-white">
                <i className="icofont-location-pin id-color"></i>Head Office
              </div>
              <a href="https://maps.app.goo.gl/7cBt29ZrMHADxvjQ9" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Plot 413,<br /> 
                DHA Phase 8 - Ex Park View Block D Park View CHS, <br />
                Lahore
              </a>
              <div className="spacer-20"></div>
              <div className="fw-bold text-white">
                <i className="icofont-phone id-color"></i>Call Us
              </div>
              <a href="tel:+19056703484" style={{ color: 'inherit', textDecoration: 'underline' }}>0300 5005666</a>
              <div className="spacer-20"></div>
              <div className="fw-bold text-white">
                <i className="icofont-envelope id-color"></i>Email Us
              </div>
              <a href="mailto:habibianofficial@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>habibianofficial@gmail.com</a>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="widget">
              <h5 className="subtitle-line">Our Services</h5>
              <ul>
                <li><a href="/services?service=detailing">Detailing</a></li>
                <li><a href="/services?service=vehicle-wrap">Vehicle Wraps</a></li>
                <li><a href="/services?service=ceramic-coating">Ceramic Coating</a></li>
                <li><a href="/services?service=paint-protection-film">Paint Protection Film (PPF)</a></li>
                <li><a href="/services?service=maintenance">Maintenance</a></li>
                <li><a href="/services?service=window-tinting">Window Tinting</a></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="widget">
              <h5 className="subtitle-line">About Us</h5>
              <p>Protomotive is a unique state of the art auto care facility that provides outstanding customer service. We pride ourselves on using only the best materials and most competent professionals.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}