import type {FeatureSnapshot,MarketTick} from './types';
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
export function validateTick(tick:MarketTick):string[]{const e:string[]=[];if(!Number.isInteger(tick.last_digit)||tick.last_digit<0||tick.last_digit>9)e.push('INVALID_LAST_DIGIT');if(!Number.isFinite(tick.quote))e.push('INVALID_QUOTE');if(!tick.timestamp_utc||Number.isNaN(Date.parse(tick.timestamp_utc)))e.push('INVALID_TIMESTAMP');return e;}
export function computeFeatures(symbol:string,ticks:MarketTick[],nowMs=Date.now()):FeatureSnapshot{
 const ordered=ticks.filter(t=>t.symbol===symbol).slice(-Math.max(1,ticks.length));const counts=Array(10).fill(0) as number[];ordered.forEach(t=>counts[t.last_digit]++);
 const n=ordered.length,freq=counts.map(c=>n?c/n:0),even=freq.reduce((s,f,d)=>s+(d%2===0?f:0),0),recent=ordered.slice(-Math.min(20,n));
 const over:Record<number,number>={},under:Record<number,number>={};for(let k=0;k<=8;k++){over[k]=freq.slice(k+1).reduce((a,b)=>a+b,0);under[k]=freq.slice(0,k+1).reduce((a,b)=>a+b,0);}
 const first=recent[0]?.last_digit,last=recent[recent.length-1]?.last_digit,momentum=recent.length>1?clamp01(Math.abs(last-first)/9):0;
 const mean=freq.reduce((s,f,d)=>s+d*f,0),variance=freq.reduce((s,f,d)=>s+((d-mean)**2)*f,0),volatility=clamp01(Math.sqrt(variance)/4.5);
 const patternConsistency=n?clamp01((Math.max(...freq)-.1)/.3):0,sampleQuality=clamp01(n/100),consecutive:Record<string,number>={};
 if(recent.length){const p=recent[recent.length-1].last_digit%2===0?'EVEN':'ODD';let c=0;for(let i=recent.length-1;i>=0&&((recent[i].last_digit%2===0?'EVEN':'ODD')===p);i--)c++;consecutive[p]=c;}
 return {symbol,window_size:n,generated_at_utc:new Date(nowMs).toISOString(),digit_counts:counts,digit_frequencies:freq,even_frequency:even,odd_frequency:1-even,over_frequencies:over,under_frequencies:under,momentum,volatility,pattern_consistency:patternConsistency,consecutive_outcomes:consecutive,sample_quality:sampleQuality,data_age_ms:ordered.length?Math.max(0,nowMs-Date.parse(ordered[ordered.length-1].timestamp_utc)):Number.MAX_SAFE_INTEGER};
}
