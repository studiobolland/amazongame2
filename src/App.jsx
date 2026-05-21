import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-webgl2';

const SCENARIO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDfY8vF3izx3Nx5ohMRmYOw1uDXssA6GU-XjVDSkW3oqzUpk_oqUaUoa35fQf2QA/pub?gid=1742593725&single=true&output=csv';
const RESPONSE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDfY8vF3izx3Nx5ohMRmYOw1uDXssA6GU-XjVDSkW3oqzUpk_oqUaUoa35fQf2QA/pub?gid=1670179409&single=true&output=csv';

// --- SOUND EFFECTS (SFX) CONFIGURATION ---
const SFX_URLS = {
  hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',     
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',     
  popup: 'https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3',     
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',   
  fail: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',      
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'   
};

// 👇 NEW: Global mute flag for SFX
let globalIsMuted = false; 

const playSound = (type) => {
  if (globalIsMuted) return; // 👇 NEW: Skip playing if muted
  
  if (SFX_URLS[type]) {
    const audio = new Audio(SFX_URLS[type]);
    audio.volume = 0.3; 
    audio.play().catch(e => console.log("Audio blocked by browser autoplay policy until interacted with."));
  }
};

const getFuzzyKey = (obj, targetKey) => {
  if (!obj) return undefined;
  const normalize = (str) => String(str).replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedTarget = normalize(targetKey);
  const foundKey = Object.keys(obj).find(k => normalize(k) === normalizedTarget);
  return foundKey ? obj[foundKey] : undefined;
};

const cleanCharName = (name) => {
  if (!name || String(name).trim().toUpperCase() === 'N/A') return 'None';
  return String(name).replace(/\s*\([^)]*\)/gi, '').trim() || 'None';
};

// --- Map character names to their exact Rive Nested ViewModel names ---
const NESTED_VM_MAP = {
  'sophia': 'VM_sophia',
  'marek': 'VM_Marek',
  'lukas': 'VM_LUKAS',
  'dominika': 'VM_dominika',
  'emma': 'VM_EMMA',
  'alessandro': 'VM_Alessandro'
};

// --- 1. MAIN MENU ---
function MainMenu({ onStart }) {
  const [language, setLanguage] = useState('English');

  // Load the logo Rive file
  const { RiveComponent: LogoRive } = useRive({
    src: `${import.meta.env.BASE_URL}logo.riv`, 
    stateMachines: 'State Machine 1', 
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) 
  });

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
      
      {/* Logo Container */}
      <div style={{ width: '300px', height: '300px' }}>
        <LogoRive />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '30px', textAlign: 'center', padding: '0 20px', lineHeight: '1.2' }}>
        Motivation Delegation: Build the Shift
      </h1>
      
      <div style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <label htmlFor="language-select" style={{ fontSize: '1.1rem', color: '#666' }}>Choose your language:</label>
        <select 
          id="language-select"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            padding: '10px 15px', 
            fontSize: '1.1rem', 
            borderRadius: '8px', 
            border: '2px solid #ddd', 
            backgroundColor: '#f8f9fa', 
            color: '#333',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '200px'
          }}
        >
          <option value="English">English</option>
          <option value="Spanish">Español (Spanish)</option>
          <option value="French">Français (French)</option>
          <option value="German">Deutsch (German)</option>
          <option value="Mandarin">中文 (Mandarin)</option>
        </select>
      </div>

      <button 
        className="standard-button" 
        onMouseEnter={() => playSound('hover')}
        onClick={() => { playSound('click'); onStart(); }} 
        style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
      >
        Start Game
      </button>
    </div>
  );
}

// --- 1.5 INSTRUCTIONS SCREEN ---
function InstructionsScreen({ onBegin }) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff9900', color: '#333', padding: '10px', boxSizing: 'border-box' }}>
      
      {/* 👇 CHANGED: Added maxHeight: 95vh and overflowY: auto so it scales down and scrolls if needed */}
      <div style={{ maxWidth: '600px', width: '100%', maxHeight: '95vh', overflowY: 'auto', backgroundColor: '#ffffff', padding: 'clamp(20px, 4vh, 40px)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
        
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vh, 2.5rem)', margin: '0 0 clamp(10px, 2vh, 20px) 0', textAlign: 'center', color: '#ff9900', flexShrink: 0 }}>How to Play</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.2vh, 10px)', fontSize: 'clamp(0.95rem, 2vh, 1.1rem)', marginBottom: 'clamp(15px, 2vh, 25px)', flexShrink: 0 }}>
          <p style={{ margin: 0 }}><strong>🏢 The Setup:</strong> You will be given various workplace scenarios to read and understand.</p>
          <p style={{ margin: 0 }}><strong>👆 Your Task:</strong> Choose the most appropriate response from 3 multiple-choice options.</p>
          <p style={{ margin: 0 }}><strong>💯 Scoring:</strong> Depending on your choice, you will receive <strong>+50</strong>, <strong>0</strong>, or <strong>-20</strong> points.</p>
        </div>

        <div style={{ backgroundColor: '#fff', marginBottom: 'clamp(15px, 3vh, 30px)', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 clamp(8px, 1.5vh, 15px) 0', fontSize: 'clamp(1.1rem, 2.5vh, 1.3rem)', textAlign: 'center' }}>🏆 Final Score Key</h3>
          
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            
            {/* Grade 5 */}
            <div style={{ backgroundColor: '#206ca4', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2' }}>EXCELLENT</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>Above 250</div>
            </div>

            {/* Grade 4 */}
            <div style={{ backgroundColor: '#2ea39b', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2' }}>GOOD</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>151 - 250</div>
            </div>

            {/* Grade 3 */}
            <div style={{ backgroundColor: '#7ab758', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2' }}>FAIR</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>51 - 150</div>
            </div>

            {/* Grade 2 */}
            <div style={{ backgroundColor: '#f29b38', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2' }}>POOR</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>0 - 50</div>
            </div>

            {/* Grade 1 */}
            <div style={{ backgroundColor: '#df3f38', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2' }}>VERY POOR</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>Below 0</div>
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={() => { playSound('click'); onBegin(); }} 
            style={{ padding: 'clamp(10px, 2vh, 15px) clamp(20px, 4vw, 30px)', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
          >
            Let's Begin
          </button>
        </div>
        
      </div>
    </div>
  );
}

// --- 2. GAME COMPONENT ---
function Game({ isMuted }) {
  const [scenarios, setScenarios] = useState([]);
  const [responses, setResponses] = useState([]);
  
  const [scenarioRowIndex, setScenarioRowIndex] = useState(0); 
  const [gamePhase, setGamePhase] = useState('scenario_step'); 
  const [selectedResponse, setSelectedResponse] = useState(null); 
  const [totalPoints, setTotalPoints] = useState(0);
  const [isRiveReady, setIsRiveReady] = useState(false);
  
  const lastPlayedPhase = useRef(''); 
  const displayedProgress = useRef(0); 
  const progressAnimRef = useRef(null); 

  const bgmPlayer = useRef(null);
  const currentBgmSrc = useRef('');
  const ambiencePlayer = useRef(null);
  const currentAmbienceSrc = useRef('');
  
  const [history, setHistory] = useState([]);

  const { rive, RiveComponent } = useRive({
    src: `${import.meta.env.BASE_URL}game.riv`, 
    artboard: 'MAIN',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Layout, alignment: Alignment.Center }),
    onLoad: () => setIsRiveReady(true)
  });

  // 👇 NEW: Load the Logo specifically for the End Screen
  const { RiveComponent: LogoRive } = useRive({
    src: `${import.meta.env.BASE_URL}logo.riv`, 
    stateMachines: 'State Machine 1', 
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) 
  });

  // 👇 UPDATED: Cleanup both audio tracks when the game component unmounts
  useEffect(() => {
    return () => {
      if (bgmPlayer.current) {
        bgmPlayer.current.pause();
        bgmPlayer.current = null;
      }
      if (ambiencePlayer.current) {
        ambiencePlayer.current.pause();
        ambiencePlayer.current = null;
      }
    };
  }, []);

  // 👇 UPDATED: Watch for mute toggles and dynamically update BOTH active tracks
  useEffect(() => {
    if (bgmPlayer.current) bgmPlayer.current.muted = isMuted;
    if (ambiencePlayer.current) ambiencePlayer.current.muted = isMuted;
  }, [isMuted]);

  // DATA FETCHING
  useEffect(() => {
    const cacheBuster = `&t=${new Date().getTime()}`; 

    Papa.parse(SCENARIO_CSV_URL + cacheBuster, { 
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => setScenarios(results.data)
    });
    
    Papa.parse(RESPONSE_CSV_URL + cacheBuster, { 
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => setResponses(results.data)
    });
  }, []);

  // AUTO ADVANCE TIMER
  useEffect(() => {
    if (gamePhase === 'points_award') {
      const timer = setTimeout(() => {
        setGamePhase('response2');
      }, 1500); 
      return () => clearTimeout(timer); 
    }
  }, [gamePhase]);

  // 👇 NEW: Developer Cheat Code (Shift + 0-9 to skip scenarios)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Shift is held and a number key is pressed
      if (e.shiftKey && e.code.startsWith('Digit')) {
        const targetIndex = parseInt(e.code.replace('Digit', ''), 10);
        
        // Ensure the scenario actually exists before jumping
        if (scenarios.length > 0 && targetIndex >= 0 && targetIndex < scenarios.length) {
          console.log(`🛠️ DEV CHEAT: Jumping to scenario index ${targetIndex}`);
          setScenarioRowIndex(targetIndex);
          setGamePhase('scenario_step');
          setSelectedResponse(null);
          
          // Clear any running Rive popups
          if (rive && rive.viewModelInstance) {
            rive.viewModelInstance.enum('popup_type_enum').value = 'None';
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenarios, rive]);

// RIVE UPDATES
  useEffect(() => {
    if (!isRiveReady || !rive || scenarios.length === 0) return;
    const viewModel = rive.viewModelInstance;
    if (!viewModel) return;

    if (gamePhase === 'end_screen') {
      playSound('complete');
      try {
        viewModel.number('currentProgress').value = 100;
        viewModel.string('completePercentage').value = '100%';
      } catch (e) {
        console.error("Progress update error:", e);
      }
      return;
    }

    const currentStepId = `${gamePhase}_${scenarioRowIndex}`;
    if (lastPlayedPhase.current === currentStepId) return; 
    lastPlayedPhase.current = currentStepId; 

    const currentScenarioRow = scenarios[scenarioRowIndex];
    if (!currentScenarioRow) return;

    // 👇 UPDATED: Background Audio & Ambience checking logic
    
    // 1. Process Music
    const musicRaw = getFuzzyKey(currentScenarioRow, 'Music');
    const musicStr = musicRaw ? String(musicRaw).trim() : '';
    const isValidMusic = musicStr !== '' && musicStr.toUpperCase() !== 'NA' && musicStr.toUpperCase() !== 'N/A';

    if (isValidMusic && musicStr !== currentBgmSrc.current) {
      if (bgmPlayer.current) bgmPlayer.current.pause();
      currentBgmSrc.current = musicStr;
      
      bgmPlayer.current = new Audio(`${import.meta.env.BASE_URL}${musicStr}`);
      bgmPlayer.current.loop = true; 
      bgmPlayer.current.volume = 0.3; 
      bgmPlayer.current.muted = isMuted;
      
      bgmPlayer.current.play().catch(e => console.log("Music autoplay blocked by browser."));
    }

    // 2. Process Ambience
    const ambienceRaw = getFuzzyKey(currentScenarioRow, 'Ambience');
    const ambienceStr = ambienceRaw ? String(ambienceRaw).trim() : '';
    const isValidAmbience = ambienceStr !== '' && ambienceStr.toUpperCase() !== 'NA' && ambienceStr.toUpperCase() !== 'N/A';

    if (isValidAmbience && ambienceStr !== currentAmbienceSrc.current) {
      if (ambiencePlayer.current) ambiencePlayer.current.pause();
      currentAmbienceSrc.current = ambienceStr;
      
      ambiencePlayer.current = new Audio(`${import.meta.env.BASE_URL}${ambienceStr}`);
      ambiencePlayer.current.loop = true; 
      ambiencePlayer.current.volume = 0.3; 
      ambiencePlayer.current.muted = isMuted;
      
      ambiencePlayer.current.play().catch(e => console.log("Ambience autoplay blocked by browser."));
    }
    // 👆 END OF NEW AUDIO LOGIC

    try {
      // 1. Find total number of multiple-choice questions in the entire game
      const totalQuestions = scenarios.filter(row => {
        const raw = getFuzzyKey(row, 'Responses');
        const str = raw ? String(raw).trim().toUpperCase() : '';
        return str !== '' && str !== 'NA' && str !== 'N/A';
      }).length || 10; 

      // 2. Count how many questions we have fully passed prior to the current row
      let questionsAnswered = scenarios.slice(0, scenarioRowIndex).filter(row => {
        const raw = getFuzzyKey(row, 'Responses');
        const str = raw ? String(raw).trim().toUpperCase() : '';
        return str !== '' && str !== 'NA' && str !== 'N/A';
      }).length;

      // 3. If we are currently ON a question row, and have made a choice, add 1
      const currentRaw = getFuzzyKey(currentScenarioRow, 'Responses');
      const currentStr = currentRaw ? String(currentRaw).trim().toUpperCase() : '';
      const currentIsQuestion = currentStr !== '' && currentStr !== 'NA' && currentStr !== 'N/A';

      if (currentIsQuestion && (gamePhase === 'response1' || gamePhase === 'points_award' || gamePhase === 'response2' || gamePhase === 'insight')) {
        questionsAnswered += 1;
      }

      // 4. Calculate the target percentage
      const targetProgressVal = Math.round((questionsAnswered / totalQuestions) * 100);

      // 5. Animate to the new target over 1000ms if it has changed!
      if (targetProgressVal !== displayedProgress.current) {
        const startProgress = displayedProgress.current;
        const duration = 1000; 
        const startTime = performance.now();

        if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);

        const animateProgress = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progressRatio = Math.min(elapsedTime / duration, 1);
          const currentVal = Math.round(startProgress + (targetProgressVal - startProgress) * progressRatio);

          try {
            viewModel.number('currentProgress').value = currentVal;
            viewModel.string('completePercentage').value = `${currentVal}%`;
          } catch (e) {}

          if (progressRatio < 1) {
            progressAnimRef.current = requestAnimationFrame(animateProgress);
          } else {
            displayedProgress.current = targetProgressVal;
          }
        };
        progressAnimRef.current = requestAnimationFrame(animateProgress);
      } else {
        viewModel.number('currentProgress').value = targetProgressVal;
        viewModel.string('completePercentage').value = `${targetProgressVal}%`;
      }

      // Automatically reset all characters' isTalking property to false on any step/phase change
      Object.values(NESTED_VM_MAP).forEach(vmName => {
        try {
          const charVm = viewModel.viewModel(vmName);
          if (charVm && charVm.boolean('isTalking')) {
            charVm.boolean('isTalking').value = false;
          }
        } catch (e) {}
      });

      if (gamePhase === 'scenario_step') {
        viewModel.enum('setting_enum').value = String(getFuzzyKey(currentScenarioRow, 'Setting') || 'Fulfilment Centre').trim();
        const charRawString = String(getFuzzyKey(currentScenarioRow, 'Character(s)') || getFuzzyKey(currentScenarioRow, 'Characters') || '');
        const rawChars = charRawString.split(',').map(c => c.trim()).filter(Boolean);
        const inSceneChars = rawChars.map(cleanCharName);
        
        viewModel.enum('char_1_enum').value = inSceneChars[0] || 'None';
        viewModel.enum('char_2_enum').value = inSceneChars[1] || 'None';
        viewModel.enum('char_3_enum').value = inSceneChars[2] || 'None';

        const popupChar = cleanCharName(getFuzzyKey(currentScenarioRow, 'Pop-Up Character') || getFuzzyKey(currentScenarioRow, 'Set-up Character'));
        const activeChar = cleanCharName(getFuzzyKey(currentScenarioRow, 'Active Character'));
        const finalActiveChar = activeChar !== 'None' ? activeChar : popupChar;
        
        viewModel.enum('active_character').value = finalActiveChar;
        viewModel.enum('popup_char_enum').value = popupChar;
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable so we can verify it below
        const popupTypeStr = String(getFuzzyKey(currentScenarioRow, 'Pop-Up Type') || getFuzzyKey(currentScenarioRow, 'Set-up Type') || 'None').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(currentScenarioRow, 'Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;
        
        const vmName = NESTED_VM_MAP[finalActiveChar.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(currentScenarioRow, 'Set-up Text') || getFuzzyKey(currentScenarioRow, 'Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable
        const popupTypeStr = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable
        const popupTypeStr = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      }
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 NEW: Turn talking on for response 1 character
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking')) {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 NEW: Turn talking on for response 2 character
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking')) {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      }
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      }
      else if (gamePhase === 'insight' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.string('insight_text').value = String(getFuzzyKey(selectedResponse, 'Click to reveal') || '').trim();
        viewModel.trigger('show_insight').trigger();
        playSound('popup');
      }
    } catch (error) {
      console.error("❌ Error setting Rive properties:", error);
    }
 }, [rive, isRiveReady, scenarioRowIndex, gamePhase, scenarios, selectedResponse, totalPoints]);

  const currentScenarioRow = scenarios[scenarioRowIndex] || {};
  const rawResponseValue = getFuzzyKey(currentScenarioRow, 'Responses');
  const responsesTextStr = rawResponseValue ? String(rawResponseValue).trim().toUpperCase() : '';
  const hasOptions = responsesTextStr !== '' && responsesTextStr !== 'NA' && responsesTextStr !== 'N/A';

  const responseNumberMatch = String(rawResponseValue).match(/\d+/);
  const optionMatchNumber = responseNumberMatch ? parseInt(responseNumberMatch[0], 10) : null;

  const currentOptions = hasOptions 
    ? responses.filter(r => {
        const optVal = getFuzzyKey(r, 'Option') || '';
        const match = String(optVal).match(/\d+/);
        const parsedOpt = match ? parseInt(match[0], 10) : null;
        return parsedOpt === optionMatchNumber;
      })
    : [];

  const questionText = currentOptions.length > 0 ? getFuzzyKey(currentOptions[0], 'Question') : null;

  const saveHistoryState = () => {
    setHistory(prev => [...prev, {
      scenarioRowIndex,
      gamePhase,
      selectedResponse,
      totalPoints
    }]);
  };

  const handleReplay = () => {
    playSound('click');
    if (rive && rive.viewModelInstance) {
      rive.viewModelInstance.enum('popup_type_enum').value = 'None';
      rive.viewModelInstance.trigger('hide_insight').trigger();
    }
    
    lastPlayedPhase.current = ''; 
    displayedProgress.current = 0;
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);

    // 👇 UPDATED: Stop both music and ambience on replay
    if (bgmPlayer.current) {
      bgmPlayer.current.pause();
      currentBgmSrc.current = '';
    }
    if (ambiencePlayer.current) {
      ambiencePlayer.current.pause();
      currentAmbienceSrc.current = '';
    }

    setTimeout(() => {
      setScenarioRowIndex(0);
      setGamePhase('scenario_step');
      setSelectedResponse(null);
      setTotalPoints(0);
      setHistory([]);
    }, 150); 
  };

  const handleNextScenarioStep = () => {
    playSound('click');
    saveHistoryState();
    if (hasOptions) {
      setGamePhase('options');
    } else {
      if (scenarioRowIndex < scenarios.length - 1) {
        setScenarioRowIndex(prev => prev + 1); 
      } else {
        setGamePhase('end_screen');
      }
    }
  };

  const handleOptionSelect = (responseRow) => {
    playSound('click');
    saveHistoryState();
    setSelectedResponse(responseRow);
    setGamePhase('response1');
  };

  const handleContinueToResp2 = () => {
    playSound('click');
    saveHistoryState();
    
    const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
    const pointsMatch = String(rawPoints).match(/-?\d+/);
    const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
    
    if (pointsGained > 0) playSound('success');
    else if (pointsGained < 0) playSound('fail');

    setTotalPoints(prev => prev + pointsGained);
    setGamePhase('points_award'); 
  };

  const handleContinueToInsight = () => {
    playSound('click');
    saveHistoryState();
    setGamePhase('insight');
  };
  
  const handleNextScenario = () => {
    playSound('click');
    saveHistoryState();
    rive.viewModelInstance.trigger('hide_insight').trigger();
    if (scenarioRowIndex < scenarios.length - 1) {
      setScenarioRowIndex(prev => prev + 1); 
      setGamePhase('scenario_step');
      setSelectedResponse(null);
    } else {
      setGamePhase('end_screen');
    }
  };

  const isLoading = !isRiveReady || scenarios.length === 0 || responses.length === 0;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
      
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          <h2>Loading Simulation...</h2>
        </div>
      )}

      {gamePhase === 'end_screen' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          
          {/* 👇 NEW: Logo Container */}
          <div style={{ width: '150px', height: '150px', marginBottom: '10px' }}>
            <LogoRive />
          </div>

          <h1 style={{ fontSize: '4rem', margin: '0 0 30px 0', lineHeight: '1.2' }}>Shift Complete!</h1>
          
          <p style={{ fontSize: '2rem', margin: '0 0 15px 0', color: '#666' }}>
            Final Score: <strong style={{ color: '#ff9900' }}>{totalPoints}</strong>
          </p>
          
          <p style={{ fontSize: '1.8rem', margin: '0 0 50px 0', fontWeight: 'bold' }}>
            Rating: <span style={{ 
              color: totalPoints < 0 ? '#df3f38' : 
                     totalPoints <= 50 ? '#f29b38' : 
                     totalPoints <= 150 ? '#7ab758' : 
                     totalPoints <= 250 ? '#2ea39b' : '#206ca4' 
            }}>
              {totalPoints < 0 ? 'VERY POOR' : 
               totalPoints <= 50 ? 'POOR' : 
               totalPoints <= 150 ? 'FAIR' : 
               totalPoints <= 250 ? 'GOOD' : 'EXCELLENT'}
            </span>
          </p>

          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={handleReplay} 
            style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
          >
            Replay Game
          </button>
        </div>
      )}

      <RiveComponent style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }} />

      {!isLoading && gamePhase !== 'end_screen' && (
        <>
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            {gamePhase === 'scenario_step' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenarioStep} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'options' && (
              <>
                {questionText && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: '15px 30px', borderRadius: '12px', maxWidth: '800px', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 'normal' }}>
                      {questionText}
                    </h2>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                  {currentOptions.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i); 
                    return (
                      <button 
                        key={i} 
                        className="option-button"
                        onMouseEnter={() => playSound('hover')}
                        onClick={() => handleOptionSelect(opt)} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', 
                          fontSize: '1.1rem', cursor: 'pointer', borderRadius: '8px', 
                          backgroundColor: '#ffffff', color: '#333', border: 'none',
                          borderBottom: '4px solid #ff9900', maxWidth: '350px', 
                          textAlign: 'left'
                        }}
                      >
                        <span style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '32px', height: '32px', borderRadius: '50%',
                          border: '2px solid #ff9900', color: '#ff9900', fontWeight: 'bold',
                          fontSize: '1.1rem', flexShrink: 0
                        }}>
                          {letter}
                        </span>
                        <span>{getFuzzyKey(opt, 'Text')}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {gamePhase === 'response1' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleContinueToResp2} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'response2' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleContinueToInsight} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                View Insight
              </button>
            )}

            {gamePhase === 'insight' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenario} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#ff9900', color: 'white', border: 'none' }}
              >
                Next Scenario
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState('menu'); 
  const [isMuted, setIsMuted] = useState(false); // 👇 NEW: Mute state
  const menuAudioRef = useRef(null);

  // 1. Setup global menu music and wait for a click
  useEffect(() => {
    menuAudioRef.current = new Audio(`${import.meta.env.BASE_URL}menu-music.mp3`);
    menuAudioRef.current.loop = true;
    menuAudioRef.current.volume = 0.3;
    menuAudioRef.current.muted = isMuted; // apply initial state

    const startMenuAudio = () => {
      if (menuAudioRef.current) {
        menuAudioRef.current.play().catch(e => console.log("Audio still blocked:", e));
      }
      document.removeEventListener('click', startMenuAudio);
    };

    document.addEventListener('click', startMenuAudio);

    return () => {
      document.removeEventListener('click', startMenuAudio);
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
      }
    };
  }, []);

  // 2. Stop the menu music when the game actually starts
  useEffect(() => {
    if (appState === 'game' && menuAudioRef.current) {
      menuAudioRef.current.pause();
    }
  }, [appState]);

  // 👇 NEW: 3. Sync the React state with the global SFX flag and Menu Audio
  useEffect(() => {
    globalIsMuted = isMuted;
    if (menuAudioRef.current) {
      menuAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'Amazon Ember';
            src: url('${import.meta.env.BASE_URL}AmazonEmber_Rg.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }

          * {
            font-family: 'Amazon Ember', Arial, sans-serif !important;
            line-height: 1.6;
          }

          .option-button {
            transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), margin 0.2s cubic-bezier(0.2, 0, 0, 1) !important;
            margin: 0 8px; 
          }
          .option-button:hover {
            transform: scale(1.05);
            margin: 0 16px; 
          }

          .standard-button {
            transition: transform 0.2s ease;
          }
          .standard-button:hover {
            transform: scale(1.05);
          }
        `}
      </style>
      
      {appState === 'menu' && <MainMenu onStart={() => setAppState('instructions')} />}
      {appState === 'instructions' && <InstructionsScreen onBegin={() => setAppState('game')} />}
      {appState === 'game' && <Game isMuted={isMuted} />} {/* 👇 Passed isMuted down */}

      {/* 👇 NEW: Flat UI Floating Mute Button */}
      <button
        onClick={() => {
          if (!isMuted) playSound('click');
          setIsMuted(prev => !prev);
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#333',
          color: 'white',
          border: '2px solid #fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>
    </>
  );
}