import {
  WalletDesignEngine,
  WalletStackedPass,
  WALLET_SECTIONS,
  type WalletDesignEngineProps,
} from './WalletDesignEngine';

export type WalletCardRenderEngineProps = WalletDesignEngineProps & {
  /** Ignored — pass height always follows ID-1 ratio from `width`. */
  height?: number;
};

/** @deprecated Prefer `WalletDesignEngine` — kept for existing imports. */
export function WalletCardRenderEngine(props: WalletCardRenderEngineProps) {
  return <WalletDesignEngine {...props} />;
}

export { WalletStackedPass, WALLET_SECTIONS };
