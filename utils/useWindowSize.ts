import { useState, useEffect } from 'react';
import _ from 'lodash';
export function useWindowSize(ref?: any) {
    const isClient = typeof window === 'object';

    function getSize() {
        if (ref) {
            const result = {
                width: _.get(ref, 'current.clientWidth', 0),
                height: _.get(ref, 'current.clientHeight', 0),
            };

            if (!ref.current) {
                setTimeout(() => {
                    setWindowSize(getSize());
                }, 5);
            }

            return result;
        }

        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined
        };
    }

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        if (!isClient) {
            return () => { };
        }

        function handleResize() {
            setWindowSize(getSize());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return windowSize;
}