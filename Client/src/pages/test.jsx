import ui from "../components/shared/_ui"
import lobby_ui from "../components/lobby/lobby_ui"
import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"



function Test(){
    Object.assign(ui, {Lobby:lobby_ui})

    return (
    <ui.FullScreen className="flex">

        <ui.SideBar 
            style={{"--bg-paint-texture": `url(${paintTexture})`,}}
        >
            <h1 className="ui-text text-2xl truncate">
                Play as: 
            </h1>
            <ui.SideBar.Input 
                className="mt-3"
                placeholder="Your name"
            />

            <div className="hidden md:flex flex-col">
                <ui.SideBar.Divider />

                <ui.Frame.Btn>
                    Start Game
                </ui.Frame.Btn>
            </div>

            <ui.SideBar.Divider />

            <ui.SideBar.Btn>Home</ui.SideBar.Btn>
            <ui.SideBar.Btn>Settings</ui.SideBar.Btn>
            <ui.SideBar.Btn>Leave Lobby</ui.SideBar.Btn>
        </ui.SideBar>

        <main
            className="
                relative flex min-w-0 flex-1
                flex-col
                items-center justify-center
                overflow-hidden
                bg-cover bg-center
                bg-[image:var(--bg-mobile)]
                md:bg-[image:var(--bg-desktop)]
            "
            style={{
                "--bg-mobile": `url(${bgMobile})`,
                "--bg-desktop": `url(${bgLandscape})`,
            }}
        >
            <div
                className="border bg-overlay
                w-full flex-2 flex flex-row justify-center items-center"
            ></div>
            <div
                className="border bg-overlay relative
                w-full flex-12 flex flex-row justify-center items-center
                gap-[10px]"
            >
                <div
                    className="border bg-overlay
                    w-[70px] aspect-9/16"
                ></div>
                <div
                    className="border bg-overlay
                    w-[120px] aspect-9/16"
                ></div>
                <div
                    className="border bg-overlay
                    w-[65px] aspect-1/1"
                ></div>
            </div>
            <div
                className="border bg-overlay
                w-full flex-3 flex flex-row justify-center items-center"
            >
                <div
                    className="border bg-overlay
                    h-full w-[100%] lg:w-[60%]"
                ></div>
            </div>

        </main>

    </ui.FullScreen>
    )
}

export default Test
