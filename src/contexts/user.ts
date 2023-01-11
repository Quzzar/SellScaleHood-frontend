import { createContext } from 'react';

export type User = {
  readonly localId: string,
  readonly email: string, 
  readonly displayName: string,
}

const UserContext = createContext<{ user: User, setUser: (user: User) => void }>({
  user: {
    localId: '',
    email: '',
    displayName: '',
  },
  setUser: (u: User) => {},
});

export { UserContext };
