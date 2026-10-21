
import "./style/logos.css";

import AddBotLogo from "../../assets/logos/add_bot.svg?react";
import ArrowRightLogo from "../../assets/logos/arrow_right.svg?react";
import BlockedLogo from "../../assets/logos/blocked.svg?react";
import BotAvatarLogo from "../../assets/logos/bot_avatar.svg?react";
import CardLogo from "../../assets/logos/card.svg?react";
import ChatLogo from "../../assets/logos/chat.svg?react";
import CircleLogo from "../../assets/logos/circle.svg?react";
import ClockLogo from "../../assets/logos/clock.svg?react";
import CreateLobbyLogo from "../../assets/logos/create_lobby.svg?react";
import DisconnectedLogo from "../../assets/logos/disconnected.svg?react";
import DoorLogo from "../../assets/logos/door.svg?react";
import EmptyLogo from "../../assets/logos/empty.svg?react";
import ExpandLogo from "../../assets/logos/expand.svg?react";
import GameOptionsLogo from "../../assets/logos/game_options.svg?react";
import GameRulesLogo from "../../assets/logos/game_rules.svg?react";
import GithubLogo from "../../assets/logos/github_logo.svg?react";
import HomeLogo from "../../assets/logos/home.svg?react";
import InfoLogo from "../../assets/logos/info.svg?react";
import KickPlayerLogo from "../../assets/logos/kick_player.svg?react";
import LeaveLogo from "../../assets/logos/leave.svg?react";
import LockedLogo from "../../assets/logos/locked.svg?react";
import NotificationLogo from "../../assets/logos/notification.svg?react";
import OwnerCrownLogo from "../../assets/logos/owner_crown.svg?react";
import PlayerAvatarLogo from "../../assets/logos/player_avatar.svg?react";
import ReconnectingLogo from "../../assets/logos/reconnecting.svg?react";
import SendLogo from "../../assets/logos/send.svg?react";
import SettingsLogo from "../../assets/logos/settings.svg?react";
import SkipLogo from "../../assets/logos/skip.svg?react";
import SyncingLogo from "../../assets/logos/syncing.svg?react";
import ThreeDotsLogo from "../../assets/logos/three_dots.svg?react";
import WinnerCrownLogo from "../../assets/logos/winner_crown.svg?react";
import XLogo from "../../assets/logos/x.svg?react";
import PlayersLogo from "../../assets/logos/players.svg?react";
import SidebarLogo from "../../assets/logos/sidebar.svg?react";
import GameDirectionArrow from "../../assets/logos/game_direction.svg?react"


const logos = {
  add_bot: AddBotLogo,
  arrow_right: ArrowRightLogo,
  blocked: BlockedLogo,
  bot_avatar: BotAvatarLogo,
  card: CardLogo,
  chat: ChatLogo,
  circle: CircleLogo,
  clock: ClockLogo,
  create_lobby: CreateLobbyLogo,
  disconnected: DisconnectedLogo,
  door: DoorLogo,
  empty: EmptyLogo,
  expand: ExpandLogo,
  game_options: GameOptionsLogo,
  game_rules: GameRulesLogo,
  github_logo: GithubLogo,
  home: HomeLogo,
  info: InfoLogo,
  kick_player: KickPlayerLogo,
  leave: LeaveLogo,
  locked: LockedLogo,
  notification: NotificationLogo,
  owner_crown: OwnerCrownLogo,
  player_avatar: PlayerAvatarLogo,
  reconnecting: ReconnectingLogo,
  send: SendLogo,
  settings: SettingsLogo,
  skip: SkipLogo,
  syncing: SyncingLogo,
  three_dots: ThreeDotsLogo,
  winner_crown: WinnerCrownLogo,
  x: XLogo,
  players: PlayersLogo,
  sidebar: SidebarLogo,

  GameDirectionArrow,
};

export function Logo({ id, color = "white", className = "" }) {
  const Svg = logos[id];

  if (!Svg) return null;

  return (
    <Svg
      aria-hidden="true"
      style={{ color, fill: color }}
      className={`game-logo inline-block h-[1em] w-auto align-[-0.15em] [&_*]:fill-current ${className}`}
    />
  );
}

export default {
    Logo,
};
