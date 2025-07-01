import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  category: string;
}

const inspirationalQuotes: QuoteData[] = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "Action"
  },
  {
    text: "A man becomes what he thinks about most of the time.",
    author: "Earl Nightingale", 
    category: "Mindset"
  },
  {
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl Jung",
    category: "Self-Acceptance"
  },
  {
    text: "Everything we need is inside us, we just have to access it.",
    author: "Joe Dispenza",
    category: "Potential"
  },
  {
    text: "Progress equals happiness.",
    author: "Tony Robbins",
    category: "Growth"
  },
  {
    text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    author: "Fyodor Dostoevsky",
    category: "Purpose"
  },
  {
    text: "The true soldier fights not because he hates what is in front of him, but because he loves what is behind him.",
    author: "G.K. Chesterton",
    category: "Purpose"
  },
  {
    text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "Love"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "Inner Strength"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Beginning"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "Dreams"
  },
  {
    text: "The privilege of a lifetime is being who you are.",
    author: "Joseph Campbell",
    category: "Authenticity"
  },
  {
    text: "Everything that irritates us about others can lead us to an understanding of ourselves.",
    author: "Carl Jung",
    category: "Self-Knowledge"
  },
  {
    text: "To change, you must become greater than your environment, greater than your body, and greater than time.",
    author: "Joe Dispenza",
    category: "Transformation"
  },
  {
    text: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius",
    category: "Persistence"
  }
];

export function InspirationalQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % inspirationalQuotes.length);
        setIsVisible(true);
      }, 300);
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = inspirationalQuotes[currentQuoteIndex];

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 shadow-lg">
      <CardContent className="p-6">
        <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-2'}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <blockquote className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                "{currentQuote.text}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <cite className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  — {currentQuote.author}
                </cite>
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-full">
                  {currentQuote.category}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-6">
            {inspirationalQuotes.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentQuoteIndex 
                    ? 'bg-purple-500 scale-125' 
                    : 'bg-purple-200 dark:bg-purple-700'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}