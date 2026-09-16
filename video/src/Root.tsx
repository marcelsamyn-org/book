import {Composition} from 'remotion';
import {BookFilm} from './BookFilm';

export const RemotionRoot = () => {
  return (
    <Composition
      id="SacredStruggleBook"
      component={BookFilm}
      durationInFrames={270}
      fps={30}
      width={1080}
      height={1350}
    />
  );
};
