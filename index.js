import {create, bind, update, remove, Effect} from './lib/core/VNode.js';
import _State from './lib/State.js';
import {FixedType as _FixedType} from './lib/core/FixedType.js';
export const VNode = {create, bind, update, remove, Effect};
export const FixedType = _FixedType;
export const State = _State;
