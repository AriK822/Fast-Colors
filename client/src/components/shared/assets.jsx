import bgLandscape from "../../assets/images/bg1.jpg"
import bgMobile from "../../assets/images/bg2.jpg"
import mainLogo from "../../assets/images/home-logo.png"
import sidebarLogo from "../../assets/images/sidebar-logo.png"
import sideBarTexture from "../../assets/images/sidebar-texture.jpg"
import sideBarTopLeft from "../../assets/images/s4.1.png";
import sideBarBottomLeft from "../../assets/images/s3.1.png";

import bgLandscapeDark from "../../assets/images/bg1-dark.jpg"
import bgMobileDark from "../../assets/images/bg2-dark.jpg"
import sideBarTopLeftDark from "../../assets/images/sidebar-topleft-dark.1.png"

import bgLandscapeFocus from "../../assets/images/bg1-focus.jpg"
import bgMobileFocus from "../../assets/images/bg2-focus.jpg"

import bgLandscapeOG from "../../assets/images/bg1-og.jpg"
import bgMobileOG from "../../assets/images/bg2-og.jpg"
import sideBarTextureOG from "../../assets/images/sidebar-texture-og.png"

import bgLandscapeCloudy from "../../assets/images/bg1-cloudy.jpg"
import bgMobileCloudy from "../../assets/images/bg2-cloudy.jpg"
import sideBarTopLeftCloudy from "../../assets/images/sidebar-tb-cloudy.png"
import sideBarBottomLeftCloudy from "../../assets/images/sidebar-tl-cloudy.png"

import bgLandscapeSorcerer from "../../assets/images/bg1-sorcerer.jpg"
import bgMobileSorcerer from "../../assets/images/bg2-sorcerer.jpg"
import sideBarBottomLeftSorcerer from "../../assets/images/sidebar-bl-sorcerer.png"


import { useApp } from "../../utils/context/app_provider"


export function Assets(){
    const { theme } = useApp();

    const defaultAssets = {
        bgLandscape,
        bgMobile,
        mainLogo,
        sidebarLogo,
        sideBarTexture,
        sideBarTopLeft,
        sideBarBottomLeft,
    }

    if (theme=="dark-theme")
        return {
            ...defaultAssets,
            bgLandscape: bgLandscapeDark,
            bgMobile: bgMobileDark,
            sideBarTopLeft: sideBarTopLeftDark,
            sideBarBottomLeft: null,
        }

    if (theme=="focus-theme")
        return {
            ...defaultAssets,
            bgLandscape: bgLandscapeFocus,
            bgMobile: bgMobileFocus,
            sideBarTexture: null,
            sideBarTopLeft: null,
            sideBarBottomLeft: null,
        }

    if (theme=="og-theme")
        return {
            ...defaultAssets,
            bgLandscape: bgLandscapeOG,
            bgMobile: bgMobileOG,
            sideBarTexture: sideBarTextureOG,
            sideBarTopLeft: null,
            sideBarBottomLeft: null,
        }

    if (theme=="cloudy-theme")
        return {
            ...defaultAssets,
            bgLandscape: bgLandscapeCloudy,
            bgMobile: bgMobileCloudy,
            sideBarTexture: null,
            sideBarTopLeft: sideBarBottomLeftCloudy,
            sideBarBottomLeft: sideBarTopLeftCloudy,
        }

    if (theme=="sorcerer-theme")
        return {
            ...defaultAssets,
            bgLandscape: bgLandscapeSorcerer,
            bgMobile: bgMobileSorcerer,
            sideBarTexture: null,
            sideBarTopLeft: null,
            sideBarBottomLeft: sideBarBottomLeftSorcerer,
        }

    return defaultAssets
}

export default {
    Assets,
}
