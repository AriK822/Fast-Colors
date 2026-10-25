# Fast colors
![Fast colors Logo](/.docs/assets/sidebar-logo.png)

An **open source** implementation of **UNO-like card game**!<br>
Add your new ideas and custom cards in under 5 minutes.<br>
Play with friends for free over your local network.<br>
Real time multiplayer gameplay with smooth graphics.

- [Overview](#fast-colors-overview)
- [Quick Start](#quick-start)
- [License](#license)
- [Contributing](#contributing)
- [Table of content](#table-of-content)


## Fast Colors Overview
Real-time, server-authoritative implementation of **UNO-like card game**, using **JavaScript**.<br>
Flexible structure, extensible card types and smooth graphics. 

**Server**:
- Express 
- SocketIO

**Client**: 
- React 
- SocketIO 
- Motion 
- Tailwind CSS 

Read more in [Features](/.docs/FEATURES.md) 

Game preview:
![Fast colors game preview](/.docs/assets/game_ui.jpg) 

See more [Screenshots](/.docs/PREVIEW.md)


## Quick Start
Fast Colors requires you to have **git**, **node** and **npm** installed.

#### Clone the repo:
```Bash
git clone https://github.com/AriK822/Fast-Colors.git
cd Fast-Colors
```

Fast Colors uses different processes for backend and frontend. Start each separately:

#### Start backend:
```bash
cd server
npm install # You need to run this only once!
npm run dev
```
If the process was successful, you would see something like:<br>
`Fast Colors listening at http://0.0.0.0:8080`
> Make sure you have `expose_host: true` in your server `config/config.js` file.

#### Start frontend:
```Bash
cd client
npm install # You need to run this only once!
npm run dev -- --host 0.0.0.0
```

If the process was successful, you would see something like:<br>
```Bash
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.4:5173/   Wi-Fi
```

Now keep both processes running, and visit the Wi-Fi url in your frontend terminal, in any browser, in any device that is connected to the same local network (router) as the device running the process.

For example, I could visit `http://192.168.1.4:5173/` on my mobile phone connected to my router, which my pc is also connected to.

## License
[AGPL-3.0 License](/LICENSE) 

## Contributing
Feel free to report bugs, suggest features, fork the repository or submit pull requests.<br>
Please read [contribution guide](/.docs/CONTRIBUTING.md) for significant changes. 

## Table of content
Read more:
- [Adding new cards](/.docs/ADDING_NEW_CARDS.md)
- [Features](/.docs/FEATURES.md)
- [Architecture](/.docs/ARCHITECTURE.md)
- [Contributing](/.docs/CONTRIBUTING.md)
- [Preview and screenshots](/.docs/PREVIEW.md)
- [Road map](/.docs/ROAD_MAP.md)

