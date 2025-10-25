import { combineReducers } from 'redux';

import masterReducer from './master';
import alertReducer from './alert';
import PIReducer from './PIList';
import selectedPIReducer from './selectedPI';

const reducer = combineReducers({
    master: masterReducer,
    alert: alertReducer,
    PI: PIReducer,
    selectedPI: selectedPIReducer
});

export default reducer;
