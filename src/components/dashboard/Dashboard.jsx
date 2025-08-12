import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBoards } from '../../store/slices/boardSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { PlusIcon, ArrowRightIcon, UserIcon } from '@heroicons/react/24/outline';
import CreateBoardModal from './CreateBoardModal';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleBoardCreated = () => {
    setShowCreateModal(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleBoardClick = (boardId) => {
    console.log(boardId)
    navigate(`/board/${boardId}`);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">My Boards</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Board</span>
          </button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading boards...</div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No boards yet. Create your first board to get started!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards && boards.map((board) => (
              <div
                key={board._id}
                onClick={() => handleBoardClick(board._id)}
                className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {board.title}
                  </h3>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                {board.description && (
                  <p className="text-gray-600 text-sm mb-4">{board.description}</p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{board.members?.length || 1} member(s)</span>
                  <span>{board.columns?.length || 3} columns</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleBoardCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;

