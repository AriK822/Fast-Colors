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
                <ui.Frame
                    header={"Available Lobbies:"}
                    className={`
                        flex flex-col w-[92%] h-[92%]
                        lg:w-[80%] lg:h-[80%]
                        items-center justify-center
                        gap-ui-md game-theme-scrollbar
                    `}
                >
 
            
                </ui.Frame>

            </main>

        </ui.FullScreen>
    )
}

export default Test
