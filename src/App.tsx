import FretboardVisualizer from './components/FretboardVisualizer';

function App() {
  return (
    <div className="min-h-screen bg-bg text-textprimary flex flex-col items-center p-2 sm:p-4 md:p-8">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-center tracking-wider select-none"
        style={{
          fontFamily: 'Monoton, cursive',
          color: 'inherit',
          textShadow: `0 2px 0 #222, 0 4px 12px #fffbe699, 0 8px 32px #fde68a66, 0 0 24px #fef9c388`
        }}
      >
        FretForge
      </h1>
      <FretboardVisualizer />
    </div>
  );
}

export default App;
