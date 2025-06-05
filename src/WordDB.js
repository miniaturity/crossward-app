import { useState, useEffect } from 'react';

function useWordDB() {
  const [wordDB, setWordDB] = useState(null);

  useEffect(() => {
    fetch(`./wordDB.json?v=${process.env.REACT_APP_VERSION}`)
      .then((res) => res.json())
      .then((data) => setWordDB(data))
      .catch((err) => console.error('Failed to load word DB:', err));
  }, []);

  return wordDB;
}

export default useWordDB;