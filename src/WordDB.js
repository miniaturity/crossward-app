import { useState, useEffect } from 'react';


export default function useWordDB() {
  const [wordDB, setWordDB] = useState(null);

  useEffect(() => {
    fetch('/worddb.json')
      .then((res) => res.json())
      .then((data) => setWordDB(data))
      .catch((err) => console.error('Failed to load word DB:', err));
  }, []);

  return wordDB;
}