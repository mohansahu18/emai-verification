import { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchUserSession } from 'src/redux/slice/userSlice';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  // Access user data and loading status from Redux
  const { user, status } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserSession()); // Trigger the thunk to check the user session
  }, [dispatch]);

  // ----------------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      user: user
        ? {
            ...user,
            role: user?.role ?? 'admin',
          }
        : null,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
