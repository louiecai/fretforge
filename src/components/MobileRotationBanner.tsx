/**
 * MobileRotationBanner Component
 * 
 * Displays a banner when the device is in portrait mode on mobile devices and tablets,
 * encouraging users to rotate their device to landscape orientation for better experience.
 * 
 * @component
 * @returns {JSX.Element} The mobile rotation banner component
 */
import React, { useEffect, useState } from 'react';

/**
 * Hook to detect if the device is in portrait mode
 * @returns {boolean} True if device is in portrait mode
 */
const useIsPortrait = (): boolean => {
    const [isPortrait, setIsPortrait] = useState<boolean>(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Enhanced mobile/tablet detection
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isTablet = /ipad|android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent) ||
                (window.innerWidth >= 768 && window.innerWidth <= 1024);

            // Check if we're on a mobile device or tablet
            if (!isMobile && !isTablet) {
                setIsPortrait(false);
                return;
            }

            // Enhanced orientation detection
            let isPortraitMode = false;

            if (window.screen && window.screen.orientation) {
                // Modern browsers
                isPortraitMode = window.screen.orientation.type.includes('portrait');
            } else if (window.orientation !== undefined) {
                // iOS Safari and older browsers
                isPortraitMode = window.orientation === 0 || window.orientation === 180;
            } else {
                // Fallback using window dimensions with a threshold
                const aspectRatio = window.innerHeight / window.innerWidth;
                isPortraitMode = aspectRatio > 1.1; // Slight threshold to account for browser UI
            }

            setIsPortrait(isPortraitMode);
        };

        // Check on mount
        checkOrientation();

        // Listen for orientation changes
        window.addEventListener('orientationchange', checkOrientation);
        window.addEventListener('resize', checkOrientation);

        return () => {
            window.removeEventListener('orientationchange', checkOrientation);
            window.removeEventListener('resize', checkOrientation);
        };
    }, []);

    return isPortrait;
};

/**
 * MobileRotationBanner Component
 * 
 * Shows a banner when the device is in portrait mode, blocking the content
 * and encouraging users to rotate their device to landscape orientation.
 */
const MobileRotationBanner: React.FC = () => {
    const isPortrait = useIsPortrait();

    if (!isPortrait) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-gray-900 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-sm mx-4 text-center">
                {/* Device icon with rotation animation */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        {/* Device shape - adapts to phone/tablet */}
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-300 rounded-lg border-4 border-gray-400 flex items-center justify-center">
                            <div className="w-8 h-10 sm:w-10 sm:h-12 bg-gray-600 rounded-sm"></div>
                        </div>
                        {/* Rotation arrow */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    Rotate Your Device
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                    For the best experience with FretForge, please rotate your device to landscape mode.
                </p>

                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Landscape mode recommended</span>
                </div>
            </div>
        </div>
    );
};

export default MobileRotationBanner; 