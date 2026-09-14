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
  loadCloudHero,
  loadCloudProgress,
  loadCloudRatings,
  normalizeProgress,
  normalizeRatings,
  normalizeHero,
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
import { VOCABULARY, type Noun } from './lesson-data';
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
  Lock,
  BookOpen,
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
    [combo, setCombo] = useState(0),
    [damageTaken, setDamageTaken] = useState(0),
    [starGoalsOpen, setStarGoalsOpen] = useState(false),
    [resultStars, setResultStars] = useState(0),
    [resultNewBest, setResultNewBest] = useState(false),
    [resultCollectedAll, setResultCollectedAll] = useState(false),
    [resultPerfectHealth, setResultPerfectHealth] = useState(false),
    [muted, setMuted] = useState(false),
    [completed, setCompleted] = useState<number[]>([]),
    [ratings, setRatings] = useState<Record<string, number>>({}),
    [mapOpen, setMapOpen] = useState(false),
    [wordbookOpen, setWordbookOpen] = useState(false),
    [wordbookLevel, setWordbookLevel] = useState(0),
    [notice, setNotice] = useState(''),
    [wordRewardQueue, setWordRewardQueue] = useState<Noun[]>([]),
    [quizHint, setQuizHint] = useState(''),
    [quizResult, setQuizResult] = useState<'idle' | 'correct' | 'wrong'>(
      'idle',
    ),
    [quizRound, setQuizRound] = useState(0),
    [quizInput, setQuizInput] = useState(''),
    [loaded, setLoaded] = useState(false),
    [assetError, setAssetError] = useState(false),
    [score, setScore] = useState(0),
    [learned, setLearned] = useState<string[]>([]),
    [earthReady, setEarthReady] = useState(false),
    [hero, setHero] = useState<CharacterId>('mon'),
    [storyOpen, setStoryOpen] = useState(true),
    [storyReady, setStoryReady] = useState(false),
    [storyStarted, setStoryStarted] = useState(false),
    [storyScene, setStoryScene] = useState(0),
    [endingOpen, setEndingOpen] = useState(false),
    [endingStarted, setEndingStarted] = useState(false),
    [endingScene, setEndingScene] = useState(0),
    [progressUser, setProgressUser] = useState<ProgressUser | null>(null),
    [guestMode, setGuestMode] = useState(false),
    [onboardingStep, setOnboardingStep] = useState<'character' | 'account'>(
      'account',
    ),
    [cloudStatus, setCloudStatus] = useState<
      'idle' | 'syncing' | 'saved' | 'error'
    >('idle'),
    [cloudReady, setCloudReady] = useState(false);
  const completedRef = useRef<number[]>([]);
  const ratingsRef = useRef<Record<string, number>>({});
  const wordReward = wordRewardQueue[0] ?? null;
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
  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (storyAudio.current) storyAudio.current.muted = next;
    if (endingAudio.current) endingAudio.current.muted = next;
    if (next) stopVoice();
    try {
      localStorage.setItem('mon-alphabet-muted', String(next));
    } catch {}
  }, []);
  const haptic = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
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
    try {
      localStorage.setItem('mon-alphabet-story-seen', 'true');
    } catch {}
  }, []);
  const replayStory = useCallback(() => {
    storyAudio.current?.pause();
    storySceneRef.current = 0;
    setStoryScene(0);
    setStoryStarted(false);
    setStoryOpen(true);
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
  const showWordReward = useCallback((noun: Noun) => {
    setWordRewardQueue((queue) =>
      queue.some((queued) => queued[0] === noun[0]) ? queue : [...queue, noun],
    );
  }, []);
  const closeWordReward = useCallback(() => {
    setWordRewardQueue((queue) => queue.slice(1));
  }, []);
  useEffect(() => {
    if (!wordReward) return;
    const timer = setTimeout(closeWordReward, 3600);
    return () => clearTimeout(timer);
  }, [closeWordReward, wordReward]);
  const changeMode = useCallback((m: Mode) => {
    game.current.mode = m;
    if (m !== 'playing') {
      stopVoice();
      setWordRewardQueue([]);
    }
    setMode(m);
    input.current = { left: false, right: false, jump: false, earth: false };
  }, []);
  const prepareLevel = useCallback((n: number) => {
    const safeLevel = Math.max(0, Math.min(25, n));
    game.current = createGame(safeLevel, game.current.hero);
    setLevel(safeLevel);
    setMode('ready');
    setHp(3);
    setStars(0);
    setCombo(0);
    setDamageTaken(0);
    setStarGoalsOpen(false);
    setResultStars(0);
    setResultNewBest(false);
    setResultCollectedAll(false);
    setResultPerfectHealth(false);
    setScore(0);
    setLearned([]);
    setEarthReady(false);
    setNotice('');
    setQuizHint('');
    setQuizResult('idle');
    setQuizRound(0);
    setQuizInput('');
    setMapOpen(false);
    input.current = { left: false, right: false, jump: false, earth: false };
    stopVoice();
  }, []);
  const resumeLatestLevel = useCallback(
    (progress: number[]) => prepareLevel(Math.min(progress.length, 25)),
    [prepareLevel],
  );
  const chooseLevel = useCallback(
    (n: number) => {
      const nextRequired = completedRef.current.length;
      if (!completedRef.current.includes(n) && n !== nextRequired) return;
      game.current.hero = hero;
      prepareLevel(n);
    },
    [hero, prepareLevel],
  );
  useEffect(() => () => stopVoice(), []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('ending') !== 'preview')
      return;
    const id = requestAnimationFrame(() => {
      setStoryOpen(false);
      setStoryReady(true);
      setEndingScene(0);
      setEndingStarted(false);
      setEndingOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);
  useEffect(() => {
    ratingsRef.current = ratings;
  }, [ratings]);
  useEffect(
    () =>
      watchProgressUser(async (user) => {
        setProgressUser(user);
        if (!user) {
          setCloudReady(false);
          setCloudStatus('idle');
          return;
        }
        setCloudReady(false);
        setGuestMode(false);
        setCloudStatus('syncing');
        try {
          const [cloud, cloudRatings, cloudHero] = await Promise.all([
              loadCloudProgress(user.uid),
              loadCloudRatings(user.uid),
              loadCloudHero(user.uid),
            ]),
            merged = normalizeProgress([...completedRef.current, ...cloud]),
            mergedRatings = { ...ratingsRef.current },
            savedHero =
              cloudHero ??
              normalizeHero(localStorage.getItem('mon-alphabet-hero'));
          for (const [ratingLevel, cloudRating] of Object.entries(cloudRatings))
            mergedRatings[ratingLevel] = Math.max(
              mergedRatings[ratingLevel] ?? 0,
              cloudRating,
            );
          completedRef.current = merged;
          ratingsRef.current = mergedRatings;
          game.current.hero = savedHero;
          setHero(savedHero);
          setCompleted(merged);
          setRatings(mergedRatings);
          if (game.current.mode === 'ready') resumeLatestLevel(merged);
          localStorage.setItem('mon-alphabet-progress', JSON.stringify(merged));
          localStorage.setItem(
            'mon-alphabet-ratings',
            JSON.stringify(mergedRatings),
          );
          localStorage.setItem('mon-alphabet-hero', savedHero);
          await saveCloudProgress(user.uid, merged, mergedRatings, savedHero);
          setCloudReady(true);
          setCloudStatus('saved');
        } catch {
          setCloudReady(true);
          setCloudStatus('error');
        }
      }),
    [resumeLatestLevel],
  );
  useEffect(() => {
    if (!progressUser || !cloudReady) return;
    const timeout = setTimeout(() => {
      if (!navigator.onLine) {
        setCloudStatus('error');
        return;
      }
      setCloudStatus('syncing');
      void saveCloudProgress(progressUser.uid, completed, ratings, hero)
        .then(() => setCloudStatus('saved'))
        .catch(() => setCloudStatus('error'));
    }, 350);
    return () => clearTimeout(timeout);
  }, [cloudReady, completed, hero, progressUser, ratings]);
  useEffect(() => {
    if (!progressUser || !cloudReady) return;
    const retryWhenOnline = () => {
        setCloudStatus('syncing');
        void saveCloudProgress(
          progressUser.uid,
          completedRef.current,
          ratingsRef.current,
          hero,
        )
          .then(() => setCloudStatus('saved'))
          .catch(() => setCloudStatus('error'));
      },
      markOffline = () => setCloudStatus('error');
    window.addEventListener('online', retryWhenOnline);
    window.addEventListener('offline', markOffline);
    return () => {
      window.removeEventListener('online', retryWhenOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, [cloudReady, hero, progressUser]);
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
        if (Array.isArray(saved)) {
          const savedProgress = normalizeProgress(saved);
          completedRef.current = savedProgress;
          setCompleted(savedProgress);
          if (game.current.mode === 'ready') resumeLatestLevel(savedProgress);
          if (
            savedProgress.length > 0 ||
            localStorage.getItem('mon-alphabet-story-seen') === 'true'
          )
            setStoryOpen(false);
        }
        const savedMuted =
          localStorage.getItem('mon-alphabet-muted') === 'true';
        mutedRef.current = savedMuted;
        setMuted(savedMuted);
        const savedRatings = normalizeRatings(
          JSON.parse(localStorage.getItem('mon-alphabet-ratings') || '{}'),
        );
        const savedHero = normalizeHero(
          localStorage.getItem('mon-alphabet-hero'),
        );
        game.current.hero = savedHero;
        setHero(savedHero);
        ratingsRef.current = savedRatings;
        setRatings(savedRatings);
      } catch {}
      setStoryReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [resumeLatestLevel]);
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
            haptic([18, 28, 18]);
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
              if (e.type === 'stomp') showWordReward(e.noun);
              else flash(`${e.noun[0]} · ${e.noun[1]}`);
              say(e.noun[0]);
            }
            if (e.type === 'stomp') {
              haptic(28);
              tone(560);
            }
          } else if (e.type === 'jump') {
            haptic(10);
            tone(310);
          } else if (e.type === 'earth') {
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
          } else if (e.type === 'earthHit') {
            haptic([24, 18, 32]);
            tone(120);
          } else if (e.type === 'heal') {
            haptic([14, 24, 14]);
            flash(`${e.food} · Hồi 1 tim ♥`);
            tone(880);
          } else if (e.type === 'hurt') {
            haptic(55);
            if (g.damageTaken === 1)
              flash('Mất mục tiêu “Không bị thương” · Vẫn còn thể đạt 2 sao!');
            tone(140);
          } else if (e.type === 'stomp') {
            haptic(28);
            tone(440);
          } else if (e.type === 'quiz')
            say(
              `${String.fromCharCode(65 + g.level)} is for ${WORDS[g.level][0]}`,
            );
        }
        setHp(g.hp);
        setStars(g.stars);
        setCombo(g.comboTime > 0 ? g.combo : 0);
        setDamageTaken(g.damageTaken);
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
  }, [flash, haptic, say, showWordReward, tone]);
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
    setQuizResult('idle');
    say(`${letter}. ${letter} is for ${word[0]}`);
    tone(520);
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  }
  function replay() {
    game.current = createGame(level, hero);
    setStars(0);
    setCombo(0);
    setDamageTaken(0);
    setStarGoalsOpen(false);
    setResultStars(0);
    setResultNewBest(false);
    setResultCollectedAll(false);
    setResultPerfectHealth(false);
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
      setQuizResult('wrong');
      tone(180);
      return;
    }
    if (quizRound < 2) {
      setQuizRound(quizRound + 1);
      setQuizHint('Đúng rồi! Thử từ tiếp theo nhé.');
      setQuizResult('correct');
      say(VOCABULARY[level][quizRound + 1][0]);
      tone(700);
      return;
    }
    setQuizRound(3);
    setQuizInput('');
    setQuizHint('Còn 3 câu gõ từ chính xác để hoàn thành màn!');
    setQuizResult('idle');
    say(VOCABULARY[level][0][0]);
    tone(700);
  }
  function finishQuiz() {
    const collectedAll = game.current.pickups.every((pickup) => pickup.got),
      perfectHealth = game.current.damageTaken === 0,
      next = [...new Set([...completed, level])],
      earnedStars = 1 + (collectedAll ? 1 : 0) + (perfectHealth ? 1 : 0),
      previousBest = ratings[String(level)] ?? 0,
      nextRatings = {
        ...ratings,
        [level]: Math.max(previousBest, earnedStars),
      };
    completedRef.current = next;
    ratingsRef.current = nextRatings;
    setCompleted(next);
    setRatings(nextRatings);
    setResultStars(earnedStars);
    setResultNewBest(earnedStars > previousBest);
    setResultCollectedAll(collectedAll);
    setResultPerfectHealth(perfectHealth);
    if (!guestMode)
      try {
        localStorage.setItem('mon-alphabet-progress', JSON.stringify(next));
        localStorage.setItem(
          'mon-alphabet-ratings',
          JSON.stringify(nextRatings),
        );
      } catch {}
    if (progressUser) {
      if (!navigator.onLine) {
        setCloudStatus('error');
      } else {
        setCloudStatus('syncing');
        void saveCloudProgress(progressUser.uid, next, nextRatings, hero)
          .then(() => setCloudStatus('saved'))
          .catch(() => setCloudStatus('error'));
      }
    }
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
    setGuestMode(false);
    try {
      await signInWithGoogle();
    } catch {
      setCloudStatus('error');
    }
  }
  async function syncProgressNow() {
    if (!progressUser) return;
    if (!navigator.onLine) {
      setCloudStatus('error');
      return;
    }
    setCloudStatus('syncing');
    try {
      await saveCloudProgress(
        progressUser.uid,
        completedRef.current,
        ratingsRef.current,
        hero,
      );
      setCloudStatus('saved');
    } catch {
      setCloudStatus('error');
    }
  }
  async function playAsGuest() {
    if (progressUser) await signOutProgressUser();
    completedRef.current = [];
    setCompleted([]);
    setRatings({});
    ratingsRef.current = {};
    prepareLevel(0);
    setGuestMode(true);
    setCloudStatus('idle');
  }
  function submitTypedAnswer(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const typingIndex = quizRound - 3,
      expected = VOCABULARY[level][typingIndex][0];
    if (quizInput.trim().toLocaleLowerCase('en') !== expected.toLowerCase()) {
      setQuizHint('Chưa chính xác. Kiểm tra từng chữ rồi thử lại nhé!');
      setQuizResult('wrong');
      tone(180);
      return;
    }
    if (quizRound < 5) {
      const nextRound = quizRound + 1;
      setQuizRound(nextRound);
      setQuizInput('');
      setQuizResult('correct');
      setQuizHint(
        nextRound === 5
          ? 'Đúng rồi! Còn từ cuối cùng nhé.'
          : 'Đúng rồi! Gõ chính xác thêm một từ nữa nhé.',
      );
      tone(700);
      return;
    }
    setQuizHint('Chính xác!');
    setQuizResult('correct');
    finishQuiz();
  }
  const touch = (key: 'left' | 'right' | 'jump' | 'earth') => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      if (key === 'earth') haptic(12);
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
  const totalRatingStars = completed.reduce(
    (total, completedLevel) =>
      total + Math.max(1, Math.min(3, ratings[String(completedLevel)] ?? 0)),
    0,
  );
  const alphabet = (
    <div className="alphabet">
      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l, i) => {
        const unlocked = completed.includes(i) || i === completed.length,
          isNext = completed.length < 26 && i === completed.length,
          isCompleted = completed.includes(i),
          levelRating = isCompleted
            ? Math.max(1, Math.min(3, ratings[String(i)] ?? 0))
            : 0;
        return (
          <button
            key={l}
            onClick={() => chooseLevel(i)}
            disabled={!unlocked}
            aria-label={`Màn ${l}${isCompleted ? `, đã hoàn thành, ${levelRating} trên 3 sao` : unlocked ? ', màn tiếp theo' : ', chưa mở khóa'}`}
            aria-current={i === level ? 'step' : undefined}
            className={`${i === level ? 'selected ' : ''}${isCompleted ? 'completed ' : ''}${isNext ? 'next-level ' : ''}${!unlocked ? 'locked' : ''}`}
          >
            <span className="letter-label">{l}</span>
            {!unlocked && (
              <span className="lock-badge" aria-hidden="true">
                <Lock size={11} />
              </span>
            )}
            {isCompleted && <span className="done-dot" />}
            {isCompleted && (
              <span className="level-stars" aria-hidden="true">
                {[0, 1, 2].map((star) => (
                  <i key={star} className={star < levelRating ? 'earned' : ''}>
                    ★
                  </i>
                ))}
              </span>
            )}
            {isNext && <span className="next-badge">TIẾP THEO</span>}
          </button>
        );
      })}
    </div>
  );
  const openWordbook = () => {
    if (mode === 'playing') changeMode('paused');
    setWordbookLevel(
      completed.includes(level) ? level : Math.max(0, completed.length - 1),
    );
    setMapOpen(false);
    setWordbookOpen(true);
  };
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
            aria-label="Mở sổ từ vựng"
            onClick={openWordbook}
          >
            <BookOpen size={19} />
          </button>
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
            onClick={toggleMuted}
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
            {storyReady && storyOpen && (
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
                <button
                  type="button"
                  className={`hud-score ${starGoalsOpen ? 'active' : ''}`}
                  onClick={() => setStarGoalsOpen((open) => !open)}
                  aria-expanded={starGoalsOpen}
                  aria-controls="star-goals"
                  aria-label={`${stars} trên 3 vật phẩm đã thu thập. Xem mục tiêu sao`}
                >
                  ✦ {stars} / 3
                </button>
                {combo > 1 && (
                  <output className="combo-hud" aria-label={`Combo ${combo}`}>
                    COMBO <b>×{Math.min(combo, 5)}</b>
                  </output>
                )}
                {progressUser && (
                  <button
                    type="button"
                    className={`cloud-save-state ${cloudStatus}`}
                    onClick={() => void syncProgressNow()}
                    aria-label={
                      cloudStatus === 'error'
                        ? 'Chưa đồng bộ, chạm để thử lưu lại'
                        : 'Trạng thái lưu tiến độ'
                    }
                  >
                    <Cloud size={14} />
                    {cloudStatus === 'syncing'
                      ? 'Đang lưu'
                      : cloudStatus === 'error'
                        ? 'Thử lưu lại'
                        : 'Đã lưu'}
                  </button>
                )}
                {mode === 'playing' && (
                  <button
                    aria-label="Tạm dừng"
                    onClick={() => changeMode('paused')}
                  >
                    <Pause size={17} />
                  </button>
                )}
                {starGoalsOpen && (
                  <output id="star-goals" className="star-goals">
                    <b>MỤC TIÊU 3 SAO</b>
                    <span className="done">
                      <Check size={13} /> Hoàn thành màn
                    </span>
                    <span className={stars === 3 ? 'done' : ''}>
                      {stars === 3 ? <Check size={13} /> : <i />}
                      Thu thập đủ 3 vật phẩm
                    </span>
                    <span className={damageTaken === 0 ? 'done' : 'lost'}>
                      {damageTaken === 0 ? (
                        <Check size={13} />
                      ) : (
                        <X size={13} />
                      )}
                      Không bị mất tim
                    </span>
                  </output>
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
                  onClick={toggleMuted}
                >
                  {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>
              </div>
            )}
            {notice && mode === 'playing' && (
              <output className="pickup-notice">{notice}</output>
            )}
            {wordReward && mode === 'playing' && (
              <div className="word-reward">
                <button
                  type="button"
                  className="word-reward-main"
                  onClick={() => say(wordReward[0])}
                  aria-label={`Nghe từ ${wordReward[0]}`}
                >
                  <Image
                    unoptimized
                    src={nounArtPath(wordReward[0])}
                    alt=""
                    width={42}
                    height={42}
                  />
                  <span>
                    <small>TỪ VỰNG ĐÃ GIẢI CỨU</small>
                    <b>{wordReward[0]}</b>
                    <em>{wordReward[1]}</em>
                  </span>
                  <Volume2 size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="word-reward-close"
                  onClick={closeWordReward}
                  aria-label="Đóng và xem từ tiếp theo"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {mode === 'ready' && (
              <div className="start-screen">
                <div className="start-card">
                  {onboardingStep === 'account' ? (
                    <>
                      <span className="step-number">BƯỚC 1 / 2</span>
                      <span className="game-kicker">CHỌN CÁCH ĐĂNG NHẬP</span>
                      <h2>ĐĂNG NHẬP</h2>
                      <div className="start-account-options">
                        {cloudProgressEnabled && (
                          <button
                            className={`start-account ${progressUser ? 'signed-in' : ''}`}
                            type="button"
                            onClick={() =>
                              void (progressUser
                                ? syncProgressNow()
                                : handleGoogleAccount())
                            }
                          >
                            {progressUser?.photoURL ? (
                              <Image
                                unoptimized
                                src={progressUser.photoURL}
                                alt=""
                                width={32}
                                height={32}
                              />
                            ) : (
                              <LogIn size={20} />
                            )}
                            <span>
                              <b>
                                {progressUser
                                  ? (progressUser.displayName ??
                                    progressUser.email)
                                  : 'Đăng nhập bằng tài khoản Google'}
                              </b>
                              <small>
                                {progressUser
                                  ? cloudStatus === 'syncing'
                                    ? 'Đang đồng bộ tiến độ…'
                                    : cloudStatus === 'error'
                                      ? 'Có lỗi đồng bộ · chạm để thử lại'
                                      : `Đã lưu ${completed.length}/26 màn`
                                  : 'Lưu và chơi tiếp trên thiết bị khác'}
                              </small>
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          className={`guest-button ${guestMode ? 'selected' : ''}`}
                          onClick={() => void playAsGuest()}
                        >
                          {guestMode ? <Check size={20} /> : <Play size={20} />}
                          <span>
                            <b>Đăng nhập với tư cách khách</b>
                            <small>Không lưu kết quả sau khi thoát</small>
                          </span>
                        </button>
                      </div>
                      <button
                        className="primary-button"
                        disabled={!progressUser && !guestMode}
                        onClick={() => setOnboardingStep('character')}
                      >
                        {!progressUser && !guestMode
                          ? 'Chọn cách đăng nhập'
                          : 'Tiếp tục chọn nhân vật'}
                        <ChevronRight size={20} />
                      </button>
                      <button
                        type="button"
                        className="text-button story-replay-button"
                        onClick={replayStory}
                      >
                        <BookOpen size={15} /> Xem lại câu chuyện mở đầu
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="step-number">BƯỚC 2 / 2</span>
                      <span className="game-kicker">
                        CHỌN NGƯỜI BẠN ĐỒNG HÀNH
                      </span>
                      <h2>
                        ALPHABET <em>ADVENTURE</em>
                      </h2>
                      <div
                        className="character-picker"
                        aria-label="Chọn nhân vật"
                      >
                        {CHARACTERS.map((character) => (
                          <button
                            key={character.id}
                            type="button"
                            aria-pressed={hero === character.id}
                            className={`character-${character.id} ${hero === character.id ? 'selected' : ''}`}
                            onClick={() => {
                              setHero(character.id);
                              game.current.hero = character.id;
                              if (!guestMode)
                                try {
                                  localStorage.setItem(
                                    'mon-alphabet-hero',
                                    character.id,
                                  );
                                } catch {}
                            }}
                          >
                            {hero === character.id && (
                              <span
                                className="selected-mark"
                                aria-hidden="true"
                              >
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
                        {progressUser && cloudReady && completed.length > 0 && (
                          <span className="resume-banner">
                            <Check size={13} /> Tiến độ đã tải ·{' '}
                            {completed.length < 26
                              ? `Tiếp tục từ màn ${letter}`
                              : 'Đã hoàn thành A–Z'}
                          </span>
                        )}
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
                            : completed.length === 0
                              ? 'Bắt đầu phiêu lưu'
                              : completed.length < 26
                                ? `Tiếp tục màn ${letter}`
                                : `Chơi lại màn ${letter}`}
                      </button>
                      <button
                        type="button"
                        className="text-button onboarding-back"
                        onClick={() => setOnboardingStep('account')}
                      >
                        <ArrowLeft size={15} /> Đổi cách chơi
                      </button>
                    </>
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
                  {quizRound === 3 ? (
                    <span className="quiz-audio-clue">
                      <Volume2 size={48} />
                    </span>
                  ) : quizRound === 4 ? (
                    <span className="quiz-meaning-clue">
                      {VOCABULARY[level][1][1]}
                    </span>
                  ) : (
                    <Image
                      unoptimized
                      src={nounArtPath(
                        VOCABULARY[level][
                          quizRound >= 3 ? quizRound - 3 : quizRound
                        ][0],
                      )}
                      alt={quizRound === 5 ? 'Hình gợi ý từ vựng' : ''}
                      width={64}
                      height={64}
                    />
                  )}
                </h2>
                <p>
                  {quizRound === 3
                    ? 'Nghe Wendy đọc rồi gõ chính xác từ tiếng Anh.'
                    : quizRound === 4
                      ? 'Gõ từ tiếng Anh có nghĩa như trên.'
                      : quizRound === 5
                        ? 'Nhìn hình và gõ chính xác từ tiếng Anh.'
                        : `Từ nào có nghĩa là “${VOCABULARY[level][quizRound][1]}”?`}
                </p>
                {quizRound !== 4 && quizRound !== 5 && (
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
                    {quizRound === 3 ? 'Nghe từ' : 'Nghe gợi ý'}
                  </button>
                )}
                {quizRound >= 3 ? (
                  <form className="quiz-typing" onSubmit={submitTypedAnswer}>
                    <label htmlFor="quiz-word">Gõ từ tiếng Anh</label>
                    <input
                      id="quiz-word"
                      value={quizInput}
                      onChange={(event) => {
                        setQuizInput(event.target.value);
                        setQuizResult('idle');
                      }}
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
                <output
                  id="quiz-feedback"
                  className={`quiz-hint ${quizResult}`}
                >
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
                    <span
                      key={i}
                      style={{ opacity: i < resultStars ? 1 : 0.2 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {resultNewBest && (
                  <span className="new-best-badge">✦ KỶ LỤC MỚI</span>
                )}
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
                  Đã học chữ {letter} · {score} điểm · {resultStars}/3 sao
                </p>
                <div className="rating-reasons">
                  <span className="earned">★ Hoàn thành</span>
                  <span className={resultCollectedAll ? 'earned' : ''}>
                    ★ Nhặt đủ 3 vật phẩm
                  </span>
                  <span className={resultPerfectHealth ? 'earned' : ''}>
                    ★ Không mất tim
                  </span>
                </div>
                {resultStars < 3 && (
                  <p className="star-coaching">
                    <Sparkles size={15} />
                    {!resultCollectedAll && !resultPerfectHealth
                      ? 'Chơi lại: tìm đủ 3 vật phẩm và né đòn để đạt 3 sao.'
                      : !resultCollectedAll
                        ? 'Còn thiếu vật phẩm. Hãy khám phá cả những bệ phụ nhé!'
                        : 'Bạn đã nhặt đủ. Lần tới né đòn để giành sao cuối nhé!'}
                  </p>
                )}
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
                  {resultStars < 3
                    ? 'Chơi lại để lấy đủ 3 sao'
                    : 'Chơi lại màn này'}
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
              {completed.length}/26 chữ đã học. Hoàn thành lần lượt từ A đến Z.
            </p>
            <div
              className="map-achievement"
              aria-label={`${totalRatingStars} trên 78 sao`}
            >
              <span>
                <Sparkles size={17} /> Tổng sao
              </span>
              <b>{totalRatingStars} / 78</b>
              <div aria-hidden="true">
                <i style={{ width: `${(totalRatingStars / 78) * 100}%` }} />
              </div>
            </div>
            {alphabet}
            <p className="map-legend">
              <span className="world-dot" /> Hoàn thành theo thứ tự A–Z · Chữ đã
              qua có thể chơi lại
            </p>
          </dialog>
        </div>
      )}
      {wordbookOpen && (
        <div
          className="wordbook-backdrop"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setWordbookOpen(false);
          }}
        >
          <dialog
            open
            className="wordbook-dialog"
            aria-modal="true"
            aria-labelledby="wordbook-title"
          >
            <button
              type="button"
              className="map-close"
              aria-label="Đóng sổ từ vựng"
              onClick={() => setWordbookOpen(false)}
            >
              <X size={22} />
            </button>
            <header className="wordbook-heading">
              <span>SỔ TỪ VỰNG A–Z</span>
              <h2 id="wordbook-title">Kho báu chữ cái</h2>
              <p>{completed.length}/26 trang đã mở khóa</p>
            </header>
            <div className="wordbook-alphabet" aria-label="Chọn trang chữ cái">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                .split('')
                .map((bookLetter, index) => {
                  const learnedLetter = completed.includes(index);
                  return (
                    <button
                      type="button"
                      key={bookLetter}
                      disabled={!learnedLetter}
                      aria-pressed={wordbookLevel === index}
                      aria-label={`${bookLetter}${learnedLetter ? ', đã học' : ', chưa học'}`}
                      onClick={() => setWordbookLevel(index)}
                    >
                      {bookLetter}
                      {!learnedLetter && <Lock size={10} aria-hidden="true" />}
                    </button>
                  );
                })}
            </div>
            {completed.includes(wordbookLevel) ? (
              <section className="wordbook-page">
                <div className="wordbook-letter">
                  <b>{String.fromCharCode(65 + wordbookLevel)}</b>
                  <span>{String.fromCharCode(97 + wordbookLevel)}</span>
                  <button
                    type="button"
                    onClick={() => say(String.fromCharCode(65 + wordbookLevel))}
                  >
                    <Volume2 size={17} /> Nghe chữ
                  </button>
                </div>
                <div className="wordbook-words">
                  {VOCABULARY[wordbookLevel].map((noun) => (
                    <button
                      type="button"
                      key={noun[0]}
                      onClick={() => say(noun[0])}
                    >
                      <Image
                        unoptimized
                        src={nounArtPath(noun[0])}
                        alt={noun[1]}
                        width={72}
                        height={72}
                      />
                      <span>
                        <b>{noun[0]}</b>
                        <small>{noun[1]}</small>
                      </span>
                      <Volume2 size={17} />
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <div className="wordbook-empty">
                <Lock size={30} />
                <b>Hoàn thành màn A để mở trang đầu tiên</b>
              </div>
            )}
          </dialog>
        </div>
      )}
    </main>
  );
}
