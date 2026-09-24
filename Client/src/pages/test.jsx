import * as ui from "../components/global"
import bgHome from "../assets_staging/bg-home-landscape.png"
import mainLogo from "../assets_staging/t1.png"

function Test(){
    return (
        <ui.FullScreen
            // style={{
            //     backgroundImage: `url(${bgHome})`,
            //     backgroundSize: "cover",
            //     backgroundPosition: "center",
            // }}
            className="flex"
        >

        <ui.SideBar 
            className="border"
        >
            <h1>Some text</h1>
        </ui.SideBar>

        <div className="flex w-full h-full items-center justify-center border">

            <div className={`
                flex flex-wrap
                justify-center gap-8
            `}>
                <div className={`
                    flex flex-col border 
                    justify-center items-center p-10
                    min-w-150 mx-6
                `}>
                    <h1 className="p-3 m-0 font-bold text-6xl">Fast colors</h1>
                    <h5 className="p-2 m-0 font-semibold text-2xl">
                        <span>Think Fast! </span>
                        <span>Play Together.</span>
                    </h5>
                </div>

                <div className={`
                    flex flex-col md:flex-row justify-center items-center
                    border gap-3 min-w-100 p-10 mx-6
                `}>
                    <ui.Button
                        className="w-full"
                    >Create Room</ui.Button>
                    <ui.Button
                        className="w-full"
                    >Join Room</ui.Button>
                </div>
            </div>

        </div>

        <div className="
            hidden [@media(min-width:1600px)]:flex
            w-[38%] min-w-[20%]
            h-full items-center justify-center
        ">
            <img
                className="
                    select-none pointer-events-none
                    w-full scale-130
                "
                src={mainLogo}
                alt="fast colors"
            />
        </div>

        </ui.FullScreen>
    )
}

export default Test
