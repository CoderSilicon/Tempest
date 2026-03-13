import { type Component } from "solid-js";
import Clear_Sky from "../assets/weather/Clear_Sky.mp4";
import Cloudy from "../assets/weather/Cloudy.mp4";
import OvercastClouds from "../assets/weather/Overcast_Clouds.mp4";
import Sunny from "../assets/weather/Sunny.mp4";
import Mist from "../assets/weather/Mist.mp4";
import Fog from "../assets/weather/Fog.mp4";
import Night from "../assets/weather/Night.mp4";
import shallowRain from "../assets/weather/Shallow_Rain.mp4";
import rain from "../assets/weather/Rain.mp4";
import thunderstorm from "../assets/weather/Thunderstorm.mp4";
import Snow from "../assets/weather/Snow.mp4";

const ClearSkyComponent: Component<{ day: boolean | undefined }> = (props) => {
  const videoSrc = () => Clear_Sky;
  const filterClass = () =>
    props.day
      ? "opacity-85"
      : "opacity-85 brightness-[0.6] contrast-[1.2] saturate-[0.5] sepia-[0.5] hue-rotate-[180deg]";

  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={videoSrc()}
        autoplay
        muted
        loop
        // Use a key or attr:src to force video reload when day changes
        class={"absolute min-w-full min-h-full object-cover " + filterClass()}
      />

      {/* Dark overlay to make text pop */}
      <div class="absolute inset-0 bg-black/20 z-1" />
    </div>
  );
};

const CloudComponent: Component<{
  intensity: number | undefined;
  day: boolean | undefined;
}> = (props) => {
  const video =
    props.intensity === 1
      ? Cloudy
      : props.intensity === 2
        ? OvercastClouds
        : Cloudy;

  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={video}
        autoplay
        muted
        loop
        class="absolute min-w-full min-h-full object-cover opacity-85"
      />
      {/* Optional: Dark overlay to make text pop even more */}
      <div class="absolute inset-0 bg-black/20 z-1" />
    </div>
  );
};

const DayComponent: Component<{}> = (props) => {
  return (
    <div class="flex items-center justify-center">
      <video
        src={Sunny}
        autoplay
        muted
        loop
        class="min-h-full bg-black min-w-full fixed right-0 bottom-0 opacity-85 z-0"
      ></video>
    </div>
  );
};

const FogComponent: Component<{
  intensity: number | undefined;
  day: boolean | undefined;
}> = (props) => {
  const video =
    props.intensity === 1 ? Mist : props.intensity === 2 ? Fog : Mist;

  const filterClass = () =>
    props.day
      ? "opacity-85"
      : "opacity-85 brightness-[0.6] contrast-[1.2] saturate-[0.5] sepia-[0.5] hue-rotate-[180deg]";

  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={video}
        autoplay
        muted
        loop
        class={
          "absolute min-w-full min-h-full object-cover opacity-85" +
          filterClass()
        }
      />
      <div class="absolute inset-0 bg-black/20 z-1" />
    </div>
  );
};

const NightComponent: Component<{}> = () => {
  const video = Night;
  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={video}
        autoplay
        muted
        loop
        class="absolute min-w-full min-h-full object-cover opacity-85"
      />

      <div class="absolute inset-0 bg-black/20 z-1" />
    </div>
  );
};

const RainComponent: Component<{ intensity: number | undefined }> = (props) => {
  const video =
    props.intensity === 1
      ? shallowRain
      : props.intensity === 2
        ? rain
        : thunderstorm;

  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={video}
        autoplay
        muted
        loop
        class="absolute min-w-full min-h-full object-cover opacity-85"
      ></video>
    </div>
  );
};

const SnowComponent: Component<{ day: boolean | undefined }> = (props) => {
  const video = Snow;
  const filterClass = () =>
    props.day
      ? "opacity-85"
      : "opacity-85 brightness-[0.6] contrast-[1.2] saturate-[0.5] sepia-[0.5] hue-rotate-[180deg]";

  return (
    <div class="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <video
        src={video}
        autoplay
        muted
        loop
        class={"absolute min-w-full min-h-full object-cover " + filterClass()}
      ></video>
    </div>
  );
};

export {
  ClearSkyComponent,
  CloudComponent,
  DayComponent,
  FogComponent,
  NightComponent,
  RainComponent,
  SnowComponent,
};
