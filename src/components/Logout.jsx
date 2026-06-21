import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const logout = async () => {
  await signOut(auth);
};