
import React from 'react';
import { X, Play, Plus, BarChart2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

interface GuideModalProps {
  language: Language;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ language, onClose }) => {
  const t = TRANSLATIONS[language];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      classNames={{
        wrapper: "bg-neutral-950/70 backdrop-blur-sm z-[100]",
        base: "rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden",
        backdrop: "bg-gradient-to-b from-neutral-950/60 to-neutral-950/80",
      }}
      motionProps={{
        variants: {
          enter: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
          },
          exit: {
            scale: 0.95,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
          }
        }
      }}
    >
      <ModalContent className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
        {/* Background Decor */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-300/10 rounded-full blur-3xl pointer-events-none" />

        <ModalHeader className="flex-col items-center text-center pb-0 pt-10 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            {t.guide.title}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
            {t.guide.subtitle}
          </p>
        </ModalHeader>

        <ModalBody className="px-10 md:px-14 relative z-10">
          <div className="grid gap-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.guide.step1Title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm md:text-base">
                  {t.guide.step1Desc}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-green-600 fill-current ml-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.guide.step2Title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm md:text-base">
                  {t.guide.step2Desc}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <BarChart2 className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.guide.step3Title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm md:text-base">
                  {t.guide.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="justify-center pb-10 relative z-10 pt-0">
          <Button
            size="lg"
            onPress={onClose}
            className="rounded-[2rem] px-16 py-5 text-lg font-black shadow-xl shadow-green/20 bg-green-400 hover:bg-green-500 text-white"
          >
            {t.guide.getStarted}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
