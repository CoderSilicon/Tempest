/**
 * Solar and lunar ephemerides.
 *
 * These are what make Tempest's day/night real: the sun in the sky is
 * where the sun actually is for that latitude and longitude at that
 * instant, and the moon is where the moon actually is, at the phase it
 * is actually showing. No colour filters, no guessing.
 *
 * Solar: NOAA low-precision approximation.
 * Lunar: truncated series from Meeus, "Astronomical Algorithms" ch. 47.
 * Both are accurate to a fraction of a degree, which is far beyond what
 * the eye can resolve here.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const toJulian = (unixSeconds: number) => unixSeconds / 86400 + 2440587.5;

export interface SunPosition {
  /** degrees above the horizon; negative at night */
  altitude: number;
  /** degrees clockwise from north */
  azimuth: number;
  /** -1..1, smooth twilight ramp for lighting */
  daylight: number;
}

export interface MoonPosition {
  altitude: number;
  azimuth: number;
  /** 0 new .. 0.5 full .. 1 new */
  phase: number;
  /** 0..1 illuminated fraction of the disc */
  illumination: number;
  /** earth radii, for apparent size */
  distance: number;
}

/* ────────────────────────── sun ────────────────────────── */

export const solarPosition = (
  unixSeconds: number,
  latitude: number,
  longitude: number,
): SunPosition => {
  const n = toJulian(unixSeconds) - 2451545.0;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;

  const declination = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const rightAsc = Math.atan2(
    Math.cos(eps) * Math.sin(lambda),
    Math.cos(lambda),
  );

  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const lst = (gmst * 15 + longitude) * RAD;
  const hourAngle = lst - rightAsc;

  const lat = latitude * RAD;
  const altitude =
    Math.asin(
      Math.sin(lat) * Math.sin(declination) +
        Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle),
    ) * DEG;

  const azimuth =
    (Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(lat) - Math.tan(declination) * Math.cos(lat),
    ) *
      DEG +
      180) %
    360;

  // Smooth ramp: full light well above the horizon, deep blue just after.
  const daylight = Math.max(0, Math.min(1, (altitude + 6) / 14));

  return { altitude, azimuth, daylight };
};

/* ────────────────────────── moon ───────────────────────── */

/** Local apparent sidereal time in degrees. */
const siderealDegrees = (unixSeconds: number, longitude: number) => {
  const n = toJulian(unixSeconds) - 2451545.0;
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  return (((gmst * 15 + longitude) % 360) + 360) % 360;
};

/**
 * Equatorial -> horizontal for an observer at (lat, lon).
 * Returns { altitude, azimuth } in degrees.
 */
const equatorialToHorizontal = (
  rightAscDeg: number,
  declinationDeg: number,
  latitude: number,
  longitude: number,
  unixSeconds: number,
) => {
  const lst = siderealDegrees(unixSeconds, longitude);
  const hourAngle = (lst - rightAscDeg) * RAD;
  const dec = declinationDeg * RAD;
  const lat = latitude * RAD;

  const altitude =
    Math.asin(
      Math.sin(lat) * Math.sin(dec) +
        Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle),
    ) * DEG;

  const azimuth =
    ((Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat),
    ) *
      DEG +
      180) %
      360 +
      360) %
    360;

  return { altitude, azimuth };
};

export const lunarPosition = (
  unixSeconds: number,
  latitude: number,
  longitude: number,
): MoonPosition => {
  const n = toJulian(unixSeconds) - 2451545.0;

  // Mean elements.
  const Lp = 218.316 + 13.176396 * n; // mean longitude
  const M = 134.963 + 13.064993 * n; // mean anomaly
  const F = 93.272 + 13.22935 * n; // argument of latitude
  const D = 297.850 + 12.190749 * n; // mean elongation
  const Ms = 357.528 + 0.9856003 * n; // sun mean anomaly

  const Mm = M * RAD;
  const Fs = F * RAD;
  const Ds = D * RAD;
  const Mss = Ms * RAD;

  // Ecliptic longitude and latitude, plus the equation of the centre.
  const lambda =
    Lp +
    6.289 * Math.sin(Mm) +
    1.274 * Math.sin(2 * D - Mm) +
    0.658 * Math.sin(2 * Ds) +
    0.214 * Math.sin(2 * Mm) -
    0.186 * Math.sin(Mss) -
    0.114 * Math.sin(2 * Fs);

  const beta =
    5.128 * Math.sin(Fs) +
    0.281 * Math.sin(Mm + Fs) -
    0.278 * Math.sin(Fs - Mm) +
    0.173 * Math.sin(2 * Ds - Fs);

  const distanceKm =
    385001 - 20905 * Math.cos(Mm) - 3699 * Math.cos(2 * Ds - Mm) - 2956 * Math.cos(2 * D);

  // Obliquity, then ecliptic -> equatorial.
  const eps = (23.4393 - 0.013 * n / 36525) * RAD;
  const lam = lambda * RAD;
  const bet = beta * RAD;
  const sinLam = Math.sin(lam);
  const rightAsc =
    Math.atan2(
      sinLam * Math.cos(eps) - Math.tan(bet) * Math.sin(eps),
      Math.cos(lam),
    ) * DEG;
  const declination =
    Math.asin(
      Math.sin(bet) * Math.cos(eps) + Math.cos(bet) * Math.sin(eps) * sinLam,
    ) * DEG;

  const { altitude, azimuth } = equatorialToHorizontal(
    ((rightAsc % 360) + 360) % 360,
    declination,
    latitude,
    longitude,
    unixSeconds,
  );

  // Phase from the *actual* geocentric elongation, i.e. the real
  // difference in ecliptic longitude between moon and sun. Using the
  // mean elongation here (Meeus' shortcut) is wrong by enough to report
  // 0.70 illumination on a full moon.
  const epsSun = (23.439 - 0.0000004 * n) * RAD;
  const sunLambda =
    ((280.46 + 0.9856474 * n) % 360 +
      1.915 * Math.sin(((357.528 + 0.9856003 * n) % 360) * RAD) +
      0.02 * Math.sin(2 * ((357.528 + 0.9856003 * n) % 360) * RAD)) *
    RAD;

  // Correct for lunar latitude so the separation is a true angle.
  const cosElong =
    Math.sin(bet) * Math.sin(epsSun) +
    Math.cos(bet) * Math.cos(epsSun) * Math.cos(lam - sunLambda);
  const elongation = Math.acos(Math.max(-1, Math.min(1, cosElong))) * DEG;

  const illuminated = (1 - Math.cos(elongation * RAD)) / 2;
  const phase = (elongation / 360) % 1;

  return {
    altitude,
    azimuth,
    phase,
    illumination: illuminated,
    distance: 6371 / distanceKm,
  };
};

/* ─────────────────────── shared helpers ─────────────────────── */

/**
 * Unit vector toward a body, in the camera's space: +X east, +Y up,
 * -Z toward the equator (south for northern observers). Facing the
 * equator rather than north keeps the noon sun in frame.
 */
export const bodyVector = (altitude: number, azimuth: number): [number, number, number] => {
  const alt = altitude * RAD;
  const az = azimuth * RAD;
  const cosAlt = Math.cos(alt);
  return [cosAlt * Math.sin(az), Math.sin(alt), cosAlt * Math.cos(az)];
};

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export const compassLabel = (bearing: number) =>
  COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];

/**
 * Rough geomagnetic latitude proxy from geographic latitude. Used only
 * to decide whether an aurora is plausible; not a real model.
 */
export const auroraPotential = (latitude: number) =>
  Math.max(0, Math.min(1, (Math.abs(latitude) - 54) / 16));
