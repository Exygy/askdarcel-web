interface Headers {
  [key: string]: string;
}

export default function fetcher(url: string, headers: Headers = {}) {
  const fetchHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  return fetch(
    url,
    {
      headers: fetchHeaders,
    }
  ).then(res => res.json());
}
