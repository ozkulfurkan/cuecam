import { Redirect } from 'expo-router';

// Placeholder route behind the Record tab. Tab presses are intercepted in the
// tabs layout; this only runs if the route is reached directly (e.g. a deep link).
export default function StartRecordingRoute() {
  return <Redirect href="/record" />;
}
