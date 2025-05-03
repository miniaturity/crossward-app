import './App.css';
import { useState, useEffect } from 'react';
import useWordDB from './WordDB';
import { getSelectorsByUserAgent } from 'react-device-detect';

function App() {
  const db = useWordDB();
  const [selectedWords, setSelectedWords] = useState([]);
  const [board, setBoard] = useState([[]]);
  const [placedWords, setPlacedWords] = useState([]);

  useEffect(() => {
    if (!db) return;
    
    chooseWords();
  }, [db]);
  
  useEffect(() => {
    if (selectedWords.length > 0) {
      const crosswordResult = createCrossword(selectedWords, 14);
      if (crosswordResult) {
        setBoard(crosswordResult.board);
        setPlacedWords(crosswordResult.placedWords);
      }
    }
  }, [selectedWords]);

  const chooseWords = () => {
    if (!db) return;

    let results = [];
    for (let i = 0; i < getRandomIntInclusive(12, 20); i++) {
      const randomLength = getRandomIntInclusive(4, 7);
      const words = db[randomLength];
      
      const randomIndex = Math.floor(Math.random() * words.length);
      const wordObj = words[randomIndex];
      
      results.push(wordObj);
    }

    setSelectedWords(results);
  };

  const handleChangePuzzle = () => {
    chooseWords();
  };

  return (
    <Board 
      board={board} 
      placedWords={placedWords} 
      onChangePuzzle={handleChangePuzzle} 
    />
  );
}


function Landing(ingame) {

}

function Board({ board, placedWords, onChangePuzzle }) {
  const [numberedGrid, setNumberedGrid] = useState([]);
  
  const acrossClues = placedWords
    ? placedWords.filter(word => word.isHorizontal).sort((a, b) => a.clueNumber - b.clueNumber)
    : [];
    
  const downClues = placedWords
    ? placedWords.filter(word => !word.isHorizontal).sort((a, b) => a.clueNumber - b.clueNumber)
    : [];

  useEffect(() => {
    if (!board || board.length === 0 || !placedWords) return;
    
    const numbered = Array(board.length).fill().map(() => Array(board[0].length).fill(null));
    
    for (const { row, col, clueNumber } of placedWords) {
      if (clueNumber) {
        numbered[row][col] = clueNumber;
      }
    }
    
    setNumberedGrid(numbered);
  }, [board, placedWords]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    gameContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    boardAndCluesContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    boardContainer: {
      flexShrink: 0
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
    cellNumber: {
      position: 'absolute',
      top: '2px',
      left: '4px',
      fontSize: '10px'
    },
    cluesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flex: 1,
      minWidth: '300px'
    },
    clueSection: {
      marginBottom: '20px'
    },
    clueHeading: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '5px'
    },
    clueList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0
    },
    clueItem: {
      marginBottom: '8px',
      fontSize: '14px'
    },
    clueNumber: {
      fontWeight: 'bold',
      marginRight: '5px'
    },
    button: {
      padding: '10px 16px',
      backgroundColor: '#4a6ea9',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      alignSelf: 'center',
      marginTop: '10px'
    }
  };

  return (
    <div className="crossword-container">
      <h2 className="crossword-title">CROSSWARD</h2>
      
      <div className="game-container">
        <div className="board-and-clues-container">
          <div className="board-container">
            <div className="board" style={{ gridTemplateRows: `repeat(${board.length}, 1fr)` }}>
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                  {row.map((cell, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`cell ${cell === '-' ? 'cell-black' : 'cell-white'}`}
                    >
                      {cell !== '-' && (
                        <>
                          {numberedGrid[rowIndex] && numberedGrid[rowIndex][colIndex] && (
                            <span className="cell-number">
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
          
          <div className="clues-container">
            {/* Across Clues */}
            <div className="clue-section">
              <h3 className="clue-heading">Across</h3>
              <ul className="clue-list">
                {acrossClues.map((word, index) => (
                  <li key={`across-${index}`} className="clue-item">
                    <span className="clue-number">{word.clueNumber}.</span>
                    {word.clue}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Down Clues */}
            <div className="clue-section">
              <h3 className="clue-heading">Down</h3>
              <ul className="clue-list">
                {downClues.map((word, index) => (
                  <li key={`down-${index}`} className="clue-item">
                    <span className="clue-number">{word.clueNumber}.</span>
                    {word.clue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <button 
          className="crossword-button"
          onClick={onChangePuzzle}
        >
          gen
        </button>
      </div>
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

  const isValidPlacement = (wordObj, row, col, isHorizontal) => {
    const word = wordObj.answer;
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

    const before = isHorizontal ? [row, col - 1] : [row - 1, col];
    const after = isHorizontal ? [row, col + len] : [row + len, col];

    for (const [r, c] of [before, after]) {
      if (
        r >= 0 && r < boardLength &&
        c >= 0 && c < boardLength &&
        board[r][c] !== '-'
      ) return false;
    }

    if (placedWords.length > 0 && !connectsToExisting) return false;

    return true;
  };

  const placeWord = (wordObj, row, col, isHorizontal) => {
    const word = wordObj.answer;
    const positions = [];
    for (let i = 0; i < word.length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (board[r][c] === '-') board[r][c] = word[i];
      positions.push([r, c]);
    }
    
    // Store the word object along with position info
    placedWords.push({ 
      word: wordObj.answer, 
      clue: wordObj.clue,
      row, 
      col, 
      isHorizontal,
      clueNumber: null // Will be filled in later
    });
    
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

    const wordObj = words[index];
    let placed = false;

    for (let r = 0; r < boardLength; r++) {
      for (let c = 0; c < boardLength; c++) {
        for (const isHorizontal of [true, false]) {
          if (isValidPlacement(wordObj, r, c, isHorizontal)) {
            const positions = placeWord(wordObj, r, c, isHorizontal);
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
  words.sort((a, b) => b.answer.length - a.answer.length);

  // Place first word at center horizontally
  const startRow = Math.floor(boardLength / 2);
  const startCol = Math.floor((boardLength - words[0].answer.length) / 2);

  if (!isValidPlacement(words[0], startRow, startCol, true)) return null;
  placeWord(words[0], startRow, startCol, true);

  if (!tryPlaceWords(1)) return null;
  
  // Number the crossword clues
  const cellNumbers = Array(boardLength).fill().map(() => Array(boardLength).fill(null));
  let clueNumber = 1;
  
  // First pass: assign numbers to cells
  for (let row = 0; row < boardLength; row++) {
    for (let col = 0; col < boardLength; col++) {
      if (board[row][col] === '-') continue;
      
      // Check if this cell starts a word
      const startsAcross = (col === 0 || board[row][col-1] === '-') && 
                         col + 1 < boardLength && board[row][col+1] !== '-';
      
      const startsDown = (row === 0 || board[row-1][col] === '-') && 
                       row + 1 < boardLength && board[row+1][col] !== '-';
      
      if (startsAcross || startsDown) {
        cellNumbers[row][col] = clueNumber++;
      }
    }
  }
  
  // Second pass: update placed words with their clue numbers
  for (const wordInfo of placedWords) {
    const { row, col } = wordInfo;
    wordInfo.clueNumber = cellNumbers[row][col];
  }

  return {
    board,
    placedWords
  };
}

export default App;
