import React from "react";
import "./App.css";
import PhotoBooth from "./PhotoBooth";

function App() {
  return (
    <div className="">
      <header className="text-center p-4">
        <p className="display-3">Foto Booth</p>
      </header>
      <PhotoBooth
        width={500}
        cropTop="top"
        cropLeft="center"
        cropRatio={0.75}
        cropHeight={1}
      />
    </div>
  );
}

export default App;
