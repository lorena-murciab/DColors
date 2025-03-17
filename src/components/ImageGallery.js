import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Gallery = () => {
  return (
    <div className="container my-5">
      <div className="row">
        {/* Primera columna */}
        <div className="col-lg-4 col-md-12 mb-4">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(73).webp"
            className="w-100 shadow rounded mb-4"
            alt="Boat on Calm Water"
          />
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Vertical/mountain1.webp"
            className="w-100 shadow rounded mb-4"
            alt="Wintry Mountain Landscape"
          />
        </div>

        {/* Segunda columna */}
        <div className="col-lg-4 mb-4">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Vertical/mountain2.webp"
            className="w-100 shadow rounded mb-4"
            alt="Mountains in the Clouds"
          />
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(73).webp"
            className="w-100 shadow rounded mb-4"
            alt="Boat on Calm Water"
          />
        </div>

        {/* Tercera columna */}
        <div className="col-lg-4 mb-4">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(18).webp"
            className="w-100 shadow rounded mb-4"
            alt="Waves at Sea"
          />
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/Vertical/mountain3.webp"
            className="w-100 shadow rounded mb-4"
            alt="Yosemite National Park"
          />
        </div>
      </div>
    </div>
  );
};

export default Gallery;
