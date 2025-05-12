import './App.css';
import { useState, useEffect, useRef } from 'react';
import useWordDB from './WordDB';
import { ITEMS } from './items';

function App() {
  const db = useWordDB();
  const [selectedWords, setSelectedWords] = useState([]);
  const [board, setBoard] = useState([[]]);
  const [placedWords, setPlacedWords] = useState([]);
  
  const [selectedCell, setSelectedCell] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState('across');
  const [currentClue, setCurrentClue] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  
  const [userBoard, setUserBoard] = useState([]);
  const [incorrectCells, setIncorrectCells] = useState([]);
  const [correctCells, setCorrectCells] = useState([]);
  const [inGame, setInGame] = useState(false);

  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0.0);
  const [inventory, setInventory] = useState([]);

  const [inShop, setInShop] = useState(false);
  const [shopkeeperDialogue, setShopkeeperDialogue] = useState("Pssst...");


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
         
        const newUserBoard = crosswordResult.board.map(row => 
          row.map(cell => cell === '-' ? '-' : '')
        );
        setUserBoard(newUserBoard);
      }
    }
  }, [selectedWords]);

  useEffect(() => {
    if (selectedCell.length === 0 || !placedWords.length) return;
    
    const [row, col] = selectedCell;
    const word = findWordAtPosition(row, col, selectedDirection);
    
    if (word) {
      const directionSymbol = word.isHorizontal ? 'A' : 'D';
      setCurrentClue(`${word.clueNumber}${directionSymbol}. ${word.clue}`);
      setCurrentWord(word.word);
    }
  }, [selectedCell, selectedDirection, placedWords]);

  const newGame = () => {
    setInGame(true);
  };

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
    setSelectedCell([]);
    setCurrentClue('');
    setIncorrectCells([]);
    setCorrectCells([]);
  };
  
  const handleCheckPuzzle = () => {
    const newIncorrectCells = [];
    const newCorrectCells = [];
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === '-') continue;
        
        if (userBoard[row][col]) {
          if (userBoard[row][col] !== board[row][col]) {
            newIncorrectCells.push([row, col]);
          } else {
            newCorrectCells.push([row, col]);
          }
        }
      }
    }
    
    setIncorrectCells(newIncorrectCells);
    setCorrectCells(newCorrectCells);
  };

  const handleCheckWord = () => {
    if (selectedCell.length === 0) return;
  
    const [row, col] = selectedCell;
    const currentWord = findWordAtPosition(row, col, selectedDirection);
    
    if (!currentWord) return;
    
    const newIncorrectCells = [...incorrectCells];
    const newCorrectCells = [...correctCells];
    let allCellsCorrect = true;
    
    for (let i = 0; i < currentWord.word.length; i++) {
      const letterRow = currentWord.isHorizontal ? currentWord.row : currentWord.row + i;
      const letterCol = currentWord.isHorizontal ? currentWord.col + i : currentWord.col;
      
      if (!userBoard[letterRow][letterCol]) {
        allCellsCorrect = false;
        continue;
      }
      
      if (userBoard[letterRow][letterCol] !== board[letterRow][letterCol]) {
        allCellsCorrect = false;
        
        if (!newIncorrectCells.some(([r, c]) => r === letterRow && c === letterCol)) {
          newIncorrectCells.push([letterRow, letterCol]);
        }
        
        const correctCellIndex = newCorrectCells.findIndex(([r, c]) => r === letterRow && c === letterCol);
        if (correctCellIndex !== -1) {
          newCorrectCells.splice(correctCellIndex, 1);
        }
      } else {
        const cellIndex = newIncorrectCells.findIndex(([r, c]) => r === letterRow && c === letterCol);
        if (cellIndex !== -1) {
          newIncorrectCells.splice(cellIndex, 1);
        }
        
        if (!newCorrectCells.some(([r, c]) => r === letterRow && c === letterCol)) {
          newCorrectCells.push([letterRow, letterCol]);
        }
      }
    }
    
    setIncorrectCells(newIncorrectCells);
    setCorrectCells(newCorrectCells);
    
    if (allCellsCorrect && currentWord) {
      setPoints(prev => prev + currentWord.word.length);
    }
  };
  
  const handleSolvePuzzle = () => {
    const solvedBoard = board.map(row => [...row]);
    setUserBoard(solvedBoard);
    setIncorrectCells([]);
  };

  const findWordAtPosition = (row, col, direction) => {
    const isHorizontal = direction === 'across';
    
    return placedWords.find(word => {
      if (word.isHorizontal !== isHorizontal) return false;
      
      const wordLength = word.word.length;
      const startRow = word.row;
      const startCol = word.col;
      
      if (isHorizontal) {
        return row === startRow && col >= startCol && col < startCol + wordLength;
      } else {
        return col === startCol && row >= startRow && row < startRow + wordLength;
      }
    });
  };

  const findNextWord = (currentWord) => {
    if (!currentWord) return null;
    
    const sortedWords = [...placedWords].sort((a, b) => {
      if (a.clueNumber === b.clueNumber) {
        return a.isHorizontal ? -1 : 1;
      }
      return a.clueNumber - b.clueNumber;
    });
    
    const currentIndex = sortedWords.findIndex(w => 
      w.clueNumber === currentWord.clueNumber && w.isHorizontal === currentWord.isHorizontal
    );
    
    if (currentIndex !== -1 && currentIndex < sortedWords.length - 1) {
      return sortedWords[currentIndex + 1];
    }
    
    return sortedWords[0]; 
  };

  return (
    <div className="page">
      <div className="left">
        <LeftMenu onNewGame={newGame} />
      </div>

      <div className="top-clue">
              {currentClue}
      </div>
      
      <MidSection 
        inGame={inGame}
        inShop={inShop}
        setInShop={setInShop}
        currentClue={currentClue}
        handleCheckWord={handleCheckWord}
        board={board}
        userBoard={userBoard}
        setUserBoard={setUserBoard}
        placedWords={placedWords}
        handleChangePuzzle={handleChangePuzzle}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        selectedDirection={selectedDirection}
        setSelectedDirection={setSelectedDirection}
        findWordAtPosition={findWordAtPosition}
        findNextWord={findNextWord}
        incorrectCells={incorrectCells}
        correctCells={correctCells}
        setIncorrectCells={setIncorrectCells}
        handleCheckPuzzle={handleCheckPuzzle}
        handleSolvePuzzle={handleSolvePuzzle}
        points={points}
        balance={balance}
        inventory={inventory}
        shopkeeperDialogue={shopkeeperDialogue}
        setShopkeeperDialogue={setShopkeeperDialogue}
        Shop={Shop}
        Board={Board}
      />
      
      <div className="right">
        <RightMenu />
      </div>
    </div>
  );
}

const MidSection = ({ 
  inGame, 
  inShop, 
  currentClue, 
  handleCheckWord, 
  setInShop, 
  board, 
  userBoard, 
  setUserBoard, 
  placedWords,
  handleChangePuzzle,
  selectedCell, 
  setSelectedCell, 
  selectedDirection, 
  setSelectedDirection,
  findWordAtPosition, 
  findNextWord, 
  incorrectCells, 
  correctCells, 
  setIncorrectCells,
  handleCheckPuzzle, 
  handleSolvePuzzle, 
  points, 
  balance,
  inventory,
  shopkeeperDialogue,
  setShopkeeperDialogue,
  Shop,
  Board
}) => {
  return (
    <div className="mid rainbow-container">
      <div className="rainbow-background"></div>
      {inGame === false && (
        <div className="intro-overlay">
          <h1 className="game-title">CROSSWARD</h1>
        </div>
      )}
      
      {!inShop ? (
        <>
          <div className="mid-left">
            <div className="actions text-3d-left">

                <h1 className="actions-title">
                  ACTIONS
                </h1>

                <button 
                  className="crossword-button"
                  onClick={() => {setInShop(true)}}
                > 
                  Shop 
                </button>
                <button 
                  className="crossword-button"
                  onClick={handleCheckWord}
                  disabled={selectedCell.length === 0}
                >
                  Check Word
                </button>
                <button 
                  className="crossword-button"
                  onClick={handleCheckPuzzle}
                >
                  Check Puzzle
                </button>
                <button 
                  className="crossword-button"
                  onClick={handleSolvePuzzle}
                >
                  Solve Puzzle
                </button>
            </div>
          </div>
          
          <div className="mid-center">
            <Board 
              board={board} 
              userBoard={userBoard}
              setUserBoard={setUserBoard}
              placedWords={placedWords} 
              onChangePuzzle={handleChangePuzzle}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              selectedDirection={selectedDirection}
              setSelectedDirection={setSelectedDirection}
              findWordAtPosition={findWordAtPosition}
              findNextWord={findNextWord}
              incorrectCells={incorrectCells}
              correctCells={correctCells}
              setIncorrectCells={setIncorrectCells}
              onCheckPuzzle={handleCheckPuzzle}
              onCheckWord={handleCheckWord}
              onSolvePuzzle={handleSolvePuzzle}
              inGame={inGame}
            />
          </div>
          
          <div className="mid-right text-3d-right">
            <div className="points-display">
              {points} PTS
            </div>
            <div className="balance-display">
              ${balance}
            </div>
          </div>
        </>
      ) : (
        <Shop 
          inventory={inventory}
          balance={balance}
          shopkeeperDialogue={shopkeeperDialogue}
          setShopkeeperDialogue={setShopkeeperDialogue}
        />
      )}
    </div>
  );
};

function LeftMenu({ onNewGame }) {
  const [visibleButtons, setVisibleButtons] = useState(0);
  
  useEffect(() => {
    
    let buttonCount = 0;
    const menuButtons = ["New Game", "Settings", "Credits"];
    
    const interval = setInterval(() => {
      buttonCount++;
      setVisibleButtons(buttonCount);
      
      if (buttonCount >= menuButtons.length) {
        clearInterval(interval);
      }
    }, 200); 
    
    return () => clearInterval(interval);
  }, []);

  const menuButtons = [
    { name: "New Game", action: onNewGame },
    { name: "Settings", action: () => {} },
    { name: "Credits", action: () => {} }
  ];
  
  return (
    <div className="left-menu">
      <div className="menu-buttons">
        {menuButtons.map((button, index) => (
          <button 
            key={button.name}
            className={`menu-button ${index < visibleButtons ? 'visible' : ''}`} 
            onClick={button.action}
          >
            {button.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function RightMenu() {
  return (
    <div className="right-menu">
      <div className="menu-section">
        <h2 className="section-title">ITEMS</h2>
        <div className="section-content">
        </div>
      </div>
      <div className="menu-section">
        <h2 className="section-title">MODIFIERS</h2>
        <div className="section-content">
        </div>
      </div>
    </div>
  );
}

const BuyItem = ({ item, inv, bal }) => {  
  const canBuy = bal >= item.price;

  return (
    <div className="shop-item">
      {item.img && <img src={item.img} alt={item.name} className="shop-item-image" />}
      <h3 className="shop-item-name">{item.name}</h3>
      <p className="shop-item-price">${item.cost}</p>
      <button 
        className="buy-button" 
        disabled={!canBuy}
        onClick={() => {inv.push(item.content)}}
      >
        Buy
      </button>
    </div>
  );
}

const Shop = ({ inventory, balance, shopkeeperDialogue, setShopkeeperDialogue }) => {

  const dialogues = [
    "HRT? Havent heard that name in a long time...",
    "Hi -__-",
    "buy something.."
  ];

  const poorDialogues = [
    "you're broke :I",

  ]

  const shopItems = [...ITEMS];

  const topShelfItems = shopItems.slice(0, Math.ceil(shopItems.length / 2));
  const bottomShelfItems = shopItems.slice(Math.ceil(shopItems.length / 2));
  
  const changeDialogue = () => {
    const randomIndex = Math.floor(Math.random() * dialogues.length);
    setShopkeeperDialogue(dialogues[randomIndex]);
  };
  
  return (
    <div className="shop-container">
      <div className="shop-interior">
        <div className="shop-shelf top-shelf">
          {topShelfItems.map((item, index) => (
            <BuyItem 
              key={index}
              item={item}
              inv={inventory}
              bal={balance}
            />
          ))}
        </div>
        
        <div className="shop-shelf bottom-shelf">
          {bottomShelfItems.map((item, index) => (
            <BuyItem 
              key={index}
              item={item}
              inv={inventory}
              bal={balance}
            />
          ))}
        </div>
        
        <div className="shop-counter">
          <div className="counter-top"></div>
          <div className="counter-front"></div>
        </div>
        
        <div className="shop-keeper-section">
          <div 
            className="shop-keeper-jovial-merriment"
            onClick={changeDialogue}
          >
            <img src="assets/jovial.png" alt="Shopkeeper" />
          </div>
          <div className="shop-keeper-dialogue">
            {shopkeeperDialogue}
          </div>
        </div>
      </div>
    </div>
  );
};


function Board({ 
  board, 
  userBoard,
  setUserBoard,
  placedWords, 
  onChangePuzzle,
  selectedCell,
  setSelectedCell,
  selectedDirection,
  setSelectedDirection,
  findWordAtPosition,
  findNextWord,
  incorrectCells,
  setIncorrectCells,
  onCheckPuzzle,
  onCheckWord,
  onSolvePuzzle,
  inGame,
  correctCells
}) {
  const [numberedGrid, setNumberedGrid] = useState([]);
  const boardRef = useRef(null);
  
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedCell.length === 0) return;
      
      const [row, col] = selectedCell;
      
      if (e.key === 'ArrowUp') {
        moveToCell(row - 1, col);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        moveToCell(row + 1, col);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        moveToCell(row, col - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        moveToCell(row, col + 1);
        e.preventDefault();
      } 
      else if (e.key === 'Backspace') {
        if (correctCells.includes([row, col])) return;
        if (userBoard[row][col]) {
          const newUserBoard = [...userBoard];
          newUserBoard[row][col] = '';
          setUserBoard(newUserBoard);
          
          if (incorrectCells.some(([r, c]) => r === row && c === col)) {
            const newIncorrectCells = incorrectCells.filter(([r, c]) => !(r === row && c === col));
            setIncorrectCells(newIncorrectCells);
          }
        } else {
          const prevCell = getAdjacentCell(row, col, selectedDirection, -1);
          if (prevCell) {
            const [prevRow, prevCol] = prevCell;
            const newUserBoard = [...userBoard];
            newUserBoard[prevRow][prevCol] = '';
            setUserBoard(newUserBoard);
            
            if (incorrectCells.some(([r, c]) => r === prevRow && c === prevCol)) {
              const newIncorrectCells = incorrectCells.filter(([r, c]) => !(r === prevRow && c === prevCol));
              setIncorrectCells(newIncorrectCells);
            }
            
            setSelectedCell([prevRow, prevCol]);
          }
        }
        e.preventDefault();
      }
      else if (e.key === ' ') {
        setSelectedDirection(selectedDirection === 'across' ? 'down' : 'across');
        e.preventDefault();
      }
      else if (/^[a-zA-Z]$/.test(e.key)) {
        const letter = e.key.toUpperCase();
        
        const newUserBoard = [...userBoard];
        newUserBoard[row][col] = letter;
        setUserBoard(newUserBoard);
        
        if (incorrectCells.some(([r, c]) => r === row && c === col)) {
          const newIncorrectCells = incorrectCells.filter(([r, c]) => !(r === row && c === col));
          setIncorrectCells(newIncorrectCells);
        }
        
        const nextCell = getAdjacentCell(row, col, selectedDirection, 1);
        if (nextCell) {
          setSelectedCell(nextCell);
        } else {
          const currentWord = findWordAtPosition(row, col, selectedDirection);
          if (currentWord) {
            const nextWord = findNextWord(currentWord);
            if (nextWord) {
              setSelectedCell([nextWord.row, nextWord.col]);
              setSelectedDirection(nextWord.isHorizontal ? 'across' : 'down');
            }
          }
        }
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, selectedDirection, userBoard, board, findWordAtPosition, findNextWord, incorrectCells]);

  const getAdjacentCell = (row, col, direction, step) => {
    const isHorizontal = direction === 'across';
    let nextRow = isHorizontal ? row : row + step;
    let nextCol = isHorizontal ? col + step : col;
    
    if (
      nextRow >= 0 && nextRow < board.length &&
      nextCol >= 0 && nextCol < board[0].length &&
      board[nextRow][nextCol] !== '-'
    ) {
      return [nextRow, nextCol];
    }
    
    return null;
  };

  const moveToCell = (row, col) => {
    if (
      row >= 0 && row < board.length &&
      col >= 0 && col < board[0].length &&
      board[row][col] !== '-'
    ) {
      setSelectedCell([row, col]);
    }
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] === '-') return;
    
    if (selectedCell.length > 0 && selectedCell[0] === row && selectedCell[1] === col) {
      setSelectedDirection(selectedDirection === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell([row, col]);
    }
  };

  return (
    <div className="crossword-container">
      <div className="game-container">
        <div className="button-container" style={{ marginBottom: '10px' }}>
        </div>
        <div ref={boardRef} className="board-container">
          <div className="board" style={{ gridTemplateRows: `repeat(${board.length}, 1fr)` }}>
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => {
                  const isSelected = selectedCell.length > 0 && 
                                    selectedCell[0] === rowIndex && 
                                    selectedCell[1] === colIndex;
                  
                  let isPartOfSelectedWord = false;
                  if (selectedCell.length > 0) {
                    const currentWord = findWordAtPosition(selectedCell[0], selectedCell[1], selectedDirection);
                    if (currentWord) {
                      if (currentWord.isHorizontal) {
                        isPartOfSelectedWord = rowIndex === currentWord.row && 
                          colIndex >= currentWord.col && 
                          colIndex < currentWord.col + currentWord.word.length;
                      } else {
                        isPartOfSelectedWord = colIndex === currentWord.col && 
                          rowIndex >= currentWord.row && 
                          rowIndex < currentWord.row + currentWord.word.length;
                      }
                    }
                  }
                  
                  return (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`cell ${cell === '-' ? 'cell-black' : 'cell-white'} 
                                ${isSelected ? 'selected-cell' : ''} 
                                ${isPartOfSelectedWord ? 'part-of-word' : ''}
                                ${incorrectCells.some(([r, c]) => r === rowIndex && c === colIndex) ? 'incorrect-cell' : ''}
                                ${correctCells.some(([r, c]) => r === rowIndex && c === colIndex) ? 'correct-cell' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell !== '-' && (
                        <>
                          {numberedGrid[rowIndex] && numberedGrid[rowIndex][colIndex] && (
                            <span className="cell-number">
                              {numberedGrid[rowIndex][colIndex]}
                            </span>
                          )}
                          <span className="cell-letter">
                            {userBoard[rowIndex] && userBoard[rowIndex][colIndex]}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
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
    
    placedWords.push({ 
      word: wordObj.answer, 
      clue: wordObj.clue,
      row, 
      col, 
      isHorizontal,
      clueNumber: null 
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

    return tryPlaceWords(index + 1);
  };

  words.sort((a, b) => b.answer.length - a.answer.length);

  const startRow = Math.floor(boardLength / 2);
  const startCol = Math.floor((boardLength - words[0].answer.length) / 2);

  if (!isValidPlacement(words[0], startRow, startCol, true)) return null;
  placeWord(words[0], startRow, startCol, true);

  if (!tryPlaceWords(1)) return null;
  
  const cellNumbers = Array(boardLength).fill().map(() => Array(boardLength).fill(null));
  let clueNumber = 1;
  
  for (let row = 0; row < boardLength; row++) {
    for (let col = 0; col < boardLength; col++) {
      if (board[row][col] === '-') continue;
      
      const startsAcross = (col === 0 || board[row][col-1] === '-') && 
        col + 1 < boardLength && board[row][col+1] !== '-';
      
      const startsDown = (row === 0 || board[row-1][col] === '-') && 
       row + 1 < boardLength && board[row+1][col] !== '-';
      
      if (startsAcross || startsDown) {
        cellNumbers[row][col] = clueNumber++;
      }
    }
  }
  
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