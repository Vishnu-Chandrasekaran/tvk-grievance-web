import React, { useEffect, useState } from "react";
import Header from "./Header";
import {
  FaChevronLeft,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaPaperPlane,
  FaLocationArrow,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import { IoDocumentOutline, IoVideocamOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";

import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Leaflet marker images don't bundle correctly with most
// build tools (Vite/CRA/webpack). Point them at the CDN instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Lets the user drop the complaint pin by clicking anywhere on the map.
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Keeps the map view in sync when we recenter programmatically
// (e.g. after "Use my current location").
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Turns coordinates into a readable address using OpenStreetMap's free
// Nominatim service (same provider as the map tiles, no API key needed).
// Falls back to plain coordinates if the lookup fails or is offline.
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=0`,
    );
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const ComplaintForm = () => {
  const nav = useNavigate();

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]);

  // The pin the complaint will actually be filed against.
  const [location, setLocation] = useState({ lat: 11.0168, lng: 76.9558 });
  // Raw GPS reading, shown as a small "you are here" dot.
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Human-readable version of `location`, shown to the user instead of
  // raw coordinates.
  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setAddressLoading(true);
    reverseGeocode(location.lat, location.lng).then((result) => {
      if (!cancelled) {
        setAddress(result);
        setAddressLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [location]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsLocation(userLoc);
        setLocation(userLoc);
        setMapCenter([userLoc.lat, userLoc.lng]);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setLocating(false);
      },
    );
  };

  useEffect(() => {
    handleUseMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...e.target.files]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

  const handleSubmit = async () => {
    try {
      const uploadedFiles = [];

      for (let file of files) {
  const fileRef = ref(storage, `complaints/${uuid()}-${file.name}`);

  // 1️⃣ upload to Firebase Storage
  await uploadBytes(fileRef, file);

  // 2️⃣ get download URL (optional for preview)
  const url = await getDownloadURL(fileRef);

  // 3️⃣ convert file to base64 for SendGrid attachment
  const base64 = await toBase64(file);

  uploadedFiles.push({
    name: file.name,
    type: file.type,
    url,        // optional (UI use)
    content: base64 // 🔥 REQUIRED for email attachment
  });
}

      await addDoc(collection(db, "complaints"), {
        description,
        location: {
          lat: Number(location.lat),
          lng: Number(location.lng),
          address,
        },
        files: uploadedFiles,
        department: "IT Support",
        createdAt: new Date(),
        status: "pending",
      });

      alert("Complaint submitted successfully");
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto text-[#425867] ">
        {/* TITLE BAR */}
        <div className="flex items-center bg-gradient-to-r from-[#780301] to-[#B10D07] text-white">
          <div className="p-4">
            <FaChevronLeft
              className="cursor-pointer"
              onClick={() => nav("/home")}
            />
          </div>
          <div className="p-4">
            <h2 className="text-md font-semibold">Drug Complaint</h2>
            <p className="font-medium text-xs">கண்காணிக்கக்கூடிய புகார்</p>
          </div>
        </div>
        <div className="container mx-auto p-4">

        {/* TWO-PANEL LAYOUT
            Mobile: items stack in DOM order (fields -> map -> button).
            Desktop: explicit grid placement puts the button back under
            the fields card, with the map spanning the full right column. */}
        <div className="grid gap-4 mt-4 md:grid-cols-2 md:grid-rows-[1fr_auto] items-stretch">
          {/* LEFT: FORM CARD (fields only, button lives outside this card now) */}
          <div className="bg-white shadow-md rounded-2xl p-6 md:col-start-1 md:row-start-1">
            <h3 className="font-semibold mb-3">Describe Your Complaint</h3>

            <label
              htmlFor="complaint-location"
              className="text-xs font-medium text-gray-500 mb-1 block"
            >
              Selected Location
            </label>
            <input
              id="complaint-location"
              type="text"
              readOnly
              value={addressLoading ? "Detecting address..." : address}
              placeholder="Tap a spot on the map to set a location"
              className="w-full border border-gray-200 p-3 rounded-lg mb-4 text-sm text-gray-700 bg-gray-50"
            />

            <textarea
              className="w-full border border-gray-200 p-3 rounded-lg mb-6 text-sm"
              rows="5"
              placeholder="enter your complaint"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <h3 className="font-semibold mb-3">Attachments</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-5 hover:bg-gray-50 transition">
                <MdOutlineImage className="text-[#780301]" />
                <span className="text-sm">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </label>

              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-5 hover:bg-gray-50 transition">
                <IoVideocamOutline className="text-[#780301]" />
                <span className="text-sm">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </label>

              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-5 hover:bg-gray-50 transition">
                <IoDocumentOutline className="text-[#780301]" />
                <span className="text-sm">Document</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {files.length > 0 && (
              <ul className="text-xs text-gray-600 mb-4 space-y-1">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red-700 ml-2"
                      aria-label={`Remove ${f.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RIGHT: MAP CARD — spans both rows on desktop so it matches
              the combined height of the fields card + button below it */}
          <div className="bg-white shadow-md rounded-2xl p-2 relative min-h-[28rem] md:col-start-2 md:row-start-1 md:row-span-2">
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="absolute top-4 right-4 z-[1000] bg-black/80 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 shadow hover:bg-black"
            >
              <FaLocationArrow />
              {locating ? "Locating..." : "Use my current location"}
            </button>

            <div className="h-full rounded-xl overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap center={mapCenter} />
                <LocationPicker onPick={setLocation} />

                {location && <Marker position={[location.lat, location.lng]} />}

                {gpsLocation && (
                  <CircleMarker
                    center={[gpsLocation.lat, gpsLocation.lng]}
                    radius={7}
                    pathOptions={{
                      color: "#1d4ed8",
                      fillColor: "#3b82f6",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* SEND BUTTON — its own grid item so mobile order (fields, map,
              button) can differ from desktop order (button sits under the
              fields card, beside the map) */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#7a0e0e] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#5e0a0a] transition md:col-start-1 md:row-start-2"
          >
            <FaPaperPlane /> Register Complaint
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintForm;
