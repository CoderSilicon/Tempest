import { Match, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sun,
} from "lucide-solid";
import type { WeatherData } from "../types/weather";
import { calculateWeatherScene } from "../libs/Scene";
import { NightComponent } from "./SceneComponent";
import { RainComponent } from "./SceneComponent";
import { DayComponent } from "./SceneComponent";
import { CloudComponent } from "./SceneComponent";
import { FogComponent } from "./SceneComponent";
import { SnowComponent } from "./SceneComponent";
import { ClearSkyComponent } from "./SceneComponent";

export function WeatherMain(props: { data: WeatherData }) {
  const celsius = () => Math.round(props.data.main.temp - 273.15);
  const feelsLike = () => Math.round(props.data.main.feels_like - 273.15);
  const high = () => Math.round(props.data.main.temp_max - 273.15);
  const low = () => Math.round(props.data.main.temp_min - 273.15);
  const description = () => props.data.weather[0].description;

  const isNight = () => calculateWeatherScene(props.data).type === "night";
  const scene = () => calculateWeatherScene(props.data);

  const weatherIcons = {
    day: Sun,
    night: Moon,
    cloudy: Cloud,
    rain: CloudRain,
    snow: CloudSnow,
    storm: CloudLightning,
    fog: CloudFog,
  };

  return (
    <>
      <Switch fallback={<DayComponent />}>
        {/* CLEAR SKY CONDITION */}
        <Match when={scene().type === "clear"}>
          <ClearSkyComponent day={scene().day} />
        </Match>

        {/* STANDARD DAY/NIGHT COMPONENTS (If not handled by Clear) */}
        <Match when={scene().type === "day"}>
          <DayComponent />
        </Match>

        <Match when={scene().type === "night"}>
          <NightComponent />
        </Match>

        {/* WEATHER CONDITIONS WITH PARAMETERS */}
        <Match when={scene().type === "rain"}>
          <RainComponent intensity={scene().intensity} />
        </Match>

        <Match when={scene().type === "fog"}>
          <FogComponent intensity={scene().intensity} day={scene().day} />
        </Match>

        <Match when={scene().type === "clouds"}>
          <CloudComponent intensity={scene().intensity} day={scene().day} />
        </Match>

        <Match when={scene().type === "snow"}>
          <SnowComponent day={scene().day} />
        </Match>
      </Switch>

      <div
        class={
          "min-h-screen relative flex flex-col overflow-hidden z-50" +
          (!isNight() ? " text-white" : " text-black")
        }
      >
        {/* Background Section - Adjusted for smaller screens */}
        <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Scaled down icon for mobile, massive for desktop */}
          <div
            class="absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 
                w-64 h-64 md:w-150 md:h-150 
                opacity-[0.08] animate-slow-drift"
          >
            <Dynamic
              component={
                weatherIcons[scene().type as keyof typeof weatherIcons] || Cloud
              }
              class="w-full h-full text-white blur-[1px]"
            />
          </div>
        </div>

        {/* Main Section - Better vertical spacing on mobile */}
        <main class="flex-1 flex flex-col items-center justify-center relative z-10 px-4 w-full pt-20 md:pt-0 ">
          {/* Temperature: Smaller on mobile so it doesn't clip */}
          <h1 class="text-[100px] sm:text-[120px] md:text-[160px] tracking-tighter text-primary leading-none mb-2 dm-sans-200 drop-shadow-2xl">
            {celsius()}°
          </h1>

          {/* Location: Using flex-wrap for long city names */}
          <p class="text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4 dm-sans-300 text-center flex items-center justify-center flex-wrap gap-1">
            <span class="font-semibold text-primary">{props.data.name}</span>
            <sup class="text-xl md:text-2xl opacity-70">
              {props.data.sys.country}
            </sup>
          </p>

          <div class="flex flex-col items-center gap-2">
            <p class="text-lg md:text-2xl text-muted-foreground capitalize font-light tracking-wide dm-sans-300">
              {description()}
            </p>
            <div class="flex items-center gap-6 text-base md:text-lg font-medium text-foreground/80 dm-sans-400 bg-white/5 px-4 py-1 rounded-full backdrop-blur-sm">
              <span>High: {high()}°</span>
              <div class="w-px h-4 bg-white/20"></div> {/* Visual separator */}
              <span>Low: {low()}°</span>
            </div>
          </div>
        </main>

        {/* Footer Section - Glassmorphism card for mobile readability */}
        <footer class="relative z-10 w-full py-6 md:py-10 px-4 md:px-8 mt-auto">
          <div
            class="max-w-5xl mx-auto 
                grid grid-cols-2 lg:grid-cols-4 
                gap-4 md:gap-8 lg:gap-12 
                bg-white/5 md:bg-transparent p-6 md:p-0 rounded-3xl backdrop-blur-md md:backdrop-blur-none border border-white/10 md:border-none"
          >
            {/* Stat Item Template */}
            <div class="space-y-1">
              <p class="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] dm-sans-300">
                Feels Like
              </p>
              <p class="text-xl md:text-3xl font-semibold text-foreground dm-sans-400">
                {feelsLike()}°
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] dm-sans-300">
                Wind
              </p>
              <p class="text-xl md:text-3xl font-semibold text-foreground dm-sans-400">
                {Math.round(props.data.wind.speed * 3.6)}
                <span class="text-sm md:text-base font-normal ml-1 opacity-60">
                  km/h
                </span>
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] dm-sans-300">
                Humidity
              </p>
              <p class="text-xl md:text-3xl font-semibold text-foreground dm-sans-400">
                {props.data.main.humidity}
                <span class="text-sm md:text-base opacity-60">%</span>
              </p>
            </div>

            <div class="space-y-3 col-span-2 lg:col-span-1">
              <div class="flex justify-between items-end">
                <p class="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] dm-sans-300">
                  Clouds
                </p>
                <p class="text-xs md:text-sm font-semibold text-foreground dm-sans-400">
                  {props.data.clouds.all}%
                </p>
              </div>
              <div class="w-full bg-white/10 h-1 md:h-1.5 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary/70 transition-all duration-1000 rounded-full"
                  style={{ width: `${props.data.clouds.all}%` }}
                ></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
