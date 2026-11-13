/**
 * Extends app.json with values that must not be committed.
 * GOOGLE_MAPS_ANDROID_API_KEY comes from .env locally and from EAS environment
 * variables in cloud builds. Without it the app ships with the simple fallback map
 * instead of crashing on the native Google map.
 */
module.exports = ({ config }) => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(mapsKey ? [['react-native-maps', { androidGoogleMapsApiKey: mapsKey }]] : []),
    ],
    extra: { ...config.extra, googleMapsEnabled: Boolean(mapsKey) },
  };
};
