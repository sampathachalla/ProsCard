import React from 'react';
import {
  WalletDesignEngine,
  WalletStackedPass,
  type WalletDesignEngineProps,
} from './WalletDesignEngine';

export type WalletCardRenderEngineProps = WalletDesignEngineProps;

/**
 * @deprecated Prefer `WalletDesignEngine` — kept so existing imports keep working.
 * Renders the ID-1 wallet pass from the card's full-view layout selection.
 */
export function WalletCardRenderEngine(props: WalletCardRenderEngineProps) {
  return <WalletDesignEngine {...props} />;
}

export { WalletStackedPass };
