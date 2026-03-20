'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  Paper,
  Collapse,
  IconButton,
  Fade,
  Slide,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BalanceIcon from '@mui/icons-material/Balance';
import {
  quizQuestions,
  getResultByScore,
  TOTAL_QUESTIONS,
  QuizQuestion,
  QuizResult,
} from './quizData';

// Color constants for consistency
const QUIZ_PRIMARY = '#7b2cbf';
const QUIZ_PRIMARY_DARK = '#5a189a';
const QUIZ_SUCCESS = '#2d6a4f';
const QUIZ_WARNING = '#d4a017';

interface TrustQuizProps {
  onScheduleConsultation?: () => void;
}

const TrustQuiz: React.FC<TrustQuizProps> = ({ onScheduleConsultation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestionData = quizQuestions[currentQuestion];
  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const progressPercentage = ((currentQuestion + (answers[currentQuestionData?.id] !== undefined ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  const handleAnswerChange = useCallback((questionId: string, points: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: points,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (answers[currentQuestionData.id] === undefined) return;

    setIsTransitioning(true);
    setSlideDirection('left');
    setExpandedExplanation(false);

    setTimeout(() => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
      setIsTransitioning(false);
    }, 200);
  }, [currentQuestion, currentQuestionData?.id, answers]);

  const handleBack = useCallback(() => {
    if (currentQuestion === 0) return;

    setIsTransitioning(true);
    setSlideDirection('right');
    setExpandedExplanation(false);

    setTimeout(() => {
      setCurrentQuestion((prev) => prev - 1);
      setIsTransitioning(false);
    }, 200);
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setExpandedExplanation(false);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const result = showResults ? getResultByScore(totalScore) : null;

  // Get result icon based on recommendation level
  const getResultIcon = (key: string) => {
    switch (key) {
      case 'will':
        return <GavelIcon sx={{ fontSize: 48 }} />;
      case 'consider':
        return <BalanceIcon sx={{ fontSize: 48 }} />;
      case 'trust':
        return <AssignmentTurnedInIcon sx={{ fontSize: 48 }} />;
      default:
        return <QuizIcon sx={{ fontSize: 48 }} />;
    }
  };

  // Get result color based on recommendation level
  const getResultColor = (key: string) => {
    switch (key) {
      case 'will':
        return '#1e3a5f';
      case 'consider':
        return QUIZ_WARNING;
      case 'trust':
        return QUIZ_SUCCESS;
      default:
        return QUIZ_PRIMARY;
    }
  };

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: alpha(QUIZ_PRIMARY, 0.15),
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${QUIZ_PRIMARY} 0%, ${QUIZ_PRIMARY_DARK} 100%)`,
            color: 'white',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: alpha('#ffffff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QuizIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Do I Need a Trust?
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {showResults
                  ? 'Your personalized recommendation'
                  : 'Answer a few questions to find out'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Bar (only show during quiz) */}
        {!showResults && (
          <Box sx={{ px: 3, pt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
              </Typography>
              <Typography variant="body2" sx={{ color: QUIZ_PRIMARY, fontWeight: 600 }}>
                {Math.round(progressPercentage)}% Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(QUIZ_PRIMARY, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: QUIZ_PRIMARY,
                },
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 4 }}>
          {/* Quiz Questions */}
          {!showResults && currentQuestionData && (
            <Fade in={!isTransitioning} timeout={200}>
              <Box>
                {/* Question */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.4,
                  }}
                >
                  {currentQuestionData.question}
                </Typography>

                {/* Options */}
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers[currentQuestionData.id]?.toString() ?? ''}
                    onChange={(e) => {
                      const selectedOption = currentQuestionData.options.find(
                        (opt) => opt.points.toString() === e.target.value
                      );
                      if (selectedOption) {
                        handleAnswerChange(currentQuestionData.id, selectedOption.points);
                      }
                    }}
                  >
                    {currentQuestionData.options.map((option, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          mb: 1.5,
                          border: '1px solid',
                          borderColor:
                            answers[currentQuestionData.id] === option.points
                              ? QUIZ_PRIMARY
                              : alpha('#000', 0.12),
                          borderRadius: 2,
                          bgcolor:
                            answers[currentQuestionData.id] === option.points
                              ? alpha(QUIZ_PRIMARY, 0.04)
                              : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: QUIZ_PRIMARY,
                            bgcolor: alpha(QUIZ_PRIMARY, 0.02),
                          },
                        }}
                      >
                        <FormControlLabel
                          value={option.points.toString()}
                          control={
                            <Radio
                              sx={{
                                color: alpha(QUIZ_PRIMARY, 0.5),
                                '&.Mui-checked': {
                                  color: QUIZ_PRIMARY,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body1"
                              sx={{
                                py: 0.5,
                                fontWeight:
                                  answers[currentQuestionData.id] === option.points ? 600 : 400,
                              }}
                            >
                              {option.label}
                            </Typography>
                          }
                          sx={{
                            m: 0,
                            px: 2,
                            py: 1,
                            width: '100%',
                          }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                </FormControl>

                {/* Why This Matters - Expandable */}
                <Box sx={{ mt: 3 }}>
                  <Button
                    onClick={() => setExpandedExplanation(!expandedExplanation)}
                    startIcon={<InfoOutlinedIcon />}
                    endIcon={expandedExplanation ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: alpha(QUIZ_PRIMARY, 0.04),
                        color: QUIZ_PRIMARY,
                      },
                    }}
                  >
                    Why does this matter?
                  </Button>
                  <Collapse in={expandedExplanation}>
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 1.5,
                        p: 2.5,
                        bgcolor: alpha('#1e3a5f', 0.03),
                        border: `1px solid ${alpha('#1e3a5f', 0.1)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                      >
                        {currentQuestionData.whyThisMatters}
                      </Typography>
                    </Paper>
                  </Collapse>
                </Box>

                {/* Navigation Buttons */}
                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      color: 'text.secondary',
                      visibility: currentQuestion === 0 ? 'hidden' : 'visible',
                      '&:hover': {
                        bgcolor: alpha(QUIZ_PRIMARY, 0.04),
                      },
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={answers[currentQuestionData.id] === undefined}
                    endIcon={
                      currentQuestion === TOTAL_QUESTIONS - 1 ? (
                        <CheckCircleOutlineIcon />
                      ) : (
                        <ArrowForwardIcon />
                      )
                    }
                    sx={{
                      bgcolor: QUIZ_PRIMARY,
                      px: 4,
                      py: 1.25,
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: QUIZ_PRIMARY_DARK,
                      },
                      '&:disabled': {
                        bgcolor: alpha(QUIZ_PRIMARY, 0.3),
                      },
                    }}
                  >
                    {currentQuestion === TOTAL_QUESTIONS - 1 ? 'See Results' : 'Next'}
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Results */}
          {showResults && result && (
            <Fade in={!isTransitioning} timeout={400}>
              <Box>
                {/* Result Icon and Headline */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(getResultColor(result.key), 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: getResultColor(result.key),
                    }}
                  >
                    {getResultIcon(result.key)}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: getResultColor(result.key),
                      mb: 1,
                    }}
                  >
                    {result.headline}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Your score: {totalScore} points
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Result Message */}
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    mb: 3,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {result.message}
                </Typography>

                {/* Benefits List (if applicable) */}
                {result.benefits && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      mb: 3,
                      bgcolor: alpha(QUIZ_SUCCESS, 0.04),
                      border: `1px solid ${alpha(QUIZ_SUCCESS, 0.15)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1.5, color: QUIZ_SUCCESS }}
                    >
                      A trust can help you:
                    </Typography>
                    <List dense disablePadding>
                      {result.benefits.map((benefit, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleOutlineIcon
                              sx={{ fontSize: 18, color: QUIZ_SUCCESS }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={benefit}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.primary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}

                {/* Call to Action */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: alpha(QUIZ_PRIMARY, 0.04),
                    border: `1px solid ${alpha(QUIZ_PRIMARY, 0.15)}`,
                    borderRadius: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarMonthIcon />}
                    onClick={onScheduleConsultation}
                    sx={{
                      bgcolor: QUIZ_PRIMARY,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 1.5,
                      '&:hover': {
                        bgcolor: QUIZ_PRIMARY_DARK,
                      },
                    }}
                  >
                    {result.ctaText}
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {result.secondaryText}
                  </Typography>

                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(QUIZ_PRIMARY, 0.1)}` }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Or call us directly:
                    </Typography>
                    <Button
                      startIcon={<PhoneIcon />}
                      href="tel:+12393454545"
                      sx={{
                        color: QUIZ_PRIMARY,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(QUIZ_PRIMARY, 0.04),
                        },
                      }}
                    >
                      (239) 345-4545
                    </Button>
                  </Box>
                </Paper>

                {/* Restart Quiz */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    onClick={handleRestart}
                    startIcon={<RestartAltIcon />}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: alpha(QUIZ_PRIMARY, 0.04),
                        color: QUIZ_PRIMARY,
                      },
                    }}
                  >
                    Retake Quiz
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{
          mt: 3,
          borderRadius: 2,
          bgcolor: alpha('#1e3a5f', 0.04),
          border: `1px solid ${alpha('#1e3a5f', 0.1)}`,
          '& .MuiAlert-icon': {
            color: '#1e3a5f',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Important Disclaimer
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          This quiz is for informational purposes only and does not constitute legal advice. The
          results are based on general guidelines and may not account for all aspects of your
          individual situation. We recommend consulting with a qualified estate planning attorney
          to determine the best approach for your specific needs.
        </Typography>
      </Alert>
    </Box>
  );
};

export default TrustQuiz;
