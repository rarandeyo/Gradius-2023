import type { PlayerModel } from 'commonTypesWithClient/models';
import {
  DEFAULT_PLAYER_MOVE_SPEED,
  SHIELD_DURATION_MS,
  SPEED_BOOST_DURATION_MS,
} from '../../commonConstantsWithClient';
import { playerRepository } from '../../repository/playerRepository';

interface ItemHandlers {
  [key: string]: (player: PlayerModel) => Promise<void>;
}
export const itemHandler: ItemHandlers = {
  speed: async (player: PlayerModel) => {
    const resetSpeedEffect = async () => {
      const currentPlayer = await playerRepository.find(player.id);
      if (currentPlayer === null) return null;
      const updatePlayerInfo: PlayerModel = {
        ...currentPlayer,
        speed: DEFAULT_PLAYER_MOVE_SPEED,
        usingItem: null,
      };
      await playerRepository.save(updatePlayerInfo);
    };
    try {
      if (player.usingItem !== null) return;
      const updatePlayerInfo: PlayerModel = {
        ...player,
        speed: DEFAULT_PLAYER_MOVE_SPEED * 2,
        Items: (player.Items ?? []).slice(1),
        usingItem: 'speed',
      };
      await playerRepository.save(updatePlayerInfo);

      setTimeout(async () => {
        try {
          resetSpeedEffect();
        } catch (error) {
          console.error('リセットに失敗しました:', error);
          setTimeout(async () => {
            resetSpeedEffect();
          }, 500);
        }
      }, SPEED_BOOST_DURATION_MS);
    } catch (error) {
      console.error('アイテムの使用に失敗しました:', error);
    }
  },
  shield: async (player: PlayerModel) => {
    const resetShieldEffect = async () => {
      const currentPlayer = await playerRepository.find(player.id);
      if (currentPlayer === null) return null;
      const updatePlayerInfo: PlayerModel = {
        ...currentPlayer,
        usingItem: null,
      };
      await playerRepository.save(updatePlayerInfo);
    };

    try {
      if (player.usingItem !== null) return;
      const updatePlayerInfo: PlayerModel = {
        ...player,
        Items: (player.Items ?? []).slice(1),
        usingItem: 'shield',
      };
      await playerRepository.save(updatePlayerInfo);

      setTimeout(async () => {
        try {
          resetShieldEffect();
        } catch (error) {
          console.error('シールドのリセットに失敗しました:', error);
          setTimeout(async () => {
            resetShieldEffect();
          }, 500);
        }
      }, SHIELD_DURATION_MS);
    } catch (error) {
      console.error('アイテムの使用に失敗しました:', error);
    }
  },
};
