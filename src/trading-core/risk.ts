import type {ConfirmationResult,RiskDecision,SessionState,SignalCandidate,TradingConfig} from './types';
export function evaluateRisk(s:SignalCandidate,session:SessionState,confirmation:ConfirmationResult,c:TradingConfig,openPositionsForSymbol=0):RiskDecision{
 const reasons:string[]=[];if(!confirmation.confirmed)reasons.push(...confirmation.reason_codes);if(session.emergency_stop||session.status==='HALTED')reasons.push('EMERGENCY_STOP');
 if(session.session_profit_loss<=-Math.abs(c.maximum_session_loss))reasons.push('SESSION_LOSS_LIMIT');if(session.daily_profit_loss<=-Math.abs(c.maximum_daily_loss))reasons.push('DAILY_LOSS_LIMIT');
 if(session.consecutive_losses>=c.maximum_consecutive_losses)reasons.push('CONSECUTIVE_LOSS_LIMIT');if(session.total_trades>=c.maximum_trades_per_session)reasons.push('TRADE_COUNT_LIMIT');
 if(session.current_exposure>=c.maximum_total_exposure)reasons.push('TOTAL_EXPOSURE_LIMIT');if(openPositionsForSymbol>0)reasons.push('SYMBOL_POSITION_LIMIT');
 if(session.current_balance<=c.minimum_balance_reserve)reasons.push('BALANCE_RESERVE');if(session.mode==='LIVE'&&(!c.live_enabled||c.manual_confirmation_required_for_live))reasons.push('LIVE_REQUIRES_EXPLICIT_AUTHORIZATION');
 const base=session.current_balance*(c.risk_percent_per_trade/100),mult=session.recovery_level>0?Math.min(c.recovery_risk_multiplier**session.recovery_level,3):1;
 const cap=session.recovery_level>0?c.recovery_maximum_stake:c.maximum_stake,stake=Math.min(cap,c.maximum_stake,session.current_balance-c.minimum_balance_reserve,base*mult);
 if(stake<c.minimum_stake)reasons.push('STAKE_BELOW_MINIMUM');const approved=reasons.length===0;
 return {decision_id:'RISK-'+Date.now().toString(36),timestamp_utc:new Date().toISOString(),approved,stake:approved?Math.max(0,stake):0,risk_fraction:approved?stake/Math.max(session.current_balance,1):0,reason_codes:approved?['APPROVED']:reasons,exposure_after_trade:session.current_exposure+(approved?stake:0),recovery_level:session.recovery_level,requires_manual_review:session.mode==='LIVE'};
}
