"use client";

import { useRouter, useSearchParams } from "next/navigation";

import DonationForm from "@/components/volunteer/DonationForm";
import VolunteerForm from "@/components/volunteer/VolunteerForm";

type Mode = "volunteer" | "donate";

export default function GetInvolvedForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: Mode = searchParams.get("mode") === "donate" ? "donate" : "volunteer";

  const setMode = (next: Mode) => {
    router.replace(`/volunteer?mode=${next}#volunteer-form`, { scroll: false });
  };

  return (
    <div className="involved-form">
      <fieldset className="involved-toggle">
        <legend>How would you like to get involved?</legend>
        <div className="involved-toggle-options">
          <label htmlFor="mode-volunteer">
            <input
              id="mode-volunteer"
              type="radio"
              name="involvement"
              value="volunteer"
              checked={mode === "volunteer"}
              onChange={() => setMode("volunteer")}
            />
            <span>Volunteer</span>
          </label>
          <label htmlFor="mode-donate">
            <input
              id="mode-donate"
              type="radio"
              name="involvement"
              value="donate"
              checked={mode === "donate"}
              onChange={() => setMode("donate")}
            />
            <span>Donate</span>
          </label>
        </div>
      </fieldset>

      {mode === "volunteer" ? (
        <>
          <p className="form-mode-note">
            Share your interests and availability and we&apos;ll get in touch about a suitable opportunity.
          </p>
          <VolunteerForm />
        </>
      ) : (
        <>
          <p className="form-mode-note">
            Leave your contact details and our team will follow up with the current ways to give.
          </p>
          <DonationForm />
        </>
      )}
    </div>
  );
}
