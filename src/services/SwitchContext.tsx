import { createContext, useContext, useState, ReactNode } from 'react';

interface SwitchContextProps {
    isSwitchOn: boolean;
    toggleSwitch: () => void;
}

const SwitchContext = createContext<SwitchContextProps | undefined>(undefined);

export const SwitchProvider = ({ children }: { children: ReactNode }) => {
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const toggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    return (
        <SwitchContext.Provider value={{ isSwitchOn, toggleSwitch }}>
            {children}
        </SwitchContext.Provider>
    );
};

export const useSwitch = () => {
    const context = useContext(SwitchContext);
    if (!context) {
        throw new Error('useSwitch must be used within a SwitchProvider');
    }
    return context;
};
