import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 750;

const innerPages = [
  'pages/part-1.png',
  'pages/text-1.png',
  'pages/part-2.png',
  'pages/text-2.png',
  'pages/part-3.png',
  'pages/text-3.png',
] as const;

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

const Grain = () => (
  <svg
    viewBox="0 0 1080 1350"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.055,
      mixBlendMode: 'soft-light',
    }}
  >
    <filter id="grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.78"
        numOctaves="3"
        seed="7"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const GoldTrace = ({progress}: {progress: number}) => {
  const dashOffset = 1180 * (1 - progress);

  return (
    <svg
      viewBox="0 0 1080 1350"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    >
      <path
        d="M-40 1080 C170 1005 140 825 335 786 C465 760 470 650 580 610 C700 565 716 442 880 390 C960 364 1012 294 1124 238"
        fill="none"
        stroke="rgba(202, 145, 76, 0.35)"
        strokeWidth="2"
        strokeDasharray="1180"
        strokeDashoffset={dashOffset}
      />
      <path
        d="M730 493 L792 493 L832 451 L936 451 L969 418 L1080 418"
        fill="none"
        stroke="rgba(222, 167, 96, 0.24)"
        strokeWidth="1.5"
        strokeDasharray="480"
        strokeDashoffset={480 * (1 - progress)}
      />
      {[792, 936, 969].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={[493, 451, 418][index]}
          r="4"
          fill="rgba(226, 171, 99, 0.32)"
          opacity={progress}
        />
      ))}
    </svg>
  );
};

const PageLeaf = ({src, index, frame}: {src: string; index: number; frame: number}) => {
  const stageStart = 72 + index * 24;
  const isLast = index === innerPages.length - 1;
  const turn = isLast
    ? 0
    : interpolate(frame, [stageStart + 16, stageStart + 24], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      });
  const hasArrived = interpolate(frame, [stageStart - 5, stageStart + 2], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const completedLeafOpacity = isLast
    ? 1
    : interpolate(frame, [218, 232], [1, 0], {
        ...clamp,
        easing: Easing.inOut(Easing.quad),
      });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: innerPages.length - index,
        transformOrigin: '0% 50%',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${-164 * turn}deg) translateZ(${index * 0.7}px)`,
        opacity: hasArrived * completedLeafOpacity,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backfaceVisibility: 'hidden',
          boxShadow: 'inset 15px 0 25px rgba(18, 24, 45, 0.07)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          background:
            'linear-gradient(90deg, #e8e4da 0%, #f8f6f0 7%, #fffefa 100%)',
          boxShadow: 'inset -14px 0 24px rgba(20, 27, 48, 0.08)',
        }}
      />
    </div>
  );
};

const Book = ({frame, open}: {frame: number; open: number}) => {
  const float = Math.sin((frame / 30) * Math.PI * 0.72) * 8;
  const groupScale = 0.94 - open * 0.21;
  const translateX = open * 174;
  const rotateY = -14 + open * 10;
  const rotateX = 5 - open * 2;
  const rotateZ = -2.7 + open * 1.8;
  const coverRotation = -164 * open;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        perspective: 2200,
        transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${float}px), 0) scale(${groupScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '8px -13px -14px 7px',
          background: 'linear-gradient(90deg, #d9d4c8, #fffefa 50%, #d8d2c5)',
          borderRadius: '2px 8px 8px 2px',
          transform: 'translateZ(-18px)',
          boxShadow:
            '0 42px 70px rgba(0, 0, 0, 0.42), 0 12px 22px rgba(0, 0, 0, 0.34)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: -14,
          top: 10,
          width: 18,
          height: PAGE_HEIGHT - 9,
          transform: 'rotateY(78deg) translateZ(-6px)',
          transformOrigin: 'left center',
          background:
            'repeating-linear-gradient(180deg, #f5f1e8 0 2px, #d8d2c7 2px 3px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: 'translateZ(8px)',
          background: '#fffefa',
        }}
      >
        {[...innerPages].reverse().map((src, reverseIndex) => {
          const index = innerPages.length - 1 - reverseIndex;
          return <PageLeaf key={src} src={src} index={index} frame={frame} />;
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          transformOrigin: '0% 50%',
          transformStyle: 'preserve-3d',
          transform: `translateZ(22px) rotateY(${coverRotation}deg)`,
        }}
      >
        <Img
          src={staticFile('pages/cover.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backfaceVisibility: 'hidden',
            borderRadius: '3px 7px 7px 3px',
            boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            borderRadius: '7px 3px 3px 7px',
            background: '#171b34',
          }}
        >
          <Img
            src={staticFile('pages/cover-art.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38}}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(8, 11, 26, .15), rgba(8, 11, 26, .72))',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: -7,
          top: 4,
          bottom: 2,
          width: 11,
          background: 'linear-gradient(90deg, #090d1d, #2a2f4d 58%, #10152a)',
          transform: `translateZ(25px) rotateY(${coverRotation}deg)`,
          transformOrigin: 'right center',
          opacity: 1 - open * 0.28,
        }}
      />
    </div>
  );
};

export const BookFilm = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = interpolate(frame, [0, 1.15 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const opening = interpolate(frame, [45, 72], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const closing = interpolate(frame, [224, 256], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const open = opening * (1 - closing);
  const traceProgress = interpolate(frame, [8, 80], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const vignette = interpolate(frame, [224, 268], [0, 0.16], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0d1d', overflow: 'hidden'}}>
      <Img
        src={staticFile('pages/cover-art.png')}
        style={{
          position: 'absolute',
          inset: -90,
          width: 1260,
          height: 1530,
          objectFit: 'cover',
          opacity: 0.16,
          filter: 'blur(32px) saturate(.72)',
          transform: `scale(${1.07 + frame / 2700}) translateY(${frame / -16}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 66% 43%, rgba(87, 96, 139, .24), transparent 34%), linear-gradient(150deg, rgba(8, 10, 25, .22), rgba(6, 8, 20, .88))',
        }}
      />
      <GoldTrace progress={traceProgress} />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 116,
          width: 620 + open * 200,
          height: 84,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.55)',
          filter: 'blur(30px)',
          transform: `translateX(calc(-50% + ${open * 48}px)) scaleX(${0.8 + open * 0.36})`,
          opacity: 0.72 * entrance,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 92}px) scale(${0.9 + entrance * 0.1})`,
        }}
      >
        <Book frame={frame} open={open} />
      </div>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: `inset 0 0 190px rgba(0, 0, 0, ${0.48 + vignette})`,
        }}
      />
    </AbsoluteFill>
  );
};
