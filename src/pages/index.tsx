import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState, useRef } from 'react'

const inter = Inter({ subsets: ['latin'] })

class Cell {
  constructor(isAlive: boolean, color: string) {
    this.isAlive = isAlive;
    this.color = color;
  }

  isAlive: boolean;
  color: string;
}

export default function Home() {

  // const numRows = 30;
  // const numCols = 60;

  const [numRows, setNumRows] = useState(75);
  const [numCols, setNumCols] = useState(180);
  const [cellSize, setCellSize] = useState(10);

  const defaultCell: Cell = new Cell(false, "black");
  const initialGrid = new Array(numRows).fill(defaultCell).map(() => new Array(numCols).fill(defaultCell));

  const [tick, setTick] = useState(0);
  const [grid, setGrid] = useState(initialGrid); // [x][y]
  const [tickTimer, setTickTimer] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [randomizationDarkness, setRandomizationDarkness] = useState(0.5);

  function reset() {
    setIsRunning(false);
    clearTimeout(tickTimer);
    setTick(0);
    setGrid(initialGrid);
  }

  function pause() {
    setIsRunning(false);
    clearTimeout(tickTimer);
  }

  function play() {
    setIsRunning(true);
    runTick(tick + 1, grid);
  }

  function randomize() {
    const newGrid = grid.map(row => row.map(cell => {
      return new Cell(Math.random() > randomizationDarkness, "black");
    }));
    setGrid(newGrid);
  }

  function liveNeighbors(x: number, y: number, grid) {
    let count = 0;
    if (x > 0 && y > 0 && grid[x - 1][y - 1].isAlive) count++;
    if (x > 0 && grid[x - 1][y].isAlive) count++;
    if (x > 0 && y < numCols - 1 && grid[x - 1][y + 1].isAlive) count++;
    if (y > 0 && grid[x][y - 1].isAlive) count++;
    if (y < numCols - 1 && grid[x][y + 1].isAlive) count++;
    if (x < numRows - 1 && y > 0 && grid[x + 1][y - 1].isAlive) count++;
    if (x < numRows - 1 && grid[x + 1][y].isAlive) count++;
    if (x < numRows - 1 && y < numCols - 1 && grid[x + 1][y + 1].isAlive) count++;
    if(count > 0) console.log("Cell: " + x + ", " + y + " has " + count + " neighbors")
    return count;
  }

  function runTick(tickNumber: number, currentGrid: Cell[][]) {
    console.log('Tick: ' + tickNumber);
    console.log(currentGrid.length)
    console.log(currentGrid[0].length)
    setTick(tickNumber);

    let newGrid = JSON.parse(JSON.stringify(currentGrid));

    let count = 0;
    currentGrid.forEach((row, x) => {
      row.forEach((cell, y) => {
        const neighbors = liveNeighbors(x, y, currentGrid);
        if (cell.isAlive) {
          if (neighbors == 2 || neighbors == 3) {
            newGrid[x][y].isAlive = true
          }
          else {
            newGrid[x][y].isAlive = false
          }
        } else {
          if (neighbors == 3) {
            newGrid[x][y].isAlive = true
          }
          else {
            newGrid[x][y].isAlive = false
          }
        }
      })
    });

    const tickTimer = setTimeout(() => {
      runTick(tickNumber + 1, newGrid);

      setGrid(newGrid);
    }, 2);

    setTickTimer(tickTimer);

  }

  function setCellAlive(x: number, y: number) {
    if (isRunning) return;
    let newGrid = grid;
    newGrid[x][y] = new Cell(true, "black");
    setGrid(newGrid)
    setTick(tick+1)
  }

  function beginSimulation() {
    console.log('Beginning...');
    setIsRunning(true);
    runTick(0, grid);
  }

  return (
    <>
      <main className={`flex min-h-screen flex-col items-center p-12 select-none ${inter.className}`}>

      <h1 className='text-2xl hover:tracking-widest'>Conway's Game of Life</h1>
      <h3 className="text-lg font-light hover:tracking-widest cursor-default select-none">Tick: {tick}</h3>

      <div className="mt-9 grid-container">
        {
          grid.map((row, xindex) => <div className="flex flex-row" key={`${xindex}`}>
            {row.map((cell, yindex) =>

              // Single Cell
              <div
                style={{width: `${cellSize}px`, height: `${cellSize}px`}}
                className={`
                    cell-container
                    ${cell.isAlive ? "alive-cell" : ""}
                    ${isRunning ? "" : "cell-border"}
                  `}
                key={`${yindex}`}
                onClick={() => setCellAlive(xindex, yindex)}
              ></div>
              // End Single Cell

              )}
          </div>)
        }
      </div>

      <div className="flex flex-row mt-3 space-x-4">
        <button
          onClick={beginSimulation}
          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded">Start</button>

        <button
          onClick={reset}
          className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded">New Board</button>

        <button
          onClick={pause}
          className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-4 rounded">Pause</button>

        <button
          onClick={play}
          className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded">Play</button>
      </div>

      <div className="flex flex-row mt-3 space-x-4 mt-8">
        <button
          onClick={randomize}
          className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-4 rounded">Randomize</button>


      </div>


      <div className="border-2 border-solid border-indigo-500/25 mt-8 p-10 rounded-lg">
        <div className="flex flex-row mt-3 space-x-4">
            <label for="myRange">Number of Rows</label>
            <input type="range" min="0" max="300" value={numRows} onChange={e => setNumRows(Number(e.target.value))} className="slider" id="myRange" />
            {numRows}
        </div>

        <div className="flex flex-row mt-3 space-x-4 mt-8">
            <label for="myRange">Number of Columns</label>
            <input type="range" min="0" max="500" value={numCols} onChange={e => setNumCols(Number(e.target.value))} className="slider" id="myRange" />
            {numCols}
        </div>

        <div className="flex flex-row mt-3 space-x-4 mt-8">
            <label for="myRange">Size of Cell (px)</label>
            <input type="range" min="0" max="50" value={cellSize} onChange={e => setCellSize(Number(e.target.value))} className="slider" id="myRange" />
            {cellSize}
        </div>

        <div className="flex flex-row mt-3 space-x-4 mt-8">
            <label for="myRange">Randomization Darkness</label>
            <input type="range" min="0" max="10" value={randomizationDarkness*10} onChange={e => setRandomizationDarkness(Number(e.target.value)/10)} className="slider" id="myRange" />
            {randomizationDarkness}
        </div>
      </div>

      </main>
    </>
  )
}

