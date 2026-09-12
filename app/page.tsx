'use client';
import { loadNounArt, nounArtPath } from './noun-art';
import { loadSceneArt } from './scene-art';
import { loadEarthArt } from './earth-art';
import { loadElementArt } from './element-art';
import { loadWendyArt } from './wendy-art';
import { loadPlatformArt } from './platform-art';
import {
  CHARACTERS,
  loadCharacterArt,
  type CharacterId,
} from './character-art';
import { loadVietnamFoodArt } from './vietnam-scene';
import CharacterChoicePortrait from './character-choice-portrait';
import {
  cloudProgressEnabled,
  loadCloudProgress,
  saveCloudProgress,
  signInWithGoogle,
  signOutProgressUser,
  watchProgressUser,
  type ProgressUser,
} from './cloud-progress';
import Link from 'next/link';
import Image from 'next/image';
import {
  speakVoice,
  stopVoice,
  voiceSpeaking,
  voiceLabel,
} from './recorded-speech';
import { VOCABULARY } from './lesson-data';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Flag,
  Pause,
  RotateCcw,
  Map,
  Check,
  ChevronRight,
  X,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  createGame,
  updateGame,
  drawGame,
  WORDS,
  WORLDS,
  WIDTH,
  HEIGHT,
  earthAbilityReady,
  type Mode,
} from './game-engine';

const STORY_SCENES = [
  {
    image: '/story/scene-1.png',
    title: 'Thế giới của những câu chuyện',
    text: 'Ngày xửa ngày xưa, mọi người trên thế giới có thể đọc, viết và kể cho nhau nghe những câu chuyện tuyệt vời.',
    start: 0,
  },
  {
    image: '/story/scene-2.png',
    title: 'Ngôn ngữ bị đánh cắp',
    text: 'Đội quân quái vật xấu xa đã đánh cắp các chữ cái và từ vựng tiếng Anh.',
    start: 9.45,
  },
  {
    image: '/story/scene-3.png',
    title: 'Một thế giới im lặng',
    text: 'Sách trở nên trống rỗng, biển hiệu mất hết chữ và mọi người dần quên cách gọi tên mọi vật.',
    start: 21.6,
  },
  {
    image: '/story/scene-4-v2.jpg',
    title: 'Bốn người bạn đứng lên',
    text: 'Mon, Mori, Rio và Sol lên đường cùng Wendy để mang các chữ cái trở về.',
    start: 29.62,
  },
  {
    image: '/story/scene-5-v2.jpg',
    title: 'Hành trình giải cứu từ vựng',
    text: 'Họ phải học từ mới, đánh bại toàn bộ enemy và chiến thắng trùm cuối của mỗi vùng đất.',
    start: 43.81,
  },
  {
    image: '/story/scene-6.png',
    title: 'Cuộc phiêu lưu bắt đầu',
    text: 'Hai mươi sáu chữ cái. Hai mươi sáu vùng đất. Hãy chọn người bạn đồng hành và khôi phục ngôn ngữ!',
    start: 61.27,
  },
] as const;

const ENDING_SCENES = [
  {
    image: '/story/ending/scene-1.png',
    title: 'Hai mươi sáu chữ cái trở về',
    text: 'Khi trùm cuối cùng bị đánh bại, những chữ cái sáng rực bay về thư viện của thế giới.',
  },
  {
    image: '/story/ending/scene-2.png',
    title: 'Mọi người lại gọi tên vạn vật',
    text: 'Sách có chữ trở lại, biển hiệu hiện tên và tiếng cười vang lên khắp những con phố Việt Nam.',
  },
  {
    image: '/story/ending/scene-3.png',
    title: 'Câu chuyện lại được kể',
    text: 'Mon, Mori, Rio, Sol và Wendy cùng các bạn nhỏ đọc những câu chuyện mới bằng tất cả từ vựng đã tìm được.',
  },
  {
    image: '/story/ending/scene-4.png',
    title: 'Người giữ chữ cái mới',
    text: 'Từ hôm ấy, thế giới không còn sợ mất ngôn ngữ nữa—vì đã có bạn bảo vệ đủ A đến Z!',
  },
] as const;

const usesDesktopStoryClips = () =>
  window.matchMedia('(min-width: 901px)').matches;

export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null),
    game = useRef(createGame()),
    input = useRef({ left: false, right: false, jump: false, earth: false }),
    mutedRef = useRef(false),
    audio = useRef<AudioContext | null>(null),
    storyAudio = useRef<HTMLAudioElement>(null),
    endingAudio = useRef<HTMLAudioElement>(null),
    storySceneRef = useRef(0);
  const [level, setLevel] = useState(0),
    [mode, setMode] = useState<Mode>('ready'),
    [hp, setHp] = useState(3),
    [stars, setStars] = useState(0),
    [muted, setMuted] = useState(false),
    [completed, setCompleted] = useState<number[]>([]),
    [mapOpen, setMapOpen] = useState(false),
    [notice, setNotice] = useState(''),
    [quizHint, setQuizHint] = useState(''),
    [quizRound, setQuizRound] = useState(0),
    [quizInput, setQuizInput] = useState(''),
    [loaded, setLoaded] = useState(false),
    [assetError, setAssetError] = useState(false),
    [score, setScore] = useState(0),
    [learned, setLearned] = useState<string[]>([]),
    [earthReady, setEarthReady] = useState(false),
    [hero, setHero] = useState<CharacterId>('mon'),
    [storyOpen, setStoryOpen] = useState(true),
    [storyStarted, setStoryStarted] = useState(false),
    [storyScene, setStoryScene] = useState(0),
    [endingOpen, setEndingOpen] = useState(false),
    [endingStarted, setEndingStarted] = useState(false),
    [endingScene, setEndingScene] = useState(0),
    [progressUser, setProgressUser] = useState<ProgressUser | null>(null),
    [cloudStatus, setCloudStatus] = useState<
      'idle' | 'syncing' | 'saved' | 'error'
    >('idle');
  const completedRef = useRef<number[]>([]);
  const voiceName = voiceLabel(level);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const letter = String.fromCharCode(65 + level),
    word = WORDS[level],
    world = WORLDS[level],
    heroInfo =
      CHARACTERS.find((character) => character.id === hero) ?? CHARACTERS[0],
    skillInfo = {
      mon: {
        label: 'THỔ',
        image: '/abilities/earth-rock.webp',
        action: 'Ném đá',
      },
      mori: {
        label: 'MỘC',
        image: '/abilities/mori-log.webp',
        action: 'Quăng khúc cây',
      },
      rio: {
        label: 'THỦY',
        image: '/abilities/rio-water.webp',
        action: 'Phun nước',
      },
      sol: {
        label: 'HỎA',
        image: '/abilities/sol-fire.webp',
        action: 'Ném lửa',
      },
    }[hero];
  const say = useCallback((phrase: string) => {
    if (!mutedRef.current) speakVoice(phrase);
  }, []);
  const playEndingClip = useCallback((scene: number) => {
    const sound = endingAudio.current;
    if (!sound) return;
    sound.pause();
    sound.src = `/story/ending/audio/scene-${scene + 1}.mp3`;
    sound.load();
    sound.muted = mutedRef.current;
    void sound.play();
  }, []);
  const closeEnding = useCallback(() => {
    endingAudio.current?.pause();
    setEndingOpen(false);
    setEndingStarted(false);
    try {
      localStorage.setItem('mon-alphabet-ending-seen', 'true');
    } catch {}
  }, []);
  const beginEnding = useCallback(() => {
    stopVoice();
    setEndingScene(0);
    setEndingStarted(true);
    playEndingClip(0);
  }, [playEndingClip]);
  const nextEndingScene = useCallback(() => {
    if (endingScene >= ENDING_SCENES.length - 1) {
      closeEnding();
      return;
    }
    const next = endingScene + 1;
    setEndingScene(next);
    playEndingClip(next);
  }, [closeEnding, endingScene, playEndingClip]);
  const replayEnding = useCallback(() => {
    setEndingScene(0);
    setEndingStarted(false);
    setEndingOpen(true);
  }, []);
  const handleEndingAudioEnded = useCallback(() => {
    if (endingStarted && endingScene < ENDING_SCENES.length - 1)
      nextEndingScene();
  }, [endingScene, endingStarted, nextEndingScene]);
  const closeStory = useCallback(() => {
    storyAudio.current?.pause();
    setStoryOpen(false);
    setStoryStarted(false);
  }, []);
  const playDesktopStoryClip = useCallback((scene: number) => {
    const sound = storyAudio.current;
    if (!sound) return;
    sound.pause();
    sound.src = `/story/audio-scenes/scene-${scene + 1}.mp3`;
    sound.load();
    sound.muted = mutedRef.current;
    void sound.play();
  }, []);
  const beginStory = useCallback(() => {
    stopVoice();
    const sound = storyAudio.current;
    if (!sound) return;
    sound.muted = mutedRef.current;
    storySceneRef.current = 0;
    setStoryScene(0);
    setStoryStarted(true);
    if (usesDesktopStoryClips()) {
      playDesktopStoryClip(0);
    } else {
      sound.src = '/story/story-google-ai-v2.wav';
      sound.load();
      sound.currentTime = 0;
      void sound.play();
    }
  }, [playDesktopStoryClip]);
  const nextStoryScene = useCallback(() => {
    const current = storySceneRef.current;
    if (current >= STORY_SCENES.length - 1) {
      closeStory();
      return;
    }
    const next = current + 1;
    storySceneRef.current = next;
    setStoryScene(next);
    const sound = storyAudio.current;
    if (usesDesktopStoryClips()) {
      playDesktopStoryClip(next);
    } else if (sound) {
      sound.pause();
      sound.currentTime = STORY_SCENES[next].start + 0.02;
      sound.muted = mutedRef.current;
      void sound.play();
    }
  }, [closeStory, playDesktopStoryClip]);
  const handleStoryAudioEnded = useCallback(() => {
    if (
      usesDesktopStoryClips() &&
      storySceneRef.current < STORY_SCENES.length - 1
    ) {
      nextStoryScene();
    }
  }, [nextStoryScene]);
  const tone = useCallback((hz: number) => {
    if (mutedRef.current) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const o = audio.current.createOscillator(),
        v = audio.current.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(hz, audio.current.currentTime);
      o.frequency.exponentialRampToValueAtTime(
        hz * 1.4,
        audio.current.currentTime + 0.12,
      );
      v.gain.setValueAtTime(0.06, audio.current.currentTime);
      v.gain.exponentialRampToValueAtTime(
        0.001,
        audio.current.currentTime + 0.18,
      );
      o.connect(v);
      v.connect(audio.current.destination);
      o.start();
      o.stop(audio.current.currentTime + 0.2);
    } catch {}
  }, []);
  const flash = useCallback((s: string) => {
    setNotice(s);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 3200);
  }, []);
  const changeMode = useCallback((m: Mode) => {
    game.current.mode = m;
    if (m !== 'playing') stopVoice();
    setMode(m);
    input.current = { left: false, right: false, jump: false, earth: false };
  }, []);
  const chooseLevel = useCallback(
    (n: number) => {
      game.current = createGame(n, hero);
      setLevel(n);
      setMode('ready');
      setHp(3);
      setStars(0);
      setScore(0);
      setLearned([]);
      setEarthReady(false);
      setNotice('');
      setQuizHint('');
      setQuizRound(0);
      setQuizInput('');
      setMapOpen(false);
      input.current = { left: false, right: false, jump: false, earth: false };
      stopVoice();
    },
    [hero],
  );
  useEffect(() => () => stopVoice(), []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('ending') !== 'preview')
      return;
    const id = requestAnimationFrame(() => {
      setStoryOpen(false);
      setEndingScene(0);
      setEndingStarted(false);
      setEndingOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);
  useEffect(
    () =>
      watchProgressUser(async (user) => {
        setProgressUser(user);
        if (!user) {
          setCloudStatus('idle');
          return;
        }
        setCloudStatus('syncing');
        try {
          const cloud = await loadCloudProgress(user.uid),
            merged = [...new Set([...completedRef.current, ...cloud])].sort(
              (a, b) => a - b,
            );
          completedRef.current = merged;
          setCompleted(merged);
          localStorage.setItem('mon-alphabet-progress', JSON.stringify(merged));
          await saveCloudProgress(user.uid, merged);
          setCloudStatus('saved');
        } catch {
          setCloudStatus('error');
        }
      }),
    [],
  );
  useEffect(() => {
    if (!progressUser) return;
    const timeout = setTimeout(() => {
      setCloudStatus('syncing');
      void saveCloudProgress(progressUser.uid, completed)
        .then(() => setCloudStatus('saved'))
        .catch(() => setCloudStatus('error'));
    }, 350);
    return () => clearTimeout(timeout);
  }, [completed, progressUser]);
  useEffect(() => {
    if (!storyOpen || !storyStarted) return;
    if (usesDesktopStoryClips()) return;
    let frame = 0;
    const syncStoryToAudio = () => {
      const current = storyAudio.current?.currentTime ?? 0;
      let active = 0;
      STORY_SCENES.forEach((scene, index) => {
        if (current >= scene.start) active = index;
      });
      const next = Math.max(active, storySceneRef.current);
      if (next !== storySceneRef.current) storySceneRef.current = next;
      setStoryScene((previous) => (previous === next ? previous : next));
      frame = requestAnimationFrame(syncStoryToAudio);
    };
    frame = requestAnimationFrame(syncStoryToAudio);
    return () => cancelAnimationFrame(frame);
  }, [storyOpen, storyStarted]);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem('mon-alphabet-progress') || '[]',
        );
        if (Array.isArray(saved))
          setCompleted(
            saved.filter(
              (n: unknown) =>
                Number.isInteger(n) && Number(n) >= 0 && Number(n) < 26,
            ),
          );
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const sprite = new window.Image();
    let active = true;
    sprite.onload = () => {
      void Promise.all([
        loadNounArt(),
        loadSceneArt(),
        loadVietnamFoodArt(),
        loadEarthArt(),
        loadCharacterArt(),
        loadElementArt(),
        loadWendyArt(),
        loadPlatformArt(),
      ])
        .then(() => {
          if (active) setLoaded(true);
        })
        .catch(() => {
          if (active) setAssetError(true);
        });
    };
    sprite.onerror = () => setAssetError(true);
    sprite.src = '/mon-sprite.png';
    let frame = 0,
      last = 0;
    const tick = (now: number) => {
      const g = game.current;
      if (g.mode === 'playing') {
        updateGame(g, last ? (now - last) / 1000 : 1 / 60, input.current);
        input.current.jump = false;
        input.current.earth = false;
        for (const e of g.events) {
          if (e.type === 'collect') {
            const l = String.fromCharCode(65 + g.level),
              w = WORDS[g.level];
            const phrase =
              e.index === 0
                ? l
                : e.index === 1
                  ? `Lowercase ${l}`
                  : `${l} is for ${w[0]}`;
            flash(
              e.index === 0
                ? `${l} — Chữ hoa`
                : e.index === 1
                  ? `${l.toLowerCase()} — Chữ thường · HỆ THỔ ĐÃ MỞ!`
                  : `${w[0]} · ${w[1]}`,
            );
            say(phrase);
            tone(680);
          } else if (e.type === 'encounter' || (e.type === 'stomp' && e.noun)) {
            if (e.noun) {
              flash(`${e.noun[0]} · ${e.noun[1]}`);
              say(e.noun[0]);
            }
            if (e.type === 'stomp') tone(560);
          } else if (e.type === 'jump') tone(310);
          else if (e.type === 'earth') {
            const character =
              CHARACTERS.find((candidate) => candidate.id === e.hero) ??
              CHARACTERS[0];
            const action =
              e.hero === 'mori'
                ? 'QUĂNG KHÚC CÂY!'
                : e.hero === 'rio'
                  ? 'PHUN NƯỚC!'
                  : e.hero === 'sol'
                    ? 'NÉM LỬA!'
                    : 'NÉM ĐÁ!';
            flash(
              `${character.name} · HỆ ${character.element.toUpperCase()} · ${action}`,
            );
            tone(230);
          } else if (e.type === 'earthHit') tone(120);
          else if (e.type === 'heal') {
            flash(`${e.food} · Hồi 1 tim ♥`);
            tone(880);
          } else if (e.type === 'hurt') tone(140);
          else if (e.type === 'stomp') tone(440);
          else if (e.type === 'quiz')
            say(
              `${String.fromCharCode(65 + g.level)} is for ${WORDS[g.level][0]}`,
            );
        }
        setHp(g.hp);
        setStars(g.stars);
        setEarthReady(earthAbilityReady(g));
        setScore(g.score);
        setLearned((prev) =>
          prev.length === g.learned.length ? prev : [...g.learned],
        );
        setMode(g.mode);
      }
      last = now;
      drawGame(ctx, g, sprite, now / 1000, voiceSpeaking());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [flash, say, tone]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('button,input,[role="dialog"]'))
        return;
      const k = e.code;
      if (
        [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'Space',
          'KeyA',
          'KeyD',
          'KeyW',
          'KeyF',
        ].includes(k)
      ) {
        e.preventDefault();
        if (game.current.mode !== 'playing') return;
        if (k === 'ArrowLeft' || k === 'KeyA') input.current.left = true;
        if (k === 'ArrowRight' || k === 'KeyD') input.current.right = true;
        if ((k === 'Space' || k === 'ArrowUp' || k === 'KeyW') && !e.repeat)
          input.current.jump = true;
        if (k === 'KeyF' && !e.repeat) input.current.earth = true;
      }
      if (
        k === 'Escape' &&
        (game.current.mode === 'playing' || game.current.mode === 'paused')
      )
        changeMode(game.current.mode === 'playing' ? 'paused' : 'playing');
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) input.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) input.current.right = false;
    };
    const blur = () => {
      input.current = { left: false, right: false, jump: false, earth: false };
      if (game.current.mode === 'playing') changeMode('paused');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', blur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', blur);
    };
  }, [changeMode]);
  function start() {
    game.current.hero = hero;
    changeMode('playing');
    setQuizHint('');
    say(`${letter}. ${letter} is for ${word[0]}`);
    tone(520);
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  }
  function replay() {
    game.current = createGame(level, hero);
    setStars(0);
    setHp(3);
    setScore(0);
    setLearned([]);
    setQuizRound(0);
    setQuizInput('');
    setNotice('');
    start();
  }
  function answer(n: number) {
    if (n !== quizRound) {
      setQuizHint('Chưa đúng rồi. Nghe gợi ý và thử lại nhé!');
      tone(180);
      return;
    }
    if (quizRound < 2) {
      setQuizRound(quizRound + 1);
      setQuizHint('Đúng rồi! Thử từ tiếp theo nhé.');
      say(VOCABULARY[level][quizRound + 1][0]);
      tone(700);
      return;
    }
    setQuizRound(3);
    setQuizInput('');
    setQuizHint('Còn 3 câu gõ từ chính xác để hoàn thành màn!');
    say(VOCABULARY[level][0][0]);
    tone(700);
  }
  function finishQuiz() {
    const next = [...new Set([...completed, level])];
    setCompleted(next);
    try {
      localStorage.setItem('mon-alphabet-progress', JSON.stringify(next));
    } catch {}
    changeMode('won');
    say(`${letter} is for ${word[0]}`);
    tone(880);
    if (next.length === 26) {
      let endingSeen = false;
      try {
        endingSeen =
          localStorage.getItem('mon-alphabet-ending-seen') === 'true';
      } catch {}
      if (!endingSeen) {
        setEndingScene(0);
        setEndingStarted(false);
        setEndingOpen(true);
      }
    }
  }
  async function handleGoogleAccount() {
    if (progressUser) {
      await signOutProgressUser();
      return;
    }
    setCloudStatus('syncing');
    try {
      await signInWithGoogle();
    } catch {
      setCloudStatus('error');
    }
  }
  function submitTypedAnswer(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const typingIndex = quizRound - 3,
      expected = VOCABULARY[level][typingIndex][0];
    if (quizInput.trim().toLocaleLowerCase('en') !== expected.toLowerCase()) {
      setQuizHint('Chưa chính xác. Nghe lại rồi kiểm tra từng chữ nhé!');
      tone(180);
      return;
    }
    if (quizRound < 5) {
      const nextRound = quizRound + 1;
      setQuizRound(nextRound);
      setQuizInput('');
      setQuizHint(
        nextRound === 5
          ? 'Đúng rồi! Còn từ cuối cùng nhé.'
          : 'Đúng rồi! Gõ chính xác thêm một từ nữa nhé.',
      );
      say(VOCABULARY[level][nextRound - 3][0]);
      tone(700);
      return;
    }
    setQuizHint('Chính xác!');
    finishQuiz();
  }
  const touch = (key: 'left' | 'right' | 'jump' | 'earth') => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      if (game.current.mode === 'playing') input.current[key] = true;
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (key !== 'jump' && key !== 'earth') input.current[key] = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    onPointerCancel: () => {
      input.current[key] = false;
    },
    onLostPointerCapture: () => {
      if (key !== 'jump' && key !== 'earth') input.current[key] = false;
    },
  });
  const alphabet = (
    <div className="alphabet">
      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l, i) => (
        <button
          key={l}
          onClick={() => chooseLevel(i)}
          aria-label={`Màn ${l}${completed.includes(i) ? ', đã hoàn thành' : ''}`}
          aria-current={i === level ? 'step' : undefined}
          className={`${i === level ? 'selected ' : ''}${completed.includes(i) ? 'completed' : ''}`}
        >
          {l}
          {completed.includes(i) && <span className="done-dot" />}
        </button>
      ))}
    </div>
  );
  return (
    <main className="app-shell is-fullscreen">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Mon Alphabet Adventure">
          mon<span>✦</span>
          <small>ALPHABET ADVENTURE</small>
        </Link>
        <span className="header-note">Một cuộc phiêu lưu. 26 chữ cái.</span>
        <div className="header-actions">
          {cloudProgressEnabled && (
            <button
              className="account-button"
              type="button"
              onClick={() => void handleGoogleAccount()}
              title={progressUser ? 'Đăng xuất' : 'Lưu tiến độ bằng Google'}
            >
              {progressUser?.photoURL ? (
                <Image
                  unoptimized
                  src={progressUser.photoURL}
                  alt=""
                  width={26}
                  height={26}
                />
              ) : progressUser ? (
                <Cloud size={18} />
              ) : (
                <LogIn size={18} />
              )}
              <span>{progressUser?.displayName ?? 'Đăng nhập Google'}</span>
              {progressUser && <LogOut size={14} />}
            </button>
          )}
          <button
            className="icon-button"
            aria-label="Chọn màn chơi"
            onClick={() => {
              if (mode === 'playing') changeMode('paused');
              setMapOpen(true);
            }}
          >
            <Map size={19} />
          </button>
          <button
            className="icon-button"
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-pressed={!muted}
            onClick={() => {
              mutedRef.current = !muted;
              setMuted(!muted);
              if (storyAudio.current) storyAudio.current.muted = !muted;
              if (endingAudio.current) endingAudio.current.muted = !muted;
              if (!muted) stopVoice();
            }}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>
      <div className="game-layout">
        <aside className="journey">
          <div className="eyebrow">CHUYẾN ĐI CỦA MON</div>
          <h1>
            Chữ nhỏ.
            <br />
            Phiêu lưu <em>lớn.</em>
          </h1>
          <p>
            Nhảy, khám phá và kết bạn
            <br />
            với bảng chữ cái tiếng Anh.
          </p>
          <div className="journey-label">
            <span>Hành trình A–Z</span>
            <span>{completed.length} / 26</span>
          </div>
          {alphabet}
          <div className="world-note">
            <span className="world-dot" /> THẾ GIỚI{' '}
            {String(level + 1).padStart(2, '0')}
            <b>{world.title}</b>
          </div>
        </aside>
        <section className="game-column" aria-label="Game Mon">
          <div className="level-heading">
            <span>
              <i /> MÀN {String(level + 1).padStart(2, '0')}
            </span>
            <b>{world.name}</b>
            <span>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ opacity: i < stars ? 1 : 0.4 }}>
                  ✦
                </span>
              ))}
            </span>
          </div>
          <div
            className="game-frame"
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
          >
            <canvas
              ref={canvas}
              width={WIDTH}
              height={HEIGHT}
              aria-label={`Màn ${letter}. Dùng phím trái phải di chuyển, Space để nhảy.`}
            />
            <audio
              ref={storyAudio}
              src="/story/story-google-ai-v2.wav"
              preload="auto"
              onEnded={handleStoryAudioEnded}
            >
              <track
                kind="captions"
                src="/story/story-vi.vtt"
                srcLang="vi"
                label="Tiếng Việt"
                default
              />
            </audio>
            <audio
              ref={endingAudio}
              preload="auto"
              onEnded={handleEndingAudioEnded}
            >
              <track
                key={endingScene}
                kind="captions"
                src={`/story/ending/audio/scene-${endingScene + 1}.vtt`}
                srcLang="vi"
                label="Tiếng Việt"
                default
              />
            </audio>
            {storyOpen && (
              <div className="story-screen" aria-label="Câu chuyện mở đầu">
                <Image
                  key={STORY_SCENES[storyScene].image}
                  unoptimized
                  fill
                  priority
                  src={STORY_SCENES[storyScene].image}
                  alt={STORY_SCENES[storyScene].title}
                  className="story-image"
                />
                <div className="story-shade" />
                <div
                  className="story-progress"
                  aria-label={`Cảnh ${storyScene + 1} trên 6`}
                >
                  {STORY_SCENES.map((scene, index) => (
                    <span
                      key={scene.image}
                      className={index <= storyScene ? 'active' : ''}
                    />
                  ))}
                </div>
                <button className="story-skip" onClick={closeStory}>
                  Bỏ qua câu chuyện
                </button>
                <div className="story-copy">
                  <small>CÂU CHUYỆN MỞ ĐẦU · {storyScene + 1}/6</small>
                  <h2>{STORY_SCENES[storyScene].title}</h2>
                  <p>{STORY_SCENES[storyScene].text}</p>
                  {!storyStarted ? (
                    <button className="story-primary" onClick={beginStory}>
                      <Play size={18} fill="currentColor" /> Bắt đầu câu chuyện
                    </button>
                  ) : (
                    <button className="story-primary" onClick={nextStoryScene}>
                      {storyScene === STORY_SCENES.length - 1
                        ? 'Chọn nhân vật'
                        : 'Tiếp tục'}
                      <ChevronRight size={19} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {endingOpen && (
              <div
                className="story-screen ending-story"
                aria-label="Câu chuyện kết thúc"
              >
                <Image
                  key={ENDING_SCENES[endingScene].image}
                  unoptimized
                  fill
                  priority
                  src={ENDING_SCENES[endingScene].image}
                  alt={ENDING_SCENES[endingScene].title}
                  className="story-image"
                />
                <div className="story-shade" />
                <div
                  className="story-progress"
                  aria-label={`Cảnh ${endingScene + 1} trên ${ENDING_SCENES.length}`}
                  style={{
                    gridTemplateColumns: `repeat(${ENDING_SCENES.length}, 1fr)`,
                  }}
                >
                  {ENDING_SCENES.map((scene, index) => (
                    <span
                      key={scene.image}
                      className={index <= endingScene ? 'active' : ''}
                    />
                  ))}
                </div>
                <button className="story-skip" onClick={closeEnding}>
                  Bỏ qua đoạn kết
                </button>
                <div className="story-copy">
                  <small>CHƯƠNG CUỐI · {endingScene + 1}/4</small>
                  <h2>{ENDING_SCENES[endingScene].title}</h2>
                  <p>{ENDING_SCENES[endingScene].text}</p>
                  {!endingStarted ? (
                    <button className="story-primary" onClick={beginEnding}>
                      <Play size={18} fill="currentColor" /> Xem đoạn kết
                    </button>
                  ) : (
                    <button className="story-primary" onClick={nextEndingScene}>
                      {endingScene === ENDING_SCENES.length - 1
                        ? 'Hoàn thành hành trình'
                        : 'Tiếp tục'}
                      <ChevronRight size={19} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {mode !== 'ready' && (
              <div className="game-hud">
                <span aria-label={`${hp} mạng`}>
                  {'♥'.repeat(Math.max(0, hp))}
                  <span style={{ opacity: 0.25 }}>
                    {'♥'.repeat(3 - Math.max(0, hp))}
                  </span>
                </span>
                <span className="hud-score">✦ {stars} / 3</span>
                {mode === 'playing' && (
                  <button
                    aria-label="Tạm dừng"
                    onClick={() => changeMode('paused')}
                  >
                    <Pause size={17} />
                  </button>
                )}
              </div>
            )}
            {(mode === 'ready' || mode === 'playing') && (
              <div className="game-utility-overlay" aria-label="Công cụ game">
                <button
                  type="button"
                  aria-label="Chọn màn chơi"
                  onClick={() => {
                    if (mode === 'playing') changeMode('paused');
                    setMapOpen(true);
                  }}
                >
                  <Map size={18} />
                </button>
                <button
                  type="button"
                  aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  aria-pressed={!muted}
                  onClick={() => {
                    mutedRef.current = !muted;
                    setMuted(!muted);
                    if (storyAudio.current) storyAudio.current.muted = !muted;
                    if (endingAudio.current) endingAudio.current.muted = !muted;
                    if (!muted) stopVoice();
                  }}
                >
                  {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>
              </div>
            )}
            {notice && mode === 'playing' && (
              <output className="pickup-notice">{notice}</output>
            )}
            {mode === 'ready' && (
              <div className="start-screen">
                <div className="start-card">
                  {cloudProgressEnabled && (
                    <button
                      className={`start-account ${progressUser ? 'signed-in' : ''}`}
                      type="button"
                      onClick={() => void handleGoogleAccount()}
                    >
                      {progressUser?.photoURL ? (
                        <Image
                          unoptimized
                          src={progressUser.photoURL}
                          alt=""
                          width={28}
                          height={28}
                        />
                      ) : (
                        <LogIn size={17} />
                      )}
                      <span>
                        {progressUser
                          ? `${progressUser.displayName ?? progressUser.email} · ${
                              cloudStatus === 'syncing'
                                ? 'Đang lưu…'
                                : cloudStatus === 'error'
                                  ? 'Chưa đồng bộ'
                                  : 'Đã lưu'
                            }`
                          : 'Đăng nhập Google để lưu tiến độ'}
                      </span>
                    </button>
                  )}
                  <span className="game-kicker">CHỌN NGƯỜI BẠN ĐỒNG HÀNH</span>
                  <h2>
                    ALPHABET <em>ADVENTURE</em>
                  </h2>
                  <div className="character-picker" aria-label="Chọn nhân vật">
                    {CHARACTERS.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        aria-pressed={hero === character.id}
                        className={`character-${character.id} ${hero === character.id ? 'selected' : ''}`}
                        onClick={() => {
                          setHero(character.id);
                          game.current.hero = character.id;
                        }}
                      >
                        {hero === character.id && (
                          <span className="selected-mark" aria-hidden="true">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        {hero === character.id ? (
                          <CharacterChoicePortrait
                            character={character.id}
                            label={character.name}
                          />
                        ) : (
                          <Image
                            unoptimized
                            src={character.image}
                            alt={character.name}
                            width={58}
                            height={58}
                          />
                        )}
                        <b>{character.name}</b>
                        <small>Hệ {character.element}</small>
                      </button>
                    ))}
                  </div>
                  <div className="start-level-info">
                    <div className="level-pill">
                      {letter} is for {word[0]}
                    </div>
                    <p>
                      {world.name} · Độ khó {1 + Math.floor(level / 5)}/6
                    </p>
                  </div>
                  <button
                    className="primary-button"
                    onClick={start}
                    disabled={!loaded}
                  >
                    <Play size={20} fill="currentColor" />
                    {assetError
                      ? 'Không tải được hình nhân vật'
                      : !loaded
                        ? 'Đang tải nhân vật…'
                        : 'Bắt đầu phiêu lưu'}
                  </button>
                  {assetError ? (
                    <button
                      className="text-button"
                      onClick={() => window.location.reload()}
                    >
                      Tải lại game
                    </button>
                  ) : (
                    <small>
                      Từ vựng: {VOCABULARY[level].map((n) => n[0]).join(' · ')}
                    </small>
                  )}
                </div>
              </div>
            )}
            {mode === 'paused' && (
              <div className="state-screen">
                <span className="game-kicker">NGHỈ MỘT CHÚT NÀO</span>
                <h2>
                  {CHARACTERS.find((character) => character.id === hero)?.name}{' '}
                  chờ bạn!
                </h2>
                <Image
                  unoptimized
                  className="state-character"
                  src={
                    CHARACTERS.find((character) => character.id === hero)
                      ?.image ?? '/mon-sprite.png'
                  }
                  alt={
                    CHARACTERS.find((character) => character.id === hero)
                      ?.name ?? 'Mon'
                  }
                  width={100}
                  height={100}
                />
                <button className="primary-button" onClick={start}>
                  <Play size={18} />
                  Chơi tiếp
                </button>
                <button className="text-button" onClick={replay}>
                  <RotateCcw size={16} />
                  Chơi lại màn này
                </button>
                <button
                  className="text-button"
                  onClick={() => setMapOpen(true)}
                >
                  <Map size={16} />
                  Chọn chữ khác
                </button>
              </div>
            )}
            {mode === 'quiz' && (
              <div className="state-screen quiz-screen">
                <span className="game-kicker">
                  TRÙM {letter} · CÂU {quizRound + 1}/6
                </span>
                <span className="quiz-letter">
                  {letter}
                  {letter.toLowerCase()}
                </span>
                <h2 className="quiz-object">
                  <Image
                    unoptimized
                    src={nounArtPath(
                      VOCABULARY[level][
                        quizRound >= 3 ? quizRound - 3 : quizRound
                      ][0],
                    )}
                    alt=""
                    width={64}
                    height={64}
                  />
                </h2>
                <p>
                  {quizRound >= 3
                    ? `Hãy gõ tên tiếng Anh của “${VOCABULARY[level][quizRound - 3][1]}”.`
                    : `Từ nào có nghĩa là “${VOCABULARY[level][quizRound][1]}”?`}
                </p>
                <button
                  className="listen-button"
                  onClick={() =>
                    say(
                      VOCABULARY[level][
                        quizRound >= 3 ? quizRound - 3 : quizRound
                      ][0],
                    )
                  }
                >
                  <Volume2 size={18} />
                  Nghe gợi ý
                </button>
                {quizRound >= 3 ? (
                  <form className="quiz-typing" onSubmit={submitTypedAnswer}>
                    <label htmlFor="quiz-word">Gõ từ tiếng Anh</label>
                    <input
                      id="quiz-word"
                      value={quizInput}
                      onChange={(event) => setQuizInput(event.target.value)}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      enterKeyHint={quizRound < 5 ? 'next' : 'done'}
                      placeholder={`${letter.toLowerCase()}...`}
                      aria-describedby="quiz-feedback"
                    />
                    <button type="submit" disabled={!quizInput.trim()}>
                      Kiểm tra <Check size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="quiz-choices">
                    {[0, 1, 2]
                      .map((i) => (i + level + quizRound + 1) % 3)
                      .map((n) => (
                        <button key={n} onClick={() => answer(n)}>
                          <span>{String.fromCharCode(65 + n)}</span>
                          {VOCABULARY[level][n][0]}
                          <ChevronRight size={18} />
                        </button>
                      ))}
                  </div>
                )}
                <output id="quiz-feedback" className="quiz-hint">
                  {quizHint ||
                    (quizRound >= 3
                      ? 'Gõ đúng từng chữ rồi nhấn Kiểm tra nhé.'
                      : 'Chọn một đáp án bên trên nhé.')}
                </output>
              </div>
            )}
            {mode === 'won' && (
              <div className="state-screen won-screen">
                <span className="game-kicker">
                  {completed.length === 26
                    ? 'BẠN ĐÃ CHINH PHỤC A–Z!'
                    : 'THÊM MỘT NGƯỜI BẠN MỚI'}
                </span>
                <div className="victory-stars">
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ opacity: i < stars ? 1 : 0.2 }}>
                      ★
                    </span>
                  ))}
                </div>
                <h2>Giỏi lắm, bạn ơi!</h2>
                <div className="learned-word">
                  <span>
                    <Image
                      unoptimized
                      src={nounArtPath(word[0])}
                      alt=""
                      width={42}
                      height={42}
                    />
                  </span>
                  <b>
                    {letter} is for {word[0]}
                  </b>
                  <p>
                    {word[0]} · {word[1]}
                  </p>
                  <button
                    className="listen-button"
                    onClick={() => say(`${letter} is for ${word[0]}`)}
                  >
                    <Volume2 size={18} />
                    Nghe lại
                  </button>
                </div>
                <div className="win-words">
                  {VOCABULARY[level].map((n) => (
                    <button
                      type="button"
                      key={n[0]}
                      onClick={() => say(n[0])}
                      onContextMenu={(event) => event.preventDefault()}
                    >
                      <Image
                        unoptimized
                        src={nounArtPath(n[0])}
                        alt=""
                        width={24}
                        height={24}
                      />{' '}
                      {n[0]} <Volume2 size={12} />
                    </button>
                  ))}
                </div>
                <p>
                  <Check size={16} />
                  Đã học chữ {letter} · {score} điểm
                </p>
                <button
                  className="primary-button"
                  onClick={() => chooseLevel((level + 1) % 26)}
                >
                  {level === 25
                    ? 'Chơi lại từ chữ A'
                    : `Khám phá chữ ${String.fromCharCode(66 + level)}`}
                  <ArrowRight size={19} />
                </button>
                <button className="text-button" onClick={replay}>
                  <RotateCcw size={16} />
                  Chơi lại, nhặt đủ sao
                </button>
                {completed.length === 26 && (
                  <button className="text-button" onClick={replayEnding}>
                    <Play size={16} />
                    Xem lại câu chuyện kết thúc
                  </button>
                )}
              </div>
            )}
            {mode === 'lost' && (
              <div className="state-screen">
                <span className="game-kicker">MÌNH THỬ LẠI NHÉ</span>
                <h2>Suýt được rồi!</h2>
                <Image
                  unoptimized
                  className="state-character"
                  src={
                    CHARACTERS.find((character) => character.id === hero)
                      ?.image ?? '/mon-sprite.png'
                  }
                  alt={`${CHARACTERS.find((character) => character.id === hero)?.name ?? 'Mon'} cổ vũ bạn`}
                  width={100}
                  height={100}
                />
                <p>Canh lúc nhảy để vượt qua chướng ngại vật.</p>
                <button className="primary-button" onClick={replay}>
                  <RotateCcw size={18} />
                  Thử lại
                </button>
                <button
                  className="text-button"
                  onClick={() => setMapOpen(true)}
                >
                  Chọn màn khác
                </button>
              </div>
            )}
            {mode === 'playing' && (
              <>
                <div
                  className="game-vocab-overlay"
                  aria-label="Từ vựng của màn"
                >
                  {VOCABULARY[level].map((n) => (
                    <button
                      type="button"
                      key={n[0]}
                      onClick={() => say(n[0])}
                      onContextMenu={(event) => event.preventDefault()}
                    >
                      <Image
                        unoptimized
                        src={nounArtPath(n[0])}
                        alt=""
                        width={20}
                        height={20}
                      />
                      {n[0]}
                      <Volume2 size={10} />
                    </button>
                  ))}
                </div>
                <div className="game-controls-overlay">
                  <div className="move-buttons">
                    <button aria-label="Sang trái" {...touch('left')}>
                      <ArrowLeft />
                    </button>
                    <button aria-label="Sang phải" {...touch('right')}>
                      <ArrowRight />
                    </button>
                  </div>
                  <button
                    className={`earth-button element-${hero} ${earthReady ? 'ready' : ''}`}
                    aria-label={
                      earthReady
                        ? `${skillInfo.action} hệ ${heroInfo.element}`
                        : `Thu thập chữ hoa và chữ thường để mở hệ ${heroInfo.element}`
                    }
                    disabled={!earthReady}
                    {...touch('earth')}
                  >
                    <Image
                      unoptimized
                      src={skillInfo.image}
                      alt=""
                      width={25}
                      height={25}
                    />
                    {skillInfo.label}
                  </button>
                  <button
                    className="jump-button"
                    aria-label="Nhảy"
                    {...touch('jump')}
                  >
                    <ArrowUp /> NHẢY
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="keyboard-note">
            ← → di chuyển <span>·</span> Space nhảy <span>·</span> F dùng kỹ
            năng <span>·</span> Esc tạm dừng
          </div>
        </section>
        <aside className="lesson">
          <div className="eyebrow">HÔM NAY MÌNH HỌC</div>
          <div className="letter-card">
            <span>
              {letter}
              {letter.toLowerCase()}
            </span>
            <button
              aria-label={`Nghe chữ ${letter}`}
              onClick={() => say(`${letter}. ${letter} is for ${word[0]}`)}
            >
              <Volume2 size={20} />
            </button>
            <b>
              {letter} is for {word[0]}
            </b>
            <p>
              {word[0]} · {word[1]}
            </p>
          </div>
          <div className="mission">
            <span className="mission-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <b>
                {level === 0
                  ? 'Vượt 28 bậc đường mây'
                  : 'Qua bậc đá, khám phá Việt Nam'}
              </b>
              <p>
                Nhặt chữ hoa, chữ thường
                <br />
                và 3 từ vựng mới. Ăn món Việt để hồi 1 tim.{' '}
                {level === 0 &&
                  '10 enemy trên đường mây dài gấp đôi. Rơi là thua!'}
              </p>
            </div>
          </div>
          <div className="mission">
            <span className="mission-icon">
              <Flag size={20} />
            </span>
            <div>
              <b>Gặp trùm chữ {letter}</b>
              <p>
                Hạ hết enemy, nhảy lên trùm {3 + Math.floor(level / 10)} lần,
                <br />
                chọn đúng từ để qua màn!
              </p>
            </div>
          </div>
          <div className="vocabulary-list">
            <div className="eyebrow">ENEMY MÀN {letter}</div>
            {VOCABULARY[level].map((n) => (
              <button
                key={n[0]}
                onClick={() => say(n[0])}
                className={learned.includes(n[0]) ? 'word-seen' : ''}
              >
                <span>
                  <Image
                    unoptimized
                    src={nounArtPath(n[0])}
                    alt=""
                    width={30}
                    height={30}
                  />
                </span>
                <div>
                  <b>{n[0]}</b>
                  <small>{n[1]}</small>
                </div>
                <Volume2 size={15} />
              </button>
            ))}
          </div>
          <p className="voice-label">{voiceName}</p>
          <div className="tip">
            <span>MON MÁCH NHỎ</span>
            <p>
              Học một chút, chơi một chút.
              <br />
              Bạn làm được mà!
            </p>
          </div>
        </aside>
      </div>
      <footer>
        ĐƯỢC TẠO CHO NHỮNG NHÀ THÁM HIỂM NHÍ <span>✦</span> CHƠI & HỌC MỖI NGÀY
      </footer>
      {mapOpen && (
        <div
          className="map-screen-backdrop"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setMapOpen(false);
          }}
        >
          <dialog
            open
            className="map-dialog"
            aria-modal="true"
            aria-labelledby="map-title"
            aria-describedby="map-description"
          >
            <button
              type="button"
              className="map-close"
              aria-label="Đóng bảng chọn màn"
              onClick={() => setMapOpen(false)}
            >
              <X size={22} />
            </button>
            <h2 id="map-title" className="map-title">
              Chọn chuyến phiêu lưu
            </h2>
            <p id="map-description" className="map-description">
              {completed.length}/26 chữ đã học. Chọn bất kỳ chữ nào để khám phá!
            </p>
            {alphabet}
            <p className="map-legend">
              <span className="world-dot" /> Chữ có chấm xanh: đã hoàn thành
            </p>
          </dialog>
        </div>
      )}
    </main>
  );
}
