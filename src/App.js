import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import PhotoSnap from "./PhotoSnap/PhotoSnap";

function App() {
  return (
    <div className="">
      <header className="text-center p-4">
        <p className="display-3">Foto Booth</p>
      </header>
      <div className="d-flex justify-content-center">
        <PhotoSnap
          initialMode="camera"
          width={500}
          cropTop="top"
          cropLeft="center"
          cropRatio={0.75}
          cropHeight={1}
        />
      </div>
    </div>
  );
}

export default App;
