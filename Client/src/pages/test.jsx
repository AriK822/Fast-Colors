import ui from "../components/shared/_ui"
import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"



function Test(){
    return (
        <ui.FullScreen className="flex">

            <ui.SideBar 
                style={{"--bg-paint-texture": `url(${paintTexture})`,}}
            >
                <h1 className="ui-text text-2xl">
                    Play as: {"AriK"}
                </h1>
                <ui.SideBar.Input 
                    className="mt-3"
                    placeholder="Your name" 
                />
                <ui.SideBar.Divider />

                <ui.SideBar.Btn>Home</ui.SideBar.Btn>
                <ui.SideBar.Btn>Settings</ui.SideBar.Btn>

            </ui.SideBar>

            <main
                className="
                    relative flex min-w-0 flex-1
                    items-center justify-center
                    overflow-hidden
                    bg-cover bg-center
                    bg-[image:var(--bg-mobile)]
                    xl:bg-[image:var(--bg-desktop)]
                "
                style={{
                    "--bg-mobile": `url(${bgMobile})`,
                    "--bg-desktop": `url(${bgLandscape})`,
                }}
            >
                <div
                    className="
                        flex flex-col w-[80%] h-[80%]
                        items-center justify-center
                        gap-ui-md
                    "
                >
                    <ui.Frame.Btn className={`w-full`}>
                        Create Lobby
                    </ui.Frame.Btn>
                    
                    <ui.Frame.Box
                        header={"Available Lobbies:"}
                        className={`
                            w-full h-full min-h-0
                        `}
                        insideBoxClassName={`
                            flex flex-col gap-ui-md
                            game-theme-scrollbar h-full
                        `}
                    >
                        {Array.from({length:3}).map((_, i) =>
                        <ui.Frame.JoinLobbyInfo
                            key={i}
                            className={`w-full`}
                            lobby={{
                                id: "8e3f-mi3b-ns73-aon3",
                                owner: "Some player 12312",
                                players: 3,
                                bots: 4,
                            }}
                        />
                        )}
                    </ui.Frame.Box>
                </div>
            </main>

        </ui.FullScreen>
    )
}

export default Test
