export type ProductSurfaceId = "nft" | "dex";

export type ProductSurface = {
  id: ProductSurfaceId;
  label: string;
  shortLabel: string;
  url: string;
  displayUrl: string;
  description: string;
  roleDescription: string;
};

export const productSurfaces = {
  nft: {
    id: "nft",
    label: "Solark NFT",
    shortLabel: "NFT",
    url: "https://nft.solarkbot.xyz/",
    displayUrl: "nft.solarkbot.xyz",
    description:
      "Dedicated SolarkBot NFT hub that lives beside the core chat and wallet experience.",
    roleDescription:
      "Solark NFT gives users a dedicated NFT surface while SolarkBot continues to own the main marketing, wallet, and agent experiences.",
  },
  dex: {
    id: "dex",
    label: "Solark DEX",
    shortLabel: "DEX",
    url: "https://dex.solarkbot.xyz/",
    displayUrl: "dex.solarkbot.xyz",
    description:
      "Dedicated SolarkBot DEX for swap-focused Solana flows that sits beside the core app.",
    roleDescription:
      "Solark DEX handles the dedicated swap experience while SolarkBot continues to own the main marketing, wallet, and agent experiences.",
  },
} as const satisfies Record<ProductSurfaceId, ProductSurface>;

export const productSurfaceList = [
  productSurfaces.nft,
  productSurfaces.dex,
] as const;
