import { Redirect } from 'expo-router';

/** Legacy tab route — camera now opens as a ChatGPT-style half-sheet modal. */
export default function ScannerPageRedirect() {
  return <Redirect href="/scanner" />;
}
