"use client";
export default function ResetMeasurementConsent() {
  return <button className="btn-outline mt-4" onClick={() => {
    localStorage.setItem("mr:consent", "essential-only");
    localStorage.removeItem("mr:measurement-consent");
    sessionStorage.removeItem("mr:measurement-session");
    window.dispatchEvent(new Event("mr:consent-change"));
  }}>Désactiver la mesure du parcours</button>;
}
