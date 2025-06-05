import './App.css';
import { useState, useEffect, useRef, memo, Fragment } from 'react';
import useWordDB from './WordDB';
import { ITEMS } from './items';

function App() {
  const db = useWordDB();
  const [selectedWords, setSelectedWords] = useState([]);
  const [board, setBoard] = useState([[]]);
  const [placedWords, setPlacedWords] = useState([]);
  const [startTime, setStartTime] = useState(45);
  
  const [selectedCell, setSelectedCell] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState('across');
  const [currentClue, setCurrentClue] = useState('HINT');
  const [currentWordState, setCurrentWordState] = useState('');
  
  const [userBoard, setUserBoard] = useState([[]]);
  const [incorrectCells, setIncorrectCells] = useState([]);
  const [correctCells, setCorrectCells] = useState([]);
  const [inGame, setInGame] = useState(false);

  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(999);
  const [inventory, setInventory] = useState([]);

  const [inShop, setInShop] = useState(false);
  const [time, setTime] = useState(startTime); // seconds (30 def)
  const [mult, setMult] = useState(1);

  const [modifiers, setModifiers] = useState([]);
  const [reward, setReward] = useState(10);

  const [rewardChance, setRewardChance] = useState(7); // 3/10 chance (10 - 7)
  const [streak, setStreak] = useState(0);
  const [streakCol, setStreakCol] = useState("");

  const [streakMult, setStreakMult] = useState(1.0);
  const [correctWords, setCorrectWords] = useState([]);
  const [dialogue, setDialogue] = useState("");
  
  const [dialogueImg, setDialogueImg] = useState("assets/jovial.png");
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [wordsSolved, setWordsSolved] = useState(0);

  const [dialogueID, setDialogueID] = useState(0);
  const [boardCount, setBoardCount] = useState(0);
  const boardReff = useRef(board);

  const [initReset, setInitReset] = useState(false);
  const [shopCycle, setShopCycle] = useState([0, 0, 0, 0, 0]);
  const [shopList, setShopList] = useState([]);

  const [currDialogue, setCurrDialogue] = useState("");
  const [dialogueVisible, setDialogueVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const correctWordsRef = useRef(correctWords);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    boardReff.current = board;
  }, [board]);

  useEffect(() => {
    correctWordsRef.current = correctWords
  }, [correctWords])

  useEffect(() => {
    if (streak !== 0) {
      setAnimationKey(prev => prev + 1); 
    }
  }, [streak]);


  useEffect(() => {
    setStreakCol(streak >= 50 ? "streak-50" : streak >= 15 ? "streak-15" : streak >= 5 ? "streak-5" : "");
    setStreakMult(streak >= 50 ? 1.5 : streak >= 15 ? 1.2 : streak >= 5 ? 1.1 : 1)
    setReward(10);
    setRewardChance(7);
  }, [streak])


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
      setCurrentWordState(word.word);
    }
  }, [selectedCell, selectedDirection, placedWords]);

  const clearModTypes = (names) => {
    names.forEach(name => {
      setModifiers(modifiers.filter(mod => mod.name === name))
    });
  } 

  const newGame = () => {
    setInGame(true);

    if (time <= 0) {
      return;
    }

    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setTimeElapsed(prev => prev + 1);
        setTime((prevSeconds) => {
          if (prevSeconds <= 0 && !inShop) {
            handleChangePuzzle();
            if (correctWordsRef.current.length === 0) {
              console.log(correctWords);
              setStreak(0); 
              setMult(1);
            }
            return startTime;
          }
          return prevSeconds > 0 ? prevSeconds - 1 : prevSeconds;
        });
    }
    }, 1000);
  };

  const pause = () => {
    setPaused(prev => {
      return !prev
    });
  }

  const chooseWords = () => {
    if (!db) return;

    let results = [];
    for (let i = 0; i < getRandomIntInclusive(12, 20); i++) {
      const randomLength = getRandomIntInclusive(4, 7);
      const words = db[randomLength];
      
      const randomIndex = Math.floor(Math.random() * words.length);
      const wordObj = words[randomIndex];

      if (results.includes(wordObj)) continue;
      
      results.push(wordObj);
    }

    setSelectedWords(results);
  };

  const handleChangePuzzle = () => {
    setTime(startTime);
    chooseWords();
    setSelectedCell([]);
    setCurrentClue('HINT');
    setIncorrectCells([]);
    setCorrectCells([]);
    setCorrectWords([]);
    setModifiers(prev => prev.filter(mod => mod.clear === false));
    setBoardCount(prev => prev + 1);
    console.log("Changing")
  };
  
const handleCheckPuzzle = (x, customUserBoard = null) => {
    const currentUserBoard = customUserBoard || userBoard;
    const newIncorrectCells = []; 
    const newCorrectCells = [];
    const newCorrectWords = [...correctWords];
    let totalNewWords = 0;
    let totalNewPoints = 0;
    let totalNewBalance = 0;
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col] === '-') continue;
        
        if (currentUserBoard[row][col]) {
          if (currentUserBoard[row][col] !== board[row][col]) {
            newIncorrectCells.push([row, col]);
          } else {
            newCorrectCells.push([row, col]);
          }
        }
      }
    }
    
    // Check each word for completion and rewards
    for (const word of placedWords) {
      if (correctWords.includes(word.word)) continue; // Skip already completed words
      
      let wordComplete = true;
      
      for (let i = 0; i < word.word.length; i++) {
        const letterRow = word.isHorizontal ? word.row : word.row + i;
        const letterCol = word.isHorizontal ? word.col + i : word.col;
        
        if (!currentUserBoard[letterRow][letterCol] || 
            currentUserBoard[letterRow][letterCol] !== board[letterRow][letterCol]) {
          wordComplete = false;
          break;
        }
      }
      
      if (wordComplete) {
        newCorrectWords.push(word.word);
        totalNewWords++;
        
        const giveReward = getRandomIntInclusive(1, 10);
        
        if (giveReward > rewardChance) {
          totalNewBalance += reward;
        }
        
        totalNewPoints += Math.ceil((word.word.length * streakMult) * mult);
      } else if (!wordComplete) {
        setStreak(0);
      }
    }
    
    if (x) { 
      setIncorrectCells(newIncorrectCells);
      setCorrectCells(newCorrectCells); 
      
      if (totalNewWords > 0) {
        clearModTypes(["▲ reward", "▲ reward chance"]);
        setWordsSolved(prev => prev + totalNewWords);
        setPoints(prev => prev + totalNewPoints);
        setBalance(prev => prev + totalNewBalance);
        setStreak(prev => prev + totalNewWords);
        setCorrectWords(newCorrectWords);
      }
    }

    if (newCorrectWords.length === placedWords.length) {
      if (x) {
        setPoints(prev => prev + (Math.ceil(((20 * newCorrectWords.length) * streakMult) * mult)));
        setBalance(prev => prev + (reward * mult));
        setPuzzlesSolved(prev => prev + 1);
        handleChangePuzzle();
      }
      return true;
    }
    return false;
};

const handleCheckWord = () => {
    if (selectedCell.length === 0) return;

    const giveReward = getRandomIntInclusive(1, 10);
  
    const [row, col] = selectedCell;
    const currentWord = findWordAtPosition(row, col, selectedDirection);
    
    if (!currentWord || correctWords.includes(currentWord)) return;
    
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
    clearModTypes(["▲ reward", "▲ reward chance"])
    
    
    if (allCellsCorrect && currentWord && !correctWords.includes(currentWord.word)) {
      const newCorrectWords = [...correctWords];
      newCorrectWords.push(currentWord.word);
      setWordsSolved(prev => prev + 1);
      if (giveReward > rewardChance) {
        setBalance(prev => prev + reward)
      }
      setPoints(prev => prev + (Math.ceil((currentWord.word.length * streakMult) * mult)));
      setStreak(prev => prev + 1);
      setCorrectWords(newCorrectWords);
      if (handleCheckPuzzle(false)) {
        setPoints(prev => prev + (Math.ceil(((20 * newCorrectWords.length) * streakMult) * mult)));
        setBalance(prev => prev + (reward * mult));
        setPuzzlesSolved(prev => prev + 1)
        handleChangePuzzle();
      }
    } else if (!allCellsCorrect) {
      setStreak(0);
    }
};


  
  const handleSolvePuzzle = () => {
    const solvedBoard = board.map(row => [...row]);

    setUserBoard(solvedBoard);

    let sum = 0;
    for (let i = 0; i < placedWords.length; i++)
      sum += placedWords[i].word.length;

    setPoints(prev => prev + (Math.ceil((sum * streakMult) * mult)));
    setStreak(prev => prev + 1)
    setPuzzlesSolved(prev => prev + 1);
    setCorrectWords(placedWords);
    handleCheckPuzzle(true, solvedBoard);
    setIncorrectCells([]);
    setTimeout(() => handleChangePuzzle(), 1000);
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

  function findWord(targetWord, board, placedWords) {
    const normalizedTargetWord = targetWord.toUpperCase();
    
    const matchingPlacedWords = placedWords.filter(wordObj => {
      return wordObj.word && wordObj.word.toUpperCase() === normalizedTargetWord;
    });
    

    if (matchingPlacedWords.length === 0) {
      console.warn(`Warning: Word "${targetWord}" not found in placed words.`);
      return [];
    }
    
    const allPositions = [];
    
    for (const placedWord of matchingPlacedWords) {
      const { row, col, isHorizontal, word } = placedWord;
      
      const positions = [];
      for (let i = 0; i < word.length; i++) {
        if (isHorizontal) {
          positions.push([row, col + i]);
        } else {
          positions.push([row + i, col]);
        }
      }
      
      const isValid = positions.every(([r, c], index) => {
        return r >= 0 && r < board.length && 
              c >= 0 && c < board[0].length && 
              board[r][c] !== '-' && 
              (board[r][c] === word[index] || !board[r][c]); 
      });
      
      if (isValid) {
        allPositions.push(positions);
      }
    }
    
    return allPositions.length > 0 ? allPositions[0] : [];
  }

  

    const setters = {
    setPoints,
    setBalance,
    setInventory,
    setInShop,
    setTime,
    setMult,
    setModifiers,
    setReward,
    setRewardChance,
    setStreak,
    setDialogue,
    handleSolvePuzzle,
    setDialogueID,
    setDialogueVisible,
    currentWordState,
    setStartTime,
  }

  return (
    <div className="page">
      <div className="left">
        <LeftMenu onNewGame={newGame} inGame={inGame} pause={pause} paused={paused} />
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
        setBalance={setBalance}
        inventory={inventory}
        setInventory={setInventory}
        Shop={Shop}
        Board={Board}
        timer={time}
        multiplier={mult}
        setTime={setTime}
        setMult={setMult}
        streak={streak}
        setStreak={setStreak}
        streakCol={streakCol}
        streakMult={streakMult}
        dialogue={dialogue}
        setDialogue={setDialogue}
        wordsSolved={wordsSolved}
        puzzlesSolved={puzzlesSolved}
        dialogueID={dialogueID}
        dialogueImg={dialogueImg}
        initReset={initReset}
        setInitReset={setInitReset}
        shopCycle={shopCycle}
        setShopCycle={setShopCycle}
        shopList={shopList}
        setShopList={setShopList}
        currDialogue={currDialogue}
        setCurrDialogue={setCurrDialogue}
        dialogueVisible={dialogueVisible}
        setDialogueVisible={setDialogueVisible}
        animationKey={animationKey}
        paused={paused}
        timeElapsed={timeElapsed}
        setters={setters}
        boardCount={boardCount}
      />
      
      <div className="right">
        <RightMenu 
          inventory={inventory}
          setInventory={setInventory}
          setters={setters}
          modifiers={modifiers}
          setModifiers={setModifiers}
          boardReff={boardReff}
        />
      </div>
    </div>
  );
}

function DialogueBox({ dialogue, img, dialogueID, currDialogue, setCurrDialogue, dialogueVisible, setDialogueVisible }) {
  const timeoutId = useRef(null);

   useEffect(() => {
    setCurrDialogue("");

    if (!dialogue || dialogue.length === 0) {
      return;
    }

    let index = 0;
    const typewriterInterval = setInterval(() => {
      setCurrDialogue(dialogue.slice(0, index + 1));
      index++;
      
      if (index >= dialogue.length) {
        timeoutId.current = setTimeout(() => {
          setCurrDialogue("");
          setDialogueVisible(false);
        }, 2000);
        clearInterval(typewriterInterval);
      }
    }, 10); 



    return () => {
      clearInterval(typewriterInterval); 
      clearTimeout(timeoutId.current);
    }
  }, [dialogueID]);

  return (
    <>
      {dialogueVisible && dialogue !== "" ? <div className="dialogue">
        <img src={img} alt="na"/>
        <p>{currDialogue}</p>
      </div> : <div className="dialogue hidden"> asd </div>}
    </>
  )
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
  setBalance,
  inventory,
  Shop,
  Board,
  timer,
  setTime,
  multiplier,
  setMult,
  setInventory,
  streak,
  setStreak,
  streakCol,
  streakMult,
  dialogue,
  setDialogue,
  wordsSolved,
  puzzlesSolved,
  dialogueImg,
  dialogueID,
  initReset,
  setInitReset,
  shopCycle,
  setShopCycle,
  shopList,
  setShopList,
  currDialogue,
  setCurrDialogue,
  dialogueVisible,
  setDialogueVisible,
  animationKey,
  paused,
  timeElapsed,
  setters,
  boardCount
}) => {

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div className="mid rainbow-container">
      <div className="rainbow-background"></div>

        {paused && (
          <div className="pause-window">
            <p>CROSSWARD (paused) <br /> Time Elapsed: {formatTime(timeElapsed)} <br /> Total Boards Played: {boardCount}</p>
          </div>
        )}
      
      {inGame === false && (
        <div className="intro-overlay">
          <h1 className="game-title">CROSSWARD</h1>
        </div>
      )}

      
        <>
          <div className="mid-left" style={{
            display: `${inShop ? "none" : ""}`
          }}>
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
                  disabled={selectedCell.length <= 1}
                >
                  Check Word
                </button>
                <button 
                  className="crossword-button"
                  onClick={() => handleCheckPuzzle(true)}
                >
                  Check Puzzle
                </button>

            </div>
          </div>
          
          <div className="mid-center" style={{
            display: `${inShop ? "none" : ""}`
          }}>
            <div className={`timer-${timer > 5 ? "" : "low"}`}>
              {formatTime(timer)}
            </div>
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
            <DialogueBox 
              dialogue={dialogue}
              img={dialogueImg}
              dialogueID={dialogueID}
              currDialogue={currDialogue}
              setCurrDialogue={setCurrDialogue}
              dialogueVisible={dialogueVisible}
              setDialogueVisible={setDialogueVisible}
            />
          </div>

          
          <div className="mid-right text-3d-right" style={{
            display: `${inShop ? "none" : ""}`
          }}>
            <h1 className="display-title">
              STATS
            </h1>
            <div className="points-display">
              {points} PTS ({multiplier}x)
            </div>
            <div className={`streak-display ${streak !== 0 ? 'streak-update' : ''} ${streakCol}`}
              style={{
                  color: {streakCol}
              }}
              key={animationKey}
            >
                {streak} STREAK ({streakMult}x)
            </div>
            <div className="points-display">
              {wordsSolved} Words Solved
            </div>
            <div className="points-display">
              {puzzlesSolved} Boards Cleared 
            </div>
            <div className="balance-display">
              {balance} zł
            </div>
          </div>
        
        <Shop 
          inventory={inventory}
          balance={balance}
          setBalance={setBalance}
          setInShop={setInShop}
          setInventory={setInventory}
          initReset={initReset}
          setInitReset={setInitReset}
          shopCycle={shopCycle}
          setShopCycle={setShopCycle}
          shopList={shopList}
          setShopList={setShopList}
          setters={setters}
          boardCount={boardCount}
          inShop={inShop}
        />

        </>
        
    </div>
      
  );
};

function LeftMenu({ onNewGame, inGame, pause, paused }) {
  const [visibleButtons, setVisibleButtons] = useState(0);
  
  useEffect(() => {
    let buttonCount = 0;
    const menuButtons = ["New Game", "Settings", "Credits", "Pause", "Unpause"];
    
    const interval = setInterval(() => {
      buttonCount++;
      setVisibleButtons(buttonCount);
      
      if (buttonCount >= menuButtons.length) {
        clearInterval(interval);
      }
    }, 5); 
    
    return () => clearInterval(interval);
  }, []);

  const menuButtons = [
    { name: "New Game", action: onNewGame, disabled: inGame, dependent: !inGame },
    { name: "Pause", action: pause, disabled: !inGame, dependent: inGame && !paused },
    { name: "Unpause", action: pause, disabled: !inGame, dependent: inGame && paused},
    { name: "Settings", action: () => {}, dependent: true },
    { name: "Credits", action: () => {}, dependent: true },
  ];
  
  return (
    <div className="left-menu">
      <div className="menu-buttons">
        {menuButtons.map((button, index) => (
          <button 
            key={button.name}
            className={`menu-button ${index < visibleButtons && button.dependent ? '' : 'none'}`} 
            onClick={button.action}
            disabled={button.disabled}
          >
            {button.name} 
          </button>
        ))}
      </div>
    </div>
  );
}

// mod is a obj!
const AddMod = ({mod, setModifiers}) => {

  const newObj = {
    img: mod.img,
    name: mod.name,
    amt: mod.amt,
    clear: mod.clear,
    id: mod.id
  }
  setModifiers(prev => [...prev, newObj])
}


const effectsList = ({modifiers, setModifiers}) => {
  const imgs = {
    slow: "assets/jovial.png",
    reward: "assets/jovial.png",
    rewardChance: "assets/jovial.png",
  }
  

  return {
    slow: {
      requires: ["setTime"],
      apply: ({mod, setTime}) => {
        setTime(prev => prev + mod);
      }
    },
    reward: {
      requires: ["setReward", "setRewardChance"],
      apply: ({mod, setReward, setRewardChance}) => {
         const modObj = {
          name: "▲ reward",
          img: imgs.reward,
          amt: `+$${mod}`,
          id: Date.now(),
          clear: false,
        }
        setRewardChance(-1);
        setReward(mod);
        AddMod({mod: modObj, modifiers: modifiers, setModifiers: setModifiers})
      }
    },
    rewardChance: {
      requires: ["setRewardChance"],
      apply: ({mod, setRewardChance}) => {
         const modObj = {
          name: "▲ reward chance",
          img: imgs.rewardChance,
          amt: `${(10 - mod) * 10}%`,
          id: Date.now(),
          clear: false,
        }
        setRewardChance(mod);
        AddMod({mod: modObj, modifiers: modifiers, setModifiers: setModifiers})
      }
    },
    multAdd: {
      requires: ["setMult"],
      apply: ({mod, setMult}) => {
        setMult(prev => prev + mod);
      }
    },
    multSet: {
      requires: ["setMult"],
      apply: ({mod, setMult}) => {
        setMult(mod);
      }
    },
    solvePuzzle: {
      requires: ["handleSolvePuzzle"],
      apply: ({handleSolvePuzzle}) => {
        handleSolvePuzzle();
      }
    },
    solveMultiplePuzzles: {
      requires: ["handleSolvePuzzle"],
      apply: ({mod, handleSolvePuzzle}) => {
        for (let i = 0; i < mod; i++) {
          handleSolvePuzzle();
        }
      }
    },
    addStartTime: {
      requires: ["setStartTime"],
      apply: ({mod, setStartTime}) => {
        const modObj = {
          name: "▲ start time",
          img: imgs.rewardChance,
          amt: `+${mod}s`,
          id: Date.now(),
          clear: false,
        }
        setStartTime(prev => prev + mod);
        AddMod({mod: modObj, modifiers: modifiers, setModifiers: setModifiers})
      }
    },
    startTime: {
      requires: ["setStartTime"],
      apply: ({mod, setStartTime}) => {
        setStartTime(mod);
      }
    },
    whisperer: {
      requires: ["setDialogue", "setDialogueID", "setDialogueVisible", "currentWordState"],
      apply: ({setDialogue, setDialogueID, setDialogueVisible, currentWordState}) => {
        if (currentWordState) {
          setDialogue('ion got nothing to tell you. select a word next time..')
          setDialogueID(Date.now() * Math.random());
          setDialogueVisible(true);
        } else {
          let letters = mapToUniqueRandomInt([0, 0], 0, currentWordState.length);
          setDialogue(`psst.. i heard the letters ${currentWordState[letters[0]]} and ${currentWordState[letters[1]]} were in this word..`)
          setDialogueID(Date.now() * Math.random());
          setDialogueVisible(true);
        }
      }
    }
  };
};

function CreateMods({ mods = [], setters = {}, modifiers, setModifiers }) {
  const effects = effectsList({modifiers: modifiers, setModifiers: setModifiers});
  const results = {};

  mods.forEach((mod, index) => {
    const { effect, ...params } = mod;
    const effectName = effect || "unknown";
    const effectId = `${effectName}_${index}`;
    
    if (!effects[effectName]) {
      results[effectId] = { success: false, message: `Effect "${effectName}" does not exist` };
      return;
    }
    
    const missingSetters = effects[effectName].requires.filter(setter => !setters[setter]);
    if (missingSetters.length > 0) {
      results[effectId] = { 
        success: false, 
        message: `Missing required setters: ${missingSetters.join(', ')}` 
      };
      return;
    }
    
    try {
      const requiredSetters = {};
      effects[effectName].requires.forEach(setter => {
        requiredSetters[setter] = setters[setter];
      });
      
      effects[effectName].apply({ ...params, ...requiredSetters });
      results[effectId] = { success: true };
    } catch (error) {
      results[effectId] = { 
        success: false, 
        message: `Error applying effect: ${error.message}` 
      };
    }
  });
  
  return results;
}

const ModifierItem = memo(({ mod }) => {
  
  return (
    <div className="item">
      <button>
        <img src={mod.img} alt={mod.name} />
        <p>{mod.name} | {mod.amt !== null ? mod.amt : ""}</p>
      </button>
    </div>
  );
});

function RightMenu({ inventory, setInventory, setters, modifiers, setModifiers, boardReff }) {

  const consumeItem = (item) => {
    if (item.msg) {
      const itMsg = item.msg;
      setters.setDialogue(itMsg);
      setters.setDialogueID(Date.now() * Math.random());
      setters.setDialogueVisible(true);
    }


    const effects = item.content.split("_");
    let mods = [];
  
    for (let i = 0; i < effects.length; i++) {
      if (effects[i].split("-")[0] === "na") continue;

      mods.push({effect: effects[i].split("-")[0], mod: parseInt(effects[i].split("-")[1])});
      console.log(`mod ${i} pushed (${item})`)
    }

    console.log(CreateMods({
      mods: mods,
      setters: setters,
      modifiers: modifiers,
      setModifiers: setModifiers,
      boardReff: boardReff,
    }))

    removeItem(item);
  }

  const removeItem = (item) => {
    const temp = [...inventory];
    temp.splice(item, 1);
    setInventory(temp);
  }

  return (
    <div className="right-menu">
      <div className="menu-section"> 
        <h2 className="section-title">ITEMS</h2>
        <div className="section-content">
          {inventory.map((item, index) => (
            <div className="item" key={index}>
              <button onClick={() => {consumeItem(item)}}>
                <img src={item.img} alt={item.name}></img>
                <p>{item.name}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="menu-section">
        <h2 className="section-title">MODIFIERS</h2>
        <div className="section-content">
          {modifiers.map((mod) => (
            <Fragment key={mod.id}>
             <ModifierItem 
                key={mod.id} 
                mod={mod} 
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const BuyItem = ({ item, inv, bal, setInShop, setBalance, setInv, id }) => {  
  const [canBuyMap, setCanBuyMap] = useState({});

  const canBuy = canBuyMap[item.id] !== false && bal >= item.cost && item.stock > 0;

  const buy = (item) => {
    if (!canBuy) return;
    
    if (item.cost > bal || item.stock <= 0) {
      setCanBuyMap(prev => ({...prev, [item.id]: false}));
      return;
    }
    
    item.stock -= 1;
    setInv(prev => [...prev, item])
    setBalance(prev => prev - item.cost);
  }

  return (
    <div className="item-buttons">
      <button 
        className="buy-button" 
        disabled={!canBuy}
        onClick={() => {buy(item)}}
        id={id}
      >
        Buy
      </button>
      <button
        className="back-button"
        onClick={() => {setInShop(false)}}
      >
        Back
      </button>
    </div>
  );
}

function mapToUniqueRandomInt(arr, min, max) {
  if (max - min + 1 < arr.length) {
    throw new Error("Range is too small to generate unique random numbers for all elements.");
  }

  const generatedNumbers = new Set();
  const result = arr.map(() => {
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (generatedNumbers.has(randomNumber));
    generatedNumbers.add(randomNumber);
    return randomNumber;
  });
  return result;
}

const Shop = ({ 
  inventory, 
  balance, 
  setBalance, 
  setInShop, 
  setInventory, 
  boardCount, 
  initReset, 
  setInitReset, 
  shopCycle,
  shopList, 
  setShopCycle, 
  setShopList, 
  setters, 
  inShop 
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  const shopItems = [...ITEMS];

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };
  
  const resetShopCycle = () => {
    const newCycle = [...mapToUniqueRandomInt(shopCycle, 1, shopItems.length)];
    
    setShopCycle(newCycle);
    
    const resetItems = shopItems.filter(obj => newCycle.includes(obj.id))
      .map(item => {
        const originalItem = ITEMS.find(original => original.id === item.id);
        return { ...item, stock: originalItem.stock }; 
      });
      
    setShopList(resetItems);
    
  };


  useEffect(() => {
    if (boardCount % 10 === 0 && boardCount !== 0) {
      resetShopCycle();
      setters.setDialogue("Shop has restocked!");
      setters.setDialogueID(Date.now() * Math.random());
      setters.setDialogueVisible(true);
    }
  }, [boardCount]);

  useEffect(() => {
    if (!initReset) {
      setInitReset(true);
      resetShopCycle();
    }
    if (shopItems.length > 0 && !selectedItem) {
      setSelectedItem(shopList[0]);
    };
  }, []); 
  
  return (
   <div className="shop-container" style={{
            display: `${!inShop ? "none" : ""}`
          }}>
      <div className="shop-items-list">
        <div className="shop-title"> <h2>Shop <strong>[{balance} zł]</strong></h2></div>
        <div className="items-scroll-container">
          {shopList.map((item, index) => (
            <div 
              key={index}
              className={`shop-list-item ${selectedItem === item ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item)}
            >

              <div className="shop-list-item-image">
                <img src={item.img} alt={item.name} />
              </div>

              <div className="shop-list-item-details">
                <div className="shop-list-item-name">{item.name} ({item.stock})</div>
                <div className="shop-list-item-price">{item.cost} zł</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="shop-item-detail">
        {selectedItem ? (
          <>
            <div className="detail-image-container">
              <img 
                src={selectedItem.img} 
                alt={selectedItem.name} 
                className="detail-image" 
              />
            </div>
            <div className="detail-info">
              <h2 className="detail-name">{selectedItem.name}</h2>
              <div className="detail-price">{selectedItem.cost} zł</div>
              <div className="detail-description">
                {selectedItem.desc || "No description available for this item."}
              </div>
              <BuyItem 
                item={selectedItem}
                inv={inventory}
                setInv={setInventory}
                bal={balance}
                setBalance={setBalance}
                setInShop={setInShop}
                id={selectedItem.id}
              />
            </div>
          </>
        ) : (
          <div className="detail-info">
            <div className="detail-description">
            Select an item to view details

            <div className="item-buttons">
              <button
                className="back-button"
                onClick={() => {setInShop(false)}}
              >
                Back
              </button>
            </div>
            </div>
          </div>
        )}
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
        if (correctCells.some(([r, c]) => r === row && c === col)) {
          return;
        }
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
        if (correctCells.some(([r, c]) => r === row && c === col)) {
          return;
        }
        const letter = e.key.toUpperCase();
        
        const newUserBoard = [...userBoard];
        newUserBoard[row][col] = letter;
        setUserBoard(newUserBoard);
        
        if (incorrectCells.some(([r, c]) => r === row && c === col)) {
          const newIncorrectCells = incorrectCells.filter(([r, c]) => !(r === row && c === col));
          setIncorrectCells(newIncorrectCells);
        }

         const findNextNonCorrectCell = (startRow, startCol, direction) => {
          let nextCell = getAdjacentCell(startRow, startCol, direction, 1);
          
          while (nextCell) {
            const [nextRow, nextCol] = nextCell;
            if (!correctCells.some(([r, c]) => r === nextRow && c === nextCol)) {
              return nextCell;
            }
            nextCell = getAdjacentCell(nextRow, nextCol, direction, 1);
          }
          
          return null;
        };
        
        const nextCell = findNextNonCorrectCell(row, col, selectedDirection);
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
  }, [selectedCell, selectedDirection, correctCells, userBoard, board, findWordAtPosition, findNextWord, incorrectCells]);

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