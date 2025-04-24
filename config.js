const scriptsConfig = [
  {
    name: "navigation",
    local: "http://localhost:3000/navigation.js",
    production: "https://starter-demo.vercel.app/navigation.js",
    forceProduction: true,
  },
  {
    name: "slider",
    local: "http://localhost:3000/slider.js",
    production: "https://starter-demo.vercel.app/slider.js",
    forceProduction: true,
  },
  {
    name: "home-slider",
    local: "http://localhost:3000/test-slider.js",
    production: "https://starter-demo.vercel.app/test-slider.js@latest",
    forceProduction: true,
  },
];
const forceProduction = false;
const isDevEnvironment =
  window.location.origin.includes("webflow.io") ||
  window.location.origin.includes("localhost");
const fragment = document.createDocumentFragment();
scriptsConfig.forEach(
  ({ name, local, production, forceProduction: forceProductionIndividual }) => {
    const script = document.createElement("script");
    const useStaging =
      isDevEnvironment && !(forceProduction || forceProductionIndividual);

    script.src = useStaging ? local : production;
    script.defer = true;
    script.dataset.scriptName = name;

    fragment.appendChild(script);
  }
);
document.currentScript.insertAdjacentElement("afterend", fragment);
