import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
const config: Config = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      screens: {
        "xxs":            "375px",
        "xs":             "576px",
        'sm':             '640px',
        'md':             '768px',
        "medium_large":   "960px",
        'lg':             '1024px',
        'large_extra':    '1120px',
        'xl':             '1280px',
        'xl_extra':       '1340px',
        "2xl":            "1536px",
        'xxs-dpr-2': {            'raw': '(min-width: 375px)  and (min-resolution: 2dppx), (min-width: 375px)  and (-webkit-min-device-pixel-ratio: 2)',},
        'xs-dpr-2': {             'raw': '(min-width: 576px)  and (min-resolution: 2dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 2)',},
        'sm-dpr-2': {             'raw': '(min-width: 640px)  and (min-resolution: 2dppx), (min-width: 640px)  and (-webkit-min-device-pixel-ratio: 2)',},
        'md-dpr-2': {             'raw': '(min-width: 768px)  and (min-resolution: 2dppx), (min-width: 768px)  and (-webkit-min-device-pixel-ratio: 2)',},
        'medium_large-dpr-2': {   'raw': '(min-width: 960px)  and (min-resolution: 2dppx), (min-width: 960px)  and (-webkit-min-device-pixel-ratio: 2)',},
        'lg-dpr-2': {             'raw': '(min-width: 1024px) and (min-resolution: 2dppx), (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)',},
        'large_extra-dpr-2': {    'raw': '(min-width: 1120px) and (min-resolution: 2dppx), (min-width: 1120px) and (-webkit-min-device-pixel-ratio: 2)',},
        'xl-dpr-2': {             'raw': '(min-width: 1280px) and (min-resolution: 2dppx), (min-width: 1280px) and (-webkit-min-device-pixel-ratio: 2)',},
        'xl_extra-dpr-2': {       'raw': '(min-width: 1340px) and (min-resolution: 2dppx), (min-width: 1340px) and (-webkit-min-device-pixel-ratio: 2)',},
        '2xl-dpr-2': {            'raw': '(min-width: 1536px) and (min-resolution: 2dppx), (min-width: 1536px) and (-webkit-min-device-pixel-ratio: 2)',},

        'xxs-dpr-3': {            'raw': '(min-width: 375px)  and (min-resolution: 3dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 3)',},
        'xs-dpr-3': {             'raw': '(min-width: 576px)  and (min-resolution: 3dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 3)',},
        'sm-dpr-3': {             'raw': '(min-width: 640px)  and (min-resolution: 3dppx), (min-width: 640px)  and (-webkit-min-device-pixel-ratio: 3)',},
        'md-dpr-3': {             'raw': '(min-width: 768px)  and (min-resolution: 3dppx), (min-width: 768px)  and (-webkit-min-device-pixel-ratio: 3)',},
        'medium_large-dpr-3': {   'raw': '(min-width: 960px)  and (min-resolution: 3dppx), (min-width: 960px)  and (-webkit-min-device-pixel-ratio: 3)',},
        'lg-dpr-3': {             'raw': '(min-width: 1024px) and (min-resolution: 3dppx), (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 3)',},
        'large_extra-dpr-3': {    'raw': '(min-width: 1120px) and (min-resolution: 3dppx), (min-width: 1120px) and (-webkit-min-device-pixel-ratio: 3)',},
        'xl-dpr-3': {             'raw': '(min-width: 1280px) and (min-resolution: 3dppx), (min-width: 1280px) and (-webkit-min-device-pixel-ratio: 3)',},
        'xl_extra-dpr-3': {       'raw': '(min-width: 1340px) and (min-resolution: 3dppx), (min-width: 1340px) and (-webkit-min-device-pixel-ratio: 3)',},
        '2xl-dpr-3': {            'raw': '(min-width: 1536px) and (min-resolution: 3dppx), (min-width: 1536px) and (-webkit-min-device-pixel-ratio: 3)',},
      },
      extend: {
        fontFamily: {
          sans: ["Inter", "sans-serif"],
          serif: ["Georgia", "serif"],
          mono: ["Menlo", "monospace"],
        },
      },
    },
  plugins: [tailwindcssAnimate],
};

export default config;
