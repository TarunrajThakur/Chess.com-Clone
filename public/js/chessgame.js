const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) =>{
    row.forEach((square, squareindex) =>{
        const squareElement = document.createElement("div");
        squareElement.classList.add(
            "square",
        (rowindex + squareindex) % 2 ===0 ? "light" : "dark"
    );

    squareElement.dataset.row = rowindex;
    squareElement.dataset.col = squareindex;

    if(square){
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
            "piece", 
            square.color === 'w' ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable =playerRole === square.color;
        pieceElement.addEventListener("dragstart", (e) => {
            if (pieceElement.draggable){
                draggedPiece = pieceElement;
                sourceSquare = {row: rowindex, col: squareindex};
                e.dataTransfer.setData("text/plain", "");
            }
        });

        pieceElement.addEventListener("dragend", (e) =>{
        draggedPiece = null;
        sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
    }
    squareElement.addEventListener("dragover",function (e){
        e.preventDefault();
    });

    squareElement.addEventListener("drop", function (e){
        e.preventDefault();
        if(draggedPiece){
            const targetSource = {
                row: parseInt(squareElement.dataset.row),
                col: parseInt(squareElement.dataset.col),
            };
            handleMove(sourceSquare,targetSource);
        }
    });
    boardElement.appendChild(squareElement);

        });

    });
};

let handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8 - source.row}`,
        promotion: "q"
    };
    const result = chess.move(move);
    if (result){
    socket.emit("move",move);
    renderBoard();
    }
};

let getPieceUnicode = (piece) => {
    const unicodePieces = {
    'P': '♙︎', // White Pawn (monochrome)
    'N': '♘', 
    'B': '♗', 
    'R': '♖', 
    'Q': '♕', 
    'K': '♔', 
    'p': '♟︎', // Black Pawn (monochrome)
    'n': '♞', 
    'b': '♝', 
    'r': '♜', 
    'q': '♛', 
    'k': '♚'
    };
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
chess.load(fen);
renderBoard();
});
renderBoard();
// const socket = io();
// const chess = new Chess();
// const boardElement = document.querySelector(".chessboard");

// let draggedPiece = null;
// let sourceSquare = null;
// let playerRole = null;

// const renderBoard = () => {
//     const board = chess.board();
//     boardElement.innerHTML = "";
    
//     board.forEach((row, rowIndex) => {
//         row.forEach((square, colIndex) => {
//             const squareElement = document.createElement("div");
//             squareElement.classList.add(
//                 "square",
//                 (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
//             );

//             squareElement.dataset.row = rowIndex;
//             squareElement.dataset.col = colIndex;

//             if (square) {
//                 const pieceElement = document.createElement("div");
//                 pieceElement.classList.add(
//                     "piece",
//                     square.color === 'w' ? "white" : "black"
//                 );
//                 pieceElement.innerText = getPieceUnicode(square);
//                 pieceElement.draggable = playerRole === square.color;
                
//                 // Drag Start
//                 pieceElement.addEventListener("dragstart", (e) => {
//                     if (pieceElement.draggable) {
//                         draggedPiece = pieceElement;
//                         sourceSquare = { row: rowIndex, col: colIndex };
//                         e.dataTransfer.setData("text/plain", "");
//                     }
//                 });

//                 // Drag End
//                 pieceElement.addEventListener("dragend", () => {
//                     setTimeout(() => { 
//                         draggedPiece = null;
//                         sourceSquare = null;
//                     }, 100);
//                 });

//                 squareElement.appendChild(pieceElement);
//             }

//             // Drag Over
//             squareElement.addEventListener("dragover", (e) => {
//                 e.preventDefault();
//             });

//             // Drop Event
//             squareElement.addEventListener("drop", (e) => {
//                 e.preventDefault();
//                 if (draggedPiece) {
//                     const targetSource = {
//                         row: parseInt(squareElement.dataset.row),
//                         col: parseInt(squareElement.dataset.col),
//                     };
//                     handleMove(sourceSquare, targetSource);
//                 }
//             });

//             boardElement.appendChild(squareElement);
//         });
//     });
// };

// let handleMove = (source, target) => {
//     const move = {
//         from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
//         to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
//         promotion: "q"
//     };

//     const result = chess.move(move); // Validate move using chess.js

//     if (result) {
//         socket.emit("move", move); // Emit move only if valid
//         renderBoard(); // Update board
//     }
// };

// // Unicode Characters for Chess Pieces
// let getPieceUnicode = (piece) => {
//     const unicodePieces = {
//         'p': '♟', // Black Pawn
//         'r': '♜', // Black Rook
//         'n': '♞', // Black Knight
//         'b': '♝', // Black Bishop
//         'q': '♛', // Black Queen
//         'k': '♚', // Black King
//         'P': '♙', // White Pawn
//         'R': '♖', // White Rook
//         'N': '♘', // White Knight
//         'B': '♗', // White Bishop
//         'Q': '♕', // White Queen
//         'K': '♔'  // White King
//     };
//     return unicodePieces[piece.type] || "";
// };

// // Player Role Assignment
// socket.on("playerRole", (role) => {
//     playerRole = role;
//     renderBoard();
// });

// socket.on("spectatorRole", () => {
//     playerRole = null;
//     renderBoard();
// });

// // Update Board State
// socket.on("boardState", (fen) => {
//     chess.load(fen);
//     renderBoard();
// });

// renderBoard();
