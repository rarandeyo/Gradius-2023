import type { PlayerModel } from 'commonTypesWithClient/models';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from 'src/utils/apiClient';
import { getUserIdFromLocalStorage, loginWithLocalStorage } from 'src/utils/loginWithLocalStorage';
import styles from './index.module.css';

const Login = () => {
  const [name, setName] = useState<string>('');
  const [playersPlaying, setPlayersPlaying] = useState<PlayerModel[]>([]);
  const [playersDead, setPlayersDead] = useState<PlayerModel[]>([]);
  const [check, setCheck] = useState<boolean>();
  const [buttonPressed, setButtonPressed] = useState<boolean>(false);

  const router = useRouter();

  const redirectToController = useCallback(async () => {
    const localStorageUserId = getUserIdFromLocalStorage();
    if (localStorageUserId !== null) {
      return router.push('/controller');
    }
  }, [router]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const login = useCallback(async () => {
    const player: PlayerModel = await apiClient.player.$post({ body: { name } });
    loginWithLocalStorage(player.id);
    router.push('/controller');
  }, [name, router]);

  const checkOrientation = useCallback(() => {
    if (window.innerWidth > window.innerHeight && buttonPressed) {
      login();
    } else if (name !== '') {
      setCheck(false);
      const container = document.querySelector('.container');
      container?.classList.add('blur');
      const titleCard = document.querySelector('.titlecard') as HTMLElement | null;

      if (titleCard) {
        titleCard.style.display = 'none';
      }
    }
  }, [name, login, buttonPressed]);

  const fetchPlayers = async () => {
    //一時的にdisplayNumber:0で固定
    const res = await apiClient.player.$get({ query: { displayNumber: 0 } });
    setPlayersPlaying(res.filter((player) => player.isPlaying));
    setPlayersDead(res.filter((player) => !player.isPlaying));
  };
  const clickButton = () => {
    setButtonPressed(true);
    checkOrientation();
  };

  const playerCount = useMemo(() => {
    return playersPlaying.length;
  }, [playersPlaying]);

  const playerRanking = useMemo(() => {
    const sortedPlayers = playersDead.sort((a, b) => b.score - a.score);
    return sortedPlayers.slice(0, 6);
  }, [playersDead]);
  useEffect(() => {
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [checkOrientation]);

  useEffect(() => {
    redirectToController();
  }, [redirectToController]);

  useEffect(() => {
    const cancelId = requestAnimationFrame(() => {
      fetchPlayers();
    });
    return () => cancelAnimationFrame(cancelId);
  }, []);

  return (
    <div className={styles.container}>
      <div>
        {check === false && buttonPressed === true && (
          <div className={styles.alertcard}>
            <div className={styles.smartphone}>
              <div className={styles.screen} />
              <div className={styles.smartPhoneButton} />
              <div className={styles.speaker} />
            </div>
            <p>横画面にしてください</p>
          </div>
        )}
      </div>

      <div>
        {(check === true || buttonPressed === false) && (
          <div className={styles.titlecard}>
            <h1 className={styles.title}>Gradius</h1>
            <span />
            <p className={styles.announcement}>ニックネームを入力してください</p>
            <input
              type="text"
              placeholder="ここに入力"
              className={styles.input}
              value={name}
              onChange={handleInput}
            />
            <button className={styles.button} disabled={name === ''} onClick={clickButton}>
              プレイ
            </button>
            <p className={styles.announcement}>※ニックネームはゲームに使用されます</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
