import type {SessionState,TradeRecord,TradingConfig} from './types';
export interface RecoveryDecision{allowed:boolean;nextLevel:number;pauseMs:number;reason:string;}
export function evaluateRecovery(trade:TradeRecord,session:SessionState,c:TradingConfig):RecoveryDecision{
 if(trade.result!=='LOSS')return{allowed:true,nextLevel:0,pauseMs:0,reason:'NO_RECOVERY_REQUIRED'};
 if(!c.recovery_enabled)return{allowed:false,nextLevel:session.recovery_level,pauseMs:c.recovery_cooldown_ms,reason:'RECOVERY_DISABLED'};
 if(c.recovery_stop_after_loss&&session.consecutive_losses>=c.maximum_consecutive_losses)return{allowed:false,nextLevel:session.recovery_level,pauseMs:c.recovery_cooldown_ms,reason:'RECOVERY_STOPPED_BY_LOSS_LIMIT'};
 const next=session.recovery_level+1;if(next>c.maximum_recovery_level)return{allowed:false,nextLevel:session.recovery_level,pauseMs:c.recovery_cooldown_ms,reason:'MAX_RECOVERY_LEVEL'};
 return{allowed:true,nextLevel:next,pauseMs:c.recovery_cooldown_ms,reason:'NEW_SIGNAL_REQUIRED_BEFORE_BOUNDED_RECOVERY'};
}
export function resetRecoveryAfterWin(session:SessionState,c:TradingConfig):SessionState{return c.reset_recovery_after_win?{...session,recovery_level:0,status:'WAITING'}:session;}
