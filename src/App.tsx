import FretboardVisualizer from './components/FretboardVisualizer';
import MobileRotationBanner from './components/MobileRotationBanner';

/**
 * App Component
 * 
 * Main application component that renders the FretForge guitar visualizer.
 * Includes mobile rotation banner and responsive design optimizations.
 * 
 * @component
 * @returns {JSX.Element} The main app component
 */
function App() {
  return (
    <div
      className="min-h-screen bg-bg text-textprimary"
      style={{
        // Prevent zoom on mobile devices
        touchAction: 'manipulation',
        // Ensure proper viewport handling
        minHeight: '100dvh', // Dynamic viewport height for mobile
      }}
    >
      <MobileRotationBanner />
      <FretboardVisualizer />
    </div>
  );
}

export default App;
