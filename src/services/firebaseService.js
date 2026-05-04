import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const DEFAULT_ROLE = "üye";

export const registerUserToFirestore = async (user, additionalData = {}) => {
  if (!user || !user.uid) {
    throw new Error("Geçerli bir kullanıcı nesnesi gerekli.");
  }

  const userRef = doc(db, "kullanicilar", user.uid);

  const userData = {
    uid: user.uid,
    email: user.email,
    username: additionalData.username || user.displayName || "",
    rol: DEFAULT_ROLE,
    olusturmaTarihi: serverTimestamp(),
    emailVerified: user.emailVerified || false,
    sonGiris: serverTimestamp(),
    ...additionalData,
  };

  await setDoc(userRef, userData, { merge: true });

  return userData;
};

export const updateUserLoginTime = async (uid) => {
  if (!uid) return;

  const userRef = doc(db, "kullanicilar", uid);
  await setDoc(
    userRef,
    { sonGiris: serverTimestamp() },
    { merge: true }
  );
};
