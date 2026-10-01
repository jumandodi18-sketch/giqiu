export type OperatingMode = 'BACKTEST' | 'SIMULATION' | 'DEMO' | 'LIVE' | 'HALTED';
export type ContractType = 'EVEN_ODD' | 'OVER_UNDER';
export type Direction = 'EVEN' | 'ODD' | 'OVER' | 'UNDER';
export type SessionStatus = 'ANALYZING' | 'WAITING' | 'SIGNAL_CONFIRMED' | 'EXECUTING' | 'MONITORING' | 'WIN' | 'LOSS' | 'RECOVERY' | 'HALTED';

export interface MarketTick { tick_id:string; symbol:string; timestamp_utc:string; quote:number; last_digit:number; source:string; sequence:number; }
export interface FeatureSnapshot {
  symbol:string; window_size:number; generated_at_utc:string; digit_counts:number[]; digit_frequencies:number[];
  even_frequency:number; odd_frequency:number; over_frequencies:Record<number,number>; under_frequencies:Record<number,number>;
  momentum:number; volatility:number; pattern_consistency:number; consecutive_outcomes:Record<string,number>;
  sample_quality:number; data_age_ms:number;
}
export interface SignalCandidate {
  signal_id:string; created_at_utc:string; symbol:string; contract_type:ContractType; direction:Direction; threshold?:number;
  confidence:number; expected_edge:number; supporting_factors:string[]; contradicting_factors:string[];
  feature_snapshot_id:string; valid_until_utc:string;
}
export interface ConfirmationResult { confirmed:boolean; independent_confirmations:number; factors:string[]; contradictions:string[]; reason_codes:string[]; }
export interface RiskDecision {
  decision_id:string; timestamp_utc:string; approved:boolean; stake:number; risk_fraction:number; reason_codes:string[];
  exposure_after_trade:number; recovery_level:number; requires_manual_review:boolean;
}
export interface SessionState {
  session_id:string; started_at_utc:string; mode:OperatingMode; starting_balance:number; current_balance:number;
  session_profit_loss:number; daily_profit_loss:number; total_trades:number; consecutive_wins:number; consecutive_losses:number;
  current_exposure:number; current_stake:number; recovery_level:number; status:SessionStatus; emergency_stop:boolean;
}
export interface TradeRecord {
  trade_id:string; client_reference:string; opened_at_utc:string; closed_at_utc?:string; symbol:string;
  contract_type:ContractType; direction:Direction; stake:number; confidence:number; expected_edge:number; entry_reason:string;
  result:'WIN'|'LOSS'|'VOID'|'ERROR'|'PENDING'; profit_loss?:number; recovery_level:number; mode:OperatingMode;
  api_status:string; risk_decision_id:string;
}
export interface NoTradeRecord {
  record_id:string; timestamp_utc:string; symbol:string; reason_codes:string[]; human_readable_reason:string;
  candidate_signal_id:string|null; risk_state:Partial<SessionState>; feature_snapshot_id:string|null;
}
export interface TradingConfig {
  symbols:string[]; tick_window_size:number; minimum_sample_size:number; maximum_tick_age_ms:number;
  minimum_confidence:number; minimum_expected_edge:number; minimum_independent_confirmations:number; maximum_signal_age_ms:number;
  minimum_pattern_consistency:number; minimum_sample_quality:number; volatility_minimum:number; volatility_maximum:number;
  risk_percent_per_trade:number; maximum_stake:number; minimum_stake:number; maximum_session_loss:number; maximum_daily_loss:number;
  maximum_consecutive_losses:number; maximum_trades_per_session:number; maximum_total_exposure:number; maximum_symbol_exposure:number;
  maximum_open_positions:number; minimum_balance_reserve:number; recovery_enabled:boolean; maximum_recovery_level:number;
  recovery_risk_multiplier:number; recovery_maximum_stake:number; recovery_cooldown_ms:number; recovery_requires_new_signal:boolean;
  recovery_stop_after_loss:boolean; reset_recovery_after_win:boolean; manual_confirmation_required_for_live:boolean;
  paper_mode_default:boolean; live_enabled:boolean;
}
export const DEFAULT_TRADING_CONFIG:TradingConfig = {
  symbols:[], tick_window_size:100, minimum_sample_size:50, maximum_tick_age_ms:3000,
  minimum_confidence:.65, minimum_expected_edge:.02, minimum_independent_confirmations:3, maximum_signal_age_ms:1500,
  minimum_pattern_consistency:.55, minimum_sample_quality:.9, volatility_minimum:0, volatility_maximum:1,
  risk_percent_per_trade:.5, maximum_stake:10, minimum_stake:.35, maximum_session_loss:20, maximum_daily_loss:50,
  maximum_consecutive_losses:3, maximum_trades_per_session:100, maximum_total_exposure:10, maximum_symbol_exposure:5,
  maximum_open_positions:1, minimum_balance_reserve:10, recovery_enabled:true, maximum_recovery_level:2,
  recovery_risk_multiplier:1.25, recovery_maximum_stake:5, recovery_cooldown_ms:5000, recovery_requires_new_signal:true,
  recovery_stop_after_loss:true, reset_recovery_after_win:true, manual_confirmation_required_for_live:true,
  paper_mode_default:true, live_enabled:false,
};
