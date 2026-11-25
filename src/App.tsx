/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppStoreProvider, useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/layout/SplashScreen';
import { DashboardView } from './components/study/DashboardView';
import { LessonView } from './components/lesson/LessonView';
import { GlossaryView } from './components/study/GlossaryView';
import { TpAndQuizView } from './components/study/TpAndQuizView';
import { Lab68HC11 } from './assembler/Lab68HC11';
import { LabPIC16F887 } from './assembler/LabPIC16F887';
import { getLessonById } from './content/modules';

const ActiveContent: React.FC = () => {
  const { view } = useAppStore();

  let content: React.ReactNode = <DashboardView />;
  let animKey = 'dashboard';

  if (view.type === 'lesson') {
    const lesson = getLessonById(view.lessonId);
    if (lesson) {
      content = <LessonView lesson={lesson} />;
      animKey = `lesson-${lesson.id}`;
    }
  } else if (view.type === 'lab-68hc11') {
    content = <Lab68HC11 initialPresetId={view.presetId} />;
    animKey = 'lab-68hc11';
  } else if (view.type === 'lab-pic16f887') {
    content = <LabPIC16F887 initialPresetId={view.presetId} />;
    animKey = 'lab-pic16f887';
  } else if (view.type === 'tp-quiz') {
    content = <TpAndQuizView />;
    animKey = 'tp-quiz';
  } else if (view.type === 'glossary') {
    content = <GlossaryView highlightId={view.highlightId} />;
    animKey = 'glossary';
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
};

const RootWithSplash: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { setView } = useAppStore();

  const handleEnter = (destination?: 'dashboard' | 'lab68' | 'labpic') => {
    if (destination === 'lab68') setView({ type: 'lab-68hc11' });
    else if (destination === 'labpic') setView({ type: 'lab-pic16f887' });
    else setView({ type: 'dashboard' });
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50"
          >
            <SplashScreen onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell>
        <ActiveContent />
      </AppShell>
    </>
  );
};

export default function App() {
  return (
    <AppStoreProvider>
      <RootWithSplash />
    </AppStoreProvider>
  );
}
