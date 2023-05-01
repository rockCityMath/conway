import { Inter } from 'next/font/google'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

class Cell {
  constructor(isAlive: boolean, color: string) {
    this.isAlive = isAlive;
    this.color = color;
  }

  isAlive: boolean;
  color: string;
}

export default function Conway() {

  const [numRows, setNumRows] = useState(50);
  const [numCols, setNumCols] = useState(100);
  const [cellSize, setCellSize] = useState(10);

  const defaultCell: Cell = new Cell(false, "black");
  const initialGrid = new Array(numRows).fill(defaultCell).map(() => new Array(numCols).fill(defaultCell));

  const [tick, setTick] = useState(0);
  const [grid, setGrid] = useState(initialGrid);
  const [tickTimer, setTickTimer] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [randomizationDarkness, setRandomizationDarkness] = useState(0.5);

  function reset() {
    clearTimeout(tickTimer);
    setIsRunning(false);
    setTick(0);
    setGrid(initialGrid);
  }

  function pause() {
    clearTimeout(tickTimer);
    setIsRunning(false);
  }

  function play() {
    setIsRunning(true);
    runTick(tick + 1, grid);
  }

  // Fill all cells with random values
  function randomize() {
    const newGrid = grid.map(row => row.map(cell => {
      return new Cell(Math.random() > randomizationDarkness, "black");
    }));
    setGrid(newGrid);
  }

  function setCellAlive(x: number, y: number) {
    if (isRunning) return;
    let newGrid = JSON.parse(JSON.stringify(grid));
    newGrid[x][y] = new Cell(true, "black");
    setGrid(newGrid)
  }

  function beginSimulation() {
    setIsRunning(true);
    runTick(0, grid);
  }

  // Count the live cells in the (possibly) 8 adjacent neighbors
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

  // Apply the rules of the game and update the grid of cells
  function runTick(tickNumber: number, currentGrid: Cell[][]) {
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

  return (
    <>
      <main className={`flex min-h-screen flex-col items-center p-12 select-none ${inter.className}`}>

          <h1 className='text-2xl hover:tracking-widest'>Conway's Game of Life</h1>
          <h3 className="text-lg font-light hover:tracking-widest cursor-default select-none">Tick: {tick}</h3>

          {/* Create a grid of cells to represent the baord in memory */}
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

          {/* Simulation Controls */}
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

          {/* Board Variable Controls  */}
          <div className="border-2 border-solid border-indigo-500/25 mt-8 p-10 rounded-lg">

            <div className="flex items-center">
                <div class="md:w-1/3">
                  <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Rows
                  </label>
                </div>
                <div class="md:w-1/3">
                  <input onChange={e => setNumRows(Number(e.target.value))} class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" defaultValue={numRows}></input>
                </div>
            </div>

            <div className="flex items-center mt-6">
                <div class="md:w-1/3">
                  <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Columns
                  </label>
                </div>
                <div class="md:w-1/3">
                  <input onChange={e => setNumCols(Number(e.target.value))} class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" defaultValue={numCols}></input>
                </div>
            </div>

            <div className="flex items-center mt-6">
                <div class="md:w-1/3">
                  <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Cell Size (px)
                  </label>
                </div>
                <div class="md:w-1/3">
                  <input onChange={e => setCellSize(Number(e.target.value))} class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" defaultValue={cellSize}></input>
                </div>
            </div>

            <div className="flex items-center mt-6">
                <div class="md:w-1/3">
                  <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="inline-full-name">
                    Randomization Thickness (0-1)
                  </label>
                </div>
                <div class="md:w-1/3">
                  <input onChange={e => setRandomizationDarkness(Number(e.target.value))} class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" defaultValue={randomizationDarkness}></input>
                </div>
            </div>
          </div>
      </main>
    </>
  )
}

