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
  amber: "#FDBA74",
  background: "#040711",
  text: "#F5F7FF",
  muted: "rgba(232, 236, 255, 0.74)",
  soft: "rgba(232, 236, 255, 0.44)",
  panel: "rgba(10, 14, 31, 0.76)",
  border: "rgba(255,255,255,0.1)",
};

type Accent = "purple" | "green" | "amber";

const headingGradient =
  "linear-gradient(120deg, #ffffff 0%, #d3ccff 38%, #14F195 100%)";

const introSignals = [
  "Portfolio intelligence",
  "Autonomous actions",
  "Simulation first",
  "Protocol-native execution",
];

const intelligenceCards = [
  {
    step: "01",
    title: "Portfolio intelligence",
    body: "Exposure analysis, token and NFT PnL, and risk scoring before the next move.",
    accent: "purple" as Accent,
  },
  {
    step: "02",
    title: "Transaction explanation",
    body: "Human-readable previews for swaps, fees, slippage, and post-trade settlement.",
    accent: "green" as Accent,
  },
  {
    step: "03",
    title: "Memory layer",
    body: "Remember favorite tokens, recurring recipients, and low-slippage preferences.",
    accent: "amber" as Accent,
  },
];

const agentCards = [
  {
    title: "Smart alerts",
    body: "Track SOL price targets, trigger exits, and monitor market events.",
    example: "Alert me if SOL drops below $100",
    accent: "green" as Accent,
  },
  {
    title: "Strategy execution",
    body: "Stake in the best pool, rebalance, or chain multiple wallet actions together.",
    example: "Swap SOL to USDC and send it to Alice",
    accent: "purple" as Accent,
  },
  {
    title: "Yield and copy trading",
    body: "Aggregate staking, lending, LP opportunities, and follow high-signal traders.",
    example: "Show the highest APY for idle SOL",
    accent: "amber" as Accent,
  },
  {
    title: "Advanced analytics",
    body: "Understand win rate, average ROI, portfolio concentration, and spend behavior.",
    example: "What is my trade win rate this month?",
    accent: "green" as Accent,
  },
];

const ecosystemChips = [
  "Jupiter",
  "Marinade",
  "Jito",
  "Tensor",
  "Magic Eden",
  "Drift",
  "Mango",
  "Cross-chain",
];

const finalTracks = [
  "Scam detection",
  "Simulation mode",
  "Session controls",
  "Plugin system",
  "SDK and API",
  "Voice and shortcuts",
];

const transitionTiming = linearTiming({ durationInFrames: 15 });
const slideTiming = springTiming({
  durationInFrames: 15,
  config: {
    damping: 200,
  },
});

export const SolarkBotUpcomingFeatures = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: bodyFont,
      }}
    >
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={105}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionTiming}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <IntelligenceScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={slideTiming}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <AgentScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionTiming}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <TrustScene />
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
  const driftX = interpolate(frame, [0, 180], [0, -130], {
    extrapolateRight: "clamp",
  });
  const pulse = 0.84 + Math.sin(frame / 16) * 0.06;

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(153,69,255,0.25), transparent 34%), radial-gradient(circle at 84% 22%, rgba(20,241,149,0.16), transparent 29%), linear-gradient(180deg, #040711 0%, #0A1021 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -220,
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          transform: `translate3d(${driftX}px, ${driftX * 0.6}px, 0)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width * 0.07,
          top: height * 0.16,
          width: 410,
          height: 410,
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(153,69,255,0.48) 0%, rgba(153,69,255,0.1) 42%, rgba(153,69,255,0) 74%)",
          filter: "blur(26px)",
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: width * 0.04,
          bottom: height * 0.07,
          width: 470,
          height: 470,
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(20,241,149,0.34) 0%, rgba(20,241,149,0.08) 38%, rgba(20,241,149,0) 72%)",
          filter: "blur(34px)",
          transform: `scale(${1.04 - (pulse - 0.84)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 14%, rgba(255,255,255,0) 86%, rgba(255,255,255,0.04) 100%)",
        }}
      />
    </>
  );
};

const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroSpring = spring({
    fps,
    frame,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
  });
  const subOpacity = interpolate(frame, [14, 34], [0, 1], {
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
        <EyebrowChip label="Upcoming roadmap" opacity={heroSpring} />
        <SceneCount value="01 / 04" />
      </div>

      <div
        style={{
          marginTop: "auto",
          marginBottom: "auto",
          display: "grid",
          gap: 24,
          placeItems: "center",
          textAlign: "center",
          transform: `translateY(${interpolate(heroSpring, [0, 1], [34, 0])}px)`,
          opacity: heroSpring,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 36,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 22px 60px rgba(0,0,0,0.26)",
          }}
        >
          <Img
            src={staticFile("logo.svg")}
            style={{
              width: 92,
              height: 92,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 100,
            lineHeight: 0.92,
            letterSpacing: "-0.05em",
            maxWidth: 1320,
            backgroundImage: headingGradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          SolarkBot is becoming an operator
        </div>
        <div
          style={{
            maxWidth: 1180,
            fontSize: 34,
            lineHeight: 1.42,
            color: colors.muted,
            opacity: subOpacity,
          }}
        >
          The roadmap moves from chat-only assistance to portfolio intelligence, automation, deep DeFi execution, and trust-first wallet tooling.
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {introSignals.map((signal, index) => {
            const chipSpring = spring({
              fps,
              frame: frame - 12 - index * 7,
              config: {
                damping: 14,
                stiffness: 140,
              },
            });

            return (
              <SignalChip
                key={signal}
                label={signal}
                progress={chipSpring}
              />
            );
          })}
        </div>
      </div>

      <FooterCopy
        left="solarkbot.xyz"
        right="Future-ready Solana UX"
      />
    </SceneShell>
  );
};

const IntelligenceScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sectionOpacity = interpolate(frame, [0, 16], [0, 1], {
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
        <EyebrowChip label="Context and clarity" opacity={sectionOpacity} />
        <SceneCount value="02 / 04" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.92fr 1.08fr",
          gap: 44,
          flex: 1,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 24, opacity: sectionOpacity }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 86,
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
            }}
          >
            Understand the wallet before every action
          </div>
          <div
            style={{
              maxWidth: 720,
              fontSize: 31,
              lineHeight: 1.46,
              color: colors.muted,
            }}
          >
            Upcoming intelligence features explain exposure, decode transactions, and remember the user’s preferred way to trade.
          </div>

          <div
            style={{
              borderRadius: 30,
              border: `1px solid ${colors.border}`,
              background: "rgba(8, 12, 24, 0.82)",
              padding: "28px 30px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: colors.soft,
              }}
            >
              Example prompts
            </div>
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gap: 14,
              }}
            >
              {[
                "Am I overexposed to SOL?",
                "This swaps 1 SOL to ~150 USDC via Jupiter",
                "Use low slippage like last time",
              ].map((prompt, index) => (
                <PromptLine key={prompt} text={prompt} index={index} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          {intelligenceCards.map((card, index) => {
            const cardSpring = spring({
              fps,
              frame: frame - 8 - index * 10,
              config: {
                damping: 14,
                stiffness: 132,
              },
            });

            return (
              <RoadmapCard
                key={card.title}
                step={card.step}
                title={card.title}
                body={card.body}
                accent={card.accent}
                progress={cardSpring}
              />
            );
          })}
        </div>
      </div>

      <FooterCopy
        left="Portfolio intelligence / transaction explanation / memory"
        right="Operator context"
      />
    </SceneShell>
  );
};

const AgentScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSpring = spring({
    fps,
    frame,
    config: {
      damping: 14,
      stiffness: 120,
    },
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
        <EyebrowChip label="Automation and DeFi power" opacity={titleSpring} />
        <SceneCount value="03 / 04" />
      </div>

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 82,
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
            maxWidth: 1100,
            opacity: titleSpring,
          }}
        >
          From alerting to execution, the agent starts moving capital with intent
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.44,
            color: colors.muted,
            maxWidth: 1200,
            opacity: interpolate(frame, [10, 30], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Smart alerts, recurring actions, staking strategies, yield discovery, copy trading, and wallet analytics are the next layer of differentiation.
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
          flex: 1,
        }}
      >
        {agentCards.map((card, index) => {
          const cardSpring = spring({
            fps,
            frame: frame - 12 - index * 8,
            config: {
              damping: 15,
              stiffness: 135,
            },
          });

          return (
            <FeaturePanel
              key={card.title}
              title={card.title}
              body={card.body}
              example={card.example}
              accent={card.accent}
              progress={cardSpring}
            />
          );
        })}
      </div>

      <FooterCopy
        left="Alerts / strategy / yield / analytics"
        right="Autonomous execution"
      />
    </SceneShell>
  );
};

const TrustScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroSpring = spring({
    fps,
    frame,
    config: {
      damping: 14,
      stiffness: 118,
      mass: 0.84,
    },
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
        <EyebrowChip label="Ecosystem and trust layer" opacity={heroSpring} />
        <SceneCount value="04 / 04" />
      </div>

      <div
        style={{
          marginTop: 34,
          display: "grid",
          gridTemplateColumns: "1.02fr 0.98fr",
          gap: 36,
          flex: 1,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 26 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 82,
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
              maxWidth: 980,
              transform: `translateY(${interpolate(heroSpring, [0, 1], [28, 0])}px)`,
              opacity: heroSpring,
            }}
          >
            Integrate the ecosystem. Add the trust layer. Make the UX addictive.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.44,
              color: colors.muted,
              maxWidth: 980,
              opacity: interpolate(frame, [12, 32], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            Protocol integrations, NFT actions, cross-chain support, simulation mode, scam warnings, plugins, and voice-first shortcuts push SolarkBot toward platform status.
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 6,
            }}
          >
            {ecosystemChips.map((chip, index) => {
              const chipSpring = spring({
                fps,
                frame: frame - 10 - index * 4,
                config: {
                  damping: 14,
                  stiffness: 140,
                },
              });
              return (
                <SignalChip
                  key={chip}
                  label={chip}
                  progress={chipSpring}
                  compact
                />
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              borderRadius: 32,
              border: `1px solid ${colors.border}`,
              background: colors.panel,
              padding: "30px 30px 24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 24,
                  background:
                    "linear-gradient(135deg, rgba(153,69,255,0.92), rgba(20,241,149,0.82))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 16px 40px rgba(20,241,149,0.14)",
                }}
              >
                <Img
                  src={staticFile("logo.svg")}
                  style={{
                    width: 56,
                    height: 56,
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 42,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Coming to solarkbot.xyz
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 22,
                    color: colors.muted,
                  }}
                >
                  Security, automation, integrations, and a platform-grade tool surface.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {finalTracks.map((item, index) => {
                const opacity = interpolate(frame, [20 + index * 4, 42 + index * 4], [0, 1], {
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={item}
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      padding: "14px 16px",
                      fontSize: 20,
                      color: colors.text,
                      opacity,
                      transform: `translateY(${interpolate(opacity, [0, 1], [14, 0])}px)`,
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <FooterCopy
        left="Security / integrations / platform features"
        right="Next release track"
      />
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

const FooterCopy = ({
  left,
  right,
}: {
  left: string;
  right: string;
}) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 20,
        color: colors.soft,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginTop: 24,
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
};

const SignalChip = ({
  label,
  progress,
  compact = false,
}: {
  label: string;
  progress: number;
  compact?: boolean;
}) => {
  return (
    <div
      style={{
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(10,14,31,0.72)",
        padding: compact ? "12px 18px" : "16px 24px",
        fontSize: compact ? 20 : 23,
        color: colors.text,
        transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
        opacity: progress,
        boxShadow: "0 18px 46px rgba(0,0,0,0.2)",
      }}
    >
      {label}
    </div>
  );
};

const PromptLine = ({
  text,
  index,
}: {
  text: string;
  index: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12 + index * 8, 30 + index * 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: "14px 16px",
        fontFamily: bodyFont,
        fontSize: 22,
        color: colors.text,
        opacity,
        transform: `translateX(${interpolate(opacity, [0, 1], [18, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

const RoadmapCard = ({
  step,
  title,
  body,
  accent,
  progress,
}: {
  step: string;
  title: string;
  body: string;
  accent: Accent;
  progress: number;
}) => {
  const accentColor =
    accent === "purple"
      ? "linear-gradient(135deg, rgba(153,69,255,0.92), rgba(85,48,172,0.84))"
      : accent === "green"
        ? "linear-gradient(135deg, rgba(20,241,149,0.92), rgba(16,146,100,0.82))"
        : "linear-gradient(135deg, rgba(251,191,36,0.92), rgba(249,115,22,0.82))";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 18,
        alignItems: "center",
        borderRadius: 30,
        border: `1px solid ${colors.border}`,
        background: colors.panel,
        padding: "24px 26px",
        boxShadow: "0 22px 54px rgba(0,0,0,0.2)",
        transform: `translateX(${interpolate(progress, [0, 1], [32, 0])}px)`,
        opacity: progress,
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: displayFont,
          fontSize: 30,
          color: colors.text,
        }}
      >
        {step}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.48,
            color: colors.muted,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};

const FeaturePanel = ({
  title,
  body,
  example,
  accent,
  progress,
}: {
  title: string;
  body: string;
  example: string;
  accent: Accent;
  progress: number;
}) => {
  const accentColor =
    accent === "purple"
      ? colors.purple
      : accent === "green"
        ? colors.green
        : colors.amber;

  return (
    <div
      style={{
        borderRadius: 30,
        border: `1px solid ${colors.border}`,
        background: colors.panel,
        padding: "28px 28px 24px",
        boxShadow: "0 22px 56px rgba(0,0,0,0.2)",
        transform: `translateY(${interpolate(progress, [0, 1], [26, 0])}px)`,
        opacity: progress,
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
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
            fontSize: 30,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: 22,
          lineHeight: 1.5,
          color: colors.muted,
        }}
      >
        {body}
      </div>
      <div
        style={{
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          padding: "14px 16px",
          fontSize: 20,
          color: accentColor,
        }}
      >
        {example}
      </div>
    </div>
  );
};
