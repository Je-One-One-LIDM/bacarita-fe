"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VoiceRecorder from "../../components/VoiceRecorder";
import Link from "next/link";

const useColors = () => ({
  background: 'var(--color-bg-primary)',
  primaryText: 'var(--color-text-primary)',
  secondaryText: 'var(--color-text-secondary)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  white: 'var(--color-white)'
});

const questionsData = {
  "Kura-kura Bijak": [
    {
      id: 1,
      type: "reading",
      instruction: "Bacakan kalimat ini dengan suara yang jelas:",
      text: "Lambat tapi pasti lebih baik daripada cepat tapi sombong",
      expectedDuration: 8,
    },
    {
      id: 2,
      type: "comprehension", 
      instruction: "Jawab pertanyaan ini dengan suara:",
      question: "Siapa yang memenangkan lomba lari dalam cerita?",
      expectedAnswer: ["kura-kura", "wijaya", "kura kura"],
      textReference: "Kura-kura memenangkan lomba dengan tekad dan ketekunannya"
    }
  ]
};

function PertanyaanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: number;
    duration: number;
    attempt: boolean;
  }>>([]);
  const [showResult, setShowResult] = useState(false);
  const [finalMedal, setFinalMedal] = useState<'gold' | 'silver' | 'bronze'>('bronze');
  
  const colors = useColors();
  const storyTitle = searchParams.get('story') || 'Unknown Story';
  const readingMedal = searchParams.get('medal') || 'bronze';
  
  const questions = questionsData[storyTitle as keyof typeof questionsData] || [];
  const currentQuestion = questions[currentQuestionIdx];

  const handleRecordingComplete = (duration: number) => {
    const newAnswer = {
      questionId: currentQuestion.id,
      duration,
      attempt: duration > 0
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      calculateFinalResult(updatedAnswers);
    }
  };

  const calculateFinalResult = (allAnswers: typeof answers) => {
    let totalScore = 0;
    
    allAnswers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question || !answer.attempt) return;

      if (question.type === 'reading' && question.expectedDuration) {
        const durationRatio = answer.duration / question.expectedDuration;
        if (durationRatio >= 0.8 && durationRatio <= 1.2) {
          totalScore += 3; // Perfect
        } else if (durationRatio >= 0.6 && durationRatio <= 1.4) {
          totalScore += 2; // Good
        } else {
          totalScore += 1; // Attempt
        }
      } else {
        if (answer.duration >= 3) {
          totalScore += 3;
        } else if (answer.duration >= 1) {
          totalScore += 2;
        } else {
          totalScore += 1;
        }
      }
    });

    let medal: 'gold' | 'silver' | 'bronze' = 'bronze';
    
    if (totalScore >= 5 && readingMedal === 'gold') {
      medal = 'gold';
    } else if (totalScore >= 3 && (readingMedal === 'gold' || readingMedal === 'silver')) {
      medal = 'silver';
    } else {
      medal = 'bronze';
    }

    setFinalMedal(medal);
    setShowResult(true);
  };

  const getMedalPoints = (medal: string) => {
    switch(medal) {
      case 'gold': return 3;
      case 'silver': return 2;
      case 'bronze': return 1;
      default: return 0;
    }
  };

  const getFeedbackMessage = () => {
    switch(finalMedal) {
      case 'gold':
        return "Luar biasa! Kamu membaca dan menjawab dengan sangat baik! 🏆";
      case 'silver':
        return "Bagus sekali! Terus berlatih ya! 🥈";
      case 'bronze':
        return "Kerja bagus! Kamu sudah berani mencoba! 🥉";
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: colors.primaryText }}>
            Pertanyaan tidak ditemukan
          </h1>
          <Link href="/">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: colors.background }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {finalMedal === 'gold' ? '🥇' : finalMedal === 'silver' ? '🥈' : '🥉'}
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primaryText }}>
              Selamat! 🎉
            </h1>
            <p className="text-lg" style={{ color: colors.secondaryText }}>
              {getFeedbackMessage()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.primaryText }}>
              Hasil Pembelajaran:
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>📖 Membaca:</span>
                <span>{readingMedal === 'gold' ? '🥇' : readingMedal === 'silver' ? '🥈' : '🥉'} ({getMedalPoints(readingMedal)} poin)</span>
              </div>
              <div className="flex justify-between">
                <span>❓ Pertanyaan:</span>
                <span>{answers.length}/2 selesai</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>🏆 Medal Final:</span>
                <span>{finalMedal === 'gold' ? '🥇 Emas' : finalMedal === 'silver' ? '🥈 Perak' : '🥉 Perunggu'} ({getMedalPoints(finalMedal)} poin)</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold mb-2" style={{ color: colors.primaryText }}>
              💡 Tips untuk Next Time:
            </h3>
            <ul className="text-sm space-y-1" style={{ color: colors.secondaryText }}>
              <li>• Bacalah dengan perlahan dan jelas</li>
              <li>• Fokus pada cerita, jangan terdistraksi</li>
              <li>• Jawab pertanyaan dengan suara yang lantang</li>
              <li>• Jangan takut mencoba, yang penting berusaha!</li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/">
              <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg transition">
                🏠 Kembali ke Beranda
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.primaryText }}>
            Pertanyaan untuk: {storyTitle}
          </h1>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="text-sm px-3 py-1 bg-blue-100 rounded-full">
              Soal {currentQuestionIdx + 1} dari {questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">
              {currentQuestion.type === 'reading' ? '📖' : '❓'}
            </div>
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.primaryText }}>
              {currentQuestion.instruction}
            </h2>
            
            {/* Question Content */}
            {currentQuestion.type === 'reading' ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  "{currentQuestion.text}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                    {currentQuestion.question}
                  </p>
                </div>
                {currentQuestion.textReference && (
                  <div className="text-sm text-gray-600 italic">
                    💡 Petunjuk: "{currentQuestion.textReference}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voice Recorder */}
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            expectedDuration={currentQuestion.expectedDuration}
          />
        </div>

        {/* Tips */}
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm" style={{ color: colors.secondaryText }}>
            💡 <strong>Tips:</strong> Bicara dengan suara yang jelas dan tidak terlalu cepat ya!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PertanyaanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p style={{ color: 'var(--color-text-primary)' }}>Memuat pertanyaan...</p>
        </div>
      </div>
    }>
      <PertanyaanContent />
    </Suspense>
  );
}