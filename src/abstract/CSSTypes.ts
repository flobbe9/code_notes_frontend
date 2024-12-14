export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexWrap = "inherit" | "initial" | "unset" | "wrap" | "nowrap" | "wrap-reverse" | "revert" | "revert-layer";
export type TextAlign = "start" | "end" | "left" | "right" | "center" | "justify" | "match-parent";
export type Overflow = "visible" | "hidden" | "clip" | "scroll" | "auto";
export type LinkTarget = "_blank" | "_parent" | "_self" | "_top";
export type ButtonType = "reset" | "submit" | "button";

export type JQueryEasing = "swing" | "linear" | "default" | "easeInQuad" | "easeOutQuad" | "easeInOutQuad" | "easeInCubic" | 
                            "easeOutCubic" | "easeInOutCubic" | "easeInQuart" | "easeOutQuart" | 
                            "easeInOutQuart" | "easeInQuint" | "easeOutQuint" | "easeInOutQuint" | 
                            "easeInSine" | "easeOutSine" | "easeInOutSine" | "easeInExpo" | "easeOutExpo" | 
                            "easeInOutExpo" | "easeInCirc" | "easeOutCirc" | "easeInOutCirc" | "easeInElastic" |
                            "easeOutElastic" | "easeInOutElastic" | "easeInBack" | "easeOutBack" | "easeInOutBack" | 
                            "easeInBounce" | "easeOutBounce" | "easeInOutBounce";
/** Possible values for ```element.animate()``` easing prop. Docs: https://udn.realityripple.com/docs/Web/API/EffectTiming/easing#:~:text=The%20EffectTiming%20dictionary */
export type AnimationEasing = "ease" | "ease-in" | "ease-out" | "ease-in-out";