import './App.css';
import { useState, useEffect } from 'react';
import { useWordDB } from './WordDB.js'

function WordChooser() {
  const wordDB = useWordDB();
  const [selectedWords, setSelectedWords] = useState([]);

  const chooseWords = () => {
    if (!wordDB) return;

    let results = [];
    for (let i = 0; i < 5; i++) {
      const lengths = Object.keys(wordDB);
      const randomLength = lengths[Math.floor(Math.random() * lengths.length)];
      const words = wordDB[randomLength];
      const word = words[Math.floor(Math.random() * words.length)];
      results.push(word);
    }

    setSelectedWords(results);
  };

  return (
    <div>
      <button onClick={chooseWords}>Choose 5 Words</button>
      <ul>
        {selectedWords.map((word, idx) => (
          <li key={idx}>
            <strong>{word.answer}</strong>: {word.clue}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [inGame, setInGame] = useState(false);

  return (
    <>
      <WordChooser />
    </>
  )
}


function Landing(ingame) {

}

function Board() {
  const words = [];

}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createCrossword(words, boardLength) {
  const board = Array.from({ length: boardLength }, () =>
    Array(boardLength).fill('-')
  );
  const placedWords = [];

  const isValidPlacement = (word, row, col, isHorizontal) => {
    const len = word.length;

    if (
      (isHorizontal && col + len > boardLength) ||
      (!isHorizontal && row + len > boardLength)
    ) return false;

    let connectsToExisting = false;

    for (let i = 0; i < len; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;

      const char = board[r][c];

      if (char !== '-' && char !== word[i]) return false;
      if (char === word[i]) connectsToExisting = true;

      // Disallow adjacent words
      const adjacents = isHorizontal
        ? [[r - 1, c], [r + 1, c]]
        : [[r, c - 1], [r, c + 1]];

      for (const [ar, ac] of adjacents) {
        if (
          ar >= 0 && ar < boardLength &&
          ac >= 0 && ac < boardLength &&
          board[ar][ac] !== '-' &&
          board[r][c] === '-'
        ) return false;
      }
    }

    // Prevent touching at start or end
    const before = isHorizontal ? [row, col - 1] : [row - 1, col];
    const after = isHorizontal ? [row, col + len] : [row + len, col];

    for (const [r, c] of [before, after]) {
      if (
        r >= 0 && r < boardLength &&
        c >= 0 && c < boardLength &&
        board[r][c] !== '-'
      ) return false;
    }

    // If this is not the first word, it must connect
    if (placedWords.length > 0 && !connectsToExisting) return false;

    return true;
  };

  const placeWord = (word, row, col, isHorizontal) => {
    const positions = [];
    for (let i = 0; i < word.length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (board[r][c] === '-') board[r][c] = word[i];
      positions.push([r, c]);
    }
    placedWords.push({ word, row, col, isHorizontal });
    return positions;
  };

  const removeWord = (positions) => {
    for (const [r, c] of positions) {
      let usedElsewhere = false;
      for (const { word, row, col, isHorizontal } of placedWords) {
        for (let i = 0; i < word.length; i++) {
          const rr = isHorizontal ? row : row + i;
          const cc = isHorizontal ? col + i : col;
          if ((rr !== r || cc !== c) && board[rr][cc] === board[r][c]) {
            usedElsewhere = true;
          }
        }
      }
      if (!usedElsewhere) board[r][c] = '-';
    }
    placedWords.pop();
  };

  const tryPlaceWords = (index) => {
    if (index === words.length) return true;

    const word = words[index];
    let placed = false;

    for (let r = 0; r < boardLength; r++) {
      for (let c = 0; c < boardLength; c++) {
        for (const isHorizontal of [true, false]) {
          if (isValidPlacement(word, r, c, isHorizontal)) {
            const positions = placeWord(word, r, c, isHorizontal);
            if (tryPlaceWords(index + 1)) return true;
            removeWord(positions);
            placed = true;
          }
        }
      }
    }

    // Skip unplaceable word
    return tryPlaceWords(index + 1);
  };

  // Sort longest first
  words.sort((a, b) => b.length - a.length);

  // Place first word at center horizontally
  const startRow = Math.floor(boardLength / 2);
  const startCol = Math.floor((boardLength - words[0].length) / 2);

  if (!isValidPlacement(words[0], startRow, startCol, true)) return null;
  placeWord(words[0], startRow, startCol, true);

  if (!tryPlaceWords(1)) return null;

  return board;
}

export default App;
