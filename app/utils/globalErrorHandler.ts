import { Alert } from 'react-native';

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsShape = {
  getGlobalHandler: () => GlobalErrorHandler;
  setGlobalHandler: (handler: GlobalErrorHandler) => void;
};

let installed = false;
let lastAlertAt = 0;

/**
 * Render errors are caught by the route ErrorBoundary, but an error thrown from a tap handler, timer or
 * native-module callback reaches React Native's global handler, which closes a release build on the spot.
 * In release builds this logs the error and shows a short alert instead, so the user keeps their place.
 * Development builds keep the red error screen so problems stay visible.
 */
export function installGlobalErrorHandler() {
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsShape }).ErrorUtils;
  if (installed || !errorUtils) return; // ErrorUtils only exists on native, not the web share page.
  installed = true;
  const defaultHandler = errorUtils.getGlobalHandler();

  errorUtils.setGlobalHandler((error, isFatal) => {
    console.error(isFatal ? 'Uncaught fatal error:' : 'Uncaught error:', error);
    if (__DEV__) {
      defaultHandler(error, isFatal);
      return;
    }
    // Several errors from one failure arrive together; show a single alert.
    const now = Date.now();
    if (isFatal && now - lastAlertAt > 5_000) {
      lastAlertAt = now;
      Alert.alert('Something went wrong', 'That action could not be completed. Please try again.');
    }
  });
}
