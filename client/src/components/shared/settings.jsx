import frame from "./frame";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useApp } from "../../utils/context/app_provider";
import { Logo } from "./logos";


const Themes = [
    {
        id:"default",
        title:"Default",
        desc:"Fast Coloes original theme",
    },
    {
        id:"dark-theme",
        title:"Dark mode",
        desc:"Modern dark theme",
    },
    {
        id:"focus-theme",
        title:"Focus",
        desc:"No distraction gameplay",
    },
    {
        id:"og-theme",
        title:"OG",
        desc:"Purple gradient theme",
    },
    {
        id:"cloudy-theme",
        title:"Cloudy",
        desc:"Bright and fluffy sky theme",
    },
    {
        id:"sorcerer-theme",
        title:"Sorcerer's Room",
        desc:"A mystical purple theme",
    },
]
const THEME_IDS = Themes.map(t => t.id);


function Settings({game, onClose}){
    const { settings, setSettings } = useApp();

    function setTheme(theme){
        setSettings(prev => ({...prev, theme}))
        const root = document.documentElement;
        root.classList.remove(...THEME_IDS);
        document.documentElement.classList.toggle(theme);
    }


    return (
        <div className="fixed inset-0 size-full bg-overlay ui-text
            flex justify-center items-center z-9999"
            onClick={onClose}
        >
        <motion.div
            className="flex justify-center items-center
                size-full"
            initial={{scale:0.3, opacity:0.3}}
            animate={{scale:1, opacity:1}}
        >
            <frame.Frame.Box
                className="w-[80%] max-w-[800px] max-h-[70%]"
                insideBoxClassName="flex flex-col gap-ui-ssx
                 min-h-0 game-theme-scrollbar"
                header={
                    <div className="text-xl">Settings</div>
                }
                onClick={(e) => e.stopPropagation()}
            >

                <p className="text-lg">Themes:</p>
                <frame.Frame.SubBox
                    className="grid md:grid-cols-2 gap-ui-xxs mb-ui-sm"
                >
                    {Themes.map((thisTheme, i) => (
                        <frame.Frame.ContrastBtn 
                            className="grow-1"
                            key={i}
                            onClick={() => setTheme(thisTheme.id)}
                        >
                            {thisTheme.title}
                            {settings.theme == thisTheme.id && <Logo id="check" />}
                            <p className="opacity-60">
                                {thisTheme.desc}
                            </p>
                        </frame.Frame.ContrastBtn>
                    ))}
                </frame.Frame.SubBox>

                <p className="text-lg">Motion:</p>
                <frame.Frame.SubBox>
                    <div
                        className="w-full flex flex-row p-ui-xxs"
                    >
                    <div className="grow-1 flex align-center">
                    <label>Animations: &nbsp;</label>
                    <frame.Frame.CheckBox
                        checked={settings.motion?.animations ?? true}
                        onChange={(e) => {setSettings(prev => ({
                            ...prev, 
                            motion:{...prev.motion, animations:!prev.motion.animations}
                        }))}}
                    />
                    </div>
                    <div className="grow-1 flex align-center">
                    <label>Drag: &nbsp;</label>
                    <frame.Frame.CheckBox
                        checked={settings.motion?.drag ?? true}
                        onChange={(e) => {setSettings(prev => ({
                            ...prev, 
                            motion:{...prev.motion, drag:!prev.motion.drag}}
                        ))}}
                    />
                    </div>
                    </div>
                </frame.Frame.SubBox>

            </frame.Frame.Box>
        </motion.div>
        </div>
    )
}

export default {
    Settings,
}