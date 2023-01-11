
/**
 * Updates access and refresh tokens, given the refresh token in local storage
 * @returns {boolean} - If tokens were successfully updated
 */
export default async function updateTokens(){

  let refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('No refresh token found, must login again.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }

  // Make request to backend to get new tokens (see: api/auth/refresh.py)
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  });
  const res = await response.json();

  switch (res.message) {
    case '':
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      return true;
    default:
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
  }

}
