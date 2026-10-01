import type {OperatingMode,SessionState,TradingConfig} from './types';
export interface SafetyState{safe:boolean;reasons:string[];canExecute:boolean;}
export function validateConfiguration(c:TradingConfig):string[]{
 const e:string[]=[];for(const key of ['minimum_confidence','minimum_expected_edge','minimum_pattern_consistency','minimum_sample_quality']){const v=c[key as keyof TradingConfig] as number;if(v<0||v>1)e.push(key+'_OUT_OF_RANGE');}
 if(c.risk_percent_per_trade<=0)e.push('INVALID_RISK_PERCENT');if(c.minimum_stake<=0||c.maximum_stake<c.minimum_stake)e.push('INVALID_STAKE_RANGE');
 if(c.maximum_recovery_level<0||c.recovery_risk_multiplier<1)e.push('INVALID_RECOVERY_BOUND');if(c.recovery_maximum_stake>c.maximum_stake)e.push('RECOVERY_STAKE_EXCEEDS_MAXIMUM');
 if(c.maximum_consecutive_losses<1)e.push('INVALID_LOSS_LIMIT');if(c.live_enabled&&!c.manual_confirmation_required_for_live)e.push('LIVE_REQUIRES_MANUAL_CONFIRMATION');return e;
}
export function evaluateSafety(session:SessionState,c:TradingConfig,mode:OperatingMode):SafetyState{
 const reasons=validateConfiguration(c);if(session.emergency_stop)reasons.push('EMERGENCY_STOP_ACTIVE');if(session.session_profit_loss<=-Math.abs(c.maximum_session_loss))reasons.push('SESSION_LOSS_LIMIT');
 if(session.daily_profit_loss<=-Math.abs(c.maximum_daily_loss))reasons.push('DAILY_LOSS_LIMIT');if(session.consecutive_losses>=c.maximum_consecutive_losses)reasons.push('CONSECUTIVE_LOSS_LIMIT');
 if(mode==='LIVE'&&!c.live_enabled)reasons.push('LIVE_DISABLED_BY_DEFAULT');if(mode==='LIVE'&&c.manual_confirmation_required_for_live)reasons.push('LIVE_MANUAL_CONFIRMATION_REQUIRED');
 return{safe:reasons.length===0,reasons,canExecute:reasons.length===0&&mode!=='HALTED'};
}
export function activateEmergencyStop(session:SessionState,_reason:string):SessionState{return{...session,emergency_stop:true,status:'HALTED'};}
