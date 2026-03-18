import { loadFont as loadBodyFont } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadDisplayFont } from "@remotion/google-fonts/ChakraPetch";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";

const { fontFamily: displayFont } = loadDisplayFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});

const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const colors = {
  purple: "#9945FF",
  green: "#14F195",
  background: "#050816",
  backgroundAlt: "#090E20",
  panel: "rgba(10, 14, 31, 0.8)",
  panelBorder: "rgba(255, 255, 255, 0.12)",
  text: "#F7F8FF",
  muted: "rgba(232, 236, 255, 0.72)",
  soft: "rgba(232, 236, 255, 0.42)",
};

const featureTags = [
  "Wallet-native auth",
  "Agent actions",
  "x402 micropayments",
];

const productPoints = [
  {
    title: "Natural language control",
    body: "Ask for balances, swaps, domain lookups, and transfers in plain English.",
  },
  {
    title: "Built for Solana speed",
    body: "Fast flows, wallet-first sign-in, and a launch-ready interface for on-chain users.",
  },
  {
    title: "Payment-native AI",
    body: "Usage pricing and agent workflows designed for crypto-native products.",
  },
];

const launchNotes = [
  "Launch App",
  "Browse solarkbot.xyz",
  "Bring Solana actions into chat",
];

const headingGradient = "linear-gradient(120deg, #ffffff 0%, #d7d0ff 35%, #14F195 100%)";

const sharedTiming = linearTiming({ durationInFrames: 15 });
const slideTiming = springTiming({
  durationInFrames: 15,
  config: {
    damping: 200,
  },
});

export const SolarkBotLaunch = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: bodyFont,
      }}
    >
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={sharedTiming}
        />
        <TransitionSeries.Sequence durationInFrames={144}>
          <ProductScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={slideTiming}
        />
        <TransitionSeries.Sequence durationInFrames={126}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const SceneShell = ({
  children,
  align = "stretch",
}: {
  children: ReactNode;
  align?: CSSProperties["alignItems"];
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: "64px 84px",
        overflow: "hidden",
      }}
    >
      <AnimatedBackdrop />
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: align,
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const AnimatedBackdrop = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = interpolate(frame, [0, 180], [0, -140], {
    extrapolateRight: "clamp",
  });
  const pulse = 0.84 + Math.sin(frame / 18) * 0.06;

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(153,69,255,0.26), transparent 34%), radial-gradient(circle at 85% 18%, rgba(20,241,149,0.18), transparent 28%), linear-gradient(180deg, #050816 0%, #0A1022 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -220,
          opacity: 0.14,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          transform: `translate3d(${drift}px, ${drift * 0.65}px, 0)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          top: height * 0.13,
          width: 420,
          height: 420,
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(153,69,255,0.52) 0%, rgba(153,69,255,0.12) 42%, rgba(153,69,255,0) 72%)",
          filter: "blur(28px)",
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: width * 0.08,
          bottom: height * 0.08,
          width: 460,
          height: 460,
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(20,241,149,0.38) 0%, rgba(20,241,149,0.1) 40%, rgba(20,241,149,0) 72%)",
          filter: "blur(32px)",
          transform: `scale(${1.04 - (pulse - 0.84)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(255,255,255,0.04) 100%)",
        }}
      />
    </>
  );
};

const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const introSpring = spring({
    fps,
    frame,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
  });
  const badgeOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [18, 42], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <EyebrowChip label="Website launch" opacity={badgeOpacity} />
        <div
          style={{
            color: colors.soft,
            fontFamily: bodyFont,
            fontSize: 24,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: badgeOpacity,
          }}
        >
          solarkbot.xyz
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "224px 1fr",
          gap: 44,
          alignItems: "center",
          marginTop: 84,
          transform: `translateY(${interpolate(frame, [0, 36], [54, 0], {
            extrapolateRight: "clamp",
          })}px)`,
          opacity: introSpring,
        }}
      >
        <div
          style={{
            width: 224,
            height: 224,
            borderRadius: 52,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
            boxShadow:
              "0 30px 90px rgba(0,0,0,0.32), 0 0 90px rgba(153,69,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(20px)",
          }}
        >
          <Img
            src={staticFile("logo.svg")}
            style={{
              width: 174,
              height: 174,
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 34,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: colors.green,
            }}
          >
            Solana AI
          </div>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 116,
              lineHeight: 0.92,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              backgroundImage: headingGradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 48px rgba(20,241,149,0.1)",
            }}
          >
            SolarkBot is live
          </div>
          <div
            style={{
              maxWidth: 920,
              fontSize: 34,
              lineHeight: 1.35,
              color: colors.muted,
              opacity: subOpacity,
            }}
          >
            A crypto-native assistant for chat, wallet actions, and on-chain workflows.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          marginTop: 54,
        }}
      >
        {featureTags.map((tag, index) => {
          const tagSpring = spring({
            fps,
            frame: frame - 12 - index * 7,
            config: {
              damping: 14,
              stiffness: 140,
            },
          });

          return (
            <div
              key={tag}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,14,31,0.72)",
                padding: "16px 24px",
                fontSize: 24,
                color: colors.text,
                transform: `translateY(${interpolate(tagSpring, [0, 1], [24, 0])}px) scale(${interpolate(tagSpring, [0, 1], [0.95, 1])})`,
                opacity: tagSpring,
                boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: colors.soft,
            maxWidth: 780,
          }}
        >
          Launching a sharper interface for wallet-native users who want action, not dashboards.
        </div>
        <SceneCount value="01 / 03" />
      </div>
    </SceneShell>
  );
};

const ProductScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelSpring = spring({
    fps,
    frame,
    config: {
      damping: 15,
      stiffness: 110,
      mass: 0.85,
    },
  });
  const screenshotOffset = interpolate(frame, [0, 126], [0, -1340], {
    extrapolateRight: "clamp",
  });
  const sectionOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          gap: 44,
          width: "100%",
          flex: 1,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 32,
            opacity: sectionOpacity,
          }}
        >
          <EyebrowChip label="Built for launch velocity" opacity={sectionOpacity} />
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 86,
              lineHeight: 0.95,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              maxWidth: 740,
            }}
          >
            Chat. Trade. Act on-chain.
          </div>
          <div
            style={{
              fontSize: 31,
              lineHeight: 1.45,
              maxWidth: 700,
              color: colors.muted,
            }}
          >
            SolarkBot combines wallet sign-in, agent workflows, and Solana-native product motion in a single conversational surface.
          </div>

          <div style={{ display: "grid", gap: 18, marginTop: 8 }}>
            {productPoints.map((point, index) => {
              const cardSpring = spring({
                fps,
                frame: frame - 8 - index * 10,
                config: {
                  damping: 14,
                  stiffness: 130,
                },
              });

              return (
                <div
                  key={point.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "88px 1fr",
                    gap: 18,
                    alignItems: "center",
                    padding: "22px 24px",
                    borderRadius: 28,
                    background: "rgba(9, 14, 32, 0.75)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 22px 50px rgba(0,0,0,0.18)",
                    transform: `translateX(${interpolate(cardSpring, [0, 1], [36, 0])}px)`,
                    opacity: cardSpring,
                  }}
                >
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: displayFont,
                      fontSize: 30,
                      color: colors.text,
                      background:
                        index % 2 === 0
                          ? "linear-gradient(135deg, rgba(153,69,255,0.9), rgba(83,44,171,0.85))"
                          : "linear-gradient(135deg, rgba(20,241,149,0.9), rgba(18,150,100,0.85))",
                    }}
                  >
                    0{index + 1}
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div
                      style={{
                        fontSize: 27,
                        fontWeight: 600,
                        color: colors.text,
                      }}
                    >
                      {point.title}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        lineHeight: 1.5,
                        color: colors.muted,
                      }}
                    >
                      {point.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            transform: `translateY(${interpolate(panelSpring, [0, 1], [60, 0])}px) rotate(-5deg) scale(${interpolate(panelSpring, [0, 1], [0.92, 1])})`,
            opacity: panelSpring,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 40,
              borderRadius: 50,
              background:
                "linear-gradient(160deg, rgba(153,69,255,0.28), rgba(20,241,149,0.16))",
              filter: "blur(70px)",
            }}
          />
          <div
            style={{
              position: "relative",
              padding: 20,
              borderRadius: 42,
              background: "rgba(6, 10, 22, 0.88)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 36px 90px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 24,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "14px 18px",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
                  <div
                    key={color}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: colors.soft,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                https://solarkbot.xyz
              </div>
            </div>

            <div
              style={{
                position: "relative",
                height: 760,
                overflow: "hidden",
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#07101f",
              }}
            >
              <Img
                src={staticFile("video/homepage.png")}
                style={{
                  width: "100%",
                  height: "auto",
                  transform: `translateY(${screenshotOffset}px)`,
                }}
              />
            </div>
          </div>

          <FloatCard
            top={88}
            right={-28}
            title="Now live"
            detail="SolarkBot launch"
            accent="purple"
            frameOffset={18}
          />
          <FloatCard
            bottom={84}
            left={-18}
            title="AI x Solana"
            detail="Fast wallet-native UX"
            accent="green"
            frameOffset={28}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: colors.soft,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Wallet auth / Agent tools / Payment-native AI
        </div>
        <SceneCount value="02 / 03" />
      </div>
    </SceneShell>
  );
};

const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroSpring = spring({
    fps,
    frame,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });
  const lineDraw = interpolate(frame, [4, 34], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell align="center">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <EyebrowChip label="Launch now" opacity={heroSpring} />
        <SceneCount value="03 / 03" />
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          gap: 28,
          transform: `translateY(${interpolate(heroSpring, [0, 1], [40, 0])}px)`,
          opacity: heroSpring,
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 40,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 26px 74px rgba(0,0,0,0.26)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={staticFile("logo.svg")}
            style={{
              width: 118,
              height: 118,
            }}
          />
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontSize: 96,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            backgroundImage: headingGradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Your crypto-native AI assistant is live
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.45,
            color: colors.muted,
            maxWidth: 1100,
          }}
        >
          Explore the launch site, connect the app, and bring Solana actions into natural language.
        </div>

        <div
          style={{
            width: `${interpolate(lineDraw, [0, 1], [0, 920])}px`,
            height: 2,
            borderRadius: 999,
            background: "linear-gradient(90deg, rgba(153,69,255,0), #9945FF, #14F195, rgba(20,241,149,0))",
          }}
        />

        <div
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(7, 10, 22, 0.82)",
            boxShadow: "0 24px 66px rgba(0,0,0,0.26)",
            padding: "26px 44px",
            fontFamily: displayFont,
            fontSize: 58,
            letterSpacing: "-0.03em",
            color: colors.text,
          }}
        >
          solarkbot.xyz
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {launchNotes.map((note, index) => {
            const noteOpacity = interpolate(frame, [18 + index * 8, 42 + index * 8], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={note}
                style={{
                  borderRadius: 999,
                  padding: "14px 22px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 23,
                  color: colors.text,
                  opacity: noteOpacity,
                  transform: `translateY(${interpolate(noteOpacity, [0, 1], [18, 0])}px)`,
                }}
              >
                {note}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: colors.soft,
          fontSize: 20,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        <div>Solana-native product launch</div>
        <div>Built for motion, AI, and action</div>
      </div>
    </SceneShell>
  );
};

const EyebrowChip = ({
  label,
  opacity = 1,
}: {
  label: string;
  opacity?: number;
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 999,
        border: "1px solid rgba(20,241,149,0.22)",
        background: "rgba(20,241,149,0.08)",
        padding: "14px 24px",
        color: colors.green,
        fontSize: 22,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          backgroundColor: colors.green,
          boxShadow: "0 0 18px rgba(20,241,149,0.7)",
        }}
      />
      {label}
    </div>
  );
};

const SceneCount = ({ value }: { value: string }) => {
  return (
    <div
      style={{
        fontFamily: displayFont,
        fontSize: 26,
        color: colors.soft,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}
    >
      {value}
    </div>
  );
};

const FloatCard = ({
  top,
  right,
  bottom,
  left,
  title,
  detail,
  accent,
  frameOffset,
}: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  title: string;
  detail: string;
  accent: "purple" | "green";
  frameOffset: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    fps,
    frame: frame - frameOffset,
    config: {
      damping: 15,
      stiffness: 140,
    },
  });
  const accentColor = accent === "purple" ? colors.purple : colors.green;

  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        bottom,
        left,
        padding: "18px 22px",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(8, 12, 24, 0.88)",
        boxShadow: "0 20px 56px rgba(0,0,0,0.3)",
        minWidth: 220,
        transform: `translateY(${interpolate(pop, [0, 1], [20, 0])}px) scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
        opacity: pop,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: accentColor,
            boxShadow: `0 0 18px ${accentColor}`,
          }}
        />
        <div
          style={{
            color: colors.text,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          color: colors.muted,
          fontSize: 18,
          lineHeight: 1.4,
        }}
      >
        {detail}
      </div>
    </div>
  );
};
