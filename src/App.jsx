import { useState } from "react";
import OtpLogin from "./components/Login";
import Header from "./components/Header";

export default function App() {
  const [user, setUser] = useState(null);

  // if (!user) {
  //   return <OtpLogin setUser={setUser} />;
  // }

  return (
    <div>
      <Header />
      <OtpLogin setUser={setUser} />
    </div>
  );
}
