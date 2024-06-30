import sanitize from "sanitize-html";
import { Env } from "../abstract/Env";

// App
export const ENV: Env = process.env.NODE_ENV as Env;
export const PROTOCOL = process.env.REACT_APP_PROTOCOL + "";
export const VERSION = process.env.REACT_APP_VERSION + "";


// URLs
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL + "";
/** Default rel attr to pass to any link */
export const LINK_DEFAULT_REL = "noopener noreferrer nofollow";


// Sanitizer
const ALLOWED_TAG_ATTRIBUTES = ["class", "id", "title", "style"];
export const DEFAULT_HTML_SANTIZER_OPTIONS: sanitize.IOptions = {
    allowedTags: [
        "a",
        "bdo",
        "code",
        "div",
        "em",
        "figcaption",
        "figure",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "img",
        "kbd",
        "mark",
        "p",
        "s",
        "span",
        "strong",
        "sub",
        "sup",
        "svg",
    ],
    allowedAttributes: {
        "a": ["href", "alt", "target", "rel", ...ALLOWED_TAG_ATTRIBUTES],
        "bdo": ["lang", "dir", ...ALLOWED_TAG_ATTRIBUTES],
        "div": [...ALLOWED_TAG_ATTRIBUTES],
        "figure": [...ALLOWED_TAG_ATTRIBUTES],
        "h1": [...ALLOWED_TAG_ATTRIBUTES],
        "h2": [...ALLOWED_TAG_ATTRIBUTES],
        "h3": [...ALLOWED_TAG_ATTRIBUTES],
        "h4": [...ALLOWED_TAG_ATTRIBUTES],
        "h5": [...ALLOWED_TAG_ATTRIBUTES],
        "h6": [...ALLOWED_TAG_ATTRIBUTES],
        "img": ["src", "alt", ...ALLOWED_TAG_ATTRIBUTES],
        "mark": ["alt", "color", ...ALLOWED_TAG_ATTRIBUTES],
        "p": [...ALLOWED_TAG_ATTRIBUTES],
        "span": [...ALLOWED_TAG_ATTRIBUTES],
    },
    parseStyleAttributes: false
}


// Crypto
export const CRYPTO_KEY = process.env.REACT_APP_CRYPTO_KEY || "";
export const CRYPTO_IV = process.env.REACT_APP_CRYPTO_IV || "";