export * from './types';export * from './features';export * from './signals';export * from './risk';export * from './recovery';export * from './safety';
export interface ExecutionAcknowledgement{accepted:boolean;contractId?:string;clientReference:string;errorCode?:string;}
export interface ExecutionEngine{submitOrder(signal:SignalCandidate,riskDecision:RiskDecision):Promise<ExecutionAcknowledgement>;getContractStatus(contractId:string):Promise<unknown>;cancelOrHaltPendingOperations():Promise<void>;}
import type {RiskDecision,SignalCandidate} from './types';
