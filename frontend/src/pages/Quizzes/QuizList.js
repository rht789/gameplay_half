// src/pages/Quizzes/QuizList.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { toast } from 'react-toastify';
import { 
  Edit2, 
  Trash2,
  Eye,
  EyeOff,
  Users,
  Calendar,
  Cpu,
  Edit3,
  List,
  PlusCircle,
  Check,
  Play
} from 'react-feather';
import './QuizList.css';
import DeleteQuizModal from './DeleteQuiz';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    quizId: null,
    quizTitle: ''
  });
  
  const ITEMS_PER_PAGE = 6;
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getAllQuizzes();
      console.log('Response from server:', response); // Debug log
      
      // Check if response has the data property
      if (response && response.success) {
        setQuizzes(response.data || []);
      } else {
        setError('Failed to fetch quizzes');
        toast.error('Error loading quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', {
        message: error.message,
        response: error.response?.data
      });
      setError(error.response?.data?.message || 'Failed to fetch quizzes');
      toast.error(error.response?.data?.message || 'Error loading quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const getCurrentQuizzes = () => {
    const indexOfLastQuiz = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstQuiz = indexOfLastQuiz - ITEMS_PER_PAGE;
    return quizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (quizId) => {
    navigate(`/quizzes/edit/${quizId}`);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (quizToDelete) {
      try {
        await quizService.deleteQuiz(quizToDelete.quizID);
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
        setShowDeleteModal(false);
        setQuizToDelete(null);
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Failed to delete quiz');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await quizService.deleteQuiz(deleteModal.quizId);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
      setDeleteModal({ isOpen: false, quizId: null, quizTitle: '' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const openDeleteModal = (quiz) => {
    setDeleteModal({
      isOpen: true,
      quizId: quiz.quizID,
      quizTitle: quiz.quizName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      quizId: null,
      quizTitle: ''
    });
  };

  const handleQuestionsClick = (quizId) => {
    try {
      navigate(`/quizzes/${quizId}/questions`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to questions');
    }
  };

  const handleFinalizeQuiz = async (quizId) => {
    try {
      const response = await quizService.finalizeQuiz(quizId);
      if (response.success) {
        toast.success(response.message || 'Quiz finalized successfully');
        await fetchQuizzes(); // Refresh the quiz list
      } else {
        toast.error(response.message || 'Failed to finalize quiz');
      }
    } catch (error) {
      console.error('Error finalizing quiz:', error);
      toast.error(error.response?.data?.message || 'Error finalizing quiz');
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      const response = await quizService.startQuizSession(quiz.quizID);
      
      if (response.success) {
        navigate(`/host-control/${response.data.sessionId}`, {
          state: {
            sessionCode: response.data.sessionCode,
            quizName: quiz.quizName
          }
        });
        toast.success('Quiz session created successfully');
      }
    } catch (error) {
      console.error('Error starting quiz session:', error);
      toast.error(error.response?.data?.message || 'Failed to start quiz session');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Quiz List</h1>
        <button 
          className="create-quiz-btn"
          onClick={() => navigate('/create-quiz')}
        >
          <PlusCircle size={20} />
          Create New Quiz
        </button>
      </div>

      <div className="quiz-grid">
        {quizzes.length === 0 ? (
          <div className="no-quizzes">
            <p>No quizzes found. Create your first quiz!</p>
            <button 
              className="create-first-quiz-btn"
              onClick={() => navigate('/create-quiz')}
            >
              <PlusCircle size={20} />
              Create Quiz
            </button>
          </div>
        ) : (
          getCurrentQuizzes().map((quiz) => (
            <div key={quiz.quizID} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.quizName}</h3>
                <div className={`visibility-badge ${quiz.visibility}`}>
                  {quiz.visibility === 'public' ? (
                    <><Eye size={16} /> Public</>
                  ) : (
                    <><EyeOff size={16} /> Private</>
                  )}
                </div>
              </div>
              <div className="quiz-card-content">
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-meta-info">
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{quiz.maxParticipants} participants</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{new Date(quiz.startAt).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    {quiz.questionMode === 'ai' ? (
                      <><Cpu size={16} /> AI Generated</>
                    ) : (
                      <><Edit2 size={16} /> Manually Created</>
                    )}
                  </div>
                  <div className="topic-badge">
                    {quiz.topic?.topicName || 'No Topic'}
                  </div>
                </div>
              </div>
              <div className="quiz-card-footer">
                <div className="action-buttons">
                  {quiz.status === 'ready' ? (
                    <button 
                      className="start-btn"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <Play size={16} />
                      Start Session
                    </button>
                  ) : (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(quiz.quizID)}
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => openDeleteModal(quiz)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
                <div className="action-buttons">
                  <button 
                    className="questions-btn"
                    onClick={() => handleQuestionsClick(quiz.quizID)}
                  >
                    <List size={16} />
                    Questions
                  </button>
                  {quiz.status === 'draft' && (
                    <button 
                      className="finalize-btn"
                      onClick={() => handleFinalizeQuiz(quiz.quizID)}
                    >
                      <Check size={16} />
                      Finalize
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {quizzes.length > ITEMS_PER_PAGE && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(quizzes.length / ITEMS_PER_PAGE) }).map((_, index) => (
            <button
              key={index + 1}
              className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Are you sure you want to delete this quiz?</h2>
              <p className="modal-description">
                You are about to delete the quiz: <strong>{quizToDelete?.quizName}</strong>
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn" 
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete-btn" 
                onClick={handleDeleteConfirm}
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteQuizModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        quizTitle={deleteModal.quizTitle}
      />
    </div>
  );
};

export default QuizList;
