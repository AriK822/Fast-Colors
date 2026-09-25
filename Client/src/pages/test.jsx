import * as ui from "../components/global"
import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import mainLogo from "../assets_staging/logo1.1.png"
import paintTexture from "../assets_staging/t1.jpg"

function Test(){
    return (
        <ui.FullScreen className="flex">

            <ui.SideBar 
                className="game-side-bar"
                style={{"--bg-paint-texture": `url(${paintTexture})`,}}
            >
                <h1 className="game-default-text text-3xl">
                    Play as: {"AriK"}
                </h1>
                <ui.Input 
                    className="mt-3"
                    placeholder="Your name" 
                />
                <ui.Divider />

                <ui.Button variant="sidebar">Home</ui.Button>
                <ui.Button variant="sidebar">Settings</ui.Button>

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
                <div className="
                    relative z-10
                    flex flex-col
                    items-center
                    gap-6
                    px-6
                ">
                    <div className="flex flex-col items-center">
                        <img
                            src={mainLogo}
                            alt="Fast Colors"
                            className="w-100 img-shadow"
                        />

                        <h5 className="game-default-text text-3xl">
                            <span>Think Fast! </span>
                            <span className="text-[#a3ffe8]">
                                Play Together.
                            </span>
                        </h5>
                    </div>

                    <div className="
                        flex w-full max-w-md
                        flex-col gap-3
                        sm:flex-row
                    ">
                        <ui.Button className="w-full p-3">
                            Create Room
                        </ui.Button>

                        <ui.Button className="w-full p-3">
                            Join Room
                        </ui.Button>
                    </div>
                </div>

            </main>

        </ui.FullScreen>
    )
}

export default Test
