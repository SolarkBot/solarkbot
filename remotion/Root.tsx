import { Composition, Folder } from "remotion";
import { SolarkBotLaunch } from "./SolarkBotLaunch";
import { SolarkBotUpcomingFeatures } from "./SolarkBotUpcomingFeatures";

export const RemotionRoot = () => {
  return (
    <Folder name="Launch">
      <Composition
        id="SolarkBotLaunch"
        component={SolarkBotLaunch}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SolarkBotUpcomingFeatures"
        component={SolarkBotUpcomingFeatures}
        durationInFrames={420}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
