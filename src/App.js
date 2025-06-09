// App.js
import React, { useState }from 'react';
import './App.css';
import {
  TUNING_DEFAULTS,
  NOTES,
  NOTE_INDEX,
  getNoteFromFret,
  SCALE_MAP,
  DIATONIC_CHORDS_MAJOR,
  DIATONIC_CHORDS_MINOR,
  CHROMATIC_INTERVALS_INDEX
} from './constants';

const tuningDefaults = TUNING_DEFAULTS;

function App() {
  // 状態管理
  const [tuning, setTuning] = useState(tuningDefaults);
  const [keyNote, setKeyNote] = useState('C');
  const [scaleType, setScaleType] = useState('Major');

  const [selectedMode, setSelectedMode] = useState('SingleTone'); // モード選択用（未確定）
  const [mode, setMode] = useState(null);               // 確定モード。nullなら非表示

  const [rootNote, setRootNote] = useState(null); // ChordTone用
  const [rootPos, setRootPos] = useState(null);   // ChordTone用 (string,fret)

  const [inputValue, setInputValue] = useState('');
  const [rootInputValue, setRootInputValue] = useState('');

  const [messages, setMessages] = useState([]);

  // モード確定ボタンハンドラ
  const handleConfirmMode = () => {
    if (selectedMode) {
      setMode(selectedMode);
      setRootNote(null);
      setMessages([]);
    }
  };

  // チューニングの入力を受けてstate更新する関数
  const handleTuningChange = (stringNum, value) => {
    setTuning(prev => ({
      ...prev,
      [stringNum]: value.toUpperCase().trim()
    }));
  };

  // ノート取得関数はconstants.jsのgetNoteFromFretを使う

  // インターバル計算(SingleTone用)
  function getIntervalFromKey(note){
    const scaleIntervals = SCALE_MAP[scaleType];
    const rootIndex = NOTE_INDEX[keyNote];
    const noteIndex = NOTE_INDEX[note];
    const semitoneDiff = (noteIndex - rootIndex + 12) % 12;

    for (const [intervalName, semitone] of Object.entries(scaleIntervals)) {
      if (semitone === semitoneDiff) {
        return intervalName;
      }
    }
    return null;
  }

  // クロマティックインターバル計算（ChordTone用）
  function getChromaticInterval(root, note) {
    if (!root) return '';
    const rootIdx = NOTE_INDEX[root];
    const noteIdx = NOTE_INDEX[note];
    const diff = (noteIdx - rootIdx + 12) % 12;
    return CHROMATIC_INTERVALS_INDEX[diff] || 'N/A';
  }

  // 入力処理（SingleTone / ChordTone 共通）
  function handleInput() {
    if (!inputValue.includes(',')) {
      setMessages(prev => [...prev, 'Invalid input format. Use string,fret']);
      setInputValue('');
      return;
    }
    const [stringStr, fretStr] = inputValue.split(',');
    const stringNum = Number(stringStr);
    const fretNum = Number(fretStr);
    if (!(stringNum in tuning)) {
      setMessages(prev => [...prev, 'Invalid string number']);
      setInputValue('');
      return;
    }
    if (fretNum < 0 || fretNum > 22) {
      setMessages(prev => [...prev, 'Fret out of range']);
      setInputValue('');
      return;
    }
    const note = getNoteFromFret(tuning[stringNum], fretNum);

    if (mode === 'SingleTone') {
      const interval = getIntervalFromKey(note);
      setMessages(prev => [...prev, `Input: (${stringNum},${fretNum}) Note: ${note} Interval from ${keyNote}: ${interval}`]);
    } else if (mode === 'ChordTone') {
      if (!rootNote) {
        setMessages(prev => [...prev, 'Please input root note first in ChordTone mode']);
      } else {
        const interval = getChromaticInterval(rootNote, note);
        setMessages(prev => [...prev, `Input: (${stringNum},${fretNum}) Note: ${note} Interval from root (${rootNote}): ${interval}`]);
      }
    }
    setInputValue('');
  }

  // rootNote入力（ChordTone用）
  function handleRootInput() {
    if (!rootInputValue.includes(',')) {
      setMessages(prev => [...prev, 'Invalid root input format']);
      setRootInputValue('');
      return;
    }
    const [stringStr, fretStr] = rootInputValue.split(',');
    const stringNum = Number(stringStr);
    const fretNum = Number(fretStr);
    if (!(stringNum in tuning)) {
      setMessages(prev => [...prev, 'Invalid string number']);
      setRootInputValue('');
      return;
    }
    if (fretNum < 0 || fretNum > 22) {
      setMessages(prev => [...prev, 'Fret out of range']);
      setRootInputValue('');
      return;
    }
    const note = getNoteFromFret(tuning[stringNum], fretNum);
    setRootNote(note);
    setRootPos([stringNum, fretNum]);
    setMessages(prev => [...prev, `Root note set: (${stringNum},${fretNum}) = ${note}`]);
    setRootInputValue('');
  }


  return (
    <div className="app-container">
      <h1>ToneDrill</h1>

      <div className="tuning-section">
        <label>Tuning (Edit each string): </label>
        {Object.entries(tuning).sort((a,b) => b[0] - a[0]).map(([stringNum, note]) => (
          <div key={stringNum} className="tuning-select-row">
            <label>{stringNum}弦:</label>
            <select
              value={note}
              onChange={(e) => handleTuningChange(stringNum, e.target.value)}
              aria-label={`${stringNum} string tuning note`}
            >
              {NOTES.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="controls">
        <label>Key:</label>
        <select value={keyNote} onChange={(e) => setKeyNote(e.target.value)}>
          {NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>

        <label>Scale:</label>
        <select value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
          {Object.keys(SCALE_MAP).map(scale => (
            <option key={scale} value={scale}>{scale}</option>
          ))}
        </select>

        <label>Mode:</label>
        <select 
          value={selectedMode}
          onChange={e => {setSelectedMode(e.target.value)}}>
          <option value="SingleTone">Single Tone</option>
          <option value="ChordTone">Chord Tone</option>
        </select>
        {!mode &&(
          <div className="confirm">
            <button onClick={handleConfirmMode}>
              Confirm Mode
            </button>
          </div>
        )}
      </div>
      {mode && (
        <>
        {mode === 'ChordTone' && (
          <div className="input-row">
          <input
            placeholder="Root input e.g. 6,3"
            value={rootInputValue}
            onChange={e => setRootInputValue(e.target.value)}
          />
          <button onClick={handleRootInput}>Set Root Note</button>
        </div>
        )}

        <div className="input-row">
          <input
          placeholder="Input string,fret e.g. 6,0"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleInput();
          }}
          />
        <button onClick={handleInput}>Check Interval</button>
        </div>
      </>
      )}

      <div className="message-log">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};


export default App;