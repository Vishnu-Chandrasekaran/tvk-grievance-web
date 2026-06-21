import { signOut } from "firebase/auth";
import { auth } from "../firebase";

// Standalone logout utility. Prefer the `logout` function from
// AuthContext where possible (e.g. in Header) since it's already wired
// to the rest of the app's auth state — this is kept for any call site
// that doesn't have access to the context.
export async function logout() {
  await signOut(auth);
}
