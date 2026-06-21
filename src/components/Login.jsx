import { useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/TNLogo.png";
import loginBanner from "../assets/HomeHero.png";
import { MdLocalPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function OtpLogin({ setUser }) {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const navigate = useNavigate(); // phone | otp

  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

    // ✅ Initialize reCAPTCHA ONLY ONCE
  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible"
        }
      );

      recaptchaRef.current.render();
    }
  }, []);

  // 📲 SEND OTP
  const sendOtp = async () => {
    try {
      if (!phone) return alert("Enter phone number");

      const appVerifier = recaptchaRef.current;

      confirmationRef.current = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      setStep("otp");
      alert("OTP sent successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // 🔐 VERIFY OTP
  const verifyOtp = async () => {
    try {
      if (!otp) return alert("Enter OTP");

      const result = await confirmationRef.current.confirm(otp);

      const user = result.user;

      setUser({
        uid: user.uid,
        phone: user.phoneNumber
      });
      navigate("/home");

      alert(`Login successful! Welcome ${user.phoneNumber} ${user.uid}`);
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
  };

  return (
    <div className=" flex items-center justify-center md:p-4">
      <div className="relative w-full max-w-7xl mx-auto px-4">
        <img
          src={loginBanner}
          alt="Logo"
          className="w-full h-auto rounded-2xl object-cover"
        />
        <div className="w-full mt-6 md:absolute md:top-1/2 md:right-[-5%]  md:-translate-y-1/2 md:w-[320px] lg:w-[380px] xl:w-[420px]">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold mb-6">Login</h2>

            <label className="block mb-2 text-gray-700">Mobile Number</label>
            <div className="relative mb-4">
              <MdLocalPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C89292] text-xl" />

              <div className="absolute left-11 top-1/2 -translate-y-1/2 h-5 w-px bg-[#C89292]" />

              <input
                type="tel"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => {
                  let val = e.target.value || "";
                  val = val.replace(/\s+/g, "");
                  if (!val.startsWith("+91")) {
                    // strip any leading + or 91 and non-digits
                    const digits = val.replace(/^\+?91/, "").replace(/\D/g, "").slice(0, 10);
                    setPhone("+91" + digits);
                  } else {
                    const rest = val.slice(3).replace(/\D/g, "").slice(0, 10);
                    setPhone("+91" + rest);
                  }
                }}
                onFocus={() => {
                  if (!phone || !phone.startsWith("+91")) setPhone("+91");
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Backspace" || e.key === "Delete") && e.currentTarget.selectionStart <= 3) {
                    e.preventDefault();
                  }
                }}
                className="w-full border rounded-lg pl-14 pr-4 py-3 bg-[#F8ECEC] text-[#C89292]"
              />
            </div>
            {step === "phone" && (
              <>
                <div id="recaptcha-container" />
                <button
                  className="w-full bg-[#7B0200] text-white py-3 rounded-lg hover:bg-[#9b0704]"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === "otp" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  // onKeyDown={onKeyDownOtp}
                  className="w-full border rounded-lg pr-4 py-3 bg-[#F8ECEC] text-[#C89292] mb-3"
                />
                <button
                  className="w-full bg-[#7B0200] text-white py-3 rounded-lg hover:bg-[#9b0704] mb-2"
                  onClick={verifyOtp}
                  disabled={loadingVerify}
                >
                  {loadingVerify ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  className="w-full bg-gray-200 text-[#7B0200] py-2 rounded-lg"
                  onClick={() => setStep("phone")}
                >
                  Edit Number
                </button>
              </div>
            )}
            <p className="text-[12px] text-[#A56B6B] mt-4 text-center font-medium leading-4">
              We will send a one-time code to verify your number. Standard SMS rates may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
