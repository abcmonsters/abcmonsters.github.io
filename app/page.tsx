'use client';
import MonPortrait from './mon-portrait';
import Link from 'next/link';
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  createGame,
  updateGame,
  drawGame,
  WORDS,
  WORLDS,
  WIDTH,
  HEIGHT,
  type Mode,
} from './game-engine';

export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null),
    game = useRef(createGame()),
    input = useRef({ left: false, right: false, jump: false }),
    mutedRef = useRef(false),
    audio = useRef<AudioContext | null>(null);
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
    [loaded, setLoaded] = useState(false),
    [assetError, setAssetError] = useState(false),
    [score, setScore] = useState(0),
    [learned, setLearned] = useState<string[]>([]);
  const voiceName = voiceLabel(level);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const letter = String.fromCharCode(65 + level),
    word = WORDS[level],
    world = WORLDS[level];
  const say = useCallback((phrase: string) => {
    if (!mutedRef.current) speakVoice(phrase);
  }, []);
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
    input.current = { left: false, right: false, jump: false };
  }, []);
  const chooseLevel = useCallback((n: number) => {
    game.current = createGame(n);
    setLevel(n);
    setMode('ready');
    setHp(3);
    setStars(0);
    setScore(0);
    setLearned([]);
    setNotice('');
    setQuizHint('');
    setQuizRound(0);
    setMapOpen(false);
    input.current = { left: false, right: false, jump: false };
    stopVoice();
  }, []);
  useEffect(() => () => stopVoice(), []);
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
    sprite.onload = () => setLoaded(true);
    sprite.onerror = () => setAssetError(true);
    sprite.src = '/mon-sprite.png';
    let frame = 0,
      last = 0;
    const tick = (now: number) => {
      const g = game.current;
      if (g.mode === 'playing') {
        updateGame(g, last ? (now - last) / 1000 : 1 / 60, input.current);
        input.current.jump = false;
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
                  ? `${l.toLowerCase()} — Chữ thường`
                  : `${w[2]} ${w[0]} · ${w[1]}`,
            );
            say(phrase);
            tone(680);
          } else if (e.type === 'encounter' || (e.type === 'stomp' && e.noun)) {
            if (e.noun) {
              flash(`${e.noun[2]} ${e.noun[0]} · ${e.noun[1]}`);
              say(e.noun[0]);
            }
            if (e.type === 'stomp') tone(560);
          } else if (e.type === 'jump') tone(310);
          else if (e.type === 'hurt') tone(140);
          else if (e.type === 'stomp') tone(440);
          else if (e.type === 'quiz')
            say(
              `${String.fromCharCode(65 + g.level)} is for ${WORDS[g.level][0]}`,
            );
        }
        setHp(g.hp);
        setStars(g.stars);
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
        ].includes(k)
      ) {
        e.preventDefault();
        if (game.current.mode !== 'playing') return;
        if (k === 'ArrowLeft' || k === 'KeyA') input.current.left = true;
        if (k === 'ArrowRight' || k === 'KeyD') input.current.right = true;
        if ((k === 'Space' || k === 'ArrowUp' || k === 'KeyW') && !e.repeat)
          input.current.jump = true;
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
      input.current = { left: false, right: false, jump: false };
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
    changeMode('playing');
    setQuizHint('');
    say(`${letter}. ${letter} is for ${word[0]}`);
    tone(520);
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  }
  function replay() {
    game.current = createGame(level);
    setStars(0);
    setHp(3);
    setScore(0);
    setLearned([]);
    setQuizRound(0);
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
    const next = [...new Set([...completed, level])];
    setCompleted(next);
    try {
      localStorage.setItem('mon-alphabet-progress', JSON.stringify(next));
    } catch {}
    changeMode('won');
    say(`${letter} is for ${word[0]}`);
    tone(880);
  }
  const touch = (key: 'left' | 'right' | 'jump') => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      if (game.current.mode === 'playing') input.current[key] = true;
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (key !== 'jump') input.current[key] = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    onPointerCancel: () => {
      input.current[key] = false;
    },
    onLostPointerCapture: () => {
      if (key !== 'jump') input.current[key] = false;
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
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Mon Alphabet Adventure">
          mon<span>✦</span>
          <small>ALPHABET ADVENTURE</small>
        </Link>
        <span className="header-note">Một cuộc phiêu lưu. 26 chữ cái.</span>
        <div className="header-actions">
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
          <div className="game-frame">
            <canvas
              ref={canvas}
              width={WIDTH}
              height={HEIGHT}
              aria-label={`Màn ${letter}. Dùng phím trái phải di chuyển, Space để nhảy.`}
            />
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
            {notice && mode === 'playing' && (
              <output className="pickup-notice">{notice}</output>
            )}
            {mode === 'ready' && (
              <div className="start-screen">
                <span className="game-kicker">CÙNG MON KHÁM PHÁ</span>
                <h2>
                  ALPHABET
                  <br />
                  <em>ADVENTURE</em>
                </h2>
                <div className="mon-intro">
                  <span className="floating-letter letter-left">{letter}</span>
                  <MonPortrait label="Mon vàng một mắt, chớp mắt và thở nhẹ" />
                  <span className="floating-letter letter-right">
                    {letter.toLowerCase()}
                  </span>
                </div>
                <div className="level-pill">
                  {word[2]} {letter} is for {word[0]}
                </div>
                <p>
                  {world.name} · Độ khó {1 + Math.floor(level / 5)}/6
                </p>
                <button
                  className="primary-button"
                  onClick={start}
                  disabled={!loaded}
                >
                  <Play size={20} fill="currentColor" />
                  {assetError
                    ? 'Không tải được Mon'
                    : !loaded
                      ? 'Đang tải Mon…'
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
                    {VOCABULARY[level].map((n) => n[0]).join(' · ')}
                  </small>
                )}
              </div>
            )}
            {mode === 'paused' && (
              <div className="state-screen">
                <span className="game-kicker">NGHỈ MỘT CHÚT NÀO</span>
                <h2>Mon chờ bạn!</h2>
                <MonPortrait className="state-mon" label="Mon" />
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
                  TRÙM {letter} · CÂU {quizRound + 1}/3
                </span>
                <span className="quiz-letter">
                  {letter}
                  {letter.toLowerCase()}
                </span>
                <h2 className="quiz-object">
                  {VOCABULARY[level][quizRound][2]}
                </h2>
                <p>Từ nào có nghĩa là “{VOCABULARY[level][quizRound][1]}”?</p>
                <button
                  className="listen-button"
                  onClick={() => say(VOCABULARY[level][quizRound][0])}
                >
                  <Volume2 size={18} />
                  Nghe gợi ý
                </button>
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
                <output className="quiz-hint">
                  {quizHint || 'Chọn một đáp án bên trên nhé.'}
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
                  <span>{word[2]}</span>
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
                    <button key={n[0]} onClick={() => say(n[0])}>
                      {n[2]} {n[0]} <Volume2 size={12} />
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
              </div>
            )}
            {mode === 'lost' && (
              <div className="state-screen">
                <span className="game-kicker">MÌNH THỬ LẠI NHÉ</span>
                <h2>Suýt được rồi!</h2>
                <MonPortrait className="state-mon" label="Mon cổ vũ bạn" />
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
          </div>
          <div className="controls">
            <div>
              <button aria-label="Sang trái" {...touch('left')}>
                <ArrowLeft />
              </button>
              <button aria-label="Sang phải" {...touch('right')}>
                <ArrowRight />
              </button>
            </div>
            <span>{score} ĐIỂM</span>
            <button
              className="jump-button"
              aria-label="Nhảy"
              {...touch('jump')}
            >
              <ArrowUp /> NHẢY
            </button>
          </div>
          <div className="mobile-wordbook">
            {VOCABULARY[level].map((n) => (
              <button key={n[0]} onClick={() => say(n[0])}>
                {n[2]} {n[0]} <Volume2 size={12} />
              </button>
            ))}
          </div>
          <div className="keyboard-note">
            ← → di chuyển <span>·</span> Space nhảy <span>·</span> Esc tạm dừng
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
              <b>Nhặt 3 ngôi sao</b>
              <p>
                Chữ hoa, chữ thường
                <br />
                và 3 từ vựng mới.
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
                Nhảy lên trùm {3 + Math.floor(level / 10)} lần,
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
                <span>{n[2]}</span>
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
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="map-dialog">
          <DialogTitle className="map-title">Chọn chuyến phiêu lưu</DialogTitle>
          <DialogDescription className="map-description">
            {completed.length}/26 chữ đã học. Chọn bất kỳ chữ nào để khám phá!
          </DialogDescription>
          {alphabet}
          <p className="map-legend">
            <span className="world-dot" /> Chữ có chấm xanh: đã hoàn thành
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
