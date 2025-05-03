import './App.css';
import { useState } from 'react';


/* 
  My (miniaturity) commenting conventions:
  First Line above a function (that needs explanation) is the description of the function/use
  Second line is where it is supposed to be used.
  Third Line is what its supposed to return
*/
function App() {
  const [inGame, setInGame] = useState(false);

  return (
    <>

    </>
  )
}

// Main menu, before a new game starts
// For: App
function Landing(ingame) {

}

// Self Explanitory
// General-Use
// int[][]
function GetMaximumsInMatrix(matrix) {
  // Catch input errors
  if (!arr || arr.length === 0 || !arr[0] || arr[0].length === 0) {
    console.log("Error: MaximumsInMatrix [input error]")
    return [];
  }

  let max = -Infinity;
  const maxIndexes = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] > max) {
        max = arr[i][j];
        maxIndexes.length = 0; // Reset array if a new max is found
        maxIndexes.push([i, j]);
      } else if (arr[i][j] === max) {
        maxIndexes.push([i, j]);
      }
    }
  }
  return maxIndexes;
}


// Self-Explanitoru
// General-Use
// int
function RandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Generate the board (without words) for the current crossword
// For: GenerateCrossword
// int[][]
function GenerateBoard(boardLength) {
  const bias = GetBiasedArray(boardLength, boardLength);
  let board = new Array(boardLength).fill(null).map(() => new Array(cols).fill("x"));
  let maximums = new Array(GetMaximumsInMatrix(board));

  const origin = maximums.Length === 1 ? maximums[0] : maximums[RandomIntInclusive(0, maximums.Length)];

  // 1. Decide direction, biased by length
  // (1 = left, 2 = right, 3 = top, 4 = bottom)

  const decideDirection = (location, matrix) => {
    const [row, col] = location;
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    const lengths = {
      up: row + 1,
      down: numRows - row,
      left: col + 1,
      right: numCols - col
    };

    
  }

  // Start in middle (if uneven, randomly choose.)
}

// Generate an array "bias" that has greater value towards the center.
// For: GenerateCrossword -> GenerateBoard
// int[][]
function GetBiasedArray(rows, cols) {
  let result = [];
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);

  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      const distance = Math.abs(i - centerRow) + Math.abs(j - centerCol);
      const maxDistance = centerRow + centerCol;
      const value = maxDistance - distance;
      row.push(value);
    }
    result.push(row);
  }

  return result;
}
export default App;
