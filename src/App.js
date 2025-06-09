import React, { useState }from 'react';
import './App.css';

function App() {
  const [inputNote, setInputNote] = useState('');
  const [result, setResult] = useState('');

  const handleClick = () => {
    setResult(`あなたが入力した音: ${inputNote}`);
  };

  return (
    <div className="App">
      <h1>ToneDrill</h1>

      <label htmlFor="note-input">音名を入力してください</label>
      <input
        id="note-input"
        type="text"
        value={inputNote}
        onChange={(e) => setInputNote(e.target.value)}
        placeholder="例: C, D#, F♭ など"
      />

      <button onClick={handleClick}>決定</button>
      {result && 
        <div style={{ marginTop: '20px' }}>
          <strong>{result}</strong>
        </div>
      }
    </div>
  );
}

export default App;
