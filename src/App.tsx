import { Route, Router } from "@solidjs/router";
import { Layout } from "./components/Header";
import { CreateEvent } from "./pages/CreateEvent";
import { EventPage } from "./pages/EventPage";
import { JoinEvent } from "./pages/JoinEvent";
import { Landing } from "./pages/Landing";

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Landing} />
      <Route path="/create" component={CreateEvent} />
      <Route path="/join" component={JoinEvent} />
      <Route path="/event/:eventName" component={EventPage} />
    </Router>
  );
}
