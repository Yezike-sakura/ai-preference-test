/// <reference types="vite/client" />

import "./styles.css";
import { createApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

createApp(root);
