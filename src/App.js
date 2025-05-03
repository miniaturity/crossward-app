import './App.css';
import { useState, useEffect } from 'react';
import useWordDB from './WordDB';
import { getSelectorsByUserAgent } from 'react-device-detect';

function App() {
  const db = useWordDB();
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectedHints, setSelectedHints] = useState([]);
  const [board, setBoard] = useState([[]]);

  // Use useEffect to run once when component mounts or when db changes
  useEffect(() => {
    if (!db) return;
    
    chooseWords();
    console.log(selectedWords);
  }, [db]);
  
  // Run this effect when selectedWords changes
  useEffect(() => {
    if (selectedWords.length > 0) {
      const newBoard = createCrossword(selectedWords, 14);
      if (newBoard) {
        setBoard(newBoard);
      }
    }
  }, [selectedWords]);

  const chooseWords = () => {
    if (!db) return;
    let hnt = [];
    let wrd = [];
    for (let i = 0; i < getRandomIntInclusive(10, 20); i++) {
      const randomLength = getRandomIntInclusive(4, 7);
      const words = db[randomLength];
      const word = words[Math.floor(Math.random() * words.length)];
      wrd.push(word.answer);
      hnt.push(word.clue);
    }

    setSelectedWords(wrd);
    setSelectedHints(hnt);
  };

  const handleChangePuzzle = () => {
    chooseWords();
  };

  return (
    <>
      <Board board={board} clues={selectedHints} onChangePuzzle={handleChangePuzzle} />
    </>
  );
}


function Landing(ingame) {

}

function Board({ board, onChangePuzzle, clues }) {
  const [numberedGrid, setNumberedGrid] = useState([]);

  const isStartOfWord = (row, col) => {
    if (board[row][col] === '-') return false;
    
    // Start of across word if: leftmost cell or left cell is black
    const startsAcross = col === 0 || board[row][col-1] === '-';
    
    // Start of down word if: topmost cell or cell above is black
    const startsDown = row === 0 || board[row-1][col] === '-';
    
    // Check if this cell starts either an across or down word
    return startsAcross && board[row][col+1] !== undefined && board[row][col+1] !== '-' ||
           startsDown && board[row+1] !== undefined && board[row+1][col] !== '-';
  };

  // Generate numbers for the crossword
  useEffect(() => {
    const numbered = Array(board.length).fill().map(() => Array(board[0].length).fill(null));
    let clueNumber = 1;
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (isStartOfWord(row, col)) {
          numbered[row][col] = clueNumber++;
        }
      }
    }
    
    setNumberedGrid(numbered);
  }, [board]);


  // Inline CSS for the component
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    boardContainer: {
      marginBottom: '24px'
    },
    board: {
      display: 'grid',
      gridTemplateRows: `repeat(${board.length}, 1fr)`,
      border: '2px solid #333'
    },
    row: {
      display: 'flex'
    },
    cell: {
      position: 'relative',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #aaa',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    blackCell: {
      backgroundColor: '#000'
    },
    whiteCell: {
      backgroundColor: '#fff'
    },
    clueNumber: {
      position: 'absolute',
      top: '2px',
      left: '4px',
      fontSize: '10px'
    },
    button: {
      padding: '10px 16px',
      backgroundColor: '#4a6ea9',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.boardContainer}>
        <div style={styles.board}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  style={{
                    ...styles.cell,
                    ...(cell === '-' ? styles.blackCell : styles.whiteCell)
                  }}
                >
                  {cell !== '-' && (
                    <>
                      {numberedGrid[rowIndex] && numberedGrid[rowIndex][colIndex] && (
                        <span style={styles.clueNumber}>
                          {numberedGrid[rowIndex][colIndex]}
                        </span>
                      )}
                      <span>
                        {cell}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        {clues.map(clue => (clue))}
      </div>
      
      <button 
        style={styles.button}
        onClick={onChangePuzzle}
      >
        Change Puzzle
      </button>
    </div>
  );
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
