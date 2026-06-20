import { useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/TNLogo.png";
import loginBanner from "../assets/HomeHero.png";
import { MdLocalPhone } from "react-icons/md";

export default function OtpLogin({ setUser }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp

  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  //   // ✅ Initialize reCAPTCHA ONLY ONCE
  //   useEffect(() => {
  //     if (!recaptchaRef.current) {
  //       recaptchaRef.current = new RecaptchaVerifier(
  //         auth,
  //         "recaptcha-container",
  //         {
  //           size: "invisible"
  //         }
  //       );

  //       recaptchaRef.current.render();
  //     }
  //   }, []);

  //   // 📲 SEND OTP
  //   const sendOtp = async () => {
  //     setError("");
  //     setMessage("");
  //     if (!phone) return setError("Please enter a valid phone number.");
  //     try {
  //       setLoading(true);
  //       const appVerifier = recaptchaRef.current;

  //       confirmationRef.current = await signInWithPhoneNumber(
  //         auth,
  //         phone,
  //         appVerifier
  //       );

  //       setStep("otp");
  //       setMessage("OTP sent. Check your phone.");
  //     } catch (err) {
  //       console.error(err);
  //       setError(err?.message || "Could not send OTP.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // 🔐 VERIFY OTP
  //   const verifyOtp = async () => {
  //     setError("");
  //     setMessage("");
  //     if (!otp) return setError("Enter the OTP sent to your phone.");
  //     try {
  //       setLoadingVerify(true);
  //       const result = await confirmationRef.current.confirm(otp);

  //       const user = result.user;

  //       setUser({
  //         uid: user.uid,
  //         phone: user.phoneNumber
  //       });

  //       setMessage("Login successful!");
  //     } catch (err) {
  //       console.error(err);
  //       setError("Invalid or expired OTP.");
  //     } finally {
  //       setLoadingVerify(false);
  //     }
  //   };

  //   const onKeyDownPhone = (e) => {
  //     if (e.key === "Enter") sendOtp();
  //   };

  //   const onKeyDownOtp = (e) => {
  //     if (e.key === "Enter") verifyOtp();
  //   };

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
                className="w-full border rounded-lg pl-14 pr-4 py-3 bg-[#F8ECEC] text-[#C89292]"
              />
            </div>

            {/* <input
              type="tel"
              placeholder={<p><MdLocalPhone /> | Enter mobile number</p>}
              className="w-full border rounded-lg px-4 py-3 mb-4 bg-[#F8ECEC] text-[#C89292]"
            /> */}

            <button className="w-full bg-[#7B0200] text-white py-3 rounded-lg hover:bg-[#9b0704]">
              Send OTP
            </button>

            <p className="text-[12px] text-[#A56B6B] mt-4 text-center font-medium leading-4">
              We will send a one-time code to verify your number. Standard SMS rates may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
