import { LandingActions } from "../components/LandingActions";

export function Landing() {
  return (
    <div class="card card--center">
      <div class="hero">
        <h1>Drinksheet</h1>
        <p>Track drinks together. No login required.</p>
      </div>
      <LandingActions />
    </div>
  );
}
