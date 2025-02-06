export function setUserVerified(email: string) {
  // Store both the verification status and timestamp
  const verificationData = {
    email,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("userVerification", JSON.stringify(verificationData));
}

export function checkUserVerified(): boolean {
  try {
    const verificationData = localStorage.getItem("userVerification");
    if (!verificationData) return false;

    const { timestamp } = JSON.parse(verificationData);
    const verificationTime = new Date(timestamp);
    const currentTime = new Date();

    // Check if verification is less than 24 hours old
    const hoursDifference =
      (currentTime.getTime() - verificationTime.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 48;
  } catch (error) {
    console.error("Error checking verification status:", error);
    return false;
  }
}

export function handleLogout() {
  // Clear user verification data
  localStorage.removeItem("userVerification");
  // You can add more cleanup here if needed
  window.location.href = "/login";
}
