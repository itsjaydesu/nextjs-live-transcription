import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mic,
  ChevronDown,
  Globe,
  Settings,
  Keyboard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ES", name: "Spanish", flag: "🇪🇸" },
  { code: "FR", name: "French", flag: "🇫🇷" },
  { code: "DE", name: "German", flag: "🇩🇪" },
];

interface TranslationPair {
  original: string;
  translated: string;
}

const AnimatedText = ({ text }: { text: string }) => {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.02 } },
        hidden: {},
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 5 },
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const AnimatedEllipsis = () => {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.2, repeat: Infinity } },
        hidden: {},
      }}
      className="inline-flex"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: [0, 1, 0], y: [0, -5, 0] },
            hidden: { opacity: 0, y: 0 },
          }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.6 }}
          className="text-3xl font-bold"
        >
          .
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function Component() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState(Array(20).fill(0));
  const [fromLang, setFromLang] = useState(languages[1]);
  const [toLang, setToLang] = useState(languages[0]);
  const [translationPairs, setTranslationPairs] = useState<TranslationPair[]>(
    []
  );
  const [currentOriginal, setCurrentOriginal] = useState("");
  const [currentTranslated, setCurrentTranslated] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevels((prev) => prev.map(() => Math.random()));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAudioLevels(Array(20).fill(0));
    }
  }, [isRecording]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [translationPairs, currentOriginal, currentTranslated]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      simulateTranscription();
    } else {
      setCurrentOriginal("");
      setCurrentTranslated("");
    }
  };

  const simulateTranscription = useCallback(async () => {
    const sampleSentences = [
      "こんにちは、元気ですか？",
      "今日は良い天気ですね。",
      "週末に何か予定はありますか？",
    ];

    for (const sentence of sampleSentences) {
      setIsTranscribing(true);
      setCurrentOriginal(sentence);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsTranscribing(false);
      await translateText(sentence);
    }
  }, []);

  const translateText = useCallback(async (text: string) => {
    const translations: { [key: string]: string } = {
      "こんにちは、元気ですか？": "Hello, how are you?",
      "今日は良い天気ですね。": "The weather is nice today.",
      "週末に何か予定はありますか？": "Do you have any plans for the weekend?",
    };
    setIsTranslating(true);
    setCurrentTranslated("");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const translatedSentence = translations[text] || "Translation not found";
    setCurrentTranslated(translatedSentence);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTranslationPairs((prev) => [
      ...prev,
      { original: text, translated: translatedSentence },
    ]);
    setCurrentOriginal("");
    setCurrentTranslated("");
    setIsTranslating(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      setCurrentOriginal(inputText);
      translateText(inputText);
      setInputText("");
      setIsInputVisible(false);
    }
  };

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const refreshSession = () => {
    setTranslationPairs([]);
    setCurrentOriginal("");
    setCurrentTranslated("");
    setIsRecording(false);
    setIsTranscribing(false);
    setIsTranslating(false);
    setInputText("");
    setIsInputVisible(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white">
      <motion.header
        className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl border-b border-gray-700"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-48 justify-between bg-gray-700 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 text-xl border-gray-600 text-white rounded-xl shadow-inner"
              >
                {fromLang.flag} {fromLang.name}{" "}
                <ChevronDown className="h-6 w-6 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border border-gray-700 rounded-xl">
              <div className="flex flex-col">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="justify-start text-xl text-white hover:bg-gray-700 hover:bg-opacity-50"
                    onClick={() => setFromLang(lang)}
                  >
                    {lang.flag} {lang.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-full bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-xl"
          >
            <Globe className="w-10 h-10 text-gray-300" />
          </motion.div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-48 justify-between bg-gray-700 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 text-xl border-gray-600 text-white rounded-xl shadow-inner"
              >
                {toLang.flag} {toLang.name}{" "}
                <ChevronDown className="h-6 w-6 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border border-gray-700 rounded-xl">
              <div className="flex flex-col">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="justify-start text-xl text-white hover:bg-gray-700 hover:bg-opacity-50"
                    onClick={() => setToLang(lang)}
                  >
                    {lang.flag} {lang.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-gray-700 bg-opacity-50 hover:bg-opacity-70"
            onClick={() => console.log("Settings clicked")}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </motion.header>

      <main className="relative flex-grow overflow-hidden">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto space-y-6 p-6 pb-80"
        >
          <AnimatePresence>
            {translationPairs.map((pair, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700 shadow-lg ring-1 ring-white ring-opacity-10"
              >
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">{fromLang.flag}</span>
                    <p className="text-3xl text-gray-200">{pair.original}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-700 bg-opacity-50">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">{toLang.flag}</span>
                    <p className="text-3xl font-medium text-white">
                      <AnimatedText text={pair.translated} />
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(currentOriginal || isTranslating || currentTranslated) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700 shadow-lg ring-1 ring-white ring-opacity-10"
            >
              {currentOriginal && (
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">{fromLang.flag}</span>
                    <p className="text-3xl text-gray-200">
                      {currentOriginal}
                      {isTranscribing && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="ml-2 inline-block w-1 h-8 bg-gray-400 align-text-bottom"
                        />
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="p-6 bg-gray-700 bg-opacity-50">
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{toLang.flag}</span>
                  <p className="text-3xl font-medium text-white min-h-[2.5rem]">
                    {isTranslating ? (
                      <AnimatedEllipsis />
                    ) : currentTranslated ? (
                      <AnimatedText text={currentTranslated} />
                    ) : null}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      </main>

      <motion.footer
        className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {isInputVisible && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleInputSubmit}
              className="p-4"
            >
              <Input
                type="text"
                placeholder="Type to translate..."
                value={inputText}
                onChange={handleInputChange}
                className="w-full p-4 text-2xl bg-gray-700 bg-opacity-50 rounded-xl border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-inner ring-1 ring-white ring-opacity-10"
              />
            </motion.form>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center space-x-8 p-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full bg-gray-700 bg-opacity-50 hover:bg-opacity-70 border-gray-600 text-gray-300 shadow-inner ring-1 ring-white ring-opacity-10"
              onClick={refreshSession}
              aria-label="Refresh session"
            >
              <RefreshCw className="w-8 h-8" />
            </Button>
          </motion.div>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-64 h-64" viewBox="0 0 200 200">
              <defs>
                <radialGradient
                  id="glass-gradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
                </radialGradient>
              </defs>
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="url(#glass-gradient)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <AnimatePresence>
                {isRecording && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {audioLevels.map((level, index) => (
                      <motion.rect
                        key={index}
                        x="98"
                        y={100 - level * 80}
                        width="4"
                        height={level * 80}
                        fill="rgba(255, 255, 255, 0.7)"
                        rx="2"
                        ry="2"
                        className="origin-bottom"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.1, delay: index * 0.02 }}
                      />
                    ))}
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
            <Button
              variant="outline"
              size="icon"
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${
                isRecording
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-700 bg-opacity-50 hover:bg-opacity-70"
              } border-gray-600 transition-all duration-300 shadow-inner ring-1 ring-white ring-opacity-10`}
              onClick={toggleRecording}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic
                className={`w-16 h-16 ${isRecording ? "text-white" : "text-gray-300"}`}
              />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full bg-gray-700 bg-opacity-50 hover:bg-opacity-70 border-gray-600 text-gray-300 shadow-inner ring-1 ring-white ring-opacity-10"
              onClick={toggleInputVisibility}
              aria-label={
                isInputVisible ? "Hide keyboard input" : "Show keyboard input"
              }
            >
              <Keyboard className="w-8 h-8" />
            </Button>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
