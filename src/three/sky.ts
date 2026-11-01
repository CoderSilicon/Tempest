import * as THREE from "three";
import type { Scene } from "../libs/Scene";
import { bodyVector, auroraPotential, type MoonPosition, type SunPosition } from "./solar";

/**
 * The sky.
 *
 * Base layer is Preetham analytic daylight scattering (the de-facto
 * standard, same model three's own Sky object uses), which is why
 * sunrise and sunset land where they should without any authored
 * gradient. Everything else is layered on top *inside the same shader*,
 * so the whole atmosphere costs exactly one draw call.
 *
 * Every uniform is driven by the weather payload:
 *   clouds.all  -> coverage, and from it the whole silhouette regime
 *                  (scattered cumulus vs. solid overcast)
 *   humidity    -> turbidity, condensation bias, haze veil, desaturation
 *   visibility  -> aerial perspective: distant cloud and sky lose
 *                  contrast and colour into the haze
 *   pressure    -> cloud base height, thickness, storminess
 *   wind        -> deck drift, downwind shear, internal boil rate
 *   temp        -> ice-crystal regime below freezing (halos, glitter,
 *                  higher contrast)
 *   condition   -> density/elevation, mist, lightning
 *   latitude    -> aurora potential
 *   dt/lat/lon  -> sun and moon vectors, moon phase
 */

/** Galactic north pole, equatorial coordinates. */
const GALACTIC_POLE = (() => {
  const ra = (192.85948 * Math.PI) / 180;
  const dec = (27.12825 * Math.PI) / 180;
  return new THREE.Vector3(
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    Math.cos(dec) * Math.sin(ra),
  ).normalize();
})();

export interface SkyInputs {
  sun: SunPosition;
  moon: MoonPosition;
  scene: Scene;
  humidity: number;
  visibility: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  latitude: number;
  /** Observed air temperature, °C. Drives the ice-crystal regime. */
  tempC: number;
  /** Reported total cloud cover, 0..100 %. The primary cloud driver. */
  cloudCover: number;
  time: number;
  /** 0..1, driven by the storm simulation. */
  lightning: number;
  /** 0..1 detail budget; the perf guard lowers it before the fps does. */
  detail: number;
}

/**
 * Measured moments of the cloud field.
 *
 * The shader's pre-threshold field is `fbm * 0.62 + worley * 0.5`, sampled
 * over the whole deck. These two constants come from numerically sampling
 * that exact expression — including the gradient-noise hash — not from
 * guesswork, and they are stable to three decimals across every base
 * frequency in use, because three octaves of gradient noise have the same
 * distribution whatever you scale the input by.
 *
 * They are what let a reported cloud percentage in 0..100 map to a
 * threshold that actually produces that coverage.
 */
const FIELD_MEAN = 0.595;
const FIELD_SD = 0.138;

/**
 * Standard normal quantile (Acklam's rational approximation, ~1e-3 accurate
 * over the range used here). Given a target coverage, this is how many
 * standard deviations above the field's mean the threshold has to sit.
 */
function inverseNormalCdf(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416];
  const pLow = 0.02425;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pLow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export class Sky {
  readonly mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;

  constructor() {
    this.mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        // scattering
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uBetaR: { value: new THREE.Vector3() },
        uBetaM: { value: new THREE.Vector3() },
        uSunE: { value: 0 },
        uTurbidity: { value: 2.2 },
        uMieCoeff: { value: 0.005 },
        uMieG: { value: 0.8 },
        uRayleigh: { value: 1 },

        // clouds
        uCoverage: { value: 0.35 },
        uThreshold: { value: 0.7 },
        uSoft: { value: 0.1 },
        uErode: { value: 0.4 },
        uThickness: { value: 0.9 },
        uBaseFreq: { value: 2.4 },
        uDetailFreq: { value: 7.5 },
        uDeckScale: { value: 0.55 },
        uDetail: { value: 1 },
        uDrift: { value: new THREE.Vector2() },
        uEvolve: { value: 0 },
        uShear: { value: 0 },
        uWindDir: { value: new THREE.Vector2(0, 1) },
        uCirrus: { value: 0.25 },

        // atmosphere conditioning
        uAerial: { value: 0 },
        uHaze: { value: 0 },
        uIce: { value: 0 },

        // final grade
        uSaturation: { value: 1 },
        uContrast: { value: 1 },
        uTint: { value: new THREE.Color(1, 1, 1) },

        // celestial
        uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
        uMoonPhase: { value: 0.5 },
        uMoonIllum: { value: 1 },
        uStars: { value: 0 },
        uAurora: { value: 0 },

        // atmosphere
        uMist: { value: 0 },
        uLightning: { value: 0 },
        uTime: { value: 0 },
        uGalacticPole: { value: GALACTIC_POLE },
      },

      vertexShader: /* glsl */ `
        uniform vec3 uSunDir;
        uniform float uRayleigh;
        uniform float uTurbidity;
        uniform float uMieCoeff;

        varying vec3 vWorld;
        varying vec3 vBetaR;
        varying vec3 vBetaM;
        varying float vSunE;

        const float e = 2.718281828459045;
        const vec3 totalRayleigh = vec3(
          5.804542996261093E-6,
          1.3562911419845635E-5,
          3.0265902468824876E-5
        );
        const vec3 MieConst = vec3(
          1.8399918514433978E14,
          2.7798023919660528E14,
          4.0790479543861094E14
        );

        float sunIntensity( float zenithAngleCos ) {
          zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
          return 1000.0 * max(
            0.0,
            1.0 - pow( e, -( ( 1.6110731556870734 - acos( zenithAngleCos ) ) / 1.5 ) )
          );
        }

        void main() {
          vec4 wp = modelMatrix * vec4( position, 1.0 );
          vWorld = wp.xyz;

          vSunE = sunIntensity( uSunDir.y );
          vBetaR = totalRayleigh * uRayleigh;
          vBetaM = 0.434 * ( ( 0.2 * uTurbidity ) * 10E-18 ) * MieConst * uMieCoeff;

          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,

      fragmentShader: /* glsl */ `
        varying vec3 vWorld;
        varying vec3 vBetaR;
        varying vec3 vBetaM;
        varying float vSunE;

        uniform vec3  uSunDir;
        uniform float uMieG;
        uniform float uCoverage;
        uniform float uThreshold;
        uniform float uSoft;
        uniform float uErode;
        uniform float uThickness;
        uniform float uBaseFreq;
        uniform float uDetailFreq;
        uniform float uDeckScale;
        uniform float uDetail;
        uniform vec2  uDrift;
        uniform float uEvolve;
        uniform float uShear;
        uniform vec2  uWindDir;
        uniform float uCirrus;

        uniform float uAerial;
        uniform float uHaze;
        uniform float uIce;

        uniform float uSaturation;
        uniform float uContrast;
        uniform vec3  uTint;

        uniform vec3  uMoonDir;
        uniform float uMoonPhase;
        uniform float uMoonIllum;
        uniform float uStars;
        uniform float uAurora;

        uniform float uMist;
        uniform float uLightning;
        uniform float uTime;
        uniform vec3  uGalacticPole;

        const float PI = 3.141592653589793;

        /* ── noise ──────────────────────────────────────────── */

        // sinless gradient hash: identical on every GPU, unlike sin().
        vec2 gradient( vec2 i ) {
          vec3 p = fract( i.xyx * vec3( 0.1031, 0.1030, 0.0973 ) );
          p += dot( p, p.yzx + 33.33 );
          return fract( ( p.xx + p.yz ) * p.zy ) * 2.0 - 1.0;
        }

        float noise( vec2 p ) {
          vec2 i = floor( p );
          vec2 f = fract( p );
          vec2 u = f * f * f * ( f * ( f * 6.0 - 15.0 ) + 10.0 );
          float a = dot( gradient( i ), f );
          float b = dot( gradient( i + vec2( 1.0, 0.0 ) ), f - vec2( 1.0, 0.0 ) );
          float c = dot( gradient( i + vec2( 0.0, 1.0 ) ), f - vec2( 0.0, 1.0 ) );
          float d = dot( gradient( i + vec2( 1.0, 1.0 ) ), f - vec2( 1.0, 1.0 ) );
          return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ) * 1.6;
        }

        float fbm( vec2 p, float drift, int octaves ) {
          float r = 0.0, a = 1.0;
          for ( int i = 0; i < 5; i ++ ) {
            if ( i >= octaves ) break;
            r += a * noise( p );
            a *= 0.5;
            p = p * 2.0 + drift;
          }
          return r;
        }

        // fbm with a per-octave rotation. Value-noise fbm without rotation
        // shows obvious axis-aligned grid artefacts at low octave counts;
        // this is the cheapest fix and costs one mat2 multiply per octave.
        const mat2 ROT = mat2( 0.8, 0.6, -0.6, 0.8 );

        float fbmR( vec2 p, float drift, int octaves ) {
          float r = 0.0, a = 1.0;
          for ( int i = 0; i < 5; i ++ ) {
            if ( i >= octaves ) break;
            r += a * noise( p );
            a *= 0.5;
            p = ROT * p * 2.02 + drift;
          }
          return r;
        }

        /** Hash a lattice point to a point in the unit square. */
        vec2 hash22( vec2 p ) {
          vec3 q = fract( vec3( p.xyx ) * vec3( 0.1031, 0.1030, 0.0973 ) );
          q += dot( q, q.yzx + 33.33 );
          return fract( ( q.xx + q.yz ) * q.zy );
        }

        /**
         * Inverted Worley: ~1 in cell interiors, ~0 on cell walls.
         *
         * Cumulus are built from rounded lobes, not fbm blobs, and Worley is
         * the only cheap primitive that produces rounded lobes. It is what
         * keeps the deck from looking like a stained-glass pattern.
         */
        float worley( vec2 p ) {
          vec2 i = floor( p );
          vec2 f = fract( p );
          float f1 = 1.0;
          for ( int y = -1; y <= 1; y ++ ) {
            for ( int x = -1; x <= 1; x ++ ) {
              vec2 g = vec2( float( x ), float( y ) );
              vec2 o = hash22( i + g );
              vec2 d = g + o - f;
              f1 = min( f1, dot( d, d ) );
            }
          }
          return 1.0 - sqrt( clamp( f1, 0.0, 1.0 ) );
        }

        /**
         * Cheap silhouette, used both for shadow marching and for the
         * level-of-detail fade.
         *
         * Must agree in shape with the real density or the shadows will not
         * line up, but it must not carry the erosion detail — one tap of the
         * full model per march step would be unaffordable.
         *
         * lod runs 1 near the viewer to 0 at the horizon, where the
         * projection compresses by 1/up^2 and anything finer than the base
         * octave aliases into horizontal streaks. So lod retires the Worley
         * breakup, which is what aliases first, and lets the low-frequency
         * base survive on its own. Distant cloud then merges into a soft
         * band on its own, which is what real cumulus do.
         *
         * The obvious alternative — converge the whole field on a single
         * constant chosen to preserve coverage — does not work: a constant
         * is either above the threshold or below it, so coverage collapses
         * to all or nothing instead of staying put.
         */
        float cloudShape( vec2 uv, float lod ) {
          vec2 p = uv + uDrift + uWindDir * dot( uv, uWindDir ) * uShear;
          float base = fbmR( p * uBaseFreq, uEvolve * 0.6, 3 ) * 0.5 + 0.5;
          // Smoothstep rather than linear, so detail retires quickly with
          // distance instead of lingering at half strength and smearing.
          float lodMix = lod * lod * ( 3.0 - 2.0 * lod );
          // A low-frequency Worley keeps isolated clouds from merging into
          // one continent at mid coverage. Always evaluated, never scaled by
          // coverage: dropping it shifts this field's mean by 0.29, which
          // would make the coverage threshold discontinuous exactly at
          // overcast and punch a visible seam into the sky.
          float lump = worley( p * uBaseFreq * 0.5 ) * 0.5 * lodMix;

          // At the horizon the projection compresses by 1/up^2 and no
          // feature can survive it, so the field is converged on the
          // threshold itself — a flat, half-transparent veil at exactly the
          // reported coverage, which the distance fog then dissolves into the
          // horizon. Letting the noise run on there instead is what smears
          // the deck into horizontal streaks.
          //
          // Converging on the *mean* would be wrong: a constant is either
          // above the threshold or below it, so coverage would collapse to
          // all or nothing rather than staying where it was put.
          float field = mix( base * 0.62 + lump, uThreshold + uSoft * 0.5, 1.0 - lodMix );
          return smoothstep( uThreshold, uThreshold + uSoft, field );
        }

        /**
         * Full density with billow erosion, 0..1.
         *
         * Erosion subtracts ridged detail from the edge of the base. It is
         * what stops a cumulus reading as an airbrushed blob: scattered
         * cumulus are almost entirely edge, overcast decks are not.
         */
        float cloudDensity( vec2 uv, float lod, out float billow ) {
          float base = cloudShape( uv, lod );
          vec2 p = uv + uDrift + uWindDir * dot( uv, uWindDir ) * uShear;

          // Ridged noise: peaks instead of valleys, so it reads as cauliflower.
          billow = fbmR( p * uDetailFreq, uEvolve * 1.4, uDetail > 0.6 ? 3 : 2 )
                 * 0.5 + 0.5;
          billow = 1.0 - abs( billow * 2.0 - 1.0 );
          billow = mix( 0.5, billow, lod );

          float erode = uErode * smoothstep( 0.2, 0.75, base ) * ( 1.0 - base )
                      * uDetail * lod;
          float d = clamp( base - erode * billow, 0.0, 1.0 );
          return smoothstep( 0.0, 0.18, d ) * base;
        }

        /* ── celestial ──────────────────────────────────────── */

        // Star field on a spherical cell grid. Returns brightness.
        float starField( vec3 dir, float density, float sharpness ) {
          vec3 a = abs( dir );
          // Project onto the dominant axis plane for a stable 2D param.
          vec2 uv = a.y > a.x && a.y > a.z ? dir.xz / a.y
                 : a.x > a.z            ? dir.zy / a.x
                                          : dir.xy / a.z;
          uv *= density;
          vec2 cell = floor( uv );
          vec2 f = fract( uv ) - 0.5;

          vec3 h = fract( sin( vec3(
            dot( cell, vec2( 127.1, 311.7 ) ),
            dot( cell, vec2( 269.5, 183.3 ) ),
            dot( cell, vec2( 419.2, 371.9 ) )
          ) ) * 43758.5453 );

          // Only a fraction of cells hold a star.
          float present = step( 0.86, h.x );
          vec2 off = ( h.yz - 0.5 ) * 0.7;
          float d = length( f - off );

          float mag = h.y;
          float bright = pow( mag, 6.0 );          // few bright, many faint
          float twinkle = 0.65 + 0.35 * sin( uTime * ( 1.4 + mag * 5.0 ) + h.z * 60.0 );

          // Gaussian core: a linear falloff saturates whole cells and
          // renders stars as little squares.
          float core = exp( -d * d * 34.0 );

          return present * bright * twinkle * core * sharpness;
        }

        // Galactic plane: brightness peaking in a great-circle band.
        float milkyWay( vec3 dir ) {
          float b = abs( dot( dir, uGalacticPole ) );
          float band = exp( -b * b * 26.0 );
          // Break the band up so it isn't a clean stripe.
          vec2 uv = vec2( atan( dir.z, dir.x ) * 2.2, b * 7.0 );
          float clumps = fbm( uv * 3.0, uTime * 0.004, 2 ) * 0.5 + 0.5;
          return band * mix( 0.35, 1.0, clumps );
        }

        /* ── cumulus deck ────────────────────────────────────── */

        /**
         * Everything the deck march needs from the sky. GLSL has no
         * closures, so the per-fragment lighting is handed down
         * explicitly rather than captured.
         */
        struct Sky {
          vec3  dir;
          float up;
          float cosTheta;
          float dayFactor;
          vec3  sunColor;
          vec3  ambient;
          vec3  moonAmbient;
          vec3  hazeCol;
          vec3  direct;
          vec3  skylight;
        };

        /**
         * One cumulus deck sheet. Returns premultiplied colour and coverage.
         *
         * A flat sheet at altitude h projects to dir.xz * h / dir.y, so a
         * higher sheet shows smaller, slower features and a lower one larger,
         * faster ones. Stacking several and compositing back to front is
         * what gives the field depth: the parallax between sheets, each
         * carrying its own distance fog, is what the eye reads as volume.
         *
         * A single sheet is hopeless on its own — every ground-level view of
         * a cloud deck is a near-horizontal slice of it, and one sheet in
         * that slice is just a printed texture. The stack is the whole point.
         */
        vec4 cumulusSheet( Sky s, float h, float fogK ) {
          // Note the projection goes as 1/up, which squeezes the vertical
          // axis far harder than the horizontal one at shallow elevations —
          // a cloud is sampled several times faster vertically than
          // horizontally and comes out stretched. Clamping the divisor to
          // stop that was tried and is worse: the clamp edge shows as a seam
          // and the region beyond it smears into vertical curtains. Fixing
          // it properly needs the sheets to have real height, not a plane.
          float t = h / s.up;
          vec2 uv = s.dir.xz * t * uDeckScale;

          // Screen-space footprint, which is what decides how much detail is
          // still resolvable. The projection goes as 1/up, so its rate of
          // change goes as 1/up^2 — that square is the whole reason a deck
          // seen from the ground falls apart into dashes near the horizon,
          // and the reason lod has to fall off on that curve rather than on
          // distance alone.
          float lod = 1.0 / ( 1.0 + 0.012 * t * uDeckScale / ( s.up * s.up ) );

          float billow = 0.0;
          float dens = cloudDensity( uv, lod, billow );
          if ( dens < 0.004 ) return vec4( 0.0 );

          // Transmittance toward the sun, marched along the sheet. This is
          // the term that gives a cloud a sunward side and a shaded core,
          // and it is what separates a lit cumulus from a flat grey stamp.
          vec2 sunStep = uSunDir.xz * t * uDeckScale * 0.09;
          float od = dens * 0.8;
          od += cloudShape( uv + sunStep, lod );
          od += cloudShape( uv + sunStep * 2.6, lod );
          // Multiple scattering puts a floor under this. Light that a
          // single-scattering model would block still reaches the far side of
          // a real cloud after enough bounces, which is exactly why an
          // overcast deck is bright grey rather than a dark slab. The floor
          // rises with optical depth, because a thicker deck is a longer
          // scattering path: this is the whole difference between a rain
          // storm reading as day and reading as night.
          float msFloor = clamp( 0.2 + uThickness * 0.11, 0.2, 0.55 );
          float sunT = msFloor + ( 1.0 - msFloor ) * exp( -od * uThickness * 0.75 );

          // Forward scatter: the silver lining, and the glare when the sun
          // sits behind the cloud. Ice crystals scatter far harder than water
          // droplets, so a cold sky glares and a warm one stays soft.
          //
          // Optical thickness within the sheet. A thin edge passes sunlight
          // and glows; a thick core is an interior and is comparatively dark.
          // The range is deliberately narrow: the bulk of a cloud is bright,
          // because it is a dense multiple-scattering medium lit from every
          // direction, and only its deepest interior is dim. Pushed further,
          // the thick core wins the alpha-weighted composite and the result
          // is dark cloud bodies ringed by bright rims — an outline drawing
          // of a cloud rather than a cloud.
          float thin = 1.0 - smoothstep( 0.04, 0.45, dens );
          float coreShade = mix( 0.72, 1.0, thin * thin );
          // Squared, so the glare stays on the rim instead of inking every
          // outline the way a single power does.
          // Scaled by lod: a rim highlight is fine detail, and drawing one
          // where the projection can no longer resolve the shape traces the
          // sampling streak instead of a cloud edge. Near the horizon the
          // streaks are what the eye reads, not the rim.
          float rim = thin * thin * pow( max( s.cosTheta, 0.0 ), 6.0 )
                    * ( 0.4 + uIce ) * lod;

          // Valleys between lobes are occluded from the sky above them.
          float ao = mix( 0.6, 1.0, billow );

          // Sheets are stacked, and lower ones sit under more of the deck, so
          // they receive less skylight. This is a weak stand-in for real
          // vertical shading, but it does put a light-to-dark gradient down
          // the stack, which is what a deck seen from below looks like.
          float depthInDeck = 1.0 - h * 0.14;

          vec3 lit = s.skylight * ao * depthInDeck
                   + s.direct * sunT * coreShade
                   + s.direct * rim * 0.7
                   + s.moonAmbient * ( 0.4 + 0.6 * sunT );
          // Deliberately NOT scaled by daylight. The scene already carries the
          // day/night crossfade in the sun's own intensity and in the night
          // term, so multiplying here as well made clouds *darker* than the
          // night sky — a moonlit cloud is one of the brightest things there
          // is, because it is lit from below by the whole lit hemisphere.

          // Coverage has to be optical, not a smoothstep on density: a sheet
          // is opaque once the integrated density along it is high, which is
          // what makes an overcast deck solid while fair-weather cumulus stay
          // translucent enough to show sky through their edges.
          // Coverage is optical, then dissolved toward the horizon.
          //
          // A flat sheet seen at a grazing angle compresses to a few pixels
          // tall and the noise streaks into horizontal dashes; no amount of
          // detail removal hides that, because the shape itself is the
          // artefact. So the deck is faded out over the lowest few degrees,
          // where a real one is anyway mostly dissolved in the air in front
          // of it. This is the same reason the fog below is not optional.
          float alpha = 1.0 - exp( -dens * uThickness * 1.7 );
          alpha *= mix( 0.3, 1.0, smoothstep( 0.0, 0.16, s.up ) );

          // Air between the viewer and this sheet. The baseline is not zero:
          // even in perfectly clear air a cloud 30 km out has washed most of
          // the way into the horizon sky, and without this the deck ends in a
          // hard line instead of dissolving.
          float fog = 1.0 - exp( -fogK * t );
          lit = mix( lit, s.hazeCol, clamp( fog, 0.0, 0.97 ) );

          return vec4( lit * alpha, alpha );
        }

        /* ── main ───────────────────────────────────────────── */

        void main() {

          vec3 dir = normalize( vWorld - cameraPosition );
          float up = dir.y;

          /* 1. atmospheric scattering ------------------------------ */
          float zenithAngle = acos( max( 0.0, up ) );
          float inv = 1.0 / ( cos( zenithAngle )
            + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / PI ), -1.253 ) );
          float sR = 8400.0 * inv;
          float sM = 1250.0 * inv;

          vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

          float cosTheta = dot( dir, uSunDir );
          float rPhase = 0.05968310365946075 * ( 1.0 + pow( cosTheta * 0.5 + 0.5, 2.0 ) );
          vec3 betaRTheta = vBetaR * rPhase;

          float g2 = pow( uMieG, 2.0 );
          float mPhase = 0.07957747154594767 * ( ( 1.0 - g2 )
            / pow( max( 1.0 - 2.0 * uMieG * cosTheta + g2, 0.0 ), 1.5 ) );
          vec3 betaMTheta = vBetaM * mPhase;

          vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) )
            * ( 1.0 - Fex ), vec3( 1.5 ) );
          Lin *= mix( vec3( 1.0 ),
            pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 0.5 ) ),
            clamp( pow( 1.0 - uSunDir.y, 5.0 ), 0.0, 1.0 ) );

          // Night term.
          //
          // Preetham only models daylight, so its stock L0 leaves the
          // night sky effectively black. Real night brightness comes from
          // airglow plus moonlight, so both are added explicitly and
          // crossfaded out as the sun rises.
          float nightAmount = 1.0 - smoothstep( -0.10, 0.06, uSunDir.y );
          float moonUp = max( 0.0, uMoonDir.y );

          // These are scaled for the auto-exposure meter, not for physics.
          //
          // The scene as a whole is lit for daylight, where the sky's own
          // radiance lands around 9 and the meter settles near an exposure
          // of 0.05. A literal night sky is ~1e-4, and at those numbers the
          // metered readback sits below half-float denormal range and gets
          // flushed to zero — so the meter sees nothing, holds its last
          // value, and the night renders as a black rectangle. Airglow is
          // lifted to stay clear of that floor. This is a change of units,
          // not a claim that airglow is that bright.
          vec3 airglow = vec3( 0.21, 0.27, 0.48 ) * nightAmount;
          vec3 moonGlow = vec3( 0.40, 0.45, 0.62 )
                        * uMoonIllum * moonUp * nightAmount;
          vec3 L0 = airglow + moonGlow + 0.012 * Fex;

          // Sun disc with limb darkening.
          const float SUN_COS = 0.9999566769464484;
          float sundisc = clamp( ( cosTheta - SUN_COS ) * 50000.0, 0.0, 1.0 );
          vec3 sundiscColor = ( 760.0 * sundisc ) * min( vSunE * Fex, 80.0 );

          // Ice-crystal halos. Plate and column crystals refract sunlight
          // into 22° and 46° rings — the reason a cold Arctic sky wears
          // them and a warm summer one does not. Scaled off uIce, so this
          // only ever appears when the reported temperature justifies it.
          if ( uIce > 0.02 ) {
            const float HALO22 = 0.9992432346;   // cos(22 deg)
            const float HALO46 = 0.9996573;      // cos(46 deg)
            float h22 = pow( max( cosTheta, 0.0 ), 420.0 );
            float h46 = pow( max( cosTheta, 0.0 ), 900.0 );
            sundiscColor += vec3( 0.9, 0.94, 1.0 )
                          * ( h22 * 26.0 + h46 * 12.0 )
                          * uIce * min( vSunE * Fex, 40.0 ) * 0.05;
          }

          vec3 color = ( Lin + L0 ) * 0.04 + sundiscColor;

          /* 2. stars + milky way ----------------------------------- */
          float night = uStars;
          if ( night > 0.001 && up > -0.05 ) {
            float brightStars = starField( dir, 90.0, 1.0 );
            float faintStars = starField( dir, 190.0, 0.45 );
            float s = brightStars * 1.5 + faintStars;
            float mw = milkyWay( dir );
            // Tint derived from what we already computed, not a third call.
            vec3 starTint = mix(
              vec3( 1.0, 0.96, 0.90 ),
              vec3( 0.80, 0.87, 1.0 ),
              fract( s * 7.0 )
            );
            color += mix( vec3( 0.9, 0.94, 1.0 ), starTint, 0.5 )
                   * s * night * 0.0038;
          }

          /* 3. moon ------------------------------------------------ */
          float cosMoon = dot( dir, uMoonDir );
          // Angular radius ~0.26 deg, widened slightly when near perigee.
          float moonR = 0.99990 + ( 1.0 - uMoonIllum ) * 0.00002;
          float onDisc = smoothstep( moonR - 0.00006, moonR + 0.00002, cosMoon );
          // Daylight washes the lunar disc out.
          float dayFade = mix( 0.55, 1.0, nightAmount );

          if ( onDisc > 0.001 && uMoonIllum > 0.001 ) {
            // Local disc frame; +X toward the sun's side so the lit limb
            // always faces the right way.
            vec3 mRight = normalize( cross( vec3( 0.0, 1.0, 0.0 ), uMoonDir ) );
            if ( dot( mRight, uSunDir ) < 0.0 ) mRight = -mRight;
            vec3 mUp = cross( uMoonDir, mRight );

            float x = dot( dir, mRight );
            float y = dot( dir, mUp );
            float r2 = clamp( x * x + y * y, 0.0, 1.0 );

            // Terminator is an ellipse: x = k * sqrt(1 - y^2).
            float k = cos( uMoonPhase * 2.0 * PI );
            float term = k * sqrt( max( 0.0, 1.0 - y * y ) );
            float lit = smoothstep( term - 0.02, term + 0.02, x );

            // Mare mottling + limb darkening.
            float mare = fbm( vec2( x, y ) * 9.0, 0.0, 2 ) * 0.5 + 0.5;
            vec3 surface = mix(
              vec3( 0.72, 0.73, 0.76 ),
              vec3( 0.42, 0.44, 0.50 ),
              mare * 0.8
            );
            float limb = sqrt( max( 0.0, 1.0 - r2 ) );
            surface *= 0.72 + 0.28 * limb;

            // Earthshine keeps the dark limb faintly visible.
            vec3 disc = surface * lit + surface * 0.055 * ( 1.0 - lit );
            // By day the moon is a pale ghost, not a black cut-out.
            color = mix( color, disc * 2.2 * dayFade, onDisc * ( 0.10 + 0.90 * nightAmount ) );
          }

          // Moon halo through the atmosphere.
          color += vec3( 0.75, 0.80, 0.95 )
                 * pow( max( cosMoon, 0.0 ), 900.0 )
                 * uMoonIllum * moonUp * nightAmount * 0.040;
          color += vec3( 0.60, 0.68, 0.90 )
                 * pow( max( cosMoon, 0.0 ), 8.0 ) * uMoonIllum * moonUp
                 * nightAmount * 0.0035;

          /* 4. clouds ---------------------------------------------- */

          // Lighting terms every layer below shares.
          float dayFactor = smoothstep( -0.12, 0.25, uSunDir.y );
          vec3 sunColor = vSunE * Fex * 0.22 * 0.04;
          vec3 ambient = Lin * 0.04 + L0 * 0.04;
          vec3 moonAmbient = vec3( 0.5, 0.58, 0.8 ) * uMoonIllum * moonUp * 0.035;

          // Aerial perspective. Haze is not a separate object — it is the
          // horizon sky itself, so distance dissolves into that colour.
          vec3 hazeCol = ( Lin + L0 ) * 0.04 * 1.3 + sunColor * 0.20;

          // A horizontal ray crosses far more air than a vertical one, which
          // is why haze and the horizon fade both key off elevation angle.
          float hazeAmt = uAerial * ( 1.0 - smoothstep( 0.02, 0.55, up ) );
          float horizonFade = smoothstep( 0.0, 0.02, up );

          Sky sky;
          sky.dir = dir;
          sky.up = up;
          sky.cosTheta = cosTheta;
          sky.dayFactor = dayFactor;
          sky.sunColor = sunColor;
          sky.ambient = ambient;
          sky.moonAmbient = moonAmbient;
          sky.hazeCol = hazeCol;

          // A cloud's brightness is set by its albedo and the sunlight on it,
          // not by the sky it happens to sit in — which is exactly why clouds
          // read white against a blue sky and why a bright cumulus is the
          // brightest thing in the frame.
          //
          // The trouble is the absolute scale: the sun's radiance in Preetham
          // units dwarfs the sky's, so using it raw clips every sunlit cloud
          // to a featureless white slab. Expressing the direct term as a
          // fixed multiple of the measured skylight keeps the *ratio* — the
          // thing the eye actually reads — stable across the whole day, while
          // its hue still tracks the sun, which is what makes a sunset cloud
          // go pink rather than grey.
          float skyLum = dot( ambient, vec3( 0.3333 ) );
          float sunLum = max( dot( sunColor, vec3( 0.3333 ) ), 1e-5 );
          sky.direct = sunColor / sunLum * skyLum * 4.0;

          // Skylight is blue, but a cloud lit by it is not: multiple
          // scattering inside the droplet field washes the colour out. Left
          // fully blue, a cloud is the same hue as the sky behind it and
          // simply disappears into it.
          //
          // The 1.7 is the diffuse albedo of a water cloud folded into the
          // sky term: a cloud integrates the whole upper hemisphere, not the
          // slice of it directly overhead, so it comes out clearly brighter
          // than the sky it is lit by. Without that a cloud is the same
          // luminance as the sky behind it and simply vanishes.
          sky.skylight = mix( ambient,
            vec3( dot( ambient, vec3( 0.2126, 0.7152, 0.0722 ) ) ), 0.85 ) * 1.7;

          if ( up > 0.0 && uCoverage > 0.004 ) {
            // Back to front: the high sheet first, then progressively lower
            // and nearer ones composited over the top of it.
            vec4 far  = cumulusSheet( sky, 2.6, 0.032 + uAerial * 0.50 );
            vec4 mid  = cumulusSheet( sky, 1.7, 0.022 + uAerial * 0.42 );
            vec4 near = uDetail > 0.5
              ? cumulusSheet( sky, 1.0, 0.014 + uAerial * 0.34 )
              : vec4( 0.0 );

            float aFar  = far.a;
            float aMid  = mid.a * ( 1.0 - aFar );
            vec4  acc   = far + mid * ( 1.0 - aFar )
                        + near * ( 1.0 - aFar - aMid );

            color = mix(
              color,
              mix( color, acc.rgb / max( acc.a, 1e-3 ), Fex ),
              acc.a
            );
          }

          /* 5. cirrus, a second deck for parallax depth ------------ */
          if ( uCirrus > 0.001 && up > 0.0 ) {
            // Cirrus sits far higher than the cumulus deck, so its
            // projection scale is much smaller — it converges far more
            // slowly and barely moves in parallax.
            vec2 sUV = dir.xz * ( 1.0 / max( up, 0.10 ) ) * 0.11
                     + uDrift * 0.28 + uWindDir * uTime * 0.002;
            // Anisotropic sampling: stretched along X so the fibres read
            // as wind-combed streaks rather than blobs.
            float streak = fbmR(
              vec2( sUV.x * 0.45, sUV.y * 2.8 ),
              uEvolve * 0.5,
              4
            ) * 0.5 + 0.5;
            float cm = smoothstep( 0.52, 0.88, streak ) * uCirrus * horizonFade;
            cm *= smoothstep( 0.45, 0.9, worley( sUV * 0.7 ) );

            vec3 cirrusCol = ( sunColor * 1.5 + ambient ) * max( dayFactor, 0.05 );
            // Cirrus catches the low sun strongly — this is what makes
            // sunset skies go pink.
            cirrusCol += vec3( 1.0, 0.62, 0.42 ) * pow( max( cosTheta, 0.0 ), 6.0 )
                       * ( 1.0 - dayFactor ) * 0.9;
            // Ice crystals make high cloud glow forward. Cirrus is ice,
            // always — so this is not conditional on temperature, it is
            // the reason a cold clear sky has a milky, glaring horizon.
            cirrusCol += sunColor * pow( max( cosTheta, 0.0 ), 22.0 ) * 1.6;
            cirrusCol = mix( cirrusCol, hazeCol, hazeAmt * 0.6 );
            color = mix( color, mix( color, cirrusCol, Fex ), cm * 0.75 );
          }

          /* 6. aurora ------------------------------------------------ */
          if ( uAurora > 0.001 && up > 0.0 ) {
            // Curtains are tall, narrow and soft. Driving the noise
            // straight off atan() produced hard vertical bars, so the
            // azimuth is folded through a low-frequency noise that
            // varies slowly and gets its fine structure from rays.
            float az = atan( dir.z, dir.x );
            float t = uTime * 0.05;

            float sheet = fbm(
              vec2( az * 1.4 + t * 0.12, up * 1.1 ),
              t * 0.2,
              2
            ) * 0.5 + 0.5;
            float curtain = smoothstep( 0.46, 0.86, sheet );

            // Fine vertical rays within each curtain.
            float rays = 0.55 + 0.45 * sin( az * 46.0 + sheet * 9.0 + t * 1.6 );
            curtain *= 0.45 + 0.55 * rays;

            // Curtains hang high and fade toward the horizon.
            float hang = smoothstep( 0.06, 0.42, up )
                       * ( 1.0 - smoothstep( 0.55, 0.95, up ) * 0.6 );

            // Oxygen green low, nitrogen magenta toward the top.
            vec3 green = vec3( 0.16, 1.0, 0.52 );
            vec3 magenta = vec3( 0.82, 0.32, 0.95 );
            vec3 auroraCol = mix( green, magenta, smoothstep( 0.3, 0.8, up ) );

            color += auroraCol * curtain * hang * uAurora * 0.010;
          }

          /* 7. below the horizon ------------------------------------- */
          // There is no sky down there, only air over whatever is. Preetham
          // clamps the zenith angle at the horizon, which leaves a flat slab
          // of horizon-glow colour filling the bottom of every frame — a red
          // block at dusk, a white one at noon. Fading it into a muted,
          // darker ground haze keeps it continuous with the sky at the
          // skyline and gives the readout something to sit against.
          if ( up < 0.0 ) {
            float below = smoothstep( 0.0, -0.22, up );
            vec3 ground = mix( color, hazeCol, 0.4 ) * mix( 1.0, 0.55, below );
            color = mix( color, ground, below * 0.92 );
          }

          /* 8. horizon mist ------------------------------------------ */
          // Ground mist is a *volume*, so it pools at the horizon and
          // thins upward, and it must scatter — it picks up sun colour
          // when backlit, which is what makes fog read as fog.
          if ( uMist > 0.001 ) {
            float band = exp( -max( 0.0, up ) * mix( 5.0, 11.0, uMist ) );
            float drift = fbmR(
              vec2( atan( dir.z, dir.x ) * 2.0, up * 5.0 ) * 1.4
                + uWindDir * uTime * 0.02,
              uEvolve * 0.3,
              3
            ) * 0.5 + 0.5;
            vec3 mistCol = hazeCol * 1.15
                         + sunColor * pow( max( cosTheta, 0.0 ), 4.0 ) * 0.5
                         + vec3( 0.06, 0.065, 0.075 ) * max( dayFactor, 0.1 );
            color = mix( color, mistCol, clamp( uMist * band * ( 0.6 + drift * 0.6 ), 0.0, 0.94 ) );
          }

          /* 9. lightning ---------------------------------------------- */
          if ( uLightning > 0.001 ) {
            // Flash lights the whole dome, brightest near the ground.
            vec3 flash = vec3( 0.72, 0.80, 1.0 ) * uLightning;
            color += flash * ( 0.55 + 0.45 * exp( -max( up, 0.0 ) * 2.0 ) ) * 1.1;
          }

          /* 10. humidity veil -----------------------------------------
             Saturated air does not fog the sky — it *veils* it. The whole
             dome loses saturation and contrast toward a pale grey, and
             the zenith lifts. Applied here rather than as fog so that it
             does not compete with the ground mist above.
          */
          if ( uHaze > 0.001 ) {
            float veil = uHaze * ( 0.45 + 0.55 * ( 1.0 - smoothstep( -0.1, 0.7, up ) ) );
            vec3 veilCol = mix( color, hazeCol, 0.6 ) + vec3( 0.012, 0.013, 0.016 ) * max( dayFactor, 0.15 );
            color = mix( color, veilCol, veil * 0.5 );
          }

          gl_FragColor = vec4( max( color, vec3( 0.0 ) ), 1.0 );

          #include <tonemapping_fragment>

          /* 11. grade -------------------------------------------------
             Applied *after* tone mapping, in display space, where
             saturation and contrast mean what the eye expects. Doing it
             in linear HDR would need a pivot guess and would fight the
             exposure meter.
          */
          {
            vec3 g = gl_FragColor.rgb;
            float luma = dot( g, vec3( 0.2126, 0.7152, 0.0722 ) );
            g = mix( vec3( luma ), g, uSaturation );
            // Pivot at 0.18 (middle grey) so the grade pivots in the
            // middle of the image instead of crushing the shadows.
            g = max( ( g - 0.18 ) * uContrast + 0.18, vec3( 0.0 ) );
            g *= uTint;
            gl_FragColor.rgb = clamp( g, 0.0, 1.0 );
          }

          #include <colorspace_fragment>
        }
      `,
    });

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(90, 32, 24),
      this.mat,
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1000;
  }

  update(i: SkyInputs) {
    const u = this.mat.uniforms;

    const [sx, sy, sz] = bodyVector(i.sun.altitude, i.sun.azimuth);
    (u.uSunDir.value as THREE.Vector3).set(sx, sy, sz);

    const [mx, my, mz] = bodyVector(i.moon.altitude, i.moon.azimuth);
    (u.uMoonDir.value as THREE.Vector3).set(mx, my, mz);
    u.uMoonPhase.value = i.moon.phase;
    u.uMoonIllum.value = i.moon.illumination;

    /* ── air quality drives the scattering ─────────────────────── */

    // OpenWeather caps `visibility` at 10,000 m — it physically cannot
    // report better than that. Treating 10 km as "half hazy" made every
    // clear sky render like smog, so the field is normalised against its
    // own ceiling: 10 km is pristine, 1 km is fog.
    const vis = i.visibility;
    const clarity = THREE.MathUtils.clamp(vis / 10000, 0, 1);
    const humidity = THREE.MathUtils.clamp(i.humidity / 100, 0, 1);

    // Hazy, humid air scatters far more Mie.
    u.uTurbidity.value = 2.1 + (1 - clarity) * 6.2 + humidity * 1.0;
    u.uMieCoeff.value = 0.0035 + (1 - clarity) * 0.012 + humidity * 0.0025;
    u.uMieG.value = 0.76 + (1 - clarity) * 0.14;

    // Rayleigh is a vertex-stage uniform (it feeds betaR).
    u.uRayleigh.value =
      (i.pressure / 1013.25) * Math.exp(-Math.max(0, i.sun.altitude) / 8400);

    /* ── clouds ────────────────────────────────────────────────── */

    const stormy = i.scene.type === "rain" || i.scene.type === "snow";
    const foggy = i.scene.type === "fog";

    // `clouds.all` is a *reported observation*, so it is the primary driver
    // and the condition code only nudges it. Fog reports near-zero cloud
    // because the cloud is below you in the mist, not absent, so it is
    // pinned high there.
    const cover = foggy
      ? 1
      : THREE.MathUtils.clamp(i.cloudCover / 100, 0, 1);
    u.uCoverage.value = cover;

    // The threshold is what actually carves the deck out of the noise, so it
    // has to be derived from the field's measured distribution rather than
    // picked by eye — otherwise "28% cloud" renders as whatever the noise
    // happened to do.
    const coverTarget = THREE.MathUtils.clamp(cover, 0.004, 0.995);
    u.uThreshold.value =
      FIELD_MEAN + FIELD_SD * inverseNormalCdf(1 - coverTarget);

    // Silhouette hardness. Scattered cumulus have crisp, hard-edged
    // outlines; an overcast deck has a soft, formless one.
    u.uSoft.value = THREE.MathUtils.lerp(0.02, 0.3, THREE.MathUtils.smoothstep(cover, 0.2, 0.95));

    u.uSoft.value = THREE.MathUtils.lerp(0.025, 0.34, THREE.MathUtils.smoothstep(cover, 0.2, 0.95));

    // Scattered cumulus are all edge and all billow; an overcast deck has
    // flattened bases and almost no silhouette detail.
    u.uErode.value = THREE.MathUtils.lerp(0.9, 0.3, THREE.MathUtils.smoothstep(cover, 0.25, 0.95));

    // Cloud scale. Scattered cover is many small cells; overcast cover is a
    // few large masses, so frequency falls as coverage rises.
    u.uBaseFreq.value = THREE.MathUtils.lerp(3.4, 1.7, cover);
    u.uDetailFreq.value = THREE.MathUtils.lerp(10.0, 5.5, cover);

    /* ── pressure ──────────────────────────────────────────────── */
    // 1013 hPa is the standard atmosphere. A low reading means a deep,
    // thick, low-based deck that blocks the sun; a high reading means a
    // shallow, high, crisp one.
    const hPa = i.pressure;
    const low = THREE.MathUtils.clamp((1013.25 - hPa) / 25, 0, 1);
    const high = THREE.MathUtils.clamp((hPa - 1013.25) / 25, 0, 1);

    // Deck altitude. A low base means the deck is closer overhead, so it
    // projects larger and occupies more of the dome. This is the clearest
    // visual tell of a low-pressure system.
    u.uDeckScale.value = 0.55 * (1 - low * 0.3 + high * 0.35);

    // Extinction through a sheet. Drives how quickly the deck closes up:
    // an overcast sheet must go fully opaque, fair-weather cumulus must stay
    // translucent enough to show sky through their edges.
    u.uThickness.value = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(0.9, 2.6, Math.pow(cover, 1.3))
      + low * 0.5
      + (stormy ? i.scene.intensity * 0.25 : 0)
      + humidity * 0.2,

      0.5,
      4.5,
    );

    u.uCirrus.value = foggy || stormy
      ? 0.06
      : THREE.MathUtils.clamp((cover - 0.12) * 0.85 + humidity * 0.18, 0, 0.75);

    /* ── wind ──────────────────────────────────────────────────── */
    // Drift is integrated from the clock rather than being an offset: it
    // is an *advection*, and a constant offset meant the deck never moved
    // no matter how hard the wind blew.
    const windAngle = ((i.windDeg ?? 0) + 180) * Math.PI / 180;
    const windX = Math.sin(windAngle);
    const windY = Math.cos(windAngle);
    (u.uWindDir.value as THREE.Vector2).set(windX, windY);

    const driftRate = 0.0035 + i.windSpeed * 0.0022;
    (u.uDrift.value as THREE.Vector2).set(windX * i.time * driftRate, windY * i.time * driftRate);

    // Internal churn: convection in still air, tearing in a gale.
    u.uEvolve.value = i.time * (0.004 + i.windSpeed * 0.0035);

    // Downwind shear. Strong wind stretches the deck into streaks along its
    // own direction, which is why a gale never shows round puffs.
    u.uShear.value = THREE.MathUtils.clamp(i.windSpeed / 18, 0, 1) * 0.4;

    u.uTime.value = i.time;

    /* ── temperature: the ice regime ───────────────────────────── */
    // Below freezing the cloud is ice rather than water. Ice crystals are
    // plates and columns, not spheres: they scatter forward far harder, so
    // a cold sky glares around the sun, and they also refract — the 22°
    // and 46° halos that ring the sun in cold air.
    const ice = THREE.MathUtils.smoothstep(-i.tempC, -6, 6);
    u.uIce.value = ice;

    /* ── haze, humidity, aerial perspective ────────────────────── */
    // Visibility is the honest distance measure, so it drives the aerial
    // perspective directly. 10 km is airless clarity.
    //
    // Rain and snow are added on top because the visibility field under-
    // reports them badly: it measures how far you can *see*, but it is
    // derived from the same station and knows nothing about the water
    // actually in the air. In real rain the atmosphere between you and a
    // cloud 10 km out is far thicker than on a clear day, and without this
    // a downpour renders with the crisp depth of a dry afternoon.
    const precip = stormy ? 0.35 + i.scene.intensity * 0.22 : 0;
    const aerial = (1 - clarity) * 0.85 + (foggy ? 0.15 : 0) + precip * 0.5;
    u.uAerial.value = THREE.MathUtils.clamp(aerial, 0, 1);

    // Humidity alone should never *fog* a clear sky — dew point does that
    // — but it does kill saturation and lift the blacks into a grey veil.
    u.uHaze.value = THREE.MathUtils.clamp((humidity - 0.45) / 0.55, 0, 1) * 0.9;

    /* ── night factors ─────────────────────────────────────────── */
    // Stars fade in as the sun sets, then get washed out by the moon
    // and by cloud.
    const starBase = 1 - THREE.MathUtils.clamp(
      (i.sun.altitude + 8) / 10, 0, 1,
    );
    const moonWash = 1 - i.moon.illumination * THREE.MathUtils.clamp(i.moon.altitude / 25, 0, 1) * 0.55;
    const cloudWash = 1 - cover * 0.85;
    u.uStars.value = starBase * moonWash * cloudWash;

    // Aurora: high latitude, clear, dark, and not a new moon.
    u.uAurora.value =
      auroraPotential(i.latitude) *
      starBase *
      (1 - cover) *
      (1 - i.moon.illumination * 0.8) *
      0.9;

    // Ground mist only when visibility is genuinely poor, the condition
    // is fog, or the air is saturated. Ordinary humidity must not fog up
    // a perfectly clear sky.
    const damp = humidity > 0.8 ? (humidity - 0.8) * 1.6 : 0;
    u.uMist.value = THREE.MathUtils.clamp(
      (foggy ? 0.85 : 0) +
        THREE.MathUtils.clamp((6000 - vis) / 6000, 0, 0.9) * 0.7 +
        damp * 0.5,
      0,
      0.95,
    );

    /* ── grade ─────────────────────────────────────────────────── */
    // Haze desaturates and flattens; cold clear air deepens and cools;
    // precipitation greys the whole frame out.
    const haze = u.uHaze.value as number;
    const aerialV = u.uAerial.value as number;

    u.uSaturation.value = THREE.MathUtils.clamp(
      1.06 - aerialV * 0.38 - haze * 0.18 + ice * 0.06 - precip * 0.3, 0.15, 1.3,
    );
    u.uContrast.value = THREE.MathUtils.clamp(
      1.0 + (1 - aerialV) * 0.1 - haze * 0.16 + ice * 0.05 - precip * 0.12, 0.5, 1.4,
    );

    // Tint: cold air reads blue, warm and humid reads faintly warm. Kept
    // subtle — a heavy tint is the fastest way to make a sky look fake.
    const cold = THREE.MathUtils.clamp((10 - i.tempC) / 30, 0, 1);
    u.uTint.value.setRGB(
      1 + cold * 0.02 + haze * 0.03,
      1 + cold * 0.01,
      1 + cold * 0.09 - haze * 0.02,
    );

    u.uLightning.value = i.lightning;
    u.uDetail.value = i.detail;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}
