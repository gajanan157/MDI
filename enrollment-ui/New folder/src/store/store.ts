import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
});

// The selected role used to be kept in localStorage, where it could be edited by hand. It now comes from the
// signed token, so remove any leftover value.
try {
  localStorage.removeItem('selectedRoles');
} catch {
  /* ignore */
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
