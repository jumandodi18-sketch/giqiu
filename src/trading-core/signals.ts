import type {FeatureSnapshot,SignalCandidate,TradingConfig,Direction,ContractType} from './types';
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
function makeCandidate(f:FeatureSnapshot,c:TradingConfig,type:ContractType,direction:Direction,support:number,threshold?:number):SignalCandidate|null{
 const confidence=clamp01(.5*support+.2*f.pattern_consistency+.15*f.sample_quality+.15*(1-f.volatility)),edge=support-.5,bad:string[]=[];
 if(f.sample_quality<c.minimum_sample_quality)bad.push('LOW_SAMPLE_QUALITY');if(f.pattern_consistency<c.minimum_pattern_consistency)bad.push('LOW_PATTERN_CONSISTENCY');
 if(f.data_age_ms>c.maximum_tick_age_ms)bad.push('STALE_DATA');if(f.volatility<c.volatility_minimum||f.volatility>c.volatility_maximum)bad.push('VOLATILITY_OUT_OF_RANGE');
 if(confidence<c.minimum_confidence)bad.push('LOW_CONFIDENCE');if(edge<c.minimum_expected_edge)bad.push('LOW_EXPECTED_EDGE');if(bad.length)return null;
 const now=Date.now();return {signal_id:'SIG-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,7),created_at_utc:new Date(now).toISOString(),symbol:f.symbol,contract_type:type,direction,threshold,confidence,expected_edge:edge,supporting_factors:['digit_distribution','sample_quality','pattern_consistency'],contradicting_factors:[],feature_snapshot_id:f.symbol+':'+f.generated_at_utc,valid_until_utc:new Date(now+c.maximum_signal_age_ms).toISOString()};
}
export function generateCandidates(f:FeatureSnapshot,c:TradingConfig):SignalCandidate[]{const r:SignalCandidate[]=[];for(const [d,s] of [['EVEN',f.even_frequency],['ODD',f.odd_frequency]] as [Direction,number][]) {const x=makeCandidate(f,c,'EVEN_ODD',d,s);if(x)r.push(x);}for(let k=0;k<=8;k++){for(const [d,s] of [['OVER',f.over_frequencies[k]],['UNDER',f.under_frequencies[k]]] as [Direction,number][]) {const x=makeCandidate(f,c,'OVER_UNDER',d,s,k);if(x)r.push(x);}}return r.sort((a,b)=>b.expected_edge-a.expected_edge);}
export function confirmSignal(s:SignalCandidate,f:FeatureSnapshot,c:TradingConfig){
 const checks=[f.sample_quality>=c.minimum_sample_quality,f.pattern_consistency>=c.minimum_pattern_consistency,f.data_age_ms<=c.maximum_tick_age_ms,f.volatility>=c.volatility_minimum&&f.volatility<=c.volatility_maximum,s.confidence>=c.minimum_confidence,s.expected_edge>=c.minimum_expected_edge];
 const names=['sample_quality','pattern_consistency','data_freshness','volatility','confidence','expected_edge'],bad=names.filter((_,i)=>!checks[i]),count=checks.filter(Boolean).length;
 return {confirmed:count>=c.minimum_independent_confirmations&&bad.length===0&&Date.parse(s.valid_until_utc)>=Date.now(),independent_confirmations:count,factors:names.filter((_,i)=>checks[i]),contradictions:bad,reason_codes:bad.length?bad.map(x=>'FAILED_'+x.toUpperCase()):['CONFIRMED']};
}
