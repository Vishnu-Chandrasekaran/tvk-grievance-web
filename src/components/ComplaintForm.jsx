import React, { useEffect, useState } from "react";
import Header from "./Header";
import { FaChevronLeft, FaImage, FaVideo, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationPicker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const cleanLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      setPosition(cleanLocation);
      setLocation(cleanLocation);
    },
  });

  return position ? <Marker position={position} /> : null;
}
const ComplaintForm = () => {
    const nav = useNavigate();

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]);
  const [location, setLocation] = useState({
  lat: 11.0168,
  lng: 76.9558,
});

useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setLocation(userLoc);
      setMapCenter([userLoc.lat, userLoc.lng]);
    },
    (error) => {
      console.error(error);
    }
  );
}, []);

  const handleSubmit = async () => {
  const uploadedFiles = [];

  for (let file of files) {
    const fileRef = ref(storage, `complaints/${uuid()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    uploadedFiles.push({
      name: file.name,
      url,
      type: file.type,
    });
  }

  await addDoc(collection(db, "complaints"), {
    description,
    location: {
      lat: Number(location.lat),
      lng: Number(location.lng),
    },
    files: uploadedFiles,
    department: "IT Support", // later make dropdown
    createdAt: new Date(),
    status: "pending",
  });

  alert("Complaint submitted successfully");
};
  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex items-center mt-4 md:mt-8 bg-gradient-to-r from-[#780301] to-[#B10D07] text-white">
            <div className="mb-4  p-4">
            <FaChevronLeft onClick={()=> nav('/home')}/>

            </div>
          <div className="mb-4  p-4">
            <h2 className="text-md font-semiboldg">Trackable Issue</h2>
            <p className="font-medium text-xs">கண்காணிக்கக்கூடிய புகார்</p>
          </div>
        </div>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          
          <h3 className="font-semibold mb-2">Describe Your Complaint</h3>

          <textarea
            className="w-full border p-2 rounded mb-4"
            rows="4"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* 📍 MAP LOCATION PICKER */}
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FaMapMarkerAlt /> Select Location
          </h3>

          <div className="h-64 mb-4">
            <MapContainer
              center={mapCenter} // default (change if needed)
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker setLocation={setLocation} />
            </MapContainer>
          </div>

          {/* 📎 ATTACHMENTS */}
          <h3 className="font-semibold mb-2">Attachments</h3>

          <div className="flex gap-4 mb-4">
            <label className="cursor-pointer flex items-center gap-2 border p-2 rounded">
              <FaImage />
              Image
              <input
                type="file"
                accept="image/*"
                hidden
                multiple
                onChange={(e) => setFiles([...files, ...e.target.files])}
              />
            </label>

            <label className="cursor-pointer flex items-center gap-2 border p-2 rounded">
              <FaVideo />
              Video
              <input
                type="file"
                accept="video/*"
                hidden
                multiple
                onChange={(e) => setFiles([...files, ...e.target.files])}
              />
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-red-800 text-white py-3 rounded flex items-center justify-center gap-2"
          >
            🚀 Send Complaint
          </button>
          </form>
      </div>
    </>
  );
}

export default ComplaintForm