export const useCookieStore = () => {
  const getCookie = (key: string) => {
    if (typeof window === 'undefined') return ''; // Ensure this runs only on the client
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [cookieKey, cookieValue] = cookie.split('=');
        acc[cookieKey] = cookieValue;
        return acc;
      },
      {} as Record<string, string>
    );
    return cookies[key] || '';
  };

  const setCookie = (key: string, value: string) => {
    if (typeof window === 'undefined') return; // Ensure this runs only on the client
    document.cookie = `${key}=${value}; path=/`;
  };

  return { getCookie, setCookie };
};
