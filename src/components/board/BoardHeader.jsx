import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  deleteBoard,
  updateBoard,
  addBoardMember,
} from "../../store/slices/boardSlice";
import axios from "axios";

const BoardHeader = ({ board, isOwner, userRole, canEdit }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState("editor");
  const [isPublic, setIsPublic] = useState(board.settings?.isPublic || false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Toggle public/private
  const handleTogglePublic = async () => {
    try {
      await dispatch(
        updateBoard({
          boardId: board._id,
          updates: { isPublic: !isPublic },
        })
      ).unwrap();
      setIsPublic(!isPublic);
      toast.add(`Board is now ${!isPublic ? "public" : "private"}`, "success");
    } catch {
      toast.add("Failed to update board settings", "error");
    }
  };

  // Delete board
  const handleDeleteBoard = () => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      dispatch(deleteBoard(board._id))
        .unwrap()
        .then(() => {
          toast.add("Board deleted", "success");
          navigate("/dashboard");
        })
        .catch((err) => toast.add(err || "Delete failed", "error"));
    }
  };

  // Search users
  const searchUsers = async (term) => {
    if (!term.trim()) return setAvailableUsers([]);
    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/search?email=${encodeURIComponent(
          term.trim()
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.user) {
        const isAlreadyMember =
          board.members?.some((m) => m.user._id === data.user._id) ||
          board.owner?._id === data.user._id;
        setAvailableUsers(isAlreadyMember ? [] : [data.user]);
      } else {
        setAvailableUsers([]);
      }
    } catch {
      toast.add("Failed to search users", "error");
      setAvailableUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.email);
    setAvailableUsers([]);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return toast.add("Select a user first", "error");
    setIsAddingMember(true);
    try {
      await dispatch(
        addBoardMember({
          boardId: board._id,
          userId: selectedUser._id,
          role: newMemberRole,
        })
      ).unwrap();
      toast.add(`${selectedUser.name} added as ${newMemberRole}`, "success");
      setShowMemberModal(false);
      setSelectedUser(null);
      setSearchTerm("");
      setAvailableUsers([]);
    } catch {
      toast.add("Failed to add member", "error");
    } finally {
      setIsAddingMember(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm) searchUsers(searchTerm);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">{board.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {isPublic ? (
                  <EyeIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-500">
                  {isPublic ? "Public" : "Private"}
                </span>
                {isOwner && (
                  <button
                    onClick={handleTogglePublic}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {canEdit && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="btn btn-secondary flex items-center space-x-1"
              >
                <UserPlusIcon className="h-4 w-4" />
                <span>Members</span>
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="btn btn-secondary flex items-center space-x-1"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="btn btn-danger flex items-center space-x-1"
                >
                  🗑
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by email"
                className="input w-full mb-3"
              />
              {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
              {availableUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleUserSelect(u)}
                  className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
                >
                  {u.name} ({u.email})
                </div>
              ))}
              {selectedUser && (
                <div className="mb-3 p-2 border rounded bg-green-50">
                  Selected: {selectedUser.name} ({selectedUser.email})
                </div>
              )}
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="input w-full mb-4"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="btn btn-primary"
                >
                  {isAddingMember ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default BoardHeader;
