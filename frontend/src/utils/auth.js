export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

export const clearUser = () => {
  localStorage.removeItem('user');
};

export const getToken = () => {
  const user = getUser();
  return user?.token;
};
