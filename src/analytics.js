import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-KXN8WKBKL2"); // Replace with your Measurement ID
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
