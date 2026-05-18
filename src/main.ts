/// <reference types="vite/client" />

import "./styles.css";
import { createApp } from "./app";
import { initParticleBackground } from "./particles";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

initParticleBackground(document.body);
createApp(root);
