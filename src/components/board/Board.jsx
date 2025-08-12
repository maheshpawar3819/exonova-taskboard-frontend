import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  fetchBoardById,
} from "../../store/slices/boardSlice";
import socketService from "../../services/socketService";
import offlineSyncService from "../../services/offlineSync";
import {
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
} from "../../store/slices/cardSlice";
import {
  toggleCreateCardModal,
  setSelectedCard,
  toggleCardDetailsModal,
} from "../../store/slices/uiSlice";
import Card from "./Card";
import CreateCardModal from "./CreateCardModal";
import BoardHeader from "./BoardHeader";
import ColumnHeader from "./ColumnHeader";
import OnlineUsers from "./OnlineUsers";
import ActivityLog from "./ActivityLog";

const SortableCard = ({ card, onClick, canEdit, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-3 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Card
        card={card}
        onClick={onClick}
        canEdit={canEdit}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { currentBoard, loading, error } = useSelector((state) => state.board);
  const { user, token } = useSelector((state) => state.auth);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
    }
  }, [boardId, dispatch]);

  // Connect to Socket.io when board loads
  useEffect(() => {
    if (token && boardId) {
      socketService.connect(token);
      socketService.joinBoard(boardId);

      // Listen for real-time card updates
      socketService.onCardCreated((data) => {
        if (data.boardId === boardId) {
          console.log("Card created event received:", data.card);
          dispatch(fetchBoardById(boardId)); // Refresh the entire board to ensure UI is updated
        }
      });

      socketService.onCardUpdated((data) => {
        if (data.boardId === boardId) {
          console.log("Card updated event received:", data.card);
          dispatch(
            updateCard({
              cardId: data.card._id,
              updates: data.card,
            })
          );
        }
      });

      socketService.onCardDeleted((data) => {
        if (data.boardId === boardId) {
          console.log("Card deleted event received:", data.cardId);
          dispatch(deleteCard({ cardId: data.cardId }));
        }
      });

      socketService.onCardReordered((data) => {
        if (data.boardId === boardId) {
          console.log("Card reordered event received");
          // Refresh board to get updated card positions
          dispatch(fetchBoardById(boardId));
        }
      });

      return () => {
        socketService.leaveBoard(boardId);
      };
    }
  }, [token, boardId, dispatch]);

  const boardCards = currentBoard?.cards || [];

  const handleDragStart = (event) => {
    const { active } = event;
    const card = boardCards.find((c) => c._id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!active || !over) {
      console.log("No active or over element in drag end event");
      setActiveCard(null);
      return;
    }

    setActiveCard(null);

    // Find the active card from the boardCards array
    const activeCard = boardCards.find((card) => card._id === active.id);
    if (!activeCard) {
      console.error("Active card not found:", active.id);
      return;
    }

    console.log("Drag end event:", { active, over });

    // Determine the destination column using multiple strategies
    let destinationColumn = null;

    // Strategy 1: Check data-droppable and data-column attributes
    if (over.data?.current?.node) {
      const node = over.data.current.node;
      const isDroppable = node.getAttribute("data-droppable") === "true";

      if (isDroppable) {
        destinationColumn = node.getAttribute("data-column");
        console.log(
          "Strategy 1: Found destination from droppable data:",
          destinationColumn
        );
      }

      // If not found directly, check parent elements
      if (!destinationColumn) {
        const columnElement = node.closest(
          '[data-column][data-droppable="true"]'
        );
        if (columnElement) {
          destinationColumn = columnElement.getAttribute("data-column");
          console.log(
            "Strategy 1 (parent): Found destination from parent element:",
            destinationColumn
          );
        }
      }
    }

    // Strategy 2: Check sortable containerId
    if (!destinationColumn && over.data?.current?.sortable) {
      destinationColumn = over.data.current.sortable.containerId;
      console.log(
        "Strategy 2: Found destination from sortable containerId:",
        destinationColumn
      );
    }

    // Strategy 3: Check if over.id is a column name
    if (!destinationColumn && typeof over.id === "string") {
      const columnExists = currentBoard.columns?.some(
        (col) => col.title === over.id
      );
      if (columnExists) {
        destinationColumn = over.id;
        console.log(
          "Strategy 3: Found destination from over.id:",
          destinationColumn
        );
      }
    }

    // If we still don't have a destination column, log an error and return
    if (!destinationColumn) {
      console.error("Could not determine destination column", { active, over });
      dispatch(
        setNotification({
          type: "error",
          message:
            "Could not determine where to drop the card. Please try again.",
        })
      );
      return;
    }

    // If the card is already in this column, no need to move it
    if (activeCard.column === destinationColumn) {
      console.log("Card already in this column, no need to move");
      return;
    }

    console.log(
      `Moving card from ${activeCard.column} to ${destinationColumn}`
    );

    try {
      // Update the card's column in the database
      await dispatch(
        reorderCards({
          boardId,
          sourceColumn: activeCard.column,
          destinationColumn: destinationColumn,
          sourceIndex: 0,
          destinationIndex: 0,
          cardId: activeCard._id,
        })
      ).unwrap();

      // Refresh board data to show updated card positions
      dispatch(fetchBoardById(boardId));

      // Emit socket event for real-time updates
      socketService.emitCardReordered(
        boardId,
        activeCard._id,
        activeCard.column,
        destinationColumn,
        0,
        0
      );

      dispatch(
        setNotification({
          type: "success",
          message: `Card moved to ${destinationColumn}`,
        })
      );
    } catch (error) {
      console.error("Failed to reorder cards:", error);
      dispatch(
        setNotification({
          type: "error",
          message:
            "Failed to move card: " +
            (error.response?.data?.message || error.message || "Unknown error"),
        })
      );
    }
  };

  const handleCreateCard = (columnId) => {
    setSelectedColumn(columnId);
    setShowCreateCard(true);
  };

  const handleCardCreated = () => {
    setShowCreateCard(false);
    setSelectedColumn(null);
  };

  const handleCardClick = (card) => {
    dispatch(setSelectedCard(card));
    dispatch(toggleCardDetailsModal());
  };

  const handleCardUpdate = async (cardId, updates) => {
    try {
      await dispatch(
        updateCard({
          cardId,
          updates,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  const handleCardDelete = async (cardId, cardTitle) => {
    try {
      await dispatch(
        deleteCard({
          cardId,
        })
      ).unwrap();

      // Emit socket event for real-time updates
      socketService.emitCardDeleted(boardId, cardId, cardTitle);
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Board
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Board Not Found
          </h2>
        </div>
      </div>
    );
  }

  const isOwner = currentBoard.owner?._id === user?._id;
  const userRole =
    currentBoard.members?.find((m) => m.user._id === user?._id)?.role ||
    "viewer";
  const canEdit = isOwner || userRole === "admin" || userRole === "editor";

  return (
    <div className="min-h-screen bg-gray-50">
      <BoardHeader
        board={currentBoard}
        isOwner={isOwner}
        userRole={userRole}
        canEdit={canEdit}
      />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Main Board Area */}
          <div className="flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBoard.columns?.map((column) => {
                  const columnCards = boardCards.filter(
                    (card) =>
                      card.column === column.title && card.status === "active"
                  );

                  return (
                    <div
                      key={column.title}
                      className="bg-white rounded-lg shadow-sm"
                    >
                      <ColumnHeader
                        column={column}
                        cardCount={columnCards.length}
                        onCreateCard={() => handleCreateCard(column.title)}
                        canEdit={canEdit}
                      />

                      <div
                        className="min-h-[200px] p-3 rounded-md transition-all duration-200 hover:bg-gray-50"
                        data-column={column.title}
                        data-droppable="true"
                      >
                        {/* Empty column indicator */}
                        {columnCards.length === 0 && (
                          <div
                            className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm"
                            data-column={column.title}
                            data-droppable="true"
                          >
                            Drop cards here
                          </div>
                        )}

                        <SortableContext
                          items={columnCards.map((card) => card._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {columnCards.map((card) => (
                            <SortableCard
                              key={card._id}
                              card={card}
                              onClick={() => handleCardClick(card)}
                              canEdit={canEdit}
                              onUpdate={(updates) =>
                                handleCardUpdate(card._id, updates)
                              }
                              onDelete={handleCardDelete}
                            />
                          ))}
                        </SortableContext>

                        {/* Drop zone indicator - always visible but more prominent on hover */}
                        <div
                          className="h-12 w-full border-2 border-dashed border-gray-300 rounded-md mt-2 flex items-center justify-center text-gray-400 text-xs opacity-50 hover:opacity-100 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200"
                          data-droppable="true"
                          data-column={column.title}
                        >
                          Drop here to move card
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {activeCard ? (
                  <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <Card
                      card={activeCard}
                      onClick={() => {}}
                      canEdit={canEdit}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Sidebar with Online Users and Activity Log */}
          <div className="w-80 flex-shrink-0 space-y-6">
            <OnlineUsers boardId={boardId} />
            <ActivityLog boardId={boardId} />
          </div>
        </div>
      </div>

      {showCreateCard && selectedColumn && (
        <CreateCardModal
          boardId={boardId}
          column={selectedColumn}
          onClose={() => {
            setShowCreateCard(false);
            setSelectedColumn(null);
          }}
          onSuccess={handleCardCreated}
        />
      )}
    </div>
  );
};

export default Board;
