import FretboardVisualizer from './components/FretboardVisualizer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-2 sm:p-4 md:p-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">Guitar Fretboard Visualizer</h1>
      <FretboardVisualizer preferFlat={true} numFrets={24} />
    </div>
  );
}

export default App;
